import User from "../models/User.js";
import generateToken from "../utils/generateToken.js";

export const registerUser = async (req, res) => {
  try {
    console.log("📥 Incoming register body:", req.body);
    const { name, email, password } = req.body;

    console.log("🔎 Checking if user exists...");
    const userExists = await User.findOne({ email });

    if (userExists) {
      console.log("⚠️ User already exists:", email);
      return res.status(400).json({ message: "User already exists" });
    }

    console.log("🛠 Creating user...");
    const user = await User.create({ name, email, password });
    console.log("✅ Created user:", user._id);

    console.log("🔐 Generating token...");
    const token = generateToken(user._id);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      token,
    });
  } catch (err) {
    console.error("❌ Register Error (full):", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const loginUser = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid credentials" });
    }
  } catch (err) {
    console.error("❌ Login Error:", err.message);
    res.status(500).json({ message: "Server error" });
  }
};
