const bcrypt = require('bcrypt');
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, default: 'user' },

  // Tracker qui a référé ce compte (utile pour les stats)
  referredBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  // Sécurité et gestion de compte
  emailVerified: { type: Boolean, default: false },
  verificationToken: String,
  verificationTokenExpires: Date,
  resetPasswordToken: String,
  resetPasswordExpires: Date,

  // Avatar et préférences
  avatarUrl: String, // URL de l'avatar (optionnel)
  avatarFile: {
    type: String,
    default: null
  },
  preferences: {
    language: { type: String, default: 'fr' },
    // notifications devient un objet pour stocker chaque préférence individuellement
    notifications: {
      newTicket: { type: Boolean, default: true },
      postReminders: { type: Boolean, default: true },
      analytics: { type: Boolean, default: false },
      clientComms: { type: Boolean, default: true },
      realTime: { type: Boolean, default: true },
      sound: { type: Boolean, default: false }
    }
  },

  // Permissions et gestion avancée
  permissions: [String],
  isActive: { type: Boolean, default: true },
  deletedAt: Date,

  // Suivre l'inscription et l’activité
  lastActiveAt: { type: Date }
}, { timestamps: true }); // Ajoute createdAt et updatedAt automatiquement

// Méthode d'instance pour comparer les mots de passe
userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
