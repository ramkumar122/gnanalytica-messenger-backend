import { io } from "socket.io-client";

const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY5MDRmNTExOTNmZjcyMTZmMjhiYjMxYyIsImlhdCI6MTc2MTkzMjU2MSwiZXhwIjoxNzY0NTI0NTYxfQ.-e48HyrbNIus2_2s2fNDePufO1xZ_5tZo0JQ8SUkCO8";
const conversationId = "6908e46502028e5747844f74";

const socket = io("http://localhost:3000", {
  auth: { token },
});

socket.on("connect", () => {
  console.log("connected", socket.id);
  socket.emit("conversation:join", conversationId);

  // send a test message
  socket.emit("message:send", { conversationId, text: "Hello from socket!" });
  socket.emit("message:send", { 
  conversationId, 
  text: "Hey bro 👋 from Madhav!" 
});
});

socket.on("message:new", (payload) => console.log("message:new", payload));
socket.on("conv:unread", (payload) => console.log("conv:unread", payload));
socket.on("presence:update", (p) => console.log("presence", p));
socket.on("typing:update", (p) => console.log("typing", p));
socket.on("disconnect", () => console.log("disconnected"));