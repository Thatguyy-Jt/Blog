// --- index.js (FINAL FIX) ---
const dotenv = require('dotenv');
dotenv.config();

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

// 🚨 CRITICAL ADDITION: Trust the proxy (Render) to correctly handle secure headers
app.set('trust proxy', 1); 

// Middleware
app.use(morgan('dev'));
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

// 🚨 CRITICAL ADDITION: Middleware to prevent aggressive cache/session loss on mobile
app.use((req, res, next) => {
  // Prevent caching of authenticated content
  res.header('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.header('Pragma', 'no-cache');
  res.header('Expires', '0');
  
  // Ensure the referrer policy is permissive for cross-site requests
  res.header('Referrer-Policy', 'no-referrer-when-downgrade');
  next();
});


// ✅ CORS configuration
const allowedOrigins = [
  'http://localhost:5173', // Local frontend
  'https://themodernblog.vercel.app', // Deployed frontend
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (Postman, server-side calls)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.warn('Blocked by CORS:', origin);
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, 
  })
);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/posts', postRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/analytics', analyticsRoutes);

// ✅ Health check route (for Render)
app.get('/', (_req, res) => {
  res.send('Backend is running successfully 🚀');
});

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

// ✅ PORT — use Render’s assigned port
const PORT = process.env.PORT || 5000;

connectToDatabase()
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✅ Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to database:', error);
    process.exit(1);
  });