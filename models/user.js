const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },

  // Tracker qui a référé ce compte (utile pour les stats)
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Suivre l'inscription
  createdAt: { type: Date, default: Date.now },

  // Exemple futur pour suivre l’activité (connexion, actions, etc.)
  lastActiveAt: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
