const mongoose = require('mongoose');

const pendingUserUpdateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  updateFields: { type: Object, required: true }, // ex: { name: "...", email: "..." }
  token: { type: String, required: true, unique: true },
  expiresAt: { type: Date, required: true }
}, { timestamps: true });

pendingUserUpdateSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PendingUserUpdate', pendingUserUpdateSchema);