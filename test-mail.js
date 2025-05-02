require('dotenv').config();
const sendConfirmationEmail = require('./utils/mailer');

sendConfirmationEmail('destinataire@test.com', 'Testeur')
  .then(() => {
    console.log('✅ Email envoyé avec succès.');
  })
  .catch((err) => {
    console.error('❌ Erreur lors de l’envoi :', err);
  });
