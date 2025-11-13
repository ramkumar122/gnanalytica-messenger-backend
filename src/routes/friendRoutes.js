import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  getFriends
} from "../controllers/friendController.js";

const router = express.Router();

// Send request
router.post("/request/:id", protect, sendFriendRequest);

// Incoming friend requests
router.get("/requests", protect, getFriendRequests);

// Accept request
router.post("/accept/:id", protect, acceptFriendRequest);

// Final confirmed friends list
router.get("/", protect, getFriends);

export default router;