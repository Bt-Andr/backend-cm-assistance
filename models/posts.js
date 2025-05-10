const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  date: { type: String, required: true },
  image: String,
  platforms: [String],
  reactions: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  }
});

module.exports = mongoose.model("Post", PostSchema);