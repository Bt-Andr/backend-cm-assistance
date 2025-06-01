const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: { type: String, required: true },
  message: { type: String, required: true },
  status: {
    type: String,
    enum: ['open', 'pending', 'closed'],
    default: 'open',
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium',
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
  category: { type: String }, // Catégorie/type de ticket
  tags: [String], // Tags pour filtrage/organisation
  attachments: [String], // URLs ou chemins des pièces jointes
  history: [{
    action: String, // ex: "status_changed", "comment_added"
    message: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    date: { type: Date, default: Date.now }
  }],
  slaDueAt: { type: Date }, // Date limite SLA
  createdAt: {
    type: Date,
    default: Date.now,
  },
  resolvedAt: {
    type: Date,
    default: null,
  },
  // Champs pour l'évaluation du ticket
  evaluated: { type: Boolean, default: false },
  rating: { type: Number, min: 1, max: 5 },
  evaluationComment: { type: String },
  deletedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
}, { timestamps: true }); // Ajoute createdAt et updatedAt automatiquement

module.exports = mongoose.model('Ticket', ticketSchema);