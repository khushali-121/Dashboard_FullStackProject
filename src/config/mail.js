const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ to, subject, text }) => {
  await sgMail.send({
    to,
    from: process.env.EMAIL_USER, 
    subject,
    text
  });
};

module.exports = sendMail;
