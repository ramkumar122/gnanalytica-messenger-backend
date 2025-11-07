import express from "express";
import {
  createGroupConversation,
  addMemberToGroup,
  removeMemberFromGroup,
  renameGroupConversation,
} from "../controllers/groupController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// ✅ Create a new group
router.post("/", protect, createGroupConversation);

// ✅ Add new members
router.put("/:id/add", protect, addMemberToGroup);

// ✅ Remove a member
router.put("/:id/remove", protect, removeMemberFromGroup);

// ✅ Rename / update info
router.put("/:id/rename", protect, renameGroupConversation);

export default router;