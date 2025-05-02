const mongoose = require('mongoose');

const publicationSchema = new mongoose.Schema({
  content: String,
  platform: String,
  status: { type: String, default: 'scheduled' },
  publishDate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = mongoose.model('Publication', publicationSchema);
