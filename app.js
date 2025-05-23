const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/ticket');
const subscribeRoutes = require('./routes/subscribe');
const dashboardRoutes = require('./routes/dashboard');
const postsRoutes = require('./routes/posts');

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/subscribe', subscribeRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use('/api/posts', postsRoutes);

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connecté'))
    .catch(err => console.error(err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Serveur lancé sur le port ${PORT}`));