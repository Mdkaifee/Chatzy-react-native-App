const Message = require("../models/Message");
const User = require("../models/User");

exports.sendMessage = async (req, res) => {
  const { senderId, receiverId, message } = req.body;

  console.log("Received data:", req.body); // Log the received data to debug

  if (!senderId || !receiverId) {
    return res
      .status(400)
      .json({ errorMessage: "Both Sender ID and Receiver ID are required" });
  }

  if (!message || message.trim().length === 0) {
    return res.status(400).json({ errorMessage: "Message cannot be empty" });
  }

  try {
    // Create the new message
    const newMessage = new Message({
      senderId,
      receiverId,
      message,
    });

    // Save the new message
    await newMessage.save();

    // After saving the message, update unread message count for the receiver
    const receiver = await User.findById(receiverId);
    if (!receiver) {
      return res.status(404).json({ errorMessage: "Receiver not found" });
    }

    receiver.unreadMessagesCount += 1; // Increment unread message count
    await receiver.save();

    // Return the saved message and success response
    return res.status(201).json({
      message: "Message sent successfully!",
      data: newMessage, // Send back the saved message as confirmation
    });
  } catch (err) {
    console.error("Error sending message:", err);
    return res
      .status(500)
      .json({ errorMessage: "Server error", details: err.message });
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
    }).sort({ timestamp: 1 }); // Sort messages by timestamp
    if (messages.length === 0) {
      return res.status(404).json({ message: "No messages found" });
    }
    return res.status(200).json(messages);
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(500).json({ errorMessage: "Server error" });
  }
};

exports.markAsRead = async (req, res) => {
  const { messageId } = req.body;

  try {
    const message = await Message.findById(messageId);
    if (!message) return res.status(404).json({ message: "Message not found" });

    message.isRead = true;
    await message.save();

    res.status(200).json({ message: "Message marked as read successfully" });
  } catch (err) {
    res.status(500).json({ errorMessage: "Server error" });
  }
};

// Get unread message count for a user
exports.getUnreadMessagesCount = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ errorMessage: "User not found" });
    }

    return res
      .status(200)
      .json({ unreadMessagesCount: user.unreadMessagesCount });
  } catch (err) {
    console.error("Error fetching unread message count:", err);
    res.status(500).json({ errorMessage: "Server error" });
  }
};
