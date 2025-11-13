import express from "express";
import { protect } from "../middleware/authMiddleware.js";

import {
  sendFriendRequest,
  getFriendRequests,
  acceptFriendRequest,
  getFriends,
} from "../controllers/friendController.js";

const router = express.Router();

// Get list of friends
router.get("/", protect, getFriends);

// Get incoming friend requests
router.get("/requests", protect, getFriendRequests);

// Send a friend request
router.post("/request/:id", protect, sendFriendRequest);

// Accept a friend request
router.post("/accept/:id", protect, acceptFriendRequest);

export default router;