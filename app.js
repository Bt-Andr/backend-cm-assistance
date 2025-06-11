const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

// Import des routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/ticket');
const subscribeRoutes = require('./routes/subscribe');
const dashboardRoutes = require('./routes/dashboard');
const postsRoutes = require('./routes/posts');
const clientRoutes = require('./routes/clients');
const userRoutes = require('./routes/user');
const notificationRoutes = require('./routes/notification'); // <-- Ajout de la route notifications

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json()); // Middleware JSON avant les routes

// Création du dossier d'upload d'avatars si besoin
const uploadDir = path.join(__dirname, 'uploads/avatars');
fs.mkdirSync(uploadDir, { recursive: true });

// Permet le CORS aussi pour les fichiers statiques
app.use('/uploads/avatars', cors(), express.static(uploadDir));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/posts', postsRoutes);
app.use("/api/clients", clientRoutes);
app.use('/api/profile', userRoutes);
app.use('/api/notifications', notificationRoutes); // <-- Ajout de la route notifications

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));