/**
 * Room Controller
 * Maps chat room operations (direct & group rooms) to the room service.
 */
const roomService = require('../services/room.service');
const ApiResponse = require('../utils/ApiResponse');

/**
 * Gets all rooms for the authenticated user.
 */
async function getUserRooms(req, res, next) {
  try {
    const rooms = await roomService.getUserRooms(req.userId);
    ApiResponse.ok(rooms).send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Gets details of a single room.
 */
async function getRoomDetails(req, res, next) {
  try {
    const room = await roomService.getRoomById(req.params.roomId, req.userId);
    ApiResponse.ok(room).send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a new direct (one-to-one) conversation.
 */
async function createDirectRoom(req, res, next) {
  try {
    const { recipientId } = req.body;
    const room = await roomService.createDirectRoom(req.userId, recipientId);
    new ApiResponse(201, room, 'Direct room created').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Creates a new group conversation.
 */
async function createGroupRoom(req, res, next) {
  try {
    const room = await roomService.createGroupRoom(req.userId, req.body);
    new ApiResponse(201, room, 'Group room created').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Adds a new member to an existing group room.
 */
async function addMember(req, res, next) {
  try {
    const { roomId } = req.params;
    const { userId } = req.body;
    const room = await roomService.addMember(roomId, userId, req.userId);
    ApiResponse.ok(room, 'Member added successfully').send(res);
  } catch (error) {
    next(error);
  }
}

/**
 * Removes a member from a group room (or lets a member leave).
 */
async function removeMember(req, res, next) {
  try {
    const { roomId, userId } = req.params;
    const updatedRoom = await roomService.removeMember(roomId, userId, req.userId);
    
    if (!updatedRoom) {
      return ApiResponse.ok(null, 'Room deleted as there were no members left').send(res);
    }
    
    ApiResponse.ok(updatedRoom, 'Member removed successfully').send(res);
  } catch (error) {
    next(error);
  }
}

module.exports = {
  getUserRooms,
  getRoomDetails,
  createDirectRoom,
  createGroupRoom,
  addMember,
  removeMember,
};
