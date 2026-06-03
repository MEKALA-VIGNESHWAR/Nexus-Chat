import { useEffect, useRef, useState, useCallback } from 'react';
import { useSocket } from '../context/SocketContext';
import { SOCKET_EVENTS } from '../lib/constants';

// WebRTC ICE server configurations (using public STUN servers)
const peerConnectionConfig = {
  iceServers: [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
    { urls: 'stun:stun2.l.google.com:19302' },
  ],
};

export function useVoice(roomId: string | undefined) {
  const { on, off, emit, connected } = useSocket();
  const [localStream, setLocalStream] = useState<MediaStream | null>(null);
  const [peers, setPeers] = useState<Record<string, any>>({}); // { [userId]: { socketId, username, avatar, stream, isMuted } }
  const [isMuted, setIsMuted] = useState(false);
  const [inVoiceRoom, setInVoiceRoom] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // References to keep state synced across WebRTC network callbacks
  const localStreamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Record<string, RTCPeerConnection>>({}); // Map of RTCPeerConnection instances keyed by userId
  const peerStatesRef = useRef<any>({}); // Map of peer UI states keyed by userId
  
  peerStatesRef.current = peers;

  /**
   * Request microphone permission and fetch stream.
   */
  const initLocalStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
        video: false,
      });
      localStreamRef.current = stream;
      setLocalStream(stream);
      return stream;
    } catch (err) {
      setError('Could not access microphone. Please check permissions.');
      console.error('Microphone access denied:', err);
      throw err;
    }
  };

  /**
   * Helper to create a new RTCPeerConnection for a user.
   */
  const createPeerConnection = useCallback((peerUserId: string, peerSocketId: string, stream: MediaStream) => {
    const pc = new RTCPeerConnection(peerConnectionConfig);
    peersRef.current[peerUserId] = pc;

    // Add local audio tracks to the peer connection
    stream.getTracks().forEach((track) => {
      pc.addTrack(track, stream);
    });

    // Handle ICE Candidate gathering
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        emit(SOCKET_EVENTS.VOICE_SIGNAL, {
          targetSocketId: peerSocketId,
          signal: { type: 'candidate', candidate: event.candidate },
        });
      }
    };

    // Handle incoming audio stream from peer
    pc.ontrack = (event) => {
      const [remoteStream] = event.streams;
      setPeers((prev) => {
        const peerObj = prev[peerUserId] || {};
        return {
          ...prev,
          [peerUserId]: {
            ...peerObj,
            stream: remoteStream,
          },
        };
      });
    };

    return pc;
  }, [emit]);

  /**
   * Joins the WebRTC voice room mesh.
   */
  const joinVoiceRoom = useCallback(async () => {
    if (!roomId) return;
    setError(null);

    try {
      // 1. Initialize local microphone audio stream
      const stream = await initLocalStream();

      // 2. Connect to voice room signaling
      emit(SOCKET_EVENTS.VOICE_JOIN, { roomId }, async (response: any) => {
        if (!response.success) {
          setError(response.error || 'Failed to join voice channel');
          return;
        }

        setInVoiceRoom(true);

        // Map joining peer metadata details
        const initialPeers: Record<string, any> = {};
        response.peers.forEach((peer: any) => {
          initialPeers[peer.userId] = {
            socketId: peer.socketId,
            username: peer.username,
            avatar: peer.avatar,
            stream: null,
            isMuted: false,
          };
        });
        setPeers(initialPeers);

        // 3. Initiate WebRTC handshake with every existing peer in room
        for (const peer of response.peers) {
          try {
            const pc = createPeerConnection(peer.userId, peer.socketId, stream);

            // Create Offer
            const offer = await pc.createOffer();
            await pc.setLocalDescription(offer);

            // Emit offer to signaling channel
            emit(SOCKET_EVENTS.VOICE_SIGNAL, {
              targetSocketId: peer.socketId,
              signal: { type: 'offer', sdp: offer },
            });
          } catch (pcError) {
            console.error(`Failed to connect with peer ${peer.username}`, pcError);
          }
        }
      });
    } catch (err) {
      // Stream error handled in initLocalStream
    }
  }, [roomId, emit, createPeerConnection]);

  /**
   * Leaves the voice room and closes all peer connections.
   */
  const leaveVoiceRoom = useCallback(() => {
    if (!inVoiceRoom) return;

    // 1. Tell signaling server we left
    emit(SOCKET_EVENTS.VOICE_LEAVE, { roomId });

    // 2. Terminate all peer connection sockets
    Object.values(peersRef.current).forEach((pc) => {
      pc.close();
    });
    peersRef.current = {};

    // 3. Close local media stream tracks
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
      setLocalStream(null);
    }

    setPeers({});
    setInVoiceRoom(false);
  }, [roomId, emit, inVoiceRoom]);

  /**
   * Toggles microphone mute state.
   */
  const toggleMute = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsMuted(!audioTrack.enabled);
      }
    }
  }, []);

  // ── WebRTC Signaling Listeners ───────────────────────
  useEffect(() => {
    if (!connected || !inVoiceRoom) return;

    // A new member has joined our voice room
    const handleMemberJoined = (peer: any) => {
      setPeers((prev) => ({
        ...prev,
        [peer.userId]: {
          socketId: peer.socketId,
          username: peer.username,
          avatar: peer.avatar,
          stream: null,
          isMuted: false,
        },
      }));
    };

    // A member has left
    const handleMemberLeft = (data: any) => {
      const { userId } = data;
      
      // Close peer connection
      if (peersRef.current[userId]) {
        peersRef.current[userId].close();
        delete peersRef.current[userId];
      }

      setPeers((prev) => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    };

    // Receive incoming WebRTC signal trades (offers, answers, ICE candidates)
    const handleVoiceSignal = async (data: any) => {
      const { senderSocketId, senderUserId, signal } = data;

      try {
        let pc = peersRef.current[senderUserId];

        // 1. Handle incoming Offer
        if (signal.type === 'offer') {
          // If connection doesn't exist yet, establish it
          if (!pc) {
            const stream = localStreamRef.current;
            if (!stream) return;
            pc = createPeerConnection(senderUserId, senderSocketId, stream);
          }

          await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          
          // Create Answer and respond
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);

          emit(SOCKET_EVENTS.VOICE_SIGNAL, {
            targetSocketId: senderSocketId,
            signal: { type: 'answer', sdp: answer },
          });
        }

        // 2. Handle incoming Answer response
        else if (signal.type === 'answer') {
          if (pc) {
            await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
          }
        }

        // 3. Handle incoming ICE candidate
        else if (signal.type === 'candidate') {
          if (pc) {
            await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
          }
        }
      } catch (err) {
        console.error('Error handling WebRTC voice signal', err);
      }
    };

    on(SOCKET_EVENTS.MEMBER_JOINED, handleMemberJoined);
    on(SOCKET_EVENTS.MEMBER_LEFT, handleMemberLeft);
    on(SOCKET_EVENTS.VOICE_SIGNAL, handleVoiceSignal);

    return () => {
      off(SOCKET_EVENTS.MEMBER_JOINED, handleMemberJoined);
      off(SOCKET_EVENTS.MEMBER_LEFT, handleMemberLeft);
      off(SOCKET_EVENTS.VOICE_SIGNAL, handleVoiceSignal);
    };
  }, [connected, inVoiceRoom, createPeerConnection, on, off, emit]);

  // Cleanup on page transitions/unmounts
  useEffect(() => {
    return () => {
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => track.stop());
      }
      Object.values(peersRef.current).forEach((pc) => pc.close());
    };
  }, []);

  return {
    peers: Object.values(peers),
    localStream,
    isMuted,
    inVoiceRoom,
    error,
    joinVoiceRoom,
    leaveVoiceRoom,
    toggleMute,
  };
}
