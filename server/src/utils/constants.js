/**
 * Application-wide Constants
 * Centralized configuration values used across the codebase.
 */

// ── Authentication ─────────────────────────────────────
const AUTH = {
  BCRYPT_ROUNDS: 12,
  ACCESS_TOKEN_COOKIE: 'accessToken',
  REFRESH_TOKEN_COOKIE: 'refreshToken',
};

// ── Socket Events ──────────────────────────────────────
const SOCKET_EVENTS = {
  // Connection
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Chat
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  DELETE_MESSAGE: 'delete_message',

  // Room
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_CREATED: 'room_created',
  ROOM_UPDATED: 'room_updated',
  MEMBER_JOINED: 'member_joined',
  MEMBER_LEFT: 'member_left',

  // Presence
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USERS_STATUS: 'users_status',

  // Typing
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',

  // Voice
  VOICE_JOIN: 'voice_join',
  VOICE_LEAVE: 'voice_leave',
  VOICE_SIGNAL: 'voice_signal',
  VOICE_USERS: 'voice_users',

  // Notification
  NOTIFICATION: 'notification',

  // Errors
  ERROR: 'error',
};

// ── Message Types ──────────────────────────────────────
const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
};

// ── Room Types ─────────────────────────────────────────
const ROOM_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
  VOICE: 'voice',
};

// ── Member Roles ───────────────────────────────────────
const MEMBER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
};

// ── File Upload ────────────────────────────────────────
const UPLOAD = {
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  MAX_IMAGE_SIZE: 5 * 1024 * 1024,  // 5MB
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/zip',
  ],
  CLOUDINARY_FOLDER: 'nexuschat',
};

// ── Notification Types ─────────────────────────────────
const NOTIFICATION_TYPES = {
  MESSAGE: 'message',
  INVITE: 'invite',
  SYSTEM: 'system',
};

// ── Pagination ─────────────────────────────────────────
const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 50,
  MAX_LIMIT: 100,
};

module.exports = {
  AUTH,
  SOCKET_EVENTS,
  MESSAGE_TYPES,
  ROOM_TYPES,
  MEMBER_ROLES,
  UPLOAD,
  NOTIFICATION_TYPES,
  PAGINATION,
};
