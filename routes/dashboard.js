const express = require("express");
const router = express.Router();
const verifyToken = require("../middleware/verifyToken");
const Ticket = require("../models/ticket");
const User = require("../models/user");

router.get("/", verifyToken, async (req, res) => {
  try {
    const userId = req.user.userId;

    // Définition des bornes de date
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);

    // Période précédente (1 jour)
    const now = new Date();
    const lastDay = new Date();
    lastDay.setDate(now.getDate() - 1);

    // Récupération des tickets de l'utilisateur
    const tickets = await Ticket.find({ user: userId }); // <-- adapte ici si besoin

    const openTickets = tickets.filter(t => t.status === "open").length;
    const closedTickets = tickets.filter(t => t.status === "closed").length;
    const pendingTickets = tickets.filter(t => t.status === "pending").length;
    const allResolved = tickets.filter(t => t.resolvedAt);

    // Tickets ouverts le jour precedent
    const prevTickets = await Ticket.find({
    user: userId,
    status: "open",
    createdAt: { $gte: lastDay, $lt: now }
    });
    const prevOpenTickets = prevTickets.length;

    // Calcul du trend
    let openTicketsTrend = "0%";
    let openTicketsIsPositive = true;
    if (prevOpenTickets > 0) {
    const diff = openTickets - prevOpenTickets;
    const percent = Math.round((diff / prevOpenTickets) * 100);
    openTicketsTrend = (percent > 0 ? "+" : "") + percent + "%";
    openTicketsIsPositive = percent >= 0;
    }

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
    // Tickets resolu aujourd'hui
    const todayResolved = tickets.filter(
        t => t.resolvedAt && t.resolvedAt >= today && t.resolvedAt < tomorrow
    );
    const avgTodayMs = todayResolved.length > 0
    ? todayResolved.reduce((acc, t) => acc + (new Date(t.resolvedAt) - new Date(t.createdAt)), 0) / todayResolved.length
    : 0;

    // Tickets résolus hier
    const yesterdayResolved = tickets.filter(
        t => t.resolvedAt && t.resolvedAt >= yesterday && t.resolvedAt < today
    );
    const avgYesterdayMs = yesterdayResolved.length > 0
    ? yesterdayResolved.reduce((acc, t) => acc + (new Date(t.resolvedAt) - new Date(t.createdAt)), 0) / yesterdayResolved.length
    : 0;

    // Calcul du trend avgResponseTimeTrend
    let avgResponseTimeTrend = "0%";
    let avgResponseTimeIsPositive = true;
    if (avgYesterdayMs > 0) {
        const diff = avgTodayMs - avgYesterdayMs;
        const percent = Math.round((diff / avgYesterdayMs) * 100);
        avgResponseTimeTrend = (percent > 0 ? "+" : "") + percent + "%";
        avgResponseTimeIsPositive = percent <= 0; // une baisse est positive (temps de réponse plus court)
    }

    // Taux de résolution
    const resolutionRate = tickets.length > 0 ? `${Math.round((closedTickets / tickets.length) * 100)}%` : "0%";

    // Tickets résolus aujourd'hui
    const todayClosed = tickets.filter(
      t => t.status === "closed" && t.resolvedAt && t.resolvedAt >= today && t.resolvedAt < tomorrow ).length;
    const todayTotal = tickets.filter( t => t.createdAt >= today && t.createdAt < tomorrow ).length;
    const resolutionRateToday = todayTotal > 0 ? Math.round((todayClosed / todayTotal) * 100) : 0;

    // Tickets résolus aujourd'hui
    const yesterdayClosed = tickets.filter(
      t => t.status === "closed" && t.resolvedAt && t.resolvedAt >= yesterday && t.resolvedAt < today
    ).length;
    const yesterdayTotal = tickets.filter( t => t.createdAt >= yesterday && t.createdAt < today ).length;
    const resolutionRateYesterday = yesterdayTotal > 0 ? Math.round((yesterdayClosed / yesterdayTotal) * 100) : 0;

    // Calcule le trend
    let resolutionRateTrend = "0%";
    let resolutionRateIsPositive = true;
    if (resolutionRateYesterday > 0) {
      const diff = resolutionRateToday - resolutionRateYesterday;
      const percent = Math.round((diff / resolutionRateYesterday) * 100);
      resolutionRateTrend = (percent > 0 ? "+" : "") + percent + "%";
      resolutionRateIsPositive = percent >= 0;
    }

    

    // Clients ajoutés par l'utilisateur (si applicable)
    const newClients = await User.countDocuments({ referredBy: userId }); // <-- adapte ici si besoin

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ error: "Utilisateur non trouvé" });
    }

    // Calcule le nombre de nouveaux clients aujourd’hui
    const newClientsToday = await User.countDocuments({
      referredBy: userId,
      createdAt: { $gte: today, $lt: tomorrow }
    });

    //Calcule le nombre de nouveaux clients hier
    const newClientsYesterday = await User.countDocuments({
      referredBy: userId,
      createdAt: { $gte: yesterday, $lt: today }
    });

    //Calcule le trend
    let newClientsTrend = "0%";
    let newClientsIsPositive = true;
    if (newClientsYesterday > 0) {
      const diff = newClientsToday - newClientsYesterday;
      const percent = Math.round((diff / newClientsYesterday) * 100);
      newClientsTrend = (percent > 0 ? "+" : "") + percent + "%";
      newClientsIsPositive = percent >= 0;
    }

    // Exemple de notifications dynamiques (à adapter selon ta logique)
    const notifications = [
      {
        title: "Nouveau ticket reçu",
        time: "il y a 5 minutes",
        type: "open"
      },
      {
        title: "Ticket résolu",
        time: "il y a 1 heure",
        type: "closed"
      }
      // ...ajoute d'autres notifications dynamiques ici...
    ];

    //réponse
    res.json({
      stats: {
        openTickets,
        openTicketsTrend,
        openTicketsIsPositive,
        resolutionRate,
        resolutionRateTrend,
        resolutionRateIsPositive,
        avgResponseTime,
        avgResponseTimeTrend,
        avgResponseTimeIsPositive,
        newClients: isNaN(newClients) ? 0 : newClients,
        newClientsTrend,
        newClientsIsPositive,
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
      notifications, // <-- Ajoute cette ligne
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
