const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  platforms: [String], // tableau de plateformes
  status: { type: String, default: 'scheduled' },
  date: Date, // même nom que le frontend
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Publication', publicationSchema);
