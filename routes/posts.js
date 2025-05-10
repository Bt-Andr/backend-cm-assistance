const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/auth");

// Exemple de données mockées (à remplacer par une vraie base de données)
const allPosts = [
  {
    id: 1,
    title: "Nouveau lancement produit",
    content: "Découvrez notre nouveau produit révolutionnaire !",
    date: "2024-05-01",
    image: "https://via.placeholder.com/150",
    platforms: ["Facebook", "Twitter"],
    reactions: { likes: 120, comments: 34, shares: 12 }
  },
  {
    id: 2,
    title: "Astuce du jour",
    content: "Voici une astuce pour améliorer votre productivité.",
    date: "2024-05-02",
    image: "https://via.placeholder.com/150",
    platforms: ["Instagram"],
    reactions: { likes: 80, comments: 10, shares: 5 }
  },
  // ...ajoute d'autres posts ici...
];

// GET /api/posts?page=1&limit=5
router.get("/", verifyToken, (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 5;
  const start = (page - 1) * limit;
  const end = start + limit;

  const paginatedPosts = allPosts.slice(start, end);

  res.json({
    posts: paginatedPosts,
    total: allPosts.length
  });
});

module.exports = router;