/**
 * Room Routes
 * Maps room operations to validators and controllers.
 */
const express = require('express');
const router = express.Router();
const roomController = require('../controllers/room.controller');
const { authenticate } = require('../middleware/auth.middleware');
const validate = require('../middleware/validate');
const {
  createGroupSchema,
  createDirectSchema,
  addMemberSchema,
} = require('../validators/room.validator');

// Protect all room routes
router.use(authenticate);

// Get rooms of authenticated user
router.get('/', roomController.getUserRooms);

// Create direct conversation
router.post(
  '/direct',
  validate(createDirectSchema),
  roomController.createDirectRoom
);

// Create group chat room
router.post(
  '/group',
  validate(createGroupSchema),
  roomController.createGroupRoom
);

// Get room details
router.get('/:roomId', roomController.getRoomDetails);

// Add member to group
router.post(
  '/:roomId/members',
  validate(addMemberSchema),
  roomController.addMember
);

// Remove member from group (or self-leave)
router.delete('/:roomId/members/:userId', roomController.removeMember);

module.exports = router;
