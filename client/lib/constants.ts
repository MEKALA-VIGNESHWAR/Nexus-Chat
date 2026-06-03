/**
 * Application Constants
 */

export const API_URL = process.env.VITE_API_URL || 'http://localhost:5000/api/v1';
export const SOCKET_URL = process.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',

  // Messages
  SEND_MESSAGE: 'send_message',
  RECEIVE_MESSAGE: 'receive_message',
  MESSAGE_DELIVERED: 'message_delivered',
  MESSAGE_READ: 'message_read',
  DELETE_MESSAGE: 'delete_message',

  // Rooms
  JOIN_ROOM: 'join_room',
  LEAVE_ROOM: 'leave_room',
  ROOM_CREATED: 'room_created',
  ROOM_UPDATED: 'room_updated',
  MEMBER_JOINED: 'member_joined',
  MEMBER_LEFT: 'member_left',

  // Status/Typing
  USER_ONLINE: 'user_online',
  USER_OFFLINE: 'user_offline',
  USERS_STATUS: 'users_status',
  TYPING: 'typing',
  STOP_TYPING: 'stop_typing',

  // Voice Rooms (WebRTC)
  VOICE_JOIN: 'voice_join',
  VOICE_LEAVE: 'voice_leave',
  VOICE_SIGNAL: 'voice_signal',
  VOICE_USERS: 'voice_users',

  NOTIFICATION: 'notification',
  ERROR: 'error',
};

export const MESSAGE_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  FILE: 'file',
  SYSTEM: 'system',
};

export const ROOM_TYPES = {
  DIRECT: 'direct',
  GROUP: 'group',
  VOICE: 'voice',
};

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'nexuschat_token',
  THEME: 'nexuschat_theme',
};
