const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Mets ta clé API dans les variables d'environnement

module.exports = async function sendMail({ to, subject, html }) {
  const msg = {
    to,
    from: 'mrola609@gmail.com', // L'adresse Single Sender vérifiée sur SendGrid
    subject,
    html,
  };
  await sgMail.send(msg);
};