import Conversation from "../models/Conversation.js";
import User from "../models/User.js";

/**
 * @desc Create a new group chat
 * @route POST /api/conversations/group
 */
export const createGroupConversation = async (req, res) => {
  try {
    const { groupName, participants, groupAvatar, description } = req.body;
    const adminId = req.user._id;

    if (!groupName || !participants?.length) {
      return res.status(400).json({ message: "Group name and members required" });
    }

    // Ensure admin is part of participants
    const uniqueParticipants = [...new Set([...participants, adminId.toString()])];

    const group = await Conversation.create({
      isGroup: true,
      groupName,
      groupAdmin: adminId,
      participants: uniqueParticipants,
      groupAvatar,
      description,
    });

    res.status(201).json({
      message: "Group created successfully",
      group,
    });
  } catch (error) {
    console.error("❌ Error creating group:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Add member(s) to group
 * @route PUT /api/conversations/group/:id/add
 */
export const addMemberToGroup = async (req, res) => {
  try {
    const { id } = req.params; // group ID
    const { members } = req.body; // array of user IDs

    const group = await Conversation.findById(id);
    if (!group || !group.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    // Only admin can add members
    if (group.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can add members" });
    }

    group.participants = [...new Set([...group.participants, ...members])];
    await group.save();

    res.json({ message: "Members added successfully", group });
  } catch (error) {
    console.error("❌ Error adding members:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Remove a member from group
 * @route PUT /api/conversations/group/:id/remove
 */
export const removeMemberFromGroup = async (req, res) => {
  try {
    const { id } = req.params;
    const { memberId } = req.body;

    const group = await Conversation.findById(id);
    if (!group || !group.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can remove members" });
    }

    group.participants = group.participants.filter(
      (p) => p.toString() !== memberId
    );

    await group.save();
    res.json({ message: "Member removed", group });
  } catch (error) {
    console.error("❌ Error removing member:", error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc Rename or update group info
 * @route PUT /api/conversations/group/:id/rename
 */
export const renameGroupConversation = async (req, res) => {
  try {
    const { id } = req.params;
    const { groupName, description, groupAvatar } = req.body;

    const group = await Conversation.findById(id);
    if (!group || !group.isGroup) {
      return res.status(404).json({ message: "Group not found" });
    }

    if (group.groupAdmin.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Only admin can rename or edit group" });
    }

    if (groupName) group.groupName = groupName;
    if (description) group.description = description;
    if (groupAvatar) group.groupAvatar = groupAvatar;

    await group.save();
    res.json({ message: "Group updated successfully", group });
  } catch (error) {
    console.error("❌ Error renaming group:", error);
    res.status(500).json({ message: error.message });
  }
};