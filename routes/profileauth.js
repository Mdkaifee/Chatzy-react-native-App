// In routes/authRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User'); // Ensure correct import

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // Folder to save uploaded files
  },
  filename: (req, file, cb) => {
    const fileExt = path.extname(file.originalname);
    cb(null, Date.now() + fileExt); // Set unique file name
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/png' || file.mimetype === 'image/jpeg') {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type! Only PNG and JPG are allowed.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post('/uploadProfileImage', upload.single('profileImage'), async (req, res) => {
  try {
    const userId = req.body.userId; // Assuming userId is passed in the request body
    const profileImagePath = req.file ? req.file.path : '';

    // Update the user's profile image in the database
    const user = await User.findByIdAndUpdate(userId, { profileImage: profileImagePath }, { new: true });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({ message: 'Profile image uploaded successfully', user });
  } catch (err) {
    console.log(err);  // Add logging for error details
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});

module.exports = router;
