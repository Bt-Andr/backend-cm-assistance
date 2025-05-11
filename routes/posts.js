const express = require('express');
const Publication = require('../models/mPosts');
const verifyToken = require('../middleware/verifyToken');
const router = express.Router();

// Création d'un post
router.post('/', verifyToken, async (req, res) => {
  try {
    const { title, content, platforms, date, status, image } = req.body;
    if (!title || !content) {
      return res.status(400).json({ error: "Le titre et le contenu sont obligatoires." });
    }
    const publication = await Publication.create({
      title,
      content,
      platforms,
      date,
      status,
      image,
      user: req.userId
    });
    res.status(201).json(publication);
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la création du post." });
    console.log(err);
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
    res.status(500).json({ error: "Erreur lors de la récupération des posts." });
  }
});

module.exports = router;