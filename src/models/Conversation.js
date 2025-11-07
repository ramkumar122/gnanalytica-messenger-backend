import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🔘 Identify if it's group or direct chat
    isGroup: {
      type: Boolean,
      default: false,
    },

    // 🏷️ For groups only
    groupName: {
      type: String,
      trim: true,
    },
    groupAdmin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    groupAvatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/295/295128.png",
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },

    // 📨 Track unread messages (future feature)
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },

    // 📩 Last message for quick display
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);
export default Conversation;