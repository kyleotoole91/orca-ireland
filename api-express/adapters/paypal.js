import fetch from 'node-fetch';

const DEFAULT_EVENT_DAYS = 7;

let paypalToken = {
  scope: '',
  access_token: '',
  token_type: '',
  app_id: '',
  expires_in: 0,
  nonce: ''
};

export const paypalAuth = async () => {  
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

const findTxByName = (txs, name) => txs
  ? txs.filter(tx => tx.payer_info.payer_name.alternate_full_name.toLowerCase().includes(name.toLowerCase()))
  : [];

export const paypalTxByDateRange = async (token, startDateIso, endDateIso) => {
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

export const authAndTransactions = async (startDateIso, endDateIso, keyword = '', name = '', amount = '') => { //2024-03-29
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

  const userTxs = name = '' ? [...txDetails] : findTxByName([...txDetails], name);
  const filteredTxs = findTxByKeywordAndAmt([...userTxs], keyword, amount);

  return transformPaypalTxList(filteredTxs) || [];
}

export const getPaypalTransactionsByEvent = async (event, email = '') => {
  if (!event || !event.date) {
    return [];
  }

  const startDate = new Date(event.date);
  const eventDate = new Date(event.date);
  const numDays = event.paypalDays || DEFAULT_EVENT_DAYS;
  startDate.setDate(startDate.getDate() - numDays);
  const startDateIso = startDate.toISOString().substring(0, 10);
  const fee = event.fee && parseFloat(event.fee || 0).toFixed(2);
  const endDateIso = eventDate.toISOString().substring(0, 10);
  const keyword = !!event.keyword ? '' : event.keyword;

  const response = await authAndTransactions(startDateIso, endDateIso, keyword, email, fee);

  return response.transaction_details ? response.transaction_details : response;
}

export const addPaypalPaidStatusToEventDetails = async (eventDetail, email = '') => {
  if (!eventDetail.cars) return eventDetail;
  
  const response = await getPaypalTransactionsByEvent(eventDetail, email);
  eventDetail.cars.forEach((raceEntry) => raceEntry.paid = response.some(tx => tx.email === raceEntry.user.email));

  return eventDetail;
}

// event
// {
//   "success": true,
//   "message": "events",
//   "data": [
//       {
//           "_id": "63bdd6226348d13470d2ae72",
//           "name": "Winter Round 2",
//           "location": "Saint Anne's Park",
//           "date": "2023-12-17T10:00:00.000Z",
//           "fee": 10
//       },
//       {
//           "_id": "63bdd60d6348d13470d2ae71",
//           "name": "Winter Round 1",
//           "location": "Saint Anne's Park",
//           "date": "2023-12-03T10:00:00.000Z",
//           "fee": 10
//       },
//     }
//   }
// }

// eventDetail object
// {
//   "_id": "624b6b3c76ecc3f72e73afb4",
//   "name": "Summer Round 3",
//   "location": "Saint Anne's Park",
//   "date": "2022-06-12T09:00:00.000Z",
//   "fee": 10,
//   "car_ids": [
//       "62713bf2d8cef5c96ca6451f",
//       "62750dcc3835d8cc14add1a4",
//       "6247abdc76ecc3f72e73afab",
//       "62a0e43b010c623ecfd8cee4",
//       "62603adad8cef5c96ca64511",
//       "62605ed5d8cef5c96ca64517",
//       "6262ddaed8cef5c96ca6451d"
//   ],
//   "cars": [
//       {
//           "_id": "6247abdc76ecc3f72e73afab",
//           "manufacturer": "Inf1nity",
//           "model": "IF18-2",
//           "transponder": "3525466",
//           "freq": "2.4ghz",
//           "color": "White",
//           "class_id": "617ee8cf3597b2657dc4cbdd",
//           "user_id": "623c5c0c1ddf12b52d832a9d",
//           "user": {
//               "_id": "623c5c0c1ddf12b52d832a9d",
//               "extId": "auth0|6006134ec27448006ba6db39",
//               "dateOfBirth": "1991-09-11T00:00:00.000Z",
//               "ecName": "Megan",
//               "ecPhone": "0862075117",
//               "email": "kyleotoole91@gmail.com",
//               "firstName": "Kyle",
//               "lastName": "O'Toole",
//               "username": "kyleotoole91",
//               "memberType_id": "61f99da2659bef0d79f9b1da"
//           },
//           "class": {
//               "_id": "617ee8cf3597b2657dc4cbdd",
//               "name": "GP"
//           }
//       },
//       {
//           "_id": "62603adad8cef5c96ca64511",
//           "manufacturer": "Serpent ",
//           "model": "SRX8 GT TQ ",
//           "transponder": "4927282",
//           "freq": "2.4ghz",
//           "color": "Red",
//           "class_id": "617ee9233597b2657dc4cbdf",
//           "user_id": "623c54f41ddf12b52d832a9c",
//           "paid": true,
//           "user": {
//               "_id": "623c54f41ddf12b52d832a9c",
//               "extId": "auth0|61f9aceb189cef00716daedf",
//               "dateOfBirth": "1983-06-29T00:00:00.000Z",
//               "ecName": "Adrian",
//               "ecPhone": "0851742123",
//               "email": "eugenadrian45@gmail.com",
//               "firstName": "Eugen",
//               "lastName": "Adrian",
//               "username": "eugenadrian45",
//               "memberType_id": "61f99da2659bef0d79f9b1da"
//           },
//           "class": {
//               "_id": "617ee9233597b2657dc4cbdf",
//               "name": "GT"
//           }
//       },
//       {
//           "_id": "62605ed5d8cef5c96ca64517",
//           "manufacturer": "Genius",
//           "model": "GTc8",
//           "transponder": "7270871",
//           "freq": "2.4ghz",
//           "color": "Purple/Green",
//           "class_id": "617ee9233597b2657dc4cbdf",
//           "user_id": "623c547d1ddf12b52d832a9b",
//           "paid": false,
//           "user": {
//               "_id": "623c547d1ddf12b52d832a9b",
//               "extId": "auth0|61f84ff6a6e5850072d759b6",
//               "dateOfBirth": "1977-04-22T00:00:00.000Z",
//               "ecName": "Grace",
//               "ecPhone": "0863771013",
//               "email": "adrian.legge@gmail.com",
//               "firstName": "Adrian",
//               "lastName": "Legge",
//               "username": "adrian.legge",
//               "memberType_id": "61f99da2659bef0d79f9b1da"
//           },
//           "class": {
//               "_id": "617ee9233597b2657dc4cbdf",
//               "name": "GT"
//           }
//       },
//       {
//           "_id": "6262ddaed8cef5c96ca6451d",
//           "manufacturer": "Xray",
//           "model": "GTX8.22 ",
//           "transponder": "3089691",
//           "freq": "2.4ghz",
//           "color": "Orange/black",
//           "class_id": "617ee9233597b2657dc4cbdf",
//           "user_id": "626135b3d8cef5c96ca6451a",
//           "user": {
//               "_id": "626135b3d8cef5c96ca6451a",
//               "extId": "auth0|62225d368568200070b75c28",
//               "dateOfBirth": "1977-10-26T00:00:00.000Z",
//               "ecName": "Warren Long",
//               "ecPhone": "0879459574",
//               "email": "warlong77@gmail.com",
//               "firstName": "Warren",
//               "lastName": "Long",
//               "username": "warlong77",
//               "memberType_id": "61f99da2659bef0d79f9b1da"
//           },
//           "class": {
//               "_id": "617ee9233597b2657dc4cbdf",
//               "name": "GT"
//           }
//       },
//       {
//           "_id": "62713bf2d8cef5c96ca6451f",
//           "manufacturer": "Serpent",
//           "model": "733",
//           "transponder": "2176074",
//           "freq": "2.4ghz",
//           "color": "Red",
//           "class_id": "617ee8cf3597b2657dc4cbdd",
//           "user_id": "6266a00dd8cef5c96ca6451e",
//           "user": {
//               "_id": "6266a00dd8cef5c96ca6451e",
//               "extId": "auth0|61f8bf10bf1df9007137e158",
//               "dateOfBirth": "1988-01-31T00:00:00.000Z",
//               "ecName": "Gerry Ward",
//               "ecPhone": "07784008296",
//               "email": "tommy_ward1@outlook.com",
//               "firstName": "THOMAS",
//               "lastName": "WARD",
//               "username": "tommy_ward1",
//               "memberType_id": "61f99da2659bef0d79f9b1da"
//           },
//           "class": {
//               "_id": "617ee8cf3597b2657dc4cbdd",
//               "name": "GP"
//           }
//       },
//       {
//           "_id": "62750dcc3835d8cc14add1a4",
//           "manufacturer": "Inf1nity",
//           "model": "If18-2",
//           "transponder": "On system ",
//           "freq": "2.4ghz",
//           "color": "Grey",
//           "class_id": "617ee8cf3597b2657dc4cbdd",
//           "user_id": "623c3aba1ddf12b52d832a98",
//           "user": {
//               "_id": "623c3aba1ddf12b52d832a98",
//               "extId": "auth0|623a63fdbc78340068c4c516",
//               "dateOfBirth": "1986-11-02T00:00:00.000Z",
//               "ecName": "H",
//               "ecPhone": "0831234567",
//               "email": "graememlougheed@gmail.com",
//               "firstName": "Graeme",
//               "lastName": "Lougheed",
//               "username": "graememlougheed",
//               "memberType_id": "61f99da2659bef0d79f9b1da"
//           },
//           "class": {
//               "_id": "617ee8cf3597b2657dc4cbdd",
//               "name": "GP"
//           }
//       },
//       {
//           "_id": "62a0e43b010c623ecfd8cee4",
//           "manufacturer": "Genius ",
//           "model": "Gt",
//           "transponder": " 5156338",
//           "freq": "2.4ghz",
//           "color": "Yellow and black",
//           "class_id": "617ee9233597b2657dc4cbdf",
//           "user_id": "625f30fdd8cef5c96ca64510",
//           "user": {
//               "_id": "625f30fdd8cef5c96ca64510",
//               "extId": "auth0|61f86b36b40a810068796790",
//               "dateOfBirth": "1967-09-30T00:00:00.000Z",
//               "ecName": "Gary Sheil",
//               "ecPhone": "087 986 0939 ",
//               "email": "redbaron.sheil@gmail.com",
//               "firstName": "Gary",
//               "lastName": "Sheil",
//               "username": "redbaron.sheil",
//               "memberType_id": "61f99da2659bef0d79f9b1da"
//           },
//           "class": {
//               "_id": "617ee9233597b2657dc4cbdf",
//               "name": "GT"
//           }
//       }
//   ],
//   "races": []
// }