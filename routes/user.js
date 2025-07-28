const express = require('express');
const router = express.Router();
const multer = require('multer');
const verifyToken = require('../middleware/verifyToken');
const User = require('../models/mUser');
const PendingUserUpdate = require('../models/PendingUserUpdate');
const ModificationHistory = require('../models/ModificationHistory'); // À créer
const crypto = require('crypto');
const sendMail = require('../utils/sendMail');
const upload = require('../utils/cloudinaryStorage');
const Notification = require('../models/Notification'); // Ajoute ceci en haut

// Configurer multer pour l'upload d'avatar
/*const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/avatars/'),
  filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });*/

// Mise à jour du profil utilisateur (JSON)
router.put('/', verifyToken, async (req, res) => {
  try {
    const { name, email, avatarUrl, avatarFile } = req.body;
    const userId = req.user.userId;

    const updateFields = {};
    if (name !== undefined) updateFields.name = name;
    if (email !== undefined) updateFields.email = email;
    if (avatarUrl !== undefined) updateFields.avatarUrl = avatarUrl;
    if (avatarFile !== undefined) updateFields.avatarFile = avatarFile;

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 1440 * 60 * 1000);

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

      // Notification in-app
      await Notification.create({
        user: userId,
        type: "profile_update_requested",
        title: "Modification de profil demandée", // Ajout du champ title
        message: "Une demande de modification de profil a été initiée. Vérifiez votre boîte mail pour confirmer.",
        link: "/settings",
        read: false
      });

      res.status(200).json({ message: "Mail de confirmation envoyé. Veuillez vérifier votre boîte mail." });
    } catch (mailErr) {
      await PendingUserUpdate.deleteOne({ _id: pendingUpdate._id });
      console.error("Erreur lors de l'envoi du mail de confirmation :", mailErr);
      res.status(500).json({ message: "Erreur lors de l'envoi du mail de confirmation. Veuillez réessayer." });
    }
  } catch (err) {
    console.error("Erreur lors de la demande de modification :", err);
    res.status(500).json({ message: "Erreur lors de la demande de modification." });
  }
});

// Upload d'avatar (multipart/form-data)
router.post('/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: "Aucun fichier envoyé" });
  }
  // L'URL Cloudinary est dans req.file.path
  res.json({ url: req.file.path, filename: req.file.filename });
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

// Demande de changement de mot de passe (avec confirmation par mail)
router.post('/password', verifyToken, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.userId;

    // Vérifie le mot de passe actuel
    const user = await User.findById(userId);
    if (!user || !(await user.comparePassword(currentPassword))) {
      return res.status(400).json({ message: "Mot de passe actuel incorrect." });
    }

    // Validation moderne du nouveau mot de passe
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit contenir au moins 8 caractères." });
    }
    if (newPassword === currentPassword) {
      return res.status(400).json({ message: "Le nouveau mot de passe doit être différent de l'ancien." });
    }
    // Optionnel : vérifie la complexité (au moins une majuscule, une minuscule, un chiffre, un caractère spécial)
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!complexityRegex.test(newPassword)) {
      return res.status(400).json({
        message:
          "Le nouveau mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.",
      });
    }

    // Génère un token et une date d'expiration (24 heures)
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

    await PendingUserUpdate.create({
      userId,
      updateFields: { password: newPassword },
      token,
      expiresAt
    });

    // Ici, NE PAS refaire `const user = ...`
    // Utilise simplement `user.email` pour l'envoi du mail
    await sendMail({
      to: user.email,
      subject: "Confirmation de changement de mot de passe",
      html: `
        <p>Vous avez demandé à changer votre mot de passe.</p>
        <p>Date et heure de la demande : ${new Date().toLocaleString()}</p>
        <p>Pour confirmer, cliquez sur ce lien : <a href="${confirmUrl}">${confirmUrl}</a></p>
        <p>Ce lien expirera dans 24 heures.</p>
      `
    });

    // Notification in-app
    await Notification.create({
      user: userId,
      type: "password_update_requested",
      title: "Changement de mot de passe demandé", // Ajout du champ title
      message: "Une demande de changement de mot de passe a été initiée. Vérifiez votre boîte mail pour confirmer.",
      link: "/settings",
      read: false
    });

    res.status(200).json({ message: "Mail de confirmation envoyé. Veuillez vérifier votre boîte mail." });
  } catch (err) {
    console.error("Erreur lors de la demande de changement de mot de passe :", err);
    res.status(500).json({ message: "Erreur lors de la demande de changement de mot de passe." });
  }
});

// Mise à jour des préférences de notifications de l'utilisateur connecté
router.put('/preferences', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const { notifications } = req.body;

    if (!notifications || typeof notifications !== "object") {
      return res.status(400).json({ message: "Préférences de notifications invalides." });
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { "preferences.notifications": notifications },
      { new: true, upsert: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }

    // Notification in-app (optionnelle)
    await Notification.create({
      user: userId,
      type: "preferences_updated",
      title: "Préférences mises à jour", // Ajout du champ title
      message: "Vos préférences de notifications ont été mises à jour.",
      link: "/settings",
      read: false
    });

    res.json({ message: "Préférences de notifications mises à jour.", notifications: updated.preferences.notifications });
  } catch (err) {
    console.error("Erreur lors de la mise à jour des préférences de notifications :", err);
    res.status(500).json({ message: "Erreur lors de la mise à jour des préférences de notifications." });
  }
});

// Récupération des préférences de notifications de l'utilisateur connecté
router.get('/preferences', verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;
    const user = await User.findById(userId).lean();
    if (!user) {
      return res.status(404).json({ message: "Utilisateur non trouvé." });
    }
    res.json({ notifications: user.preferences?.notifications || {} });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des préférences." });
  }
});

module.exports = router;