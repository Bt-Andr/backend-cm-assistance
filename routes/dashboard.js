// routes/dashboard.js
const express = require('express');
const verifyToken = require('../middleware/authMiddleware');
const router = express.Router();

router.get("/", verifyToken, async (req, res) => {
  // Simule ou récupère des vraies données
  res.json({
    openTickets: 14,
    avgResponseTime: "1.2h",
    resolutionRate: "94%",
    newClients: 5,
    activities: [
      {
        title: "New Ticket Created",
        description: "Sarah Johnson created a new ticket",
        time: "10 minutes ago",
        type: "open",
      },
      // ...
    ]
  });
});

module.exports = router;