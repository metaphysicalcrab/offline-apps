import { useState, useRef, useCallback, useEffect } from 'react';

// Lazy-load PeerJS to avoid breaking offline mode
let PeerClass = null;
async function getPeer() {
  if (!PeerClass) {
    const mod = await import('peerjs');
    PeerClass = mod.Peer || mod.default;
  }
  return PeerClass;
}

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // no ambiguous chars
  let code = '';
  for (let i = 0; i < 4; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return `BJ-${code}`;
}

const PEER_PREFIX = 'draw-bj-';
const MAX_RECONNECT_ATTEMPTS = 3;
const RECONNECT_DELAYS = [1000, 2000, 4000]; // exponential backoff
const PEER_CONNECT_TIMEOUT_MS = 8000;
const PEER_CONFIG = {
  debug: 0,
  config: {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' },
    ],
  },
};

export function useMultiplayer() {
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [roomCode, setRoomCode] = useState(null);
  const [players, setPlayers] = useState([]);
  const [error, setError] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState('disconnected'); // 'connected' | 'reconnecting' | 'disconnected'
  const [isConnecting, setIsConnecting] = useState(false);
  const [myPeerId, setMyPeerId] = useState(null);

  const peerRef = useRef(null);
  const connectionsRef = useRef([]); // Host: connections to clients
  const hostConnRef = useRef(null); // Client: connection to host
  const onActionRef = useRef(null); // Host: callback for player actions
  const reconnectAttemptRef = useRef(0);
  const reconnectTimerRef = useRef(null);
  const joinInfoRef = useRef(null); // Store code + name for reconnection
  const openTimeoutRef = useRef(null);
  const connTimeoutRef = useRef(null);

  const cleanup = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }
    if (openTimeoutRef.current) {
      clearTimeout(openTimeoutRef.current);
      openTimeoutRef.current = null;
    }
    if (connTimeoutRef.current) {
      clearTimeout(connTimeoutRef.current);
      connTimeoutRef.current = null;
    }
    reconnectAttemptRef.current = 0;
    connectionsRef.current.forEach(c => c.close());
    connectionsRef.current = [];
    if (hostConnRef.current) {
      hostConnRef.current.close();
      hostConnRef.current = null;
    }
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }
    setIsHost(false);
    setIsConnected(false);
    setIsConnecting(false);
    setRoomCode(null);
    setPlayers([]);
    setError(null);
    setGameState(null);
    setConnectionStatus('disconnected');
    setMyPeerId(null);
    joinInfoRef.current = null;
  }, []);

  // Cleanup on unmount
  useEffect(() => cleanup, [cleanup]);

  const createRoom = useCallback(async (playerName) => {
    try {
      setError(null);
      setIsConnecting(true);
      const Peer = await getPeer();
      const code = generateRoomCode();
      const peerId = PEER_PREFIX + code;

      const peer = new Peer(peerId, PEER_CONFIG);
      peerRef.current = peer;

      openTimeoutRef.current = setTimeout(() => {
        if (!peer.open && !peer.destroyed) {
          peer.destroy();
          peerRef.current = null;
          setIsConnecting(false);
          setError('Could not reach signaling server. Check your internet connection and try again.');
          setConnectionStatus('disconnected');
        }
      }, PEER_CONNECT_TIMEOUT_MS);

      peer.on('open', () => {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
        setIsConnecting(false);
        setIsHost(true);
        setIsConnected(true);
        setConnectionStatus('connected');
        setRoomCode(code);
        setMyPeerId(peerId);
        setPlayers([{ name: playerName, isHost: true, id: 'host' }]);
      });

      peer.on('connection', (conn) => {
        conn.on('open', () => {
          connectionsRef.current.push(conn);

          conn.on('data', (data) => {
            if (data.type === 'JOIN') {
              setPlayers(prev => {
                if (prev.some(p => p.id === conn.peer)) return prev;
                const updated = [...prev, { name: data.name, isHost: false, id: conn.peer }];
                // Broadcast updated player list
                broadcast({ type: 'PLAYER_LIST', players: updated });
                return updated;
              });
            } else if (data.type === 'PLAYER_ACTION') {
              // Forward to host game logic
              if (onActionRef.current) {
                onActionRef.current(data.action, conn.peer);
              }
            }
          });

          conn.on('close', () => {
            connectionsRef.current = connectionsRef.current.filter(c => c !== conn);
            setPlayers(prev => {
              const updated = prev.filter(p => p.id !== conn.peer);
              broadcast({ type: 'PLAYER_LIST', players: updated });
              return updated;
            });
          });
        });
      });

      peer.on('error', (err) => {
        setIsConnecting(false);
        if (err.type === 'unavailable-id') {
          setError('Room code conflict. Try creating a new room.');
        } else if (err.type === 'network' || err.type === 'server-error') {
          setError('Cannot reach signaling server. Check your connection.');
        } else {
          setError(`Connection error: ${err.type}`);
        }
        setConnectionStatus('disconnected');
      });
    } catch (err) {
      setIsConnecting(false);
      setError('Failed to create room. Check your connection.');
    }
  }, []);

  const connectToHost = useCallback((peer, code, playerName) => {
    const hostPeerId = PEER_PREFIX + code.toUpperCase();
    const conn = peer.connect(hostPeerId, { reliable: true });
    hostConnRef.current = conn;

    connTimeoutRef.current = setTimeout(() => {
      if (!conn.open) {
        conn.close();
        setIsConnecting(false);
        setError('Could not connect to host. The room may no longer exist.');
        setConnectionStatus('disconnected');
      }
    }, PEER_CONNECT_TIMEOUT_MS);

    conn.on('open', () => {
      clearTimeout(connTimeoutRef.current);
      connTimeoutRef.current = null;
      setIsConnecting(false);
      setIsConnected(true);
      setConnectionStatus('connected');
      setRoomCode(code.toUpperCase());
      setError(null);
      reconnectAttemptRef.current = 0;
      conn.send({ type: 'JOIN', name: playerName });
    });

    conn.on('data', (data) => {
      if (data.type === 'PLAYER_LIST') {
        setPlayers(data.players);
      } else if (data.type === 'GAME_STATE') {
        setGameState(data.state);
      } else if (data.type === 'GAME_START') {
        setGameState(data.state);
      }
    });

    conn.on('close', () => {
      setIsConnected(false);
      hostConnRef.current = null;

      // Attempt reconnection
      const info = joinInfoRef.current;
      if (info && reconnectAttemptRef.current < MAX_RECONNECT_ATTEMPTS) {
        setConnectionStatus('reconnecting');
        setError(`Reconnecting... (attempt ${reconnectAttemptRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        const delay = RECONNECT_DELAYS[reconnectAttemptRef.current] || 4000;
        reconnectAttemptRef.current++;

        reconnectTimerRef.current = setTimeout(() => {
          if (peerRef.current && !peerRef.current.destroyed) {
            connectToHost(peerRef.current, info.code, info.name);
          }
        }, delay);
      } else {
        setConnectionStatus('disconnected');
        setError('Disconnected from host');
      }
    });
  }, []);

  const joinRoom = useCallback(async (code, playerName) => {
    try {
      setError(null);
      setIsConnecting(true);
      reconnectAttemptRef.current = 0;
      joinInfoRef.current = { code: code.toUpperCase(), name: playerName };

      const Peer = await getPeer();
      const peer = new Peer(PEER_CONFIG);
      peerRef.current = peer;

      openTimeoutRef.current = setTimeout(() => {
        if (!peer.open && !peer.destroyed) {
          peer.destroy();
          peerRef.current = null;
          setIsConnecting(false);
          setError('Could not reach signaling server. Check your internet connection and try again.');
          setConnectionStatus('disconnected');
        }
      }, PEER_CONNECT_TIMEOUT_MS);

      peer.on('open', () => {
        clearTimeout(openTimeoutRef.current);
        openTimeoutRef.current = null;
        setMyPeerId(peer.id);
        connectToHost(peer, code, playerName);
      });

      peer.on('error', (err) => {
        setIsConnecting(false);
        if (err.type === 'peer-unavailable') {
          setError('Room not found. Check the code and try again.');
        } else if (err.type === 'network' || err.type === 'server-error') {
          setError('Cannot reach signaling server. Check your connection.');
        } else {
          setError(`Connection error: ${err.type}`);
        }
        setConnectionStatus('disconnected');
      });
    } catch (err) {
      setIsConnecting(false);
      setError('Failed to join room. Check your connection.');
    }
  }, [connectToHost]);

  const broadcast = useCallback((data) => {
    connectionsRef.current.forEach(conn => {
      if (conn.open) conn.send(data);
    });
  }, []);

  const sendAction = useCallback((action) => {
    if (hostConnRef.current?.open) {
      hostConnRef.current.send({ type: 'PLAYER_ACTION', action });
    }
  }, []);

  const broadcastGameState = useCallback((state) => {
    broadcast({ type: 'GAME_STATE', state });
  }, [broadcast]);

  const setOnAction = useCallback((callback) => {
    onActionRef.current = callback;
  }, []);

  const leaveRoom = useCallback(() => {
    cleanup();
  }, [cleanup]);

  const kickPlayer = useCallback((playerId) => {
    const conn = connectionsRef.current.find(c => c.peer === playerId);
    if (conn) conn.close();
  }, []);

  return {
    isHost,
    isConnected,
    isConnecting,
    roomCode,
    players,
    error,
    gameState,
    connectionStatus,
    myPeerId,
    createRoom,
    joinRoom,
    leaveRoom,
    broadcast,
    broadcastGameState,
    sendAction,
    setOnAction,
    kickPlayer,
  };
}
