import fetch from 'node-fetch';
import { UserModel } from '../models/UserModel';
import { EventModel } from '../models/EventModel';
import { PaymentModel } from '../models/PaymentModel';
import { MembershipModel } from '../models/MembershipModel';
import { sendEmail } from './email.js';
import {
  eventPaymentConfirmationTemplate, 
  membershipPaymentConfirmationTemplate
} from '../email/email-templates.js';

const DEFAULT_DAYS = 7;
const NUM_EVENT_EXTRAS_ALLOWED = 3;

let paypalToken = {
  scope: '',
  access_token: '',
  token_type: '',
  app_id: '',
  expires_in: 0,
  nonce: ''
};

const objectIdsToStrings = (obj) => obj.map(o => o ? o.toString() : '');

const discountedEventExtraAmount = (eventFee) => !!eventFee 
  ? parseFloat(parseFloat(eventFee / 2)).toFixed(2) 
  : 0;

const calcTotalIncExtras = (stdAmount, extraAmount, multiplier) => multiplier !== 0 
  ? parseFloat(parseFloat(stdAmount) + (extraAmount * multiplier)).toFixed(2).toString()
  : stdAmount;

const paypalAuth = async () => {  
  if (paypalToken.expiry_date && paypalToken.expiry_date > new Date()) {
    return paypalToken;
  }

  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const basicAuth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const body = 'grant_type=client_credentials';
  const headers = {
      'Authorization': `Basic ${basicAuth}`,
      'Content-Type': 'application/x-www-form-urlencoded'
  };
  
  const response = await fetch(`${process.env.PAYPAL_ROOT_URL}/oauth2/token`, {
    method: 'POST',
    headers: headers,
    body: body
  }).then(response => response.json());

  const expiryDate = new Date();
  expiryDate.setSeconds(expiryDate.getSeconds() + response.expires_in);
  response.expiry_date = expiryDate;

  return response;
};

const transformPaypalTxList = (txs) => txs.map(tx => {
  return {
    email: tx.payer_info.email_address,
    name: tx.payer_info.payer_name.alternate_full_name,
    amount: tx.transaction_info.transaction_amount.value,
    currency: tx.transaction_info.transaction_amount.currency_code,
    date: tx.transaction_info.transaction_initiation_date,
    note: tx.transaction_info.transaction_note,
    status: tx.transaction_info.transaction_status,
    transaction_id: tx.transaction_info.transaction_id,
    available_balance: tx.transaction_info.available_balance.value
  }
});

const commaErrorText = (details) => details && details.map(detail => detail.issue).join(', ');

const findTxByKeywordAndAmt = (txs, keyword = '', txAmount = '') => txs
  ? txs.filter(tx =>
    (keyword === '' || tx.transaction_info.transaction_note &&
      tx.transaction_info.transaction_note.toLowerCase().includes(keyword.toLowerCase())) && 
    (txAmount === '' || tx.transaction_info.transaction_amount.value === txAmount))
  : [];

const paypalTxByDateRange = async (token, startDateIso, endDateIso) => {
  let qryStartDate;
  let qryEndDate;

  if (!endDateIso) {
    let startDate = new Date(startDateIso);
    const lastWeekDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
    const lastWeekDateIso = lastWeekDate.toISOString().substring(0, 10);
    qryStartDate = `start_date=${lastWeekDateIso}T00:00:00Z`;
    qryEndDate = `end_date=${startDateIso}T23:59:59Z`;
  } else {
    qryStartDate = `start_date=${startDateIso}T00:00:00Z`;
    qryEndDate = `end_date=${endDateIso}T23:59:59Z`;
  }

  const qryFields = `fields=all`;
  const qryPageSize = `page_size=500`;
  const url = `${process.env.PAYPAL_ROOT_URL}/reporting/transactions?${qryStartDate}&${qryEndDate}&${qryFields}&${qryPageSize}`;
  
  const response = await fetch(url, {
    method: `GET`,
    headers: { 'Authorization': `Bearer ${token}`, 'Accept': `application/json` }
  }).then(response => response.json());
  
  return response || [];
};

const getPaypalTransactionsByEvent = async (event) => {
  if (!event || !event.date) {
    return [];
  }

  const startDate = new Date(event.date);
  const eventDate = new Date(event.date);
  const numDays = event.paypalDays || DEFAULT_DAYS;
  startDate.setDate(startDate.getDate() - numDays);
  const startDateIso = startDate.toISOString().substring(0, 10);
  const endDateIso = eventDate.toISOString().substring(0, 10);
  const fee = event.fee && parseFloat(event.fee || 0).toFixed(2);
  const keyword = !!event.keyword ? '' : event.keyword;

  const response = await authAndTransactions(startDateIso, endDateIso, keyword, '', fee, true);
  
  return response.transaction_details ? response.transaction_details : response;
}

const addPaypalTxToEventDetails = async (eventDetail) => {
  if (!eventDetail.cars) return eventDetail;
  
  const response = await getPaypalTransactionsByEvent(eventDetail);
  eventDetail.cars.forEach((raceEntry) => {
    const email = raceEntry.user.email ? raceEntry.user.email.toLowerCase() : '';
    const paypalEmail = raceEntry.user.paypalEmail ? raceEntry.user.paypalEmail.toLowerCase() : '';
    const emailAddresses = [email];
    if (!!paypalEmail && !emailAddresses.includes(paypalEmail)) {
      emailAddresses.push(paypalEmail);
    }
    raceEntry.payment_tx = response.find(tx => tx.email && (
      emailAddresses.includes(tx.email.toLowerCase())
    ));
  });
  return eventDetail;
}

export const authAndTransactions = async (startDateIso, endDateIso, keyword = '', name = '', amount = '', checkForDiscountedExtras = false) => { //2024-03-29
  const { access_token: token } = await paypalAuth();
  const response = await paypalTxByDateRange(token, startDateIso, endDateIso);
  const txDetails = response.transaction_details;

  if (!txDetails) {
    const errorsCommaText = commaErrorText(response.details);
    return { 
      error: {
        code: 400,
        message: errorsCommaText || 'unknown error',
      }
    };
  };

  const findTxByName = (txs, name) => txs
    ? txs.filter(tx => 
        tx.payer_info.payer_name.alternate_full_name
          .toLowerCase()
          .includes(name.toLowerCase()))
    : [];

  const userTxs = name === '' 
    ? [...txDetails] 
    : findTxByName([...txDetails], name);

  let filteredTxs = [];

  if (checkForDiscountedExtras) { // check for additional cars at the rate of 50%, eg two cars cost 15e instead of 10e, check for that tx, up to 3 extras
    const extraAmount = discountedEventExtraAmount(amount);
    for (var i = 0; i <= NUM_EVENT_EXTRAS_ALLOWED; i++) {
      const amountToCheck = calcTotalIncExtras(amount, extraAmount, i);
      filteredTxs = filteredTxs.concat(
        findTxByKeywordAndAmt([...userTxs], keyword, amountToCheck)
      );
    }
  } else {
    filteredTxs = findTxByKeywordAndAmt([...userTxs], keyword, amount);
  }
  
  return transformPaypalTxList(filteredTxs) || [];
}

export const generateCurrentEventPayments = async () => {
  const paymentDb = new PaymentModel();
  const eventDb = new EventModel(true);
  const events = await eventDb.getUpcomingEvents();
  const newPayments = [];
  for (const event of events) {
    const eventPayments = await paymentDb.getPaymentsByEventId(event._id);

    const alreadyFullyPaid = eventPayments && eventPayments.length === event.cars.length;
    
    if (!alreadyFullyPaid) {
      const eventWithPaidFlags = await addPaypalTxToEventDetails(event);

      for (const eventEntry of eventWithPaidFlags.cars || []) { 
        const userAlreadyPaid = eventPayments.some(ep => ep.user_id.toString() === eventEntry.user._id.toString());
        
        if (!userAlreadyPaid && eventEntry.payment_tx) {
          
          const payment = {
            event_id: event._id,
            payment_date: eventEntry.payment_tx.date,
            transaction_id: eventEntry.payment_tx.transaction_id,
            user_id: eventEntry.user._id,
            email: eventEntry.user.email,
            name: eventEntry.payment_tx.name,
            amount: eventEntry.payment_tx.amount,
            currency: eventEntry.payment_tx.currency,
            date: eventEntry.payment_tx.date,
            status: eventEntry.payment_tx.status,
            available_balance: eventEntry.payment_tx.available_balance
          };
          // multiple events at the same time may create dupe payments, assign one payment to one event at a time
          const alreadyAddedPayment = newPayments.some(p => p.transaction_id === payment.transaction_id);

          if (!alreadyAddedPayment) {
            newPayments.push(payment);
          }
        }
      };
    }
  }

  for (const payment of newPayments) {
    try {
      const event = await eventDb.getDocument(payment.event_id);
      if (event) {
        await paymentDb.addDocument(payment);

        if (paymentDb.success) {
          
          if (!event.paid_user_ids) {
            event.paid_user_ids = [];
          }
          
          if (!event.paid_user_ids.includes(payment.user_id)) {
            event.paid_user_ids.push(payment.user_id);
            await eventDb.updateDocument(event._id, event);
            await sendEmail(
              payment.email, 
              'Event payment confirmation', 
              eventPaymentConfirmationTemplate(event, payment)
            );
          }
        }
      }
    } catch (error) {
      console.error(error);
    }
  }
  return newPayments;
}

export const generateCurrentMembershipPayments = async () => {
  const membershipDb = new MembershipModel();
  const paymentDb = new PaymentModel();
  const userDb = new UserModel();
  const currentMemberships = await membershipDb.getCurrentMembership();
  const currentMembership = currentMemberships[0] || {};
  
  if (!currentMembership) { return; }

  if (!currentMembership.user_ids) {
    currentMembership.user_ids = [];
  }

  const startDate = new Date();
  const eventDate = new Date();
  const numDays = DEFAULT_DAYS;
  startDate.setDate(startDate.getDate() - numDays);
  const startDateIso = startDate.toISOString().substring(0, 10);
  const endDateIso = eventDate.toISOString().substring(0, 10);
  const keyword = currentMembership.keyword || '';
  const fee = parseFloat(currentMembership.fee || 0).toFixed(2);

  const response = await authAndTransactions(startDateIso, endDateIso, keyword, '', fee);

  const currentMembershipPayments = await paymentDb.getPaymentsByMembershipId(currentMembership._id) || [];
  
  response.forEach(async tx => {
    const user = await userDb.getUserByEmail(tx.email);
    if (user && !currentMembershipPayments.some(p => p.transaction_id === tx.transaction_id)) { 
      try {
        const payment = {
          membership_id: currentMembership._id,
          payment_date: tx.date,
          transaction_id: tx.transaction_id,
          user_id: user ? user._id : '',
          email: tx.email,
          name: tx.name,
          amount: tx.amount,
          currency: tx.currency,
          date: tx.date,
          status: tx.status,
          available_balance: tx.available_balance
        };
        await paymentDb.addDocument(payment);
        const userIds = objectIdsToStrings(currentMembership.user_ids);
        const paymentUserId = payment.user_id.toString();
        if (!userIds.includes(paymentUserId)) {
          currentMembership.user_ids.push(payment.user_id);
          await membershipDb.updateDocument(currentMembership._id, currentMembership);
          await sendEmail(
            payment.email, 
            'Membership payment confirmation', 
            membershipPaymentConfirmationTemplate(currentMembership, payment)
          );
        }
      } catch (error) {
        console.error(error);
      }
    };

  });
}