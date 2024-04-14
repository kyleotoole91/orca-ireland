
export const extractTimeFromDateTime = (dateTime) => {
  const date = new Date(dateTime)
  return date.toLocaleTimeString('en-IE', { hour: '2-digit', minute: '2-digit' })
}
 
export const getLocaleDate = (date) => new Date(date).toLocaleDateString(
  'en-IE', 
  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
);

export const emailFooterHtml = `
  <p><a href='https://orcaireland.com'>On Road Cicruit Association</a></p>
  <a href='https://orcaireland.com'>
    <img style='border-radius: 10px' src='https://orcaireland.com/static/media/orca-logo.0a8eb6f0.png' alt='ORCA Logo' width='175' height='175'>
  </a>
`;

export const eventPaymentConfirmationTemplate = (event, payment) => `
  <p>Dear ${payment.name},<p>
  <p>We have received your payment of ${payment.amount} ${payment.currency} and confirmed your place for the following event:</p>
  <p>
    Event: <a href='https://orcaireland.com/events/${event_id.toString()}'>${event.name}</a><br>
    Date: ${getLocaleDate(event.date)} at ${extractTimeFromDateTime(event.date)}<br>
  </p> 
  <p>Please arrive early to assist with track setup, we plan to begin racing at ${extractTimeFromDateTime(event.date)}</p>
  <p>We look forward to seeing you!</p>
  <p>Best of luck!</p>
`;

export const membershipPaymentConfirmationTemplate = (membership, payment) => `
  <p>Dear ${payment.name},<p>
  <p>Welcome to ORCA Ireland!<p>
  <p>Thank you for your payment of ${payment.amount} ${payment.currency}, we have activated your membership!</p>
  <p>
    Membership: <a href='https://orcaireland.com/membership'>${membership.name}</a><br>
    Start Date: ${getLocaleDate(membership.startDate)}<br>
    End Date: ${getLocaleDate(membership.endDate)}<br>
  </p> 
  <p>You can now register for <a href='https://orcaireland.com/events'>events</a></p>
  <p>We look forward to seeing you!</p>
`;