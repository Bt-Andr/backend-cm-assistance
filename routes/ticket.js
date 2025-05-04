const express = require('express');
const Ticket = require('../models/ticket');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

// Protéger toute la route
router.use(auth);

router.post('/', auth, async (req, res) => {
  const ticket = await Ticket.create({ ...req.body, user: req.userId });
  res.status(201).json(ticket);
});

router.get('/', auth, async (req, res) => {
  const tickets = await Ticket.find({ user: req.userId });
  res.json(tickets);
});

module.exports = router;
