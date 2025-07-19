const express = require('express');
require('dotenv').config();
const cors = require('cors');
const connectDB = require('./config/db');

// Import all models to ensure they are registered
require('./models/user.model');
require('./models/unit.model');
require('./models/booking-request.model');
require('./models/lease.model');

const userRoutes = require('./routes/user.routes');
const adminRoutes = require('./routes/admin.routes');
const path = require('path');
const leaseRoutes = require("./routes/lease.routes");
const unitRoutes = require('./routes/unit.routes');
const app = express();
connectDB();

// CORS configuration
app.use(cors({
  origin: ['http://localhost:3000', 'http://127.0.0.1:3000'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// JSON middleware
app.use(express.json({ limit: '10mb' }));

// Debug middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Serve uploads folder
app.use('/uploads', express.static(path.join(__dirname, '/uploads')));

// Routes
app.use('/api/users', userRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/units', unitRoutes);
app.use("/api/leases", leaseRoutes);
app.use("/api/booking", require('./routes/booking.routes'));

//global error handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.StatusText || 'ERROR',
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on ${PORT}`));
