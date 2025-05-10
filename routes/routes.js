
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/publications', publicationRoutes);
app.use('/api/posts', require('./routes/posts'));