// src/routes/userRoutes.js
import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import User from "../models/User.js";

const router = express.Router();

// GET /api/users → return list of all users (name, email, avatar)
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find({}, "name email avatar"); // only return safe fields
    res.json(users);
  } catch (err) {
    console.error("User list error:", err);
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// GET /api/users/profile → Return logged-in user details
router.get("/profile", protect, (req, res) => {
  res.json({
    message: "Access granted",
    user: req.user,
  });
});

export default router;