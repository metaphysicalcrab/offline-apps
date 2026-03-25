import React, { useState, useEffect } from 'react';
import { getRandomNPCName } from '../game/npcPlayer.js';

export default function BlackjackLobby({
  multiplayer,
  onStartSolo,
  onStartMultiplayer,
  themeStyles,
}) {
  // Guest: auto-transition when host starts the game
  useEffect(() => {
    if (!multiplayer.isHost && multiplayer.gameState) {
      onStartMultiplayer({ isHost: false });
    }
  }, [multiplayer.gameState, multiplayer.isHost]);
  const [mode, setMode] = useState(null); // null, 'solo', 'create', 'join'
  const [playerName, setPlayerName] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [npcPlayers, setNpcPlayers] = useState([]);

  const addNPC = () => {
    if (npcPlayers.length >= 5) return;
    const existingNames = ['You', ...npcPlayers];
    const name = getRandomNPCName(existingNames);
    setNpcPlayers([...npcPlayers, name]);
  };

  const removeNPC = (index) => {
    setNpcPlayers(npcPlayers.filter((_, i) => i !== index));
  };

  const handleStartWithNPCs = () => {
    onStartSolo(npcPlayers);
  };

  const handleCreate = () => {
    if (!playerName.trim()) return;
    multiplayer.createRoom(playerName.trim());
  };

  const handleJoin = () => {
    if (!playerName.trim() || !joinCode.trim()) return;
    multiplayer.joinRoom(joinCode.trim(), playerName.trim());
  };

  // Connected to room — show lobby
  if (multiplayer.isConnected && multiplayer.roomCode) {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ ...themeStyles?.text, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
            {multiplayer.isHost ? 'Your Room' : 'Joined Room'}
          </div>

          <div
            style={{ ...styles.codeDisplay, cursor: 'pointer' }}
            onClick={() => {
              navigator.clipboard.writeText(multiplayer.roomCode);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            role="button"
            tabIndex={0}
            aria-label={`Copy room code ${multiplayer.roomCode}`}
          >
            <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>ROOM CODE</span>
            <span style={{ ...themeStyles?.textAccent, fontSize: 32, fontWeight: 700, letterSpacing: 4 }}>
              {multiplayer.roomCode}
            </span>
            <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>
              {copied ? 'Copied!' : 'Tap to copy'}
            </span>
          </div>

          <div style={styles.playersList}>
            <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>
              Players ({multiplayer.players.length}/6)
            </span>
            {multiplayer.players.map((p, i) => (
              <div key={i} style={{ ...styles.playerBadge, ...themeStyles?.playerBadge }}>
                <span>{p.name}</span>
                {p.isHost && <span style={{ fontSize: 10, opacity: 0.6 }}>(Host)</span>}
                {multiplayer.isHost && !p.isHost && (
                  <button
                    onClick={() => multiplayer.kickPlayer(p.id)}
                    style={styles.kickBtn}
                    aria-label={`Remove ${p.name}`}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          <div style={styles.actions}>
            {multiplayer.isHost && multiplayer.players.length >= 1 && (
              <button
                onClick={() => onStartMultiplayer({ isHost: true })}
                style={{ ...styles.btn, ...themeStyles?.buttonPrimary, flex: 1 }}
              >
                Start Game
              </button>
            )}
            {!multiplayer.isHost && (
              <div style={{ ...themeStyles?.textMuted, fontSize: 13, textAlign: 'center', flex: 1, padding: '12px 0' }}>
                Waiting for host to start...
              </div>
            )}
            <button
              onClick={multiplayer.leaveRoom}
              style={{ ...styles.btn, ...themeStyles?.buttonDanger }}
            >
              Leave
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Create/Join flow
  if (mode === 'create' || mode === 'join') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ ...themeStyles?.text, fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
            {mode === 'create' ? 'Create Room' : 'Join Room'}
          </div>

          <input
            type="text"
            placeholder="Your name"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            style={{ ...styles.input, ...themeStyles?.input }}
            maxLength={15}
            autoFocus
          />

          {mode === 'join' && (
            <input
              type="text"
              placeholder="Room code (e.g. BJ-A3K9)"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
              style={{ ...styles.input, ...themeStyles?.input, letterSpacing: 2, textAlign: 'center' }}
              maxLength={7}
            />
          )}

          {multiplayer.error && (
            <div style={styles.errorMsg}>
              {multiplayer.error}
            </div>
          )}

          <div style={styles.actions}>
            <button
              onClick={() => { setMode(null); multiplayer.leaveRoom(); }}
              style={{ ...styles.btn, ...themeStyles?.button }}
            >
              Back
            </button>
            <button
              onClick={mode === 'create' ? handleCreate : handleJoin}
              disabled={multiplayer.isConnecting || !playerName.trim() || (mode === 'join' && !joinCode.trim())}
              style={{
                ...styles.btn,
                ...themeStyles?.buttonPrimary,
                flex: 1,
                opacity: (multiplayer.isConnecting || !playerName.trim()) ? 0.4 : 1,
              }}
            >
              {multiplayer.isConnecting
                ? 'Connecting...'
                : (mode === 'create' ? 'Create' : 'Join')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Solo setup flow — configure NPCs
  if (mode === 'solo') {
    return (
      <div style={styles.container}>
        <div style={styles.card}>
          <div style={{ ...themeStyles?.text, fontSize: 16, fontWeight: 600, textAlign: 'center' }}>
            Table Setup
          </div>
          <div style={{ ...themeStyles?.textMuted, fontSize: 12, textAlign: 'center' }}>
            Add AI players to simulate a full table
          </div>

          <div style={styles.playersList}>
            <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>
              Players ({1 + npcPlayers.length}/6)
            </span>
            <div style={{ ...styles.playerBadge, ...themeStyles?.playerBadge }}>
              <span>You</span>
              <span style={{ fontSize: 10, opacity: 0.6 }}>(Player)</span>
            </div>
            {npcPlayers.map((name, i) => (
              <div key={i} style={{ ...styles.playerBadge, ...themeStyles?.playerBadge }}>
                <span>{name}</span>
                <span style={{ fontSize: 10, opacity: 0.6 }}>(NPC)</span>
                <button
                  onClick={() => removeNPC(i)}
                  style={styles.kickBtn}
                  aria-label={`Remove ${name}`}
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {npcPlayers.length < 5 && (
            <button
              onClick={addNPC}
              style={{ ...styles.addNpcBtn, ...themeStyles?.button }}
              aria-label="Add NPC player"
            >
              + Add NPC
            </button>
          )}

          <div style={styles.actions}>
            <button
              onClick={() => { setMode(null); setNpcPlayers([]); }}
              style={{ ...styles.btn, ...themeStyles?.button }}
            >
              Back
            </button>
            <button
              onClick={handleStartWithNPCs}
              style={{ ...styles.btn, ...themeStyles?.buttonPrimary, flex: 1 }}
            >
              Start Game
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Main lobby menu
  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={{ textAlign: 'center' }}>
          <span style={{ fontSize: 40 }}>🃏</span>
          <div style={{ ...themeStyles?.text, fontSize: 20, fontWeight: 700, marginTop: 4 }}>
            Blackjack
          </div>
          <div style={{ ...themeStyles?.textMuted, fontSize: 13, marginTop: 2 }}>
            Casino practice with full rules
          </div>
        </div>

        <button
          onClick={() => setMode('solo')}
          style={{ ...styles.menuBtn, ...themeStyles?.buttonPrimary }}
        >
          <span style={{ fontSize: 20 }}>🎯</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Play Solo</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Practice with optional NPC players</div>
          </div>
        </button>

        <button
          onClick={() => setMode('create')}
          style={{ ...styles.menuBtn, ...themeStyles?.button }}
        >
          <span style={{ fontSize: 20 }}>📡</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Create Room</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Host a multiplayer game</div>
          </div>
        </button>

        <button
          onClick={() => setMode('join')}
          style={{ ...styles.menuBtn, ...themeStyles?.button }}
        >
          <span style={{ fontSize: 20 }}>🔗</span>
          <div>
            <div style={{ fontWeight: 700, fontSize: 15 }}>Join Room</div>
            <div style={{ fontSize: 11, opacity: 0.7 }}>Enter a room code</div>
          </div>
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
    padding: '20px 16px',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    gap: 12,
    width: '100%',
    maxWidth: 340,
  },
  menuBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '14px 16px',
    borderRadius: 14,
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.15s',
    fontSize: 14,
  },
  input: {
    width: '100%',
    boxSizing: 'border-box',
  },
  btn: {
    padding: '12px 20px',
    borderRadius: 12,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'all 0.15s',
  },
  actions: {
    display: 'flex',
    gap: 8,
    marginTop: 4,
  },
  codeDisplay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    padding: '12px 0',
  },
  playersList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  playerBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '8px 12px',
    borderRadius: 10,
    fontSize: 14,
  },
  kickBtn: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    opacity: 0.5,
    marginLeft: 'auto',
    color: 'inherit',
  },
  errorMsg: {
    fontSize: 13,
    color: '#e74c3c',
    textAlign: 'center',
    padding: '6px 12px',
    background: 'rgba(231,76,60,0.1)',
    borderRadius: 8,
  },
  addNpcBtn: {
    padding: '10px 16px',
    borderRadius: 10,
    border: '1px dashed currentColor',
    background: 'none',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    opacity: 0.7,
    transition: 'all 0.15s',
  },
};
