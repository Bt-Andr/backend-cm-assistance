const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Ticket = require("../models/ticket");
const User = require("../models/user");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Récupération des tickets de l'utilisateur
    const tickets = await Ticket.find({ user: userId }); // <-- adapte ici si besoin

    const openTickets = tickets.filter(t => t.status === "open").length;
    const closedTickets = tickets.filter(t => t.status === "closed").length;
    const pendingTickets = tickets.filter(t => t.status === "pending").length;
    const allResolved = tickets.filter(t => t.resolvedAt);

    // Temps moyen de réponse estimé (temps entre création et résolution)
    let avgResponseTime = "N/A";
    if (allResolved.length > 0) {
      const totalResponseTimeMs = allResolved.reduce((acc, ticket) => {
        const created = new Date(ticket.createdAt);
        const resolved = new Date(ticket.resolvedAt);
        return acc + (resolved - created);
      }, 0);

      const avgMs = totalResponseTimeMs / allResolved.length;
      const hours = Math.floor(avgMs / (1000 * 60 * 60));
      const minutes = Math.floor((avgMs % (1000 * 60 * 60)) / (1000 * 60));
      avgResponseTime = `${hours}h ${minutes}m`;
    }

    // Taux de résolution
    const resolutionRate = tickets.length > 0 ? `${Math.round((closedTickets / tickets.length) * 100)}%` : "0%";

    // Clients ajoutés par l'utilisateur (si applicable)
    const newClients = await User.countDocuments({ referredBy: userId }); // <-- adapte ici si besoin

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    res.json({
      stats: {
        openTickets,
        avgResponseTime,
        resolutionRate,
        newClients: isNaN(newClients) ? 0 : newClients
      },
      activities: [
        {
          title: "Connexion réussie",
          description: "Bienvenue sur CM Assistance",
          time: "il y a quelques instants",
          type: "other"
        },
        {
          title: "Statistiques mises à jour",
          description: `Vous avez ${openTickets} tickets ouverts` || "",
          time: "Aujourd'hui",
          type: "open"
        }
      ],
      user: {
        id: user._id,
        email: user.email,
        name: user.name
      }
    });
  } catch (err) {
    console.error("Erreur dashboard:", err);
    res.status(500).json({ error: "Erreur lors de la récupération du tableau de bord" });
  }
});

module.exports = router;
