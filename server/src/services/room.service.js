/**
 * Room Service
 * Business logic for creating, managing, and querying chat rooms.
 */
const Room = require('../models/Room');
const User = require('../models/User');
const ApiError = require('../utils/ApiError');
const { ROOM_TYPES, MEMBER_ROLES } = require('../utils/constants');

/**
 * Creates a direct (1-on-1) chat room between two users.
 * Returns existing room if one already exists.
 * @param {string} userId - Initiating user
 * @param {string} recipientId - Target user
 * @returns {Promise<Document>}
 */
async function createDirectRoom(userId, recipientId) {
  if (userId === recipientId) {
    throw ApiError.badRequest('Cannot create a chat with yourself');
  }

  // Verify recipient exists
  const recipient = await User.findById(recipientId);
  if (!recipient) {
    throw ApiError.notFound('Recipient user not found');
  }

  // Check if direct room already exists
  const existingRoom = await Room.findDirectRoom(userId, recipientId);
  if (existingRoom) {
    return existingRoom;
  }

  // Create new direct room
  const room = await Room.create({
    type: ROOM_TYPES.DIRECT,
    members: [
      { user: userId, role: MEMBER_ROLES.MEMBER },
      { user: recipientId, role: MEMBER_ROLES.MEMBER },
    ],
    createdBy: userId,
  });

  // Add room reference to both users
  await User.updateMany(
    { _id: { $in: [userId, recipientId] } },
    { $addToSet: { rooms: room._id } }
  );

  // Return populated room
  return Room.findById(room._id)
    .populate('members.user', 'username avatar status')
    .lean();
}

/**
 * Creates a group chat room.
 * @param {string} creatorId - User creating the group
 * @param {Object} data - { name, members: [userId], isPrivate }
 * @returns {Promise<Document>}
 */
async function createGroupRoom(creatorId, { name, members, isPrivate = true }) {
  // Ensure creator is included in members
  const uniqueMembers = [...new Set([creatorId, ...members])];

  // Verify all members exist
  const existingUsers = await User.find({ _id: { $in: uniqueMembers } }).select('_id');
  if (existingUsers.length !== uniqueMembers.length) {
    throw ApiError.badRequest('One or more member IDs are invalid');
  }

  // Build members array — creator is admin
  const memberDocs = uniqueMembers.map((memberId) => ({
    user: memberId,
    role: memberId === creatorId ? MEMBER_ROLES.ADMIN : MEMBER_ROLES.MEMBER,
  }));

  const room = await Room.create({
    name,
    type: ROOM_TYPES.GROUP,
    members: memberDocs,
    settings: { isPrivate },
    createdBy: creatorId,
  });

  // Add room reference to all members
  await User.updateMany(
    { _id: { $in: uniqueMembers } },
    { $addToSet: { rooms: room._id } }
  );

  return Room.findById(room._id)
    .populate('members.user', 'username avatar status')
    .lean();
}

/**
 * Gets all rooms for a user.
 * @param {string} userId
 * @returns {Promise<Document[]>}
 */
async function getUserRooms(userId) {
  return Room.getUserRooms(userId);
}

/**
 * Gets a single room by ID (with membership check).
 * @param {string} roomId
 * @param {string} userId - Requesting user (must be a member)
 * @returns {Promise<Document>}
 */
async function getRoomById(roomId, userId) {
  const room = await Room.findById(roomId)
    .populate('members.user', 'username avatar status')
    .populate('lastMessage')
    .lean();

  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  // Verify membership
  const isMember = room.members.some(
    (m) => m.user._id.toString() === userId
  );
  if (!isMember) {
    throw ApiError.forbidden('You are not a member of this room');
  }

  return room;
}

/**
 * Adds a member to a group room.
 * @param {string} roomId
 * @param {string} userId - User to add
 * @param {string} requesterId - User performing the action (must be admin)
 * @returns {Promise<Document>}
 */
async function addMember(roomId, userId, requesterId) {
  const room = await Room.findById(roomId);
  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  if (room.type !== ROOM_TYPES.GROUP) {
    throw ApiError.badRequest('Can only add members to group rooms');
  }

  // Check if requester is admin
  const isAdmin = await Room.isAdmin(roomId, requesterId);
  if (!isAdmin) {
    throw ApiError.forbidden('Only admins can add members');
  }

  // Check if user is already a member
  const alreadyMember = room.members.some(
    (m) => m.user.toString() === userId
  );
  if (alreadyMember) {
    throw ApiError.conflict('User is already a member of this room');
  }

  // Check max members
  if (room.members.length >= room.settings.maxMembers) {
    throw ApiError.badRequest('Room has reached maximum member limit');
  }

  // Verify user exists
  const user = await User.findById(userId);
  if (!user) {
    throw ApiError.notFound('User not found');
  }

  // Add member
  room.members.push({ user: userId, role: MEMBER_ROLES.MEMBER });
  await room.save();

  // Add room to user's rooms
  await User.findByIdAndUpdate(userId, { $addToSet: { rooms: roomId } });

  return Room.findById(roomId)
    .populate('members.user', 'username avatar status')
    .lean();
}

/**
 * Removes a member from a group room (or self-leave).
 * @param {string} roomId
 * @param {string} userId - User to remove
 * @param {string} requesterId - User performing the action
 * @returns {Promise<Document|null>}
 */
async function removeMember(roomId, userId, requesterId) {
  const room = await Room.findById(roomId);
  if (!room) {
    throw ApiError.notFound('Room not found');
  }

  if (room.type !== ROOM_TYPES.GROUP) {
    throw ApiError.badRequest('Can only remove members from group rooms');
  }

  // Allow self-leave or admin removal
  const isSelf = userId === requesterId;
  if (!isSelf) {
    const isAdmin = await Room.isAdmin(roomId, requesterId);
    if (!isAdmin) {
      throw ApiError.forbidden('Only admins can remove members');
    }
  }

  // Remove member
  room.members = room.members.filter((m) => m.user.toString() !== userId);

  // If room is empty, delete it
  if (room.members.length < 2) {
    await Room.findByIdAndDelete(roomId);
    await User.findByIdAndUpdate(userId, { $pull: { rooms: roomId } });
    return null;
  }

  // If removed user was the only admin, promote the oldest member
  const hasAdmin = room.members.some((m) => m.role === MEMBER_ROLES.ADMIN);
  if (!hasAdmin && room.members.length > 0) {
    room.members[0].role = MEMBER_ROLES.ADMIN;
  }

  await room.save();
  await User.findByIdAndUpdate(userId, { $pull: { rooms: roomId } });

  return Room.findById(roomId)
    .populate('members.user', 'username avatar status')
    .lean();
}

module.exports = {
  createDirectRoom,
  createGroupRoom,
  getUserRooms,
  getRoomById,
  addMember,
  removeMember,
};
