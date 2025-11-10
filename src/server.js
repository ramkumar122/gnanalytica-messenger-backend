import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import friendRoutes from "./routes/friendRoutes.js";
import conversationRoutes from "./routes/conversationRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";
import { createServer } from "http";
import { initSocket } from "./realtime/socket.js";
import groupRoutes from "./routes/groupRoutes.js";


dotenv.config();
connectDB();

const app = express();

// ✅ Middleware
app.use(
  cors({
    origin: [
      "https://proud-stone-0a644ec0f.3.azurestaticapps.net", // your deployed frontend
      "http://localhost:3000" // keep for local dev
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
  })
);
app.use(express.json());

// ✅ Request logger (helps debug)
app.use((req, res, next) => {
  console.log("➡️ Incoming request:", req.method, req.url);
  next();
});
app.post("/debug", (req, res) => {
  console.log("🧩 Received body:", req.body);
  res.json(req.body);
});


// ✅ Routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/conversations/group", groupRoutes);
// ✅ Default route
app.get("/", (req, res) => {
  res.send("🚀 Gnanalytica Messenger Backend Running");
});

// ✅ Test route
app.post("/test", (req, res) => {
  res.status(200).json({ message: "✅ Test route working", body: req.body });
});

// ⬇️ Create HTTP server and initialize sockets
const server = createServer(app);
const io = initSocket(server);     // initSocket returns the socket.io instance
app.set("io", io);                 // makes io available in controllers

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`✅ Server + WebSocket running on port ${PORT}`));
