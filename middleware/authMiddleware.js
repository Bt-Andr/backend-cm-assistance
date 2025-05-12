const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Accès non autorisé (pas de token)" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Ex: { userId, email, iat, exp }
    req.userId = decoded.userId; // <-- AJOUTE CETTE LIGNE
    next();
  } catch (err) {
    console.error("Token invalide :", err);
    return res.status(401).json({ error: "Token invalide ou expiré" });
  }
};

module.exports = authMiddleware;
