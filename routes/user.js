const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/mUser');

// Mise à jour du profil utilisateur
router.put('/profile', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, email, company, position, avatar, phone } = req.body;
    const userId = req.user.userId;

    const updated = await User.findByIdAndUpdate(
      userId,
      { firstName, lastName, email, company, position, avatar, phone },
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ message: "Utilisateur non trouvé" });
    }
    res.json({ message: "Profil mis à jour", user: updated });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour du profil" });
  }
});

module.exports = router;