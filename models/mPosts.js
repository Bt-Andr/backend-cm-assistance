const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: String,
  date: { type: String, required: true },
  scheduledAt: { type: Date }, // Date de programmation réelle
  image: String,
  platforms: [String],
  reactions: {
    likes: { type: Number, default: 0 },
    comments: { type: Number, default: 0 },
    shares: { type: Number, default: 0 }
  },
  status: { type: String, enum: ["draft", "published", "failed", "pending", "scheduled"], default: "draft" },
  platformStatus: [{
    platform: String,
    status: { type: String, enum: ["pending", "published", "failed"], default: "pending" },
    errorMessage: String
  }],
  errorMessage: String, // Message d'erreur global si échec
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
}, { timestamps: true }); // Ajoute createdAt et updatedAt

module.exports = mongoose.model("Post", PostSchema);