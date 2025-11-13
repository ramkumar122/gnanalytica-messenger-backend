// src/controllers/friendController.js
import User from "../models/User.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    if (senderId.toString() === receiverId)
      return res.status(400).json({ message: "You cannot add yourself" });

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!receiver)
      return res.status(404).json({ message: "User not found" });

    if (receiver.friends.includes(senderId))
      return res.status(400).json({ message: "Already friends" });

    if (receiver.friendRequests.includes(senderId))
      return res.status(400).json({ message: "Request already sent" });

    receiver.friendRequests.push(senderId);
    await receiver.save();

    res.json({ message: "Friend request sent!" });
  } catch (err) {
    console.error("Send Request Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// GET incoming friend requests
export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friendRequests", "name email avatar");

    res.json(user.friendRequests);
  } catch (err) {
    console.error("Get Requests Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Accept friend request
export const acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;
    const senderId = req.params.id;

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!sender)
      return res.status(404).json({ message: "User not found" });

    // remove from pending
    receiver.friendRequests = receiver.friendRequests.filter(
      (reqId) => reqId.toString() !== senderId
    );

    // add to friends list both ways
    receiver.friends.push(senderId);
    sender.friends.push(receiverId);

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request accepted!" });
  } catch (err) {
    console.error("Accept Request Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get confirmed friends list
export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("friends", "name email avatar");

    res.json(user.friends);
  } catch (err) {
    console.error("Get Friends Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};