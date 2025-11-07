import express from "express";
import {
  sendFriendRequest,
  respondToRequest,
  getFriends,
  getPendingRequests,
} from "../controllers/friendController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/request/:id", protect, sendFriendRequest);
router.post("/respond/:id", protect, respondToRequest);
router.get("/", protect, getFriends);
router.get("/requests", protect, getPendingRequests);
router.post("/respond/:id", protect, respondToRequest);
export default router;
