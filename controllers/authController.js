const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const User = require('../models/User');
const Message = require('../models/Message');
// Create Transporter for sending OTP emails
const transporter = nodemailer.createTransport({
  service: 'gmail', // Change to your email service
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// Helper function to send OTP email
const sendOtpEmail = (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP for Password Reset',
    text: `Your OTP for password reset is: ${otp}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) {
      console.error('Error sending OTP:', err);
    } else {
      console.log('OTP sent:', info.response);
    }
  });
};

// Signup
exports.signup = async (req, res) => {
  const { name, email, password, mobile } = req.body;
  try {
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ errorMessage: 'User already exists' });

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      name,
      email,
      password: hashedPassword,
      mobile
    });

    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (err) {
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

// Login
exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errorMessage: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ errorMessage: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    res.json({ token });
  } catch (err) {
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

// Forgot Password
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errorMessage: 'User not found' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate OTP
    user.otp = otp;
    user.otpExpiration = Date.now() + parseInt(process.env.OTP_EXPIRY);
    await user.save();

    sendOtpEmail(email, otp);
    res.status(200).json({ message: 'OTP sent to email' });
  } catch (err) {
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

// Reset Password
exports.resetPassword = async (req, res) => {
  const { email, otp, newPassword } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errorMessage: 'User not found' });

    if (user.otp !== otp || Date.now() > user.otpExpiration)
      return res.status(400).json({ errorMessage: 'Invalid or expired OTP' });

    const salt = await bcrypt.genSalt(10);
    user.password = await bcrypt.hash(newPassword, salt);
    user.otp = ''; // Clear OTP after use
    user.otpExpiration = null; // Clear OTP expiration
    await user.save();

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (err) {
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

// Resend OTP
exports.resendOtp = async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ errorMessage: 'User not found' });

    if (Date.now() - user.otpExpiration < 30000)
      return res.status(400).json({ errorMessage: 'You can resend OTP only after 30 seconds' });

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate new OTP
    user.otp = otp;
    user.otpExpiration = Date.now() + parseInt(process.env.OTP_EXPIRY);
    await user.save();

    sendOtpEmail(email, otp);
    res.status(200).json({ message: 'New OTP sent to email' });
  } catch (err) {
    res.status(500).json({ errorMessage: 'Server error' });
  }
};
// Get All Users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();  // Fetching all users
    if (users.length === 0) {
      return res.status(404).json({ message: 'No users found' });
    }
    res.json(users);  // Send users as JSON
  } catch (err) {
    res.status(500).json({ errorMessage: 'Server Error' });
  }
};


