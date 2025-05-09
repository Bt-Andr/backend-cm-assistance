const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'pending', 'closed'],
    default: 'open',
  },
  priority: {//Pour filtrer/statistiquement classer par priorité
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  createdAt: {//Pour trier les tickets récents ou calculer temps de réponse
    type: Date,
    default: Date.now,
  },
  resolvedAt: {//Pour calculer la durée de résolution
    type: Date,
    default: null,
  },
  assignedTo: {//Pour un jour attribuer un ticket à un agent/support spécifique
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  }
});

module.exports = mongoose.model('Ticket', ticketSchema);
