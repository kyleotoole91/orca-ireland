require('dotenv').config()
const unsubscribeUrl = process.env.UNSUBSCRIBE_URL;

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

export const registrationOpenTemplate = (orcaPaypalUrl, events) => `
  <p>Dear member,<p>
  <p>Registration is now open for the following ${events.length > 1 ? 'events:' : 'event:'}<p>` + 
  events.map(event => registrationOpenEventTemplate(event)).join('') + `
  <p>
    Please <a href='https://orcaireland.com/events'><strong>register</strong></a> and pay the fee via Paypal to <a href='${orcaPaypalUrl}'><strong>orcairelandpp</strong></a> to secure your place.
    Please use the <strong>friends and family</strong> option when paying or else your payment will not be recognised. The Paypal acount email address must match your ORCA account email address, or contact the administrator for a manual payment check. 
  </p>
  <p>We look forward to seeing you!</p>
`;

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
  <p>Registration closes soon!<p>
  <p>
    <strong>Event: </strong>${event.name}<br>
    <strong>Date: </strong>${getLocaleDateTime(event.date)}<br>
    <strong>Fee: </strong>${parseFloat(event.fee).toFixed(2)} EUR<br>
    <strong>Additional car/family: </strong>${parseFloat(parseFloat(event.fee) / 2).toFixed(2)} EUR<br>
  </p>
  <p>
    Please <a href='https://orcaireland.com/events'><strong>register</strong></a> and pay the fee via Paypal to <a href='${orcaPaypalUrl}'><strong>orcairelandpp</strong></a> to secure your place.
    Please use the <strong>friends and family</strong> option when paying or else your payment will not be recognised. Please use the <strong>friends and family</strong> option when paying or else your payment will not be recognised. The Paypal acount email address must match your ORCA account email address, or contact the administrator for a manual payment check. 
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
  <p>You can now register for <a href='https://orcaireland.com/events'>events.</a></p>
  <p>If you haven't already, please review the <a href='https://orcaireland.com/about'>club rules</a>.</p>
  <p>We look forward to seeing you!</p>
`;

export const emailFooterHtml = (emailAddr, includeUnsubscribeLink) => `
  <p>Best regards,<br><a href='https://orcaireland.com'>On Road Cicruit Association</a></p>
  <a href='https://orcaireland.com'>
    <img style='border-radius: 10px' src='https://orcaireland.com/static/media/orca-logo.0a8eb6f0.png' alt='ORCA Logo' width='175' height='175'>
  </a>
  ${includeUnsubscribeLink ? unsubscribeLink(emailAddr) : ''}
`;

export const unsubscribeLink = (emailAddr) => `<br><br>
  <div style='text-align: center; font-size: 10px'>
    <a href="${unsubscribeUrl}?email=${emailAddr}">Unsubscribe</a>
  </div>
`;

