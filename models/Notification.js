const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: { type: String, required: true }, // ex: "ticket_created", "post_scheduled"
  title: { type: String }, // <-- Ajoute cette ligne
  message: { type: String, required: true },
  link: { type: String }, // URL pour rediriger l'utilisateur
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Notification', notificationSchema);