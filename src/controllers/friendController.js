import User from "../models/User.js";

/**
 * SEND FRIEND REQUEST
 */
export const sendFriendRequest = async (req, res) => {
  try {
    const senderId = req.user._id;
    const receiverId = req.params.id;

    if (senderId.toString() === receiverId)
      return res.status(400).json({ message: "You cannot add yourself" });

    const sender = await User.findById(senderId);
    const receiver = await User.findById(receiverId);

    if (!receiver)
      return res.status(404).json({ message: "User not found" });

    // already friends?
    if (receiver.friends.includes(senderId))
      return res.status(400).json({ message: "Already friends" });

    // already received?
    if (receiver.receivedRequests.includes(senderId))
      return res.status(400).json({ message: "Request already sent" });

    // already sent the other way?
    if (sender.receivedRequests.includes(receiverId))
      return res.status(400).json({ message: "They already sent you a request" });

    receiver.receivedRequests.push(senderId);
    sender.sentRequests.push(receiverId);

    await receiver.save();
    await sender.save();

    res.json({ message: "Friend request sent!" });
  } catch (err) {
    console.error("Send Request Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * GET INCOMING FRIEND REQUESTS
 */
export const getFriendRequests = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate("receivedRequests", "name email avatar");

    res.json(user.receivedRequests);
  } catch (err) {
    console.error("Get Requests Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


/**
 * ACCEPT FRIEND REQUEST
 */
export const acceptFriendRequest = async (req, res) => {
  try {
    const receiverId = req.user._id;     // the one accepting
    const senderId = req.params.id;      // the one who originally sent request

    const receiver = await User.findById(receiverId);
    const sender = await User.findById(senderId);

    if (!sender)
      return res.status(404).json({ message: "User not found" });

    // Remove from receiver's pending
    receiver.receivedRequests = receiver.receivedRequests.filter(
      (id) => id.toString() !== senderId
    );

    // Remove from sender's sent list
    sender.sentRequests = sender.sentRequests.filter(
      (id) => id.toString() !== receiverId.toString()
    );

    // Add to friends list (both ways)
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