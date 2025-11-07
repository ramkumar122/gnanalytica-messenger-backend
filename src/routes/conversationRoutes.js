import express from "express";
import { getOrCreateConversation } from "../controllers/conversationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, getOrCreateConversation);

export default router;
