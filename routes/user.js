const express = require('express');
const router = express.Router();
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/mUser');

// Mise à jour du profil utilisateur (inclut l'avatar)
router.put('/', verifyToken, async (req, res) => {
  try {
    const { firstName, lastName, email, company, position, avatarUrl, avatarFile, phone } = req.body;
    const userId = req.user.userId;

    const updateFields = {
      firstName,
      lastName,
      email,
      company,
      position,
      phone,
    };

    // Si un avatarUrl ou un avatarFile est fourni, on l'ajoute à la mise à jour
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;
    if (avatarFile !== undefined) updateFields.avatarFile = avatarFile;

    const updated = await User.findByIdAndUpdate(
      userId,
      updateFields,
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