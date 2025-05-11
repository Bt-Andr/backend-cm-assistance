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
  },
  status: { type: String, enum: ["draft", "published", "failed", "pending"], default: "draft" }, // Ajout du champ status
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Ajout du champ user
});

module.exports = mongoose.model("Post", PostSchema);