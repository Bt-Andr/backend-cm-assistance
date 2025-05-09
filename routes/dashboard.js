const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const User = require("../models/user");
const Ticket = require("../models/ticket");

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }
    //tickets créés par cet utilisateur
    const openTickets = await Ticket?.countDocuments({ createdBy: userId, status: "open" }) ?? 0;
    const closedTickets = await Ticket?.countDocuments({ createdBy: userId, status: "closed" }) ?? 0;

     // Taux de résolution simple
     const resolutionRate = closedTickets + openTickets > 0
     ? `${Math.round((closedTickets / (closedTickets + openTickets)) * 100)}%`
     : "0%";

     // Temps de réponse fictif (à remplacer plus tard par la vraie mesure)
    const avgResponseTime = "1.5h";

    // Nouveaux clients ajoutés récemment (si applicable)
    const newClients = await User?.countDocuments({ referredBy: userId }) ?? 0;

    res.json({
      stats: {
        openTickets,
        avgResponseTime,
        resolutionRate,
        newClients,
      },
      activities: [
        {
          title: "Connexion réussie",
          description: "Bienvenue sur CM Assistance",
          time: "il y a quelques instants",
          icon: "CheckCircle"
        },
        {
          title: "New Ticket Created",
          description: "Sarah Johnson created a new ticket",
          time: "10 minutes ago",
          type: "open",
        }
      ],
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération du tableau de bord" });
  }
});

module.exports = router;
