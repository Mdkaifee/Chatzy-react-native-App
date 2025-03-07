const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const User = require('../models/User'); // Ensure the User model is correctly imported

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  resendOtp,
  getAllUsers,
} = require('../controllers/authController');
const { sendMessage, getMessages, markAsRead, getUnreadMessagesCount } = require("../controllers/messageController");
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Store files in 'uploads' folder
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix);
  },
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 },  // Max file size is 10 MB
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
    console.log(err);  // Log error details
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
router.get('/getProfileImage/:userId', async (req, res) => {
  console.log("Fetching profile for user:", req.params.userId);  // Add a log
  try {
    const userId = req.params.userId; // Get userId from request params

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.status(200).json({
      message: 'User profile fetched successfully',
      user: {
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        profileImage: `http://localhost:5000/${user.profileImage.replace(/\\/g, '/')}`, // Fix file path
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: err.message });
  }
});
// Existing API routes
router.post('/signup', signup);
router.post('/login', login);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.post('/resend-otp', resendOtp);
router.get('/users', getAllUsers);
router.post('/send', sendMessage);
router.get('/get', getMessages);
router.post('/messages/markRead', markAsRead);
router.get('/messages/unreadCount/:userId', getUnreadMessagesCount); 

module.exports = router;
