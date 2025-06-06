const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/mUser');
const ResetToken = require('../models/ResetToken');
const sendMail = require('../utils/sendMail'); // À adapter selon ton projet
const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatarUrl, preferences } = req.body;

    // Validation moderne du mot de passe
    if (!password || typeof password !== "string" || password.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }
    // Complexité : majuscule, minuscule, chiffre, caractère spécial
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!complexityRegex.test(password)) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.",
      });
    }

    const hashed = await bcrypt.hash(password, 10);

    // Sécurité : ignorer tout champ "role" venant du frontend
    const user = await User.create({ 
      name, 
      email, 
      password: hashed,
      avatarUrl,
      preferences,
      role: "user"
    });

    // Générer le token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Ne jamais retourner le mot de passe
    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      message: "Inscription réussie",
      token,
      user: userObj
    });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier si l'utilisateur existe
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Email incorrect" });

    // Vérifier le mot de passe
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(401).json({ message: "Mot de passe incorrect" });

    // Générer un token avec le rôle
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "2h" }
    );

    // Ne jamais retourner le mot de passe
    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      message: "Connexion réussie",
      token,
      user: userObj
    });

  } catch (error) {
    console.error("Erreur login :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// FORGOT PASSWORD
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Aucun utilisateur trouvé avec cet email." });
    }

    // Génère un token unique et une date d'expiration (1h)
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Supprime les anciens tokens pour cet utilisateur
    await ResetToken.deleteMany({ userId: user._id });

    // Stocke le nouveau token
    await ResetToken.create({
      userId: user._id,
      token,
      expiresAt,
    });

    // Envoie l'email de réinitialisation
    const resetUrl = `http://localhost:8080/reset-password?token=${token}`;
    await sendMail({
      to: user.email,
      subject: "Réinitialisation de votre mot de passe",
      html: `
        <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
        <p>Cliquez sur ce lien pour choisir un nouveau mot de passe : <a href="${resetUrl}">${resetUrl}</a></p>
        <p>Ce lien expirera dans 1 heure.</p>
      `
    });

    res.status(200).json({ message: "Un email de réinitialisation a été envoyé." });
  } catch (error) {
    console.error("Erreur forgot-password :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

// RESET PASSWORD
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // 1. Vérifie le token de reset
    const resetRecord = await ResetToken.findOne({ token });
    if (!resetRecord || resetRecord.expiresAt < new Date()) {
      return res.status(400).json({ message: "Lien de réinitialisation invalide ou expiré." });
    }

    // 2. Valide le nouveau mot de passe (mêmes règles que l'inscription)
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 8) {
      return res.status(400).json({ message: "Le mot de passe doit contenir au moins 8 caractères." });
    }
    const complexityRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
    if (!complexityRegex.test(newPassword)) {
      return res.status(400).json({
        message: "Le mot de passe doit contenir au moins une majuscule, une minuscule, un chiffre et un caractère spécial.",
      });
    }

    // 3. Met à jour le mot de passe de l'utilisateur (hashé)
    const hashed = await bcrypt.hash(newPassword, 10);
    await User.findByIdAndUpdate(resetRecord.userId, { password: hashed });

    // 4. Invalide le token (suppression)
    await ResetToken.deleteOne({ _id: resetRecord._id });

    res.status(200).json({ message: "Mot de passe réinitialisé avec succès." });
  } catch (error) {
    console.error("Erreur reset-password :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
