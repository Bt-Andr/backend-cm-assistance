const express = require('express');
const Publication = require('../models/mPosts');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Création d'un post
router.post('/', verifyToken, async (req, res) => {
  try {
    const {
      title,
      content,
      platforms,
      date,
      status,
      image,
      scheduledAt,
      platformStatus,
      errorMessage
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Le titre et le contenu sont obligatoires." });
    }

    let finalStatus = "draft";

    if (status === "publish") {
      const publishSuccess = true; // Remplace par ta logique réelle
      finalStatus = publishSuccess ? "published" : "failed";
    } else if (status === "schedule") {
      const scheduleSuccess = true; // Remplace par ta logique réelle
      finalStatus = scheduleSuccess ? "scheduled" : "failed";
    } else if (status === "draft") {
      finalStatus = "draft";
    }

    const publication = await Publication.create({
      title,
      content,
      platforms,
      date,
      scheduledAt,
      status: finalStatus,
      image,
      platformStatus,
      errorMessage,
      user: req.userId
    });

    res.status(201).json({
      message: "Post créé avec succès",
      post: publication
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la création du post." });
    console.log(err);
  }
});

// Modification d'un post
router.put('/:id', verifyToken, async (req, res) => {
  try {
    const { title, content, image } = req.body;
    const postId = req.params.id;

    const updated = await Publication.findOneAndUpdate(
      { _id: postId, user: req.userId },
      { title, content, image },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Post non trouvé ou non autorisé." });
    }

    res.json({
      message: "Post modifié avec succès",
      post: updated
    });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la modification du post." });
  }
});

// Suppression d'un post
router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const postId = req.params.id;
    const deleted = await Publication.findOneAndDelete({ _id: postId, user: req.userId });
    if (!deleted) {
      return res.status(404).json({ message: "Post non trouvé ou non autorisé." });
    }
    res.json({ message: "Post supprimé avec succès" });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la suppression du post." });
  }
});

// Récupération des posts de l'utilisateur connecté
router.get('/', verifyToken, async (req, res) => {
  try {
    const posts = await Publication.find({ user: req.userId });
    const total = await Publication.countDocuments({ user: req.userId });
    // Transformation : _id -> id
    const postsWithId = posts.map(post => {
      const obj = post.toObject();
      obj.id = obj._id;
      delete obj._id;
      delete obj.__v;
      return obj;
    });
    res.json({ posts: postsWithId, total });
  } catch (err) {
    res.status(500).json({ message: "Erreur lors de la récupération des posts." });
  }
});

module.exports = router;