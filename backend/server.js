require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');
const projectRoutes = require('./routes/projectRoutes');
const barangmasukRoutes = require('./routes/barangmasukRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/projects', projectRoutes);
app.use('/api/barangmasuk', barangmasukRoutes);

const masterDataRoutes = require('./routes/masterDataRoutes');
app.use('/api/masterdata', masterDataRoutes);

// Root route
app.get('/', (req, res) => {
  res.send('Storage Management Backend is running');
});

// Sync database and start server
sequelize.sync({ alter: true })
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
