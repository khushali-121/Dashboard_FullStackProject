const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendMail = async ({ to, subject, html, text }) => {
  await sgMail.send({
    to,
    from:{
      name: process.env.EMAIL_FROM_NAME,
      email: process.env.EMAIL_USER, 
    } ,
    subject,
    html,
    text
  });
};

module.exports = sendMail;
