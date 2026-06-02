/**
 * Typing Indicator Custom Hook
 * Handles typing detection, socket signaling, and auto stop-typing timeouts.
 */
import { useEffect, useRef, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { SOCKET_EVENTS } from '../utils/constants';

/**
 * Hook to coordinate client typing indicators.
 * @param {string} roomId - Active chat room ID
 * @param {number} [timeoutMs=3000] - Duration of inactivity before sending stop_typing
 */
export function useTyping(roomId, timeoutMs = 3000) {
  const { emit } = useSocket();
  const typingRef = useRef(false);
  const timeoutRef = useRef(null);

  // Clear timeout on unmount or roomId shift
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [roomId]);

  /**
   * Triggers client typing signals.
   * Call this on input onChange event handlers.
   */
  const handleTyping = useCallback(() => {
    if (!roomId) return;

    // Send typing event if client was not already marked as typing
    if (!typingRef.current) {
      typingRef.current = true;
      emit(SOCKET_EVENTS.TYPING, { roomId });
    }

    // Reset stop typing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      typingRef.current = false;
      emit(SOCKET_EVENTS.STOP_TYPING, { roomId });
    }, timeoutMs);
  }, [roomId, emit, timeoutMs]);

  /**
   * Force stop typing indicator (e.g. on message send).
   */
  const forceStopTyping = useCallback(() => {
    if (!roomId || !typingRef.current) return;

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    typingRef.current = false;
    emit(SOCKET_EVENTS.STOP_TYPING, { roomId });
  }, [roomId, emit]);

  return {
    handleTyping,
    forceStopTyping,
  };
}
