// Convert all import statements to require()
const dotenv = require('dotenv');
dotenv.config(); // This now works reliably at the top of the file

const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');
const { connectToDatabase } = require('./config/db.js');
const authRoutes = require('./routes/auth.js');
const postRoutes = require('./routes/posts.js');
const categoryRoutes = require('./routes/categories.js');
const commentRoutes = require('./routes/comments.js');
const analyticsRoutes = require('./routes/analytics.js');

const app = express();

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// CORS with credentials
const clientOrigin = process.env.CLIENT_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: clientOrigin,
    credentials: true,
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

const PORT = process.env.PORT || 5000;

// Start server only after DB connects
connectToDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Failed to connect to database:', error);
    process.exit(1);
  });
