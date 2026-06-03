'use client';

/**
 * Socket.IO Context Provider
 * Coordinates WebSocket connection, reconnect sequences, and auth token synchronization.
 */
import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import { SOCKET_URL, SOCKET_EVENTS } from '../lib/constants';

interface SocketContextType {
  socket: Socket | null;
  connected: boolean;
  emit: (event: string, data?: any, callback?: (response: any) => void) => void;
  on: (event: string, fn: (...args: any[]) => void) => void;
  off: (event: string, fn: (...args: any[]) => void) => void;
}

const SocketContext = createContext<SocketContextType | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { token, isAuthenticated } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // Initialize/terminate connection based on auth state
  useEffect(() => {
    if (!isAuthenticated || !token) {
      if (socket) {
        socket.disconnect();
        setSocket(null);
        setConnected(false);
      }
      return;
    }

    // Establish WebSocket connection
    const socketInstance = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket'], // Restrict to WebSocket transport for performance
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });

    socketInstance.on(SOCKET_EVENTS.CONNECT, () => {
      setConnected(true);
    });

    socketInstance.on(SOCKET_EVENTS.DISCONNECT, () => {
      setConnected(false);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, [token, isAuthenticated]);

  /**
   * Safe wrapper to emit events to socket, checking connection first.
   */
  const emit = useCallback(
    (event: string, data?: any, callback?: (response: any) => void) => {
      if (socket && connected) {
        socket.emit(event, data, callback);
      } else {
        console.warn(`Socket: Cannot emit event "${event}". Socket is disconnected.`);
        if (typeof callback === 'function') {
          callback({ success: false, error: 'Socket is disconnected' });
        }
      }
    },
    [socket, connected]
  );

  /**
   * Helper to attach event listeners to socket.
   */
  const on = useCallback(
    (event: string, fn: (...args: any[]) => void) => {
      if (socket) {
        socket.on(event, fn);
      }
    },
    [socket]
  );

  /**
   * Helper to detach event listeners from socket.
   */
  const off = useCallback(
    (event: string, fn: (...args: any[]) => void) => {
      if (socket) {
        socket.off(event, fn);
      }
    },
    [socket]
  );

  const value = {
    socket,
    connected,
    emit,
    on,
    off,
  };

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}
