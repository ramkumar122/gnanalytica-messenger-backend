import User from "../models/User.js";
// @desc    Send a friend request
// @route   POST /api/friends/request/:id
export const sendFriendRequest = async (req, res) => {
  try {
    const sender = await User.findById(req.user._id);
    const receiver = await User.findById(req.params.id);

    if (!receiver) return res.status(404).json({ message: "User not found" });
    if (receiver._id.equals(sender._id))
      return res.status(400).json({ message: "You cannot add yourself" });
    if (sender.friends.includes(receiver._id))
      return res.status(400).json({ message: "Already friends" });
    if (receiver.receivedRequests.includes(sender._id))
      return res.status(400).json({ message: "Request already sent" });

    sender.sentRequests.push(receiver._id);
    receiver.receivedRequests.push(sender._id);

    await sender.save();
    await receiver.save();

    res.json({ message: "Friend request sent" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Accept or reject friend request
// @route   POST /api/friends/respond/:id


// @desc    Get all friends
// @route   GET /api/friends
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "name email profilePic"
    );
    res.json(user.friends);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get pending friend requests
// @route   GET /api/friends/requests
export const getPendingRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "receivedRequests",
      "name email profilePic"
    );
    res.json(user.receivedRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// ✅ Respond to a friend request (accept or reject)
export const respondToRequest = async (req, res) => {
  try {
    console.log("📥 Body received:", req.body);
    console.log("🆔 Params:", req.params);
    console.log("🙍‍♂️ Logged-in user:", req.user);

    const senderId = req.params.id; // The person who sent the friend request
    const receiverId = req.user._id; // The logged-in user (who is responding)
    const { action } = req.body;

    if (!action) {
      return res.status(400).json({ message: "Missing action in body" });
    }

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!sender || !receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    // Convert ObjectIds to strings for comparison
    const receivedFrom = receiver.receivedRequests.map((id) => id.toString());
    const sentTo = sender.sentRequests.map((id) => id.toString());

    if (!receivedFrom.includes(senderId)) {
      console.log("⚠️ receiver.receivedRequests:", receivedFrom);
      return res.status(400).json({ message: "No pending request from this user" });
    }

    if (action === "accept") {
      // ✅ Add each other as friends
      if (!receiver.friends.includes(senderId)) receiver.friends.push(senderId);
      if (!sender.friends.includes(receiverId)) sender.friends.push(receiverId);

      // ✅ Remove from request arrays
      receiver.receivedRequests = receiver.receivedRequests.filter(
        (id) => id.toString() !== senderId
      );
      sender.sentRequests = sender.sentRequests.filter(
        (id) => id.toString() !== receiverId
      );

      await receiver.save();
      await sender.save();

      return res.json({ message: "✅ Friend request accepted" });
    }

    if (action === "reject") {
      // ✅ Remove the pending request only
      receiver.receivedRequests = receiver.receivedRequests.filter(
        (id) => id.toString() !== senderId
      );
      sender.sentRequests = sender.sentRequests.filter(
        (id) => id.toString() !== receiverId
      );

      await receiver.save();
      await sender.save();

      return res.json({ message: "🚫 Friend request rejected" });
    }

    return res.status(400).json({ message: "Invalid action" });
  } catch (error) {
    console.error("❌ Error responding to request:", error);
    res.status(500).json({ message: error.message });
  }
};
