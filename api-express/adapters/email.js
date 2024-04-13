require('dotenv').config()
import { MembershipModel } from '../models/MembershipModel'
import { Permissions } from '../utils/permissions.js'
const nodeMailer = require('nodemailer')

const testMode = process.env.TEST_MODE === '1'
const testRecipient = process.env.TEST_EMAIL_ADDR 

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

export const sendEmail = async (recipient, subject, html) => {
  try {
    const emailer = emailTransporter()
    const mailOptions = {
      to: testMode ? testRecipient : recipient,
      from: process.env.CLUB_EMAIL_ADDR,
      subject: subject,
      html,
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
      accepted
    }
  } catch (error) {
    return { success: false, error: error } 
  }
}

const getLocaleDate = (date) => new Date(date).toLocaleDateString(
  'en-IE', 
  { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
);

export const sendEmailToActiveMembers = async (req, res) => {
  try {
    const permissions = new Permissions()

    if (!permissions.check(req.get('Authorization').replace('Bearer', '').trim(), 'post', 'email')) {
      return res.status(403).send({
        success: false,
        message: 'forbidden'
      });
    }

    const { subject, message, html } = req.body;
    const hasHtml = !!html 
    const hasMessage = !!message 

    if (!subject || (!hasMessage && !hasHtml)) {
      return res.status(400).send({
        success: false,
        message: 'please provide a subject and message or html content'
      });
    }

    const membershipDb = new MembershipModel();
    const currentMembershipData = await membershipDb.getCurrentMembershipWithFullUser();
    const currentMembership = currentMembershipData[0];
    const userEmails = currentMembership.users.map(user => user.email);
    const commaSeparatedEmails = userEmails.join(',');

    if (!currentMembership || !currentMembership.users || currentMembership.users.length === 0) {
      return res.status(404).send({
        success: false,
        message: 'No active members found'
      })
    }

    const htmlContent = html ? html : getHtmlMessage(message);

    const response = testMode 
      ? await sendEmail(testRecipient, subject, htmlContent)
      : await sendEmail(commaSeparatedEmails, subject, htmlContent);

    if (!response.success) {
      return res.status(500).send({
        success: false,
        message: 'error sending email(s): ' + JSON.stringify(response) 
      }) 
    }

    return res.status(200).send({
      success: true,
      message: response.allAccepted 
        ? `Successfully sent to ${response.accepted.length} active members`
        : `Successfully sent to ${response.accepted.length} and ${response.rejected.length} failed to send to the following recipients: ${response.rejected.join(', ')}`
    });

  } catch (error) {
    return res.status(500).send({
      success: false,
      message: 'internal server error: '+error.message
    }) 
  }

}
 
export const eventPaymentConfirmationTemplate = (event, payment) =>
  `<p>We have received your payment of ${payment.amount} ${payment.currency} and confirmed your place for the following event:</p>
  <p>
    Event: <a href='https://orcaireland.com/events/${event_id.toString()}'>${event.name}</a><br>
    Date: ${getLocaleDate(event.date)}<br>
  </p> 
  <p>We look forward to seeing you!</p>
  <p>Best of luck!</p>
  <p><a href='https://orcaireland.com'>On Road Cicruit Association</a></p>`;

export const membershipPaymentConfirmationTemplate = (membership, payment) => 
  `<p>We have received your payment of ${payment.amount} ${payment.currency} and have activated your membership!</p>
  <p>
    Membership: <a href='https://orcaireland.com/membership'>${membership.name}</a><br>
    Start Date: ${getLocaleDate(membership.startDate)}<br>
    End Date: ${getLocaleDate(membership.endDate)}<br>
  </p> 
  <p>You can now register for <a href='https://orcaireland.com/events'>events</a></p>
  <p>We look forward to seeing you!</p>
  <p><a href='https://orcaireland.com'>On Road Cicruit Association</a></p>`;