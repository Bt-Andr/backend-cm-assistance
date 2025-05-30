const express = require('express');
const Ticket = require('../models/mTicket');
const auth = require('../middleware/authMiddleware');
const verifyToken = require('../middleware/verifyToken');
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
    res.status(201).json({ message: "Ticket créé avec succès", ticket });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Liste des tickets
router.get('/', verifyToken, async (req, res) => {
  try {
    const tickets = await Ticket.find({ user: req.userId });
    res.json({ data: tickets });
  } catch (err) {
    res.status(500).json({ message: err.message });
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
    res.json({ message: "Ticket supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du ticket" });
  }
});

module.exports = router;