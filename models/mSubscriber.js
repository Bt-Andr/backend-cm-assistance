const mongoose = require('mongoose');

const subscriberSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  companyType: String,
  status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
  source: String,
  notes: String,
  referral: String
}, { timestamps: true });

module.exports = mongoose.model('subscriber', subscriberSchema);
