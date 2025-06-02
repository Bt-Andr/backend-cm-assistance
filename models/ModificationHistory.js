const mongoose = require('mongoose');

const modificationHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updateFields: { type: Object, required: true },
  confirmedAt: { type: Date, required: true },
  token: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('ModificationHistory', modificationHistorySchema);