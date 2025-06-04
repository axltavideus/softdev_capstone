require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const projectRoutes = require('./routes/projectRoutes');
const barangmasukRoutes = require('./routes/barangmasukRoutes');
const testRoutes = require('./routes/testRoutes');
const barangkeluarRoutes = require('./routes/barangkeluarRoutes');

const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const authRoutes = require('./routes/authRoutes');
app.use('/api/auth', authRoutes);

// API Routes
app.use('/api/projects', projectRoutes);
app.use('/api/barangmasuk', barangmasukRoutes);
app.use('/api/test', testRoutes);
app.use('/api/barangkeluar', barangkeluarRoutes);

const masterDataRoutes = require('./routes/masterDataRoutes');
app.use('/api/masterdata', masterDataRoutes);

// Serve static files from the React frontend build
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Catch-all handler to serve React's index.html for any non-API routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// Sync database and start server
sequelize.sync()
  .then(() => {
    console.log('Database synced');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Unable to sync database:', err);
  });
