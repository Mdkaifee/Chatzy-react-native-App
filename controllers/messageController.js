const Message = require('../models/Message');
const User = require('../models/User');

// Send message
exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;
  
  try {
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    // Save the new message
    await newMessage.save();

    // After saving the message, update unread message count for the receiver
    const receiver = await User.findById(receiverId);
    receiver.unreadMessagesCount += 1; // Increment unread message count
    await receiver.save();

    return res.status(201).json({ message: 'Message sent successfully!' });
  } catch (err) {
    console.error('Error sending message:', err);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

// Get all messages between sender and receiver
exports.getMessages = async (req, res) => {
  const { senderId, receiverId } = req.query;

  try {
    const messages = await Message.find({
      $or: [
        { senderId, receiverId },
        { senderId: receiverId, receiverId: senderId },
      ],
    }).sort({ timestamp: 1 });  // Sort messages by timestamp

    return res.status(200).json(messages);
  } catch (err) {
    console.error('Error fetching messages:', err);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};

  
exports.markAsRead = async (req, res) => {
    const { messageId } = req.body;
  
    try {
      const message = await Message.findById(messageId);
      if (!message) return res.status(404).json({ message: 'Message not found' });
  
      message.isRead = true;
      await message.save();
  
      res.status(200).json({ message: 'Message marked as read successfully' });
    } catch (err) {
      res.status(500).json({ errorMessage: 'Server error' });
    }
  };
  
// Get unread message count for a user
exports.getUnreadMessagesCount = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errorMessage: 'User not found' });
    }

    return res.status(200).json({ unreadMessagesCount: user.unreadMessagesCount });
  } catch (err) {
    console.error('Error fetching unread message count:', err);
    res.status(500).json({ errorMessage: 'Server error' });
  }
};
