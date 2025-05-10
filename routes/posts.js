const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");
const Post = require("../models/post");

// GET /api/posts?page=1&limit=5
router.get("/", verifyToken, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      Post.find().skip(skip).limit(limit).lean(),
      Post.countDocuments()
    ]);

    res.json({ posts, total });
  } catch (err) {
    res.status(500).json({ error: "Erreur lors de la récupération des posts" });
  }
});

module.exports = router;