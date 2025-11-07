import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: { origin: "*", methods: ["GET", "POST"] },
  });

  const onlineUsers = new Map();

  // 🔐 1️⃣ Authenticate each socket using JWT
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error("Authentication error: No token"));
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id;
      next();
    } catch (err) {
      console.error("❌ Socket auth failed:", err.message);
      next(new Error("Authentication error: Invalid token"));
    }
  });

  // ⚡ 2️⃣ When user connects
  io.on("connection", async (socket) => {
    const userId = socket.userId;
    onlineUsers.set(userId, socket.id);
    console.log(`⚡ User connected: ${userId}`);

    io.emit("presence:update", { userId, status: "online" });

    // 🧠 Join all their conversations (1-1 + groups)
    const conversations = await Conversation.find({ participants: userId });
    conversations.forEach((conv) => socket.join(conv._id.toString()));

    // 🧩 3️⃣ Join a specific conversation (manual)
    socket.on("conversation:join", (conversationId) => {
      socket.join(conversationId);
      console.log(`✅ ${userId} joined conversation ${conversationId}`);
      io.to(conversationId).emit("group:member:joined", { userId, conversationId });
    });

    // 💬 4️⃣ Send message (works for both 1-1 and group)
    socket.on("message:send", async ({ conversationId, text, media }, ack) => {
      try {
        if (!conversationId || !text)
          return ack?.({ success: false, error: "Missing fields" });

        const message = await Message.create({
          conversation: conversationId,
          sender: userId,
          text,
          media: media || [],
          readBy: [userId],
          status: "sent",
        });

        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
        });

        // Broadcast new message to everyone in the conversation
        io.to(conversationId).emit("message:new", message);

        // Mark delivered for all online members
        io.to(conversationId).emit("message:status:update", {
          messageId: message._id,
          status: "delivered",
        });

        ack?.({ success: true, message });
        console.log(`💬 ${userId} sent message: "${text}" to ${conversationId}`);
      } catch (error) {
        console.error("❌ Error sending message:", error.message);
        ack?.({ success: false, error: error.message });
      }
    });

    // 👀 5️⃣ Mark a message as read
    socket.on("message:read", async ({ messageId, conversationId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        if (!message.readBy.includes(userId)) {
          message.readBy.push(userId);
        }

        message.status = "seen";
        await message.save();

        io.to(conversationId).emit("message:status:update", {
          messageId: message._id,
          status: "seen",
          userId,
          seenAt: new Date(),
        });
      } catch (error) {
        console.error("❌ Error marking message as seen:", error.message);
      }
    });

    // ✍️ 6️⃣ Typing indicator (works for groups)
    socket.on("typing:start", (conversationId) => {
      socket.to(conversationId).emit("typing:update", { userId, isTyping: true });
    });

    socket.on("typing:stop", (conversationId) => {
      socket.to(conversationId).emit("typing:update", { userId, isTyping: false });
    });

    // 👋 7️⃣ Handle group membership updates
    socket.on("group:member:added", ({ conversationId, newMemberId }) => {
      io.to(conversationId).emit("group:member:added", {
        conversationId,
        newMemberId,
      });
    });

    socket.on("group:member:removed", ({ conversationId, removedUserId }) => {
      io.to(conversationId).emit("group:member:removed", {
        conversationId,
        removedUserId,
      });
    });

    // 🚪 8️⃣ Handle disconnection
    socket.on("disconnect", () => {
      onlineUsers.delete(userId);
      console.log(`⚠️ User disconnected: ${userId}`);
      io.emit("presence:update", { userId, status: "offline" });
    });
  });

  return io;
}