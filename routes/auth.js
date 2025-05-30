const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/mUser');
const router = express.Router();

// REGISTER
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, avatarUrl, preferences } = req.body;
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

    // Ici, tu dois générer un token de reset et envoyer un email (implémentation à adapter)
    // Par exemple :
    // const resetToken = ...;
    // await sendResetEmail(user.email, resetToken);

    res.status(200).json({ message: "Un email de réinitialisation a été envoyé." });
  } catch (error) {
    console.error("Erreur forgot-password :", error);
    res.status(500).json({ message: "Erreur serveur" });
  }
});

module.exports = router;
