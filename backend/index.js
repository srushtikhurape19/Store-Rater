const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors'); // Import cors
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const ownerRoutes = require('./routes/owner');
const adminRoutes = require('./routes/admin');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Use cors middleware
app.use(cors({ origin: ['http://localhost:3000', 'http://localhost:3001'] })); // Allow requests from your frontend

app.use(express.json());

// Basic route for testing
app.get('/', (req, res) => {
    res.send('API is running...');
});

// Route Middlewares
app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/owner', ownerRoutes);
app.use('/api/admin', adminRoutes);

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
