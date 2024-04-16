require('dotenv').config()
import { MembershipModel } from '../models/MembershipModel'
import { Permissions } from '../utils/permissions.js'
import {
  emailFooterHtml,
  registrationOpenTemplate,
  registrationClosesSoonTemplate
} from '../email/email-templates.js'
import { EventModel } from '../models/EventModel'
const nodeMailer = require('nodemailer')

const testMode = process.env.TEST_MODE === '1';
const testRecipient = process.env.TEST_EMAIL_ADDR;
const registrationDays = 7;
const orcaPaypalUrl = 'https://www.paypal.com/paypalme/orcairelandpp';

export const getHtmlMessage = (message) => `<span>${message}</span><br>`

export const emailTransporter = () => nodeMailer.createTransport({
  host: 'smtp.mail.yahoo.com',
  port: 465,
  service:'yahoo',
  secure: false,
  auth: {
      user: process.env.CLUB_EMAIL_ADDR,
      pass: process.env.CLUB_EMAIL_APP_PWD,
  },
  debug: false,
  logger: true
});

export const sendEmail = async (recipients, subject, html) => {
  try {
    const emailer = emailTransporter()
    const mailOptions = {
      to: testMode ? testRecipient : recipients,
      from: process.env.CLUB_EMAIL_ADDR,
      subject: subject,
      html: html + emailFooterHtml,
    }

    const response = await emailer.sendMail(mailOptions);
    const rejected = response.rejected || [];
    const accepted = response.accepted || [];
    const allAccepted = rejected.length === 0;
    const success = accepted.length > 0;

    return { 
      success, 
      response,
      allAccepted,
      rejected,
      accepted,
      message: allAccepted 
        ? `Successfully sent to ${accepted.length} active members`
        : `Successfully sent to ${accepted.length} and ${rejected.length} failed to send to the following recipients: ${rejected.join(', ')}`
    }
  } catch (error) {
    return { success: false, error: error } 
  }
}

export const sendEmailToActiveMembersReq = async (req, res) => {
  try {
    const permissions = new Permissions()

    if (!permissions.check(req.get('Authorization').replace('Bearer', '').trim(), 'post', 'email')) {
      return res.status(403).send({
        success: false,
        message: 'forbidden'
      });
    }

    const { subject, message, html, overrideRecipients } = req.body;
    const hasHtml = !!html 
    const hasMessage = !!message 

    if (!subject || (!hasMessage && !hasHtml)) {
      return res.status(400).send({
        success: false,
        message: 'Please provide a subject and message or html content'
      });
    }

    const result = !overrideRecipients
      ? await sendEmailToActiveMembers(subject, message, html)
      : await sendEmail(overrideRecipients, subject, !!html 
          ? html 
          : getHtmlMessage(message));

    if (!result.success) {
      return res.status(result.httpCode || 400).send({
        success: false,
        message: res.message
      })
    }

    return res.status(200).send({
      success: false,
      message: result.message
    })

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: 'internal server error: '+error.message
    }) 
  }

}

export const sendEmailToActiveMembers = async (subject, message, html) => {
  try {
    const membershipDb = new MembershipModel();
    const currentMembershipData = await membershipDb.getCurrentMembershipWithFullUser();
    const currentMembership = currentMembershipData[0];
    const userEmails = currentMembership.users.map(user => user.email);
    const commaSeparatedEmails = userEmails.join(',');

    if (!currentMembership || !currentMembership.users || currentMembership.users.length === 0) {
      return {
        success: false,
        httpCode: 404,
        message: 'No active members found'
      }
    }

    const htmlContent = html 
      ? html 
      : getHtmlMessage(message);

    const response = testMode 
      ? await sendEmail(testRecipient, subject, htmlContent)
      : await sendEmail(commaSeparatedEmails, subject, htmlContent);

    response.httpCode = response.success ? 200 : 400;

    return response;
  } catch (error) {
    return {
      success: false,
      httpCode: 500,
      message: 'internal server error: '+error.message
    }
  }
}

const subtractDaysFromDate = (date, days) => new Date(new Date(date).getTime() - days * 24 * 60 * 60 * 1000);

export const notifyEventRegistrationOpen = async () => {
  const eventModel = new EventModel();
  const upcomingEvents = await eventModel.getUpcomingEvents(true);

  if (!upcomingEvents || upcomingEvents.length === 0) return;

  const notifableEvents = upcomingEvents.filter(event => {
    const alreadyNotified = event.notified === true;
    return !alreadyNotified && subtractDaysFromDate(event.date, registrationDays) < new Date();
  });

  if (!notifableEvents || notifableEvents.length === 0) return;

  const subject = 'Event Registration Now Open!';
  
  const html = registrationOpenTemplate(orcaPaypalUrl, notifableEvents);

  const response = await sendEmailToActiveMembers(subject, '', html);

  if (response.success) {
    const eventIds = notifableEvents.map(event => event._id.toString()) || [];
    eventIds.forEach(async eventId => {
      await eventModel.markEventAsNotified(eventId);
    });
  }
}

const sendEventPaymentReminders = async (event) => {
  const notifyableEvent = event && !!event.fee && !(event.reminded === true) && new subtractDaysFromDate(event.date, 1) < new Date();

  if (!notifyableEvent) return;

  const paidUserIds = event.paid_user_ids 
    ? event.paid_user_ids.map(paid_user_id => paid_user_id.toString())
    : [];

  const unpaidRegisteredEmails = event.cars.filter(car => {
      const paymentExempt = car.user.paymentExempt === true; 
      return !paymentExempt && !paidUserIds.includes(car.user._id.toString());
    })
  .map(car => car.user.email);

  if (!unpaidRegisteredEmails || unpaidRegisteredEmails.length === 0) return; 

  const subject = 'Event Payment Reminder';

  const html = registrationClosesSoonTemplate(orcaPaypalUrl, event);

  unpaidRegisteredEmails.forEach(async recipient => {
    await sendEmail(recipient, subject, html);
  });

  const eventModel = new EventModel();
  await eventModel.markEventAsReminded(event._id.toString());
};

export const notifyUpcomingEventsPaymentReminder = async () => {
  const eventModel = new EventModel();
  const upcomingEvents = await eventModel.getUpcomingEvents(true);

  if (!upcomingEvents || upcomingEvents.length === 0) return;   

  upcomingEvents.forEach(async event => {
    await sendEventPaymentReminders(event);
  });
}

