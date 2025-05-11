const express = require('express');
const Ticket = require('../models/mTicket');
const auth = require('../middleware/authMiddleware');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Protéger toute la route
router.use(auth);

router.post('/', verifyToken, async (req, res) => {
  const ticket = await Ticket.create({ ...req.body, user: req.userId });
  res.status(201).json(ticket);
});

router.get('/', verifyToken, async (req, res) => {
  const tickets = await Ticket.find({ user: req.userId });
  res.json(tickets);
});

module.exports = router;
