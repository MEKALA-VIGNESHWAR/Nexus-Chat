/**
 * Chat Context Provider
 * Core application state manager for chat rooms, message feeds, status sync,
 * typing indicators, and real-time socket message listeners.
 */
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../services/api';
import { useSocket } from './SocketContext';
import { useAuth } from './AuthContext';
import { SOCKET_EVENTS, MESSAGE_TYPES } from '../utils/constants';

const ChatContext = createContext(null);

export function ChatProvider({ children }) {
  const { user, isAuthenticated } = useAuth();
  const { on, off, emit, connected } = useSocket();

  const [rooms, setRooms] = useState([]);
  const [activeRoom, setActiveRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);

  // Pagination states
  const [page, setPage] = useState(1);
  const [hasMoreMessages, setHasMoreMessages] = useState(false);

  // Active presence & typing trackers
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [typingUsers, setTypingUsers] = useState({}); // { [roomId]: { [userId]: username } }

  // Notifications state
  const [notifications, setNotifications] = useState([]);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Refs for tracking values inside asynchronous event listeners
  const activeRoomRef = useRef(null);
  activeRoomRef.current = activeRoom;

  const messagesRef = useRef([]);
  messagesRef.current = messages;

  /**
   * Fetch all conversations for the user.
   */
  const fetchRooms = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingRooms(true);
    try {
      const response = await api.get('/rooms');
      setRooms(response.data.data);
    } catch (error) {
      console.error('Failed to fetch rooms', error);
    } finally {
      setLoadingRooms(false);
    }
  }, [isAuthenticated]);

  /**
   * Fetch all notifications for the user.
   */
  const fetchNotifications = useCallback(async () => {
    if (!isAuthenticated) return;
    setLoadingNotifications(true);
    try {
      const response = await api.get('/notifications?unreadOnly=false&limit=40');
      setNotifications(response.data.data.notifications || []);
      setUnreadNotificationsCount(response.data.data.unreadCount || 0);
    } catch (error) {
      console.error('Failed to fetch notifications', error);
    } finally {
      setLoadingNotifications(false);
    }
  }, [isAuthenticated]);

  const markNotificationAsRead = useCallback(async (id) => {
    try {
      await api.patch(`/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n._id === id || n.id === id ? { ...n, read: true } : n))
      );
      setUnreadNotificationsCount((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Failed to mark notification as read', error);
    }
  }, []);

  const markAllNotificationsAsRead = useCallback(async () => {
    try {
      await api.patch('/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadNotificationsCount(0);
    } catch (error) {
      console.error('Failed to mark all notifications as read', error);
    }
  }, []);

  // Load rooms and notifications on startup or when auth finishes
  useEffect(() => {
    if (isAuthenticated) {
      fetchRooms();
      fetchNotifications();
    } else {
      setRooms([]);
      setActiveRoom(null);
      setMessages([]);
      setOnlineUsers(new Set());
      setNotifications([]);
      setUnreadNotificationsCount(0);
    }
  }, [isAuthenticated, fetchRooms, fetchNotifications]);

  /**
   * Fetches paginated messages for the active conversation.
   */
  const fetchMessages = useCallback(async (roomId, pageNum = 1, append = false) => {
    setLoadingMessages(true);
    try {
      const response = await api.get(`/messages/${roomId}?page=${pageNum}&limit=40`);
      const { messages: newMessages, hasMore } = response.data.data;

      setMessages((prev) => (append ? [...newMessages, ...prev] : newMessages));
      setHasMoreMessages(hasMore);
      setPage(pageNum);

      // Trigger read receipt on message load
      emit(SOCKET_EVENTS.MESSAGE_READ, { roomId });
      api.patch(`/messages/${roomId}/read`).catch(() => {});
    } catch (error) {
      console.error('Failed to fetch messages', error);
    } finally {
      setLoadingMessages(false);
    }
  }, [emit]);

  // Load messages when conversation shifts
  useEffect(() => {
    if (activeRoom) {
      fetchMessages(activeRoom._id, 1, false);
      // Join socket channel explicitly
      emit(SOCKET_EVENTS.JOIN_ROOM, { roomId: activeRoom._id });
    } else {
      setMessages([]);
    }
  }, [activeRoom, fetchMessages, emit]);

  /**
   * Selects a conversation room.
   */
  const selectRoom = useCallback((room) => {
    // Leave previous room if active
    if (activeRoomRef.current) {
      emit(SOCKET_EVENTS.LEAVE_ROOM, { roomId: activeRoomRef.current._id });
    }
    setActiveRoom(room);
  }, [emit]);

  /**
   * Sends a message with optimistic UI updates.
   */
  const sendMessage = useCallback(async (text, type = MESSAGE_TYPES.TEXT, mediaId = null, replyTo = null) => {
    if (!activeRoom) return;

    const tempId = `optimistic-${Date.now()}`;
    const optimisticMessage = {
      _id: tempId,
      room: activeRoom._id,
      sender: {
        _id: user._id,
        username: user.username,
        avatar: user.avatar,
      },
      content: { text },
      type,
      media: mediaId,
      replyTo,
      createdAt: new Date().toISOString(),
      optimistic: true,
    };

    // Insert optimistic message instantly in state
    setMessages((prev) => [...prev, optimisticMessage]);

    // Send through WebSocket for real-time delivery
    emit(
      SOCKET_EVENTS.SEND_MESSAGE,
      {
        roomId: activeRoom._id,
        content: text,
        type,
        mediaId,
        replyTo,
      },
      (response) => {
        if (response.success) {
          // Replace optimistic message with actual DB record
          setMessages((prev) =>
            prev.map((msg) => (msg._id === tempId ? response.data : msg))
          );

          // Update lastMessage field in room list
          setRooms((prev) =>
            prev.map((r) =>
              r._id === activeRoom._id ? { ...r, lastMessage: response.data } : r
            )
          );
        } else {
          // Flag optimistic message as failed
          setMessages((prev) =>
            prev.map((msg) =>
              msg._id === tempId ? { ...msg, failed: true } : msg
            )
          );
        }
      }
    );
  }, [activeRoom, user, emit]);

  /**
   * Triggers room creation for direct chats.
   */
  const startDirectChat = useCallback(async (recipientId) => {
    try {
      const response = await api.post('/rooms/direct', { recipientId });
      const room = response.data.data;
      
      // Update rooms list if it is a new room
      if (!rooms.some((r) => r._id === room._id)) {
        setRooms((prev) => [room, ...prev]);
      }
      
      selectRoom(room);
      return { success: true, room };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to start chat',
      };
    }
  }, [rooms, selectRoom]);

  /**
   * Triggers room creation for group conversations.
   */
  const createGroupChat = useCallback(async (name, memberIds) => {
    try {
      const response = await api.post('/rooms/group', { name, members: memberIds });
      const room = response.data.data;
      setRooms((prev) => [room, ...prev]);
      selectRoom(room);
      return { success: true, room };
    } catch (error) {
      return {
        success: false,
        message: error.response?.data?.message || 'Failed to create group',
      };
    }
  }, [selectRoom]);

  // ── Sockets Real-time Listeners ───────────────────────
  useEffect(() => {
    if (!connected) return;

    // 1. Listen for new incoming messages
    const handleReceiveMessage = (msg) => {
      // If message is for currently active room, append it and send read ack
      if (activeRoomRef.current && activeRoomRef.current._id === msg.room) {
        setMessages((prev) => [...prev, msg]);
        emit(SOCKET_EVENTS.MESSAGE_READ, { roomId: msg.room });
        api.patch(`/messages/${msg.room}/read`).catch(() => {});
      } else {
        // If message is for another room, trigger delivery ack
        emit(SOCKET_EVENTS.MESSAGE_DELIVERED, { roomId: msg.room });
      }

      // Update lastMessage field in room object, bumping it to top
      setRooms((prev) => {
        const targetRoom = prev.find((r) => r._id === msg.room);
        if (targetRoom) {
          const updated = { ...targetRoom, lastMessage: msg };
          return [updated, ...prev.filter((r) => r._id !== msg.room)];
        }
        // If room is new to list (e.g. newly created by someone else), fetch rooms again
        fetchRooms();
        return prev;
      });
    };

    // 2. Listen for read receipts
    const handleMessageRead = (data) => {
      const { roomId, userId, readAt } = data;
      if (activeRoomRef.current && activeRoomRef.current._id === roomId) {
        setMessages((prev) =>
          prev.map((msg) => {
            // Add user to readBy array if not present
            if (!msg.readBy.some((r) => r.user === userId)) {
              return {
                ...msg,
                readBy: [...msg.readBy, { user: userId, readAt }],
              };
            }
            return msg;
          })
        );
      }
    };

    // 3. Listen for message deletion
    const handleMessageDelete = (data) => {
      const { messageId, roomId } = data;
      if (activeRoomRef.current && activeRoomRef.current._id === roomId) {
        setMessages((prev) =>
          prev.map((msg) =>
            msg._id === messageId ? { ...msg, deleted: true, content: { text: '' } } : msg
          )
        );
      }
    };

    // 4. Online users status updates
    const handleUsersStatus = (userIds) => {
      setOnlineUsers(new Set(userIds));
    };

    const handleUserOnline = (data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.add(data.userId);
        return next;
      });
    };

    const handleUserOffline = (data) => {
      setOnlineUsers((prev) => {
        const next = new Set(prev);
        next.delete(data.userId);
        return next;
      });
    };

    // 5. Typing indicator listeners
    const handleUserTyping = (data) => {
      const { roomId, userId, username } = data;
      setTypingUsers((prev) => ({
        ...prev,
        [roomId]: {
          ...(prev[roomId] || {}),
          [userId]: username,
        },
      }));
    };

    const handleUserStopTyping = (data) => {
      const { roomId, userId } = data;
      setTypingUsers((prev) => {
        const nextRoomTyping = { ...(prev[roomId] || {}) };
        delete nextRoomTyping[userId];
        return {
          ...prev,
          [roomId]: nextRoomTyping,
        };
      });
    };

    // 6. Listen for real-time notifications
    const handleNotification = (notification) => {
      setNotifications((prev) => [notification, ...prev]);
      setUnreadNotificationsCount((prev) => prev + 1);
    };

    // Attach listeners
    on(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
    on(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
    on(SOCKET_EVENTS.DELETE_MESSAGE, handleMessageDelete);
    on(SOCKET_EVENTS.USERS_STATUS, handleUsersStatus);
    on(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
    on(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
    on(SOCKET_EVENTS.TYPING, handleUserTyping);
    on(SOCKET_EVENTS.STOP_TYPING, handleUserStopTyping);
    on(SOCKET_EVENTS.NOTIFICATION, handleNotification);

    return () => {
      off(SOCKET_EVENTS.RECEIVE_MESSAGE, handleReceiveMessage);
      off(SOCKET_EVENTS.MESSAGE_READ, handleMessageRead);
      off(SOCKET_EVENTS.DELETE_MESSAGE, handleMessageDelete);
      off(SOCKET_EVENTS.USERS_STATUS, handleUsersStatus);
      off(SOCKET_EVENTS.USER_ONLINE, handleUserOnline);
      off(SOCKET_EVENTS.USER_OFFLINE, handleUserOffline);
      off(SOCKET_EVENTS.TYPING, handleUserTyping);
      off(SOCKET_EVENTS.STOP_TYPING, handleUserStopTyping);
      off(SOCKET_EVENTS.NOTIFICATION, handleNotification);
    };
  }, [connected, on, off, emit, fetchRooms]);

  const value = {
    rooms,
    activeRoom,
    messages,
    loadingRooms,
    loadingMessages,
    hasMoreMessages,
    page,
    onlineUsers,
    typingUsers: typingUsers[activeRoom?._id] || {},
    notifications,
    unreadNotificationsCount,
    loadingNotifications,
    fetchNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    selectRoom,
    fetchRooms,
    fetchMessages: (pageNum) => fetchMessages(activeRoom?._id, pageNum, true),
    sendMessage,
    startDirectChat,
    createGroupChat,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
