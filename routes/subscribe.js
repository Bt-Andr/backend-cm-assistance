const express = require('express');
const router = express.Router();
const Subscriber = require('../models/subscriber');
const sendConfirmationEmail = require('../utils/mailer');


router.post('/', async (req, res) => {
  try {
    const { name, email, companyType } = req.body;
    const newSubscriber = await Subscriber.create({ name, email, companyType });
    res.status(201).json({ message: 'Inscription réussie', data: newSubscriber });
    await sendConfirmationEmail(email, name);

  } catch (err) {
    if (err.code === 11000) {
      res.status(400).json({ error: 'Email déjà inscrit' });
    } else {
      res.status(500).json({ error: 'Erreur serveur' });
    }
  }
});

module.exports = router;
