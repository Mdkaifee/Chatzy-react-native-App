// const express = require('express');
// const connectDB = require('./config/db');
// const dotenv = require('dotenv');
// const cors = require('cors');
// const path = require('path'); 
// dotenv.config();
// connectDB();

// const app = express();
// app.use(express.json());
// app.use(cors());


// // Basic route to handle GET requests to the root URL
// app.get('/', (req, res) => {
//   res.send('Welcome to the server!');
// });

// // API routes
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve static files for uploaded images
// const PORT = process.env.PORT || 5000;

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}/`);
// });
// In server.js
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

// API routes
app.use('/api/auth', require('./routes/authRoutes')); // Ensure this line is correctly set
app.use('/uploads', express.static(path.join(__dirname, 'uploads'))); // Serve uploaded images

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}/`);
});
