const express = require("express");
const Client = require("../models/mClients");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// Créer un client
router.post("/", verifyToken, async (req, res) => {
  try {
    const { name, email, phone, address, status, socialNetworks } = req.body;
    const client = await Client.create({
      name,
      email,
      phone,
      address,
      status,
      socialNetworks,
      user: req.userId,
    });
    res.status(201).json({ message: "Client créé avec succès", client });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Récupérer tous les clients de l'utilisateur connecté
router.get("/", verifyToken, async (req, res) => {
  try {
    const clients = await Client.find({ user: req.userId });
    // Adapter pour le frontend : renvoyer un tableau sous la clé "clients"
    res.json({ clients });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Supprimer un client
router.delete("/:id", verifyToken, async (req, res) => {
  try {
    const deleted = await Client.findOneAndDelete({ _id: req.params.id, user: req.userId });
    if (!deleted) {
      return res.status(404).json({ message: "Client non trouvé ou non autorisé." });
    }
    res.json({ message: "Client supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du client" });
  }
});

module.exports = router;