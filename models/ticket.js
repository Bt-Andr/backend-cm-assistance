const mongoose = require('mongoose');

const ticketSchema = new mongoose.Schema({
  subject: String,
  message: String,
  status: { type: String, default: 'open' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Ticket', ticketSchema);
