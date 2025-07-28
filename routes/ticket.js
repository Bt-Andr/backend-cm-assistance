const express = require('express');
const Ticket = require('../models/mTicket');
const User = require('../models/mUser');
const auth = require('../middleware/authMiddleware');
const verifyToken = require('../middleware/verifyToken');
const sendMail = require('../utils/sendMail');
const { createNotificationIfAllowed } = require('../utils/notificationUtils'); // Utilitaire centralisé
const router = express.Router();

// Protéger toute la route
router.use(auth);

// Création d'un ticket
router.post('/', verifyToken, async (req, res) => {
  try {
    const { subject, message, priority, category, tags, attachments } = req.body;
    const ticket = await Ticket.create({
      subject,
      message,
      priority,
      category,
      tags,
      attachments,
      user: req.userId,
      history: [{
        action: "created",
        message: "Ticket créé",
        author: req.userId,
        date: new Date()
      }]
    });
    const user = await User.findById(req.user.userId);

    // Notification email selon la préférence utilisateur
    if (user.preferences?.notifications?.newTicket) {
      await sendMail({
        to: user.email,
        subject: "Nouveau ticket créé",
        html: "<p>Votre ticket a bien été créé.</p>"
      });
    }

    // Notification in-app selon la préférence utilisateur (centralisée)
    await createNotificationIfAllowed({
      userId: user._id,
      type: "ticket_created",
      title: "Ticket créé",
      message: `Votre ticket "${subject}" a été créé.`,
      link: `/tickets/${ticket._id}`,
    });

    res.status(201).json({ message: "Ticket créé avec succès", ticket });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Liste des tickets
router.get('/', verifyToken, async (req, res) => {
  try {
    let tickets;
    if (req.user.role === "admin") {
      tickets = await Ticket.find();
    } else {
      // Filtre par userId ou email selon ton modèle
      tickets = await Ticket.find({ email: req.user.email });
      // ou : tickets = await Ticket.find({ userId: req.user.userId });
    }
    res.json(tickets);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des tickets" });
  }
});

// Répondre à un ticket
router.post('/:id/reply', verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.userId });
    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });
    ticket.history.push({
      action: "reply",
      message: req.body.message,
      author: req.userId,
      date: new Date()
    });
    await ticket.save();
    res.json({ message: "Réponse ajoutée", ticket });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la réponse au ticket" });
  }
});

// Évaluer un ticket
router.post('/:id/evaluate', verifyToken, async (req, res) => {
  try {
    const ticket = await Ticket.findOne({ _id: req.params.id, user: req.userId });
    if (!ticket) return res.status(404).json({ message: "Ticket non trouvé" });
    ticket.evaluated = true;
    ticket.rating = req.body.rating;
    ticket.evaluationComment = req.body.comment;
    await ticket.save();
    res.json({ message: "Ticket évalué", ticket });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de l'évaluation du ticket" });
  }
});

// Supprimer un ticket
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const deleted = await Ticket.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) return res.status(404).json({ message: "Ticket non trouvé" });

    // Notification in-app à la suppression du ticket (centralisée)
    await createNotificationIfAllowed({
      userId: req.userId,
      type: "ticket_deleted",
      title: "Ticket supprimé",
      message: `Votre ticket a été supprimé.`,
      link: `/tickets`,
    });

    res.json({ message: "Ticket supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du ticket" });
  }
});

module.exports = router;