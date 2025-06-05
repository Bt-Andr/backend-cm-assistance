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
const uploadsAvatars = express.static(path.join(__dirname, 'uploads/avatars'))

dotenv.config();
const app = express();

app.use(cors()); // <-- doit être AVANT les routes et les fichiers statiques

// Permet le CORS aussi pour les fichiers statiques
app.use('/uploads/avatars', cors(), express.static(path.join(__dirname, 'uploads/avatars')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/posts', postsRoutes);
app.use("/api/clients", clientRoutes);
app.use('/api/profile', userRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));

const uploadDir = path.join(__dirname, 'uploads/avatars');
fs.mkdirSync(uploadDir, { recursive: true });