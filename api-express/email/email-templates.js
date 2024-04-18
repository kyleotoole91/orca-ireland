
export const extractTimeFromDateTime = (dateTime) => {
  const date = new Date(dateTime)
  return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
}
 
export const getLocaleDate = (date) => new Date(date).toLocaleDateString(
  'en-IE', 
  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
);

export const getLocaleTime = (date) => new Date(date).toLocaleTimeString(
  'en-IE', 
  { hour: '2-digit', minute: '2-digit' }
);

const getLocaleDateTime = (date) => `${getLocaleDate(date)} at ${getLocaleTime(date)}`;

export const registrationOpenTemplate = (orcaPaypalUrl, events) => {
  let html = `
    <p>Dear member,<p>
    <h2>Please <a href='https://orcaireland.com/events'>register</a> and <a href='${orcaPaypalUrl}'>pay</a> the entry fee to secure your place.</h2>
  `;
  html = html + events.map(event => registrationOpenEventTemplate(event)).join('');
  html = html + `<p>We look forward to seeing you!</p>`;
  return html;
}

export const registrationOpenEventTemplate = (event) => `
  <p>
    <strong>Event: </strong>${event.name}<br>
    <strong>Date: </strong>${getLocaleDateTime(event.date)}<br>
    <strong>Register by: </strong>${getLocaleDateTime(event.closeDate)}<br>
    <strong>Fee: </strong>${parseFloat(event.fee).toFixed(2)} EUR<br>
    <strong>Additional car/family: </strong>${parseFloat(parseFloat(event.fee) / 2).toFixed(2)} EUR<br>
  </p>
`;

export const registrationClosesSoonTemplate = (orcaPaypalUrl, event) => `
  <p>Dear member,<p>
  <h2>Registration closes soon!<h2>
  <h3>Please <a href='${orcaPaypalUrl}'>pay</a> the entry fee as soon as possible to secure your place.</h3>
  <p>
    <strong>Event: </strong>${event.name}<br>
    <strong>Date: </strong>${getLocaleDateTime(event.date)}<br>
    <strong>Fee: </strong>${parseFloat(event.fee).toFixed(2)} EUR<br>
    <strong>Additional car/family: </strong>${parseFloat(parseFloat(event.fee) / 2).toFixed(2)} EUR<br>
  </p>
  <p>We look forward to seeing you!</p>
`;

export const eventPaymentConfirmationTemplate = (event, payment) => `
  <p>Dear ${payment.name},<p>
  <p>We have received your payment of ${payment.amount} ${payment.currency} and confirmed your place for the following event:</p>
  <p>
    <strong>Event: </strong> <a href='https://orcaireland.com/events/${event._id.toString()}'>${event.name}</a><br>
    <strong>Date: </strong>${getLocaleDateTime(event.date)}<br>
  </p> 
  <p>Please arrive early to assist with track setup, we aim to begin racing at ${extractTimeFromDateTime(event.date)}</p>
  <p>We look forward to seeing you!</p>
  <p>Best of luck!</p>
`;

export const membershipPaymentConfirmationTemplate = (membership, payment) => `
  <p>Dear ${payment.name},<p>
  <p>Welcome to ORCA Ireland!<p>
  <p>Thank you for your payment of ${payment.amount} ${payment.currency}, we have activated your membership!</p>
  <p>
    <strong>Membership:</strong> <a href='https://orcaireland.com/membership'>${membership.name}</a><br>
    <strong>Start Date:</strong> ${getLocaleDate(membership.startDate)}<br>
    <strong>End Date:</strong> ${getLocaleDate(membership.endDate)}<br>
  </p> 
  <p>You can now register for <a href='https://orcaireland.com/events'>events</a></p>
  <p>If you haven't already, please review the <a href='https://orcaireland.com/about'>club rules </a>before registering.</p>
  <p>We look forward to seeing you!</p>
`;

export const emailFooterHtml = `
  <p>Best regards,<br><a href='https://orcaireland.com'>On Road Cicruit Association</a></p>
  <a href='https://orcaireland.com'>
    <img style='border-radius: 10px' src='https://orcaireland.com/static/media/orca-logo.0a8eb6f0.png' alt='ORCA Logo' width='175' height='175'>
  </a>
`;

export const unsubscribeLink = (unsubscribeUrl, emailAddr) => `<br><br>
  <div style='text-align: center; font-size: 10px'>
    <a href="${unsubscribeUrl}?email=${emailAddr}">Unsubscribe</a>
  </div>
`;

