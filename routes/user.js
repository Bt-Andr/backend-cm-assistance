const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/mUser');

// Configurer multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Mise à jour du profil utilisateur (JSON)
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

// Upload d'avatar (multipart/form-data)
router.post('/profile/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé" });
  const url = `/uploads/avatars/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

module.exports = router;