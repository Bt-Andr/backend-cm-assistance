const express = require("express");
const Notification = require("../models/Notification");
const verifyToken = require("../middleware/verifyToken");
const router = express.Router();

// Toutes les routes nécessitent l'utilisateur connecté
router.use(verifyToken);

// Récupérer les notifications de l'utilisateur connecté
router.get("/", async (req, res) => {
  try {
    const notifications = await Notification.find({ user: req.user.userId })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des notifications" });
  }
});

// Créer une notification (utile pour tests ou admin)
router.post("/", async (req, res) => {
  try {
    const { type, title, message, link } = req.body;
    const notif = await Notification.create({
      user: req.user.userId,
      type,
      title,
      message,
      link,
      read: false,
    });
    res.status(201).json(notif);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création de la notification" });
  }
});

// Marquer une notification comme lue
router.patch("/:id/read", async (req, res) => {
  try {
    const notif = await Notification.findOneAndUpdate(
      { _id: req.params.id, user: req.user.userId },
      { read: true },
      { new: true }
    );
    if (!notif) return res.status(404).json({ message: "Notification non trouvée" });
    res.json(notif);
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour de la notification" });
  }
});

// Marquer toutes les notifications comme lues
router.patch("/read-all", async (req, res) => {
  try {
    await Notification.updateMany(
      { user: req.user.userId, read: false },
      { $set: { read: true } }
    );
    res.json({ message: "Toutes les notifications ont été marquées comme lues" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la mise à jour des notifications" });
  }
});

module.exports = router;