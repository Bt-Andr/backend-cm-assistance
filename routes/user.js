const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/mUser');
const PendingUserUpdate = require('../models/PendingUserUpdate');
const ModificationHistory = require('../models/ModificationHistory'); // À créer
const crypto = require('crypto');
const sendMail = require('../utils/sendMail');

// Configurer multer pour l'upload d'avatar
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });

// Mise à jour du profil utilisateur (JSON)
/*router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, email, avatarUrl, avatarFile } = req.body;
    const userId = req.user.userId;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
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
});*/

// Upload d'avatar (multipart/form-data)
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Aucun fichier envoyé" });
  const url = `/uploads/avatars/${req.file.filename}`;
  res.json({ url, filename: req.file.filename });
});

router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, email, avatarUrl, avatarFile } = req.body;
    const userId = req.user.userId;

    // Prépare les champs à modifier
    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;
    if (avatarFile !== undefined) updateFields.avatarFile = avatarFile;

    // Génère un token et une date d'expiration (24 heures)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1440 * 60 * 1000);

    // Stocke la demande
    const pendingUpdate = await PendingUserUpdate.create({
      userId,
      updateFields,
      token,
      expiresAt
    });

    // Envoie le mail de confirmation
    const confirmUrl = `https://localhost:8080/profile/confirm-update?token=${token}`;
    try {
      await sendMail({
        to: req.user.email,
        subject: "Confirmation de modification de profil",
        html: `
          <p>Vous avez demandé à modifier les informations suivantes :</p>
          <pre>${JSON.stringify(updateFields, null, 2)}</pre>
          <p>Date et heure de la demande : ${new Date().toLocaleString()}</p>
          <p>Pour confirmer, cliquez sur ce lien : <a href="${confirmUrl}">${confirmUrl}</a></p>
          <p>Ce lien expirera dans 24 heures.</p>
        `
      });
      res.status(200).json({ message: "Mail de confirmation envoyé. Veuillez vérifier votre boîte mail." });
    } catch (mailErr) {
      // Si l'envoi du mail échoue, supprime la demande en attente
      await PendingUserUpdate.deleteOne({ _id: pendingUpdate._id });
      console.error("Erreur lors de l'envoi du mail de confirmation :", mailErr);
      res.status(500).json({ message: "Erreur lors de l'envoi du mail de confirmation. Veuillez réessayer." });
    }
  } catch (err) {
    console.error("Erreur lors de la demande de modification :", err);
    res.status(500).json({ message: "Erreur lors de la demande de modification." });
  }
});

// Confirmation de la modification via le lien reçu par mail
router.get('/confirm-update', async (req, res) => {
  try {
    const { token } = req.query;
    const pending = await PendingUserUpdate.findOne({ token });

    if (!pending || pending.expiresAt < new Date()) {
      return res.status(400).send("Lien invalide ou expiré.");
    }

    // Applique la modification
    await User.findByIdAndUpdate(pending.userId, pending.updateFields);

    // Ajoute à l'historique d'audit
    await ModificationHistory.create({
      userId: pending.userId,
      updateFields: pending.updateFields,
      confirmedAt: new Date(),
      token: pending.token
    });

    // Supprime la demande en attente
    await PendingUserUpdate.deleteOne({ _id: pending._id });

    res.send("Modification confirmée et appliquée !");
  } catch (err) {
    res.status(500).send("Erreur lors de la confirmation.");
  }
});

module.exports = router;