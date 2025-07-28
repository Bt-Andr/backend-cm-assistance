const express = require("express");
const Client = require("../models/mClients");
const User = require("../models/mUser");
const verifyToken = require("../middleware/verifyToken");
const { createNotificationIfAllowed } = require("../utils/notificationUtils"); // Utilitaire centralisé
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

    // Notification in-app à la création (respecte la préférence realTime)
    await createNotificationIfAllowed({
      userId: req.userId,
      type: "client_created",
      title: "Nouveau client ajouté",
      message: `Le client "${name}" a été ajouté à votre liste.`,
      link: `/clients/${client._id}`,
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

    // Notification in-app à la suppression (respecte la préférence realTime)
    await createNotificationIfAllowed({
      userId: req.userId,
      type: "client_deleted",
      title: "Client supprimé",
      message: `Le client a été supprimé de votre liste.`,
      link: `/clients`,
    });

    res.json({ message: "Client supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du client" });
  }
});

module.exports = router;