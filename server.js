const express = require('express');
const path = require('path'); // Make sure you import 'path'
const connectDB = require('./config/db');
const dotenv = require('dotenv');
const cors = require('cors');
dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());
app.get('/', (req, res) => {
  res.send('Welcome to the API!');
});

// API routes
app.use('/api/auth', require('./routes/authRoutes')); // Ensure this line is correctly set
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
