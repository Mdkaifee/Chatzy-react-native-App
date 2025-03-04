const express = require('express');
const router = express.Router();
const {
  signup,
  login,
  forgotPassword,
      resetPassword,
  resendOtp,
  getAllUsers,
} = require('../controllers/authController');
const { sendMessage, getMessages, markAsRead, getUnreadMessagesCount } = require("../controllers/messageController");
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
