const express = require('express');
const Publication = require('../models/publication');
const auth = require('../middleware/authMiddleware');
const router = express.Router();

router.post('/', auth, async (req, res) => {
  const publication = await Publication.create({ ...req.body, user: req.userId });
  res.status(201).json(publication);
});

router.get('/', auth, async (req, res) => {
  const publications = await Publication.find({ user: req.userId });
  res.json(publications);
});

module.exports = router;
