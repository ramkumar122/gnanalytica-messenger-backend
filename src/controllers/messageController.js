import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import mongoose from "mongoose";

// ✅ Send a message and update unread counts
export const sendMessage = async (req, res) => {
  try {
    const { conversationId, text, media } = req.body;
    const userId = req.user._id;

    // 1️⃣ Ensure conversation exists
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    // 2️⃣ Create message
    const message = await Message.create({
      conversation: conversationId,
      sender: userId,
      text,
      media,
      readBy: [userId], // sender has already read it
    });

    // 3️⃣ Update conversation lastMessage
    conversation.lastMessage = message._id;

    // 4️⃣ Increment unread count for all *other* participants
    conversation.participants.forEach((participantId) => {
      const idStr = participantId.toString();
      const senderStr = userId.toString();

      if (idStr !== senderStr) {
        const current = conversation.unreadCounts.get(idStr) || 0;
        conversation.unreadCounts.set(idStr, current + 1);
      }
    });

    await conversation.save();

    // 5️⃣ Return message
    res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error("❌ Error sending message:", error);
    res.status(500).json({ message: error.message });
  }
};
// @desc Get all messages
// @route GET /api/messages/:conversationId
export const getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    }).populate("sender", "name email");

    res.json(messages);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ Mark a message as read
export const markMessageAsRead = async (req, res) => {
  try {
    console.log("🟢 Reached markMessageAsRead route");
    console.log("🟢 Message ID from URL:", req.params.id);
    console.log("🟢 Authenticated user:", req.user);

    const messageId = req.params.id; // the message ID from the URL
    const userId = req.user._id;     // logged-in user ID from JWT

    // 1️⃣ Find the message
    const message = await Message.findOne({ _id: new mongoose.Types.ObjectId(messageId) });
    if (!message) return res.status(404).json({ message: "Message not found" });

    // 2️⃣ Check if user is already in readBy array
    if (!message.readBy.includes(userId)) {
      message.readBy.push(userId);
      await message.save();
    }

    // 3️⃣ Respond with updated message
    res.status(200).json({
      message: "Marked as read",
      data: message,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ✅ Mark all messages in a conversation as read

// ✅ Mark all messages in a conversation as read
export const markAllMessagesAsRead = async (req, res) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user._id;

    // 1️⃣ Mark all unread messages in this conversation as read
    const result = await Message.updateMany(
      {
        conversation: conversationId,
        readBy: { $ne: userId },
      },
      {
        $push: { readBy: userId },
      }
    );

    // 2️⃣ Reset unread count for this user
    const conversation = await Conversation.findById(conversationId);
    if (conversation) {
      conversation.unreadCounts.set(userId.toString(), 0);
      await conversation.save();
    }

    // 3️⃣ Return success response
    res.status(200).json({
      message: "All unread messages marked as read",
      updatedCount: result.modifiedCount,
    });
  } catch (error) {
    console.error("❌ Error marking messages as read:", error);
    res.status(500).json({ message: error.message });
  }
};