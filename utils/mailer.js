const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail', // ou autre : 'mailgun', 'sendgrid'...
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});

const sendConfirmationEmail = (to, name) => {
  const mailOptions = {
    from: `CM Assistance <${process.env.MAIL_USER}>`,
    to,
    subject: 'Bienvenue dans la bêta privée CM Assistance',
    html: `
      <p>Bonjour ${name},</p>
      <p>Merci de vous être inscrit à notre bêta privée.</p>
      <p>Nous reviendrons très vite vers vous avec les accès !</p>
      <p>– L'équipe CM Assistance</p>
    `
  };

  return transporter.sendMail(mailOptions);
};

module.exports = sendConfirmationEmail;