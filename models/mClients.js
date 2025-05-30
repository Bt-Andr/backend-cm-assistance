const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  address: String,
  status: { type: String, enum: ["Active", "Inactive"], default: "Active" },
  notes: String, // Ajout d'un champ notes/description
  tags: [String], // Ajout de tags pour le classement/filtrage
  onboardingStatus: { // Suivi du processus commercial
    type: String,
    enum: ["pending", "active", "completed"],
    default: "pending"
  },
  collaborators: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }], // Multi-utilisateurs/collaborateurs
  socialNetworks: [
    {
      type: { type: String }, // ex: "Facebook", "Instagram", etc.
      handle: String,
      url: String,
      status: { type: String, enum: ["Active", "Inactive"], default: "Active" }
    }
  ],
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" } // Pour filtrer par utilisateur
}, { timestamps: true }); // Ajout des dates de création/mise à jour

module.exports = mongoose.model("Client", ClientSchema);