import express from "express";
import { sendMessage, getMessages, markMessageAsRead, markAllMessagesAsRead  } from "../controllers/messageController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// POST /api/messages
router.post("/", protect, sendMessage);
router.get("/:conversationId", protect, getMessages);
router.put("/:id/read", protect, markMessageAsRead);
router.put("/conversation/:conversationId/read", protect, markAllMessagesAsRead);
export default router;
