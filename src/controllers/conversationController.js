import Conversation from "../models/Conversation.js";

// ✅ Get or Create a conversation
export const getOrCreateConversation = async (req, res) => {
  try {
    const { participants, isGroup, groupName } = req.body;

    // 1️⃣ Check if this is a one-on-one chat
    if (!isGroup && participants.length === 2) {
      const existing = await Conversation.findOne({
        participants: { $all: participants, $size: 2 },
        isGroup: false,
      });

      // ✅ If found, just return the existing one
      if (existing) return res.status(200).json(existing);
    }

    // 2️⃣ Initialize unread counts
    const unreadCounts = {};
    participants.forEach((id) => {
      unreadCounts[id] = 0;
    });

    // 3️⃣ Create a new conversation
    const conversation = await Conversation.create({
      participants,
      isGroup: isGroup || false,
      groupName: groupName || null,
      unreadCounts,
    });

    res.status(201).json(conversation);
  } catch (error) {
    console.error("❌ Error creating/getting conversation:", error);
    res.status(500).json({ message: error.message });
  }
};

// ✅ Create a new conversation
export const createConversation = async (req, res) => {
  try {
    const { participants, isGroup, groupName } = req.body;

    // 1️⃣ Prevent duplicates for one-to-one chats
    if (!isGroup && participants.length === 2) {
      const existing = await Conversation.findOne({
        participants: { $all: participants, $size: 2 },
        isGroup: false,
      });
      if (existing) return res.status(200).json(existing);
    }

    // 2️⃣ Initialize unreadCounts for all participants
    const unreadCounts = {};
    participants.forEach((id) => {
      unreadCounts[id] = 0;
    });

    // 3️⃣ Create the conversation
    const conversation = await Conversation.create({
      participants,
      isGroup: isGroup || false,
      groupName: groupName || null,
      unreadCounts, // ✅ set initial counts to 0
    });

    res.status(201).json(conversation);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};