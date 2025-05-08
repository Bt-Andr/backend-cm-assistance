const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");

router.get("/", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);

    res.json({
      stats: {
        openTickets: 5,
        avgResponseTime: "1.5h",
        resolutionRate: "92%",
        newClients: 3
      },
      activity: [
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
