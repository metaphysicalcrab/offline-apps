import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GAME_PHASE, BLACKJACK_ACTIONS, HAND_STATUS } from '../constants.js';
import { useBlackjack } from '../hooks/useBlackjack.js';
import { useMultiplayer } from '../hooks/useMultiplayer.js';
import { getOptimalAction, getActionExplanation } from '../game/blackjackStrategy.js';
import { needsNewShoe, getAvailableActions as getAvailableActionsRaw } from '../game/blackjack.js';
import { getNPCAction, getNPCActionDelay, getNPCBet } from '../game/npcPlayer.js';
import BlackjackHand from './BlackjackHand.jsx';
import BlackjackBetting from './BlackjackBetting.jsx';
import BlackjackControls from './BlackjackControls.jsx';
import BlackjackResults from './BlackjackResults.jsx';
import BlackjackRules from './BlackjackRules.jsx';
import BlackjackStrategy from './BlackjackStrategy.jsx';
import BlackjackLobby from './BlackjackLobby.jsx';

function getSerializableState(game) {
  return {
    shoe: game.shoe,
    phase: game.phase,
    dealer: game.dealer,
    players: game.players,
    currentPlayerIndex: game.currentPlayerIndex,
    dealtCards: game.dealtCards,
    results: game.results,
    message: game.message,
    config: game.config,
  };
}

const TURN_TIMEOUT_MS = 30000;

const ACTION_LABELS = {
  hit: 'Hit', stand: 'Stand', double: 'Double', split: 'Split', surrender: 'Surrender',
};

export default function BlackjackGame({ themeStyles, audio, haptics }) {
  const game = useBlackjack();
  const multiplayer = useMultiplayer();
  const [hintMode, setHintMode] = useState('off'); // 'off' | 'before' | 'after'
  const [feedback, setFeedback] = useState(null);
  const optimalActionRef = useRef(null);
  const [showCount, setShowCount] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const [inLobby, setInLobby] = useState(true);
  const [isMultiplayer, setIsMultiplayer] = useState(false);
  const [localPlayerId, setLocalPlayerId] = useState(null);
  const [turnTimeLeft, setTurnTimeLeft] = useState(null);

  // Refs for stable access in callbacks
  const gameRef = useRef(game);
  gameRef.current = game;

  // Derived state
  const localPlayerIndex = isMultiplayer
    ? game.players.findIndex(p => p.id === localPlayerId)
    : game.players.findIndex(p => !p.isNPC);
  const hasNPCs = game.players.some(p => p.isNPC);
  const currentPlayer = game.players[game.currentPlayerIndex];
  const activeHand = currentPlayer?.hands[currentPlayer.activeHandIndex];
  const isPlayerTurn = game.phase === GAME_PHASE.PLAYER_TURN;
  const isLocalPlayerTurn = isPlayerTurn && game.currentPlayerIndex === localPlayerIndex;
  const isHost = !isMultiplayer || multiplayer.isHost;

  // --- Host: broadcast game state on changes ---
  useEffect(() => {
    if (!isMultiplayer || !multiplayer.isHost) return;
    multiplayer.broadcastGameState(getSerializableState(game));
  }, [game.phase, game.currentPlayerIndex, game.players, game.dealer, game.results, isMultiplayer, multiplayer.isHost]);

  // --- Host: handle remote player actions ---
  useEffect(() => {
    if (!isMultiplayer || !multiplayer.isHost) return;
    multiplayer.setOnAction((action, peerId) => {
      const g = gameRef.current;
      const playerIndex = g.players.findIndex(p => p.id === peerId);
      if (playerIndex === -1) return;

      // Betting phase: any player can bet
      if (action.type === 'PLACE_BET') {
        g.placeBet(playerIndex, action.amount);
        return;
      }

      if (action.type === 'TAKE_INSURANCE') {
        g.takeInsurance();
        return;
      }
      if (action.type === 'DECLINE_INSURANCE') {
        g.declineInsurance();
        return;
      }

      // Player turn: validate it's this player's turn
      if (g.phase === GAME_PHASE.PLAYER_TURN && playerIndex !== g.currentPlayerIndex) return;
      const hi = g.players[playerIndex].activeHandIndex;

      switch (action.type) {
        case 'HIT': g.hit(playerIndex, hi); break;
        case 'STAND': g.stand(playerIndex, hi); break;
        case 'DOUBLE': g.double(playerIndex, hi); break;
        case 'SPLIT': g.split(playerIndex, hi); break;
        case 'SURRENDER': g.surrender(playerIndex, hi); break;
      }
    });
  }, [isMultiplayer, multiplayer.isHost]);

  // --- Host: sync multiplayer player list to game state ---
  useEffect(() => {
    if (!isMultiplayer || !multiplayer.isHost || game.phase !== GAME_PHASE.BETTING) return;

    // Add new remote players
    for (const mp of multiplayer.players) {
      if (!mp.isHost && !game.players.some(p => p.id === mp.id)) {
        game.addPlayer(mp.name, mp.id);
      }
    }
    // Remove disconnected players
    for (const gp of game.players) {
      if (gp.id && gp.id !== 'host' && !multiplayer.players.some(mp => mp.id === gp.id)) {
        game.removePlayer(gp.id);
      }
    }
  }, [multiplayer.players, isMultiplayer, multiplayer.isHost, game.phase]);

  // --- Guest: sync state from host ---
  useEffect(() => {
    if (!isMultiplayer || multiplayer.isHost || !multiplayer.gameState) return;
    game.dispatch({ type: 'SYNC_STATE', state: multiplayer.gameState });
  }, [multiplayer.gameState, isMultiplayer, multiplayer.isHost]);

  // --- Multiplayer turn timeout (host only) ---
  useEffect(() => {
    if (!isMultiplayer || !multiplayer.isHost || !isPlayerTurn) {
      setTurnTimeLeft(null);
      return;
    }

    setTurnTimeLeft(TURN_TIMEOUT_MS / 1000);
    const interval = setInterval(() => {
      setTurnTimeLeft(prev => {
        if (prev === null || prev <= 1) return 0;
        return prev - 1;
      });
    }, 1000);

    const timeout = setTimeout(() => {
      const g = gameRef.current;
      if (g.phase === GAME_PHASE.PLAYER_TURN) {
        const pi = g.currentPlayerIndex;
        const hi = g.players[pi].activeHandIndex;
        g.stand(pi, hi);
      }
    }, TURN_TIMEOUT_MS);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [game.currentPlayerIndex, game.phase, isMultiplayer, multiplayer.isHost, isPlayerTurn]);

  // --- NPC auto-play during player turn ---
  useEffect(() => {
    if (game.phase !== GAME_PHASE.PLAYER_TURN) return;
    const cp = game.players[game.currentPlayerIndex];
    if (!cp?.isNPC) return;
    const hand = cp.hands[cp.activeHandIndex];
    if (hand.status !== HAND_STATUS.PLAYING) return;

    const actions = game.getAvailableActions(
      hand, cp.hands.length, cp.chips,
      hand.cards.length === 2 && !hand.isDoubled,
    );
    if (actions.length === 0) return;

    const action = getNPCAction(hand, game.dealer.cards[0], actions);
    const delay = getNPCActionDelay();

    const timer = setTimeout(() => {
      const g = gameRef.current;
      const pi = g.currentPlayerIndex;
      const hi = g.players[pi]?.activeHandIndex ?? 0;
      switch (action) {
        case BLACKJACK_ACTIONS.HIT: g.hit(pi, hi); break;
        case BLACKJACK_ACTIONS.STAND: g.stand(pi, hi); break;
        case BLACKJACK_ACTIONS.DOUBLE: g.double(pi, hi); break;
        case BLACKJACK_ACTIONS.SPLIT: g.split(pi, hi); break;
        case BLACKJACK_ACTIONS.SURRENDER: g.surrender(pi, hi); break;
      }
    }, delay);

    return () => clearTimeout(timer);
  }, [game.phase, game.currentPlayerIndex, game.players]);

  // --- NPC auto-handle insurance (always decline) ---
  useEffect(() => {
    if (game.phase !== GAME_PHASE.INSURANCE || !hasNPCs) return;
    // Insurance is handled for all players at once; just let human decide
    // NPCs don't need separate handling — the reducer applies to all
  }, [game.phase, hasNPCs]);

  // Auto-dismiss feedback after 3 seconds
  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3000);
    return () => clearTimeout(timer);
  }, [feedback]);

  // Clear feedback on phase changes
  useEffect(() => {
    setFeedback(null);
  }, [game.phase]);

  // Get available actions for current hand
  const availableActions = isPlayerTurn && activeHand
    ? game.getAvailableActions(
        activeHand,
        currentPlayer.hands.length,
        currentPlayer.chips,
        activeHand.cards.length === 2 && !activeHand.isDoubled,
      )
    : [];

  // Compute optimal action (needed for both 'before' and 'after' modes)
  const computedHint = isPlayerTurn && activeHand && game.dealer.cards.length > 0
    ? (() => {
        const action = getOptimalAction(activeHand.cards, game.dealer.cards[0], availableActions);
        const explanation = getActionExplanation(action, activeHand.cards, game.dealer.cards[0]);
        return { action, explanation };
      })()
    : null;

  // Store in ref for 'after' mode comparison
  if (computedHint) {
    optimalActionRef.current = computedHint;
  }

  // Only expose hint for display in 'before' mode
  const hint = hintMode === 'before' ? computedHint : null;

  const handleAction = useCallback((action) => {
    // After-mode feedback: compare action to stored optimal
    if (hintMode === 'after' && optimalActionRef.current) {
      const { action: optimalAction, explanation } = optimalActionRef.current;
      setFeedback({
        takenAction: action,
        optimalAction,
        explanation,
        isCorrect: action === optimalAction,
      });
    }

    // Guest: send to host
    if (isMultiplayer && !multiplayer.isHost) {
      multiplayer.sendAction({ type: action.toUpperCase() });
      return;
    }

    // Host / solo: dispatch locally
    const pi = game.currentPlayerIndex;
    const hi = currentPlayer.activeHandIndex;

    switch (action) {
      case BLACKJACK_ACTIONS.HIT:
        game.hit(pi, hi);
        audio?.playFlip();
        break;
      case BLACKJACK_ACTIONS.STAND:
        game.stand(pi, hi);
        break;
      case BLACKJACK_ACTIONS.DOUBLE:
        game.double(pi, hi);
        audio?.playFlip();
        break;
      case BLACKJACK_ACTIONS.SPLIT:
        game.split(pi, hi);
        audio?.playFlip();
        break;
      case BLACKJACK_ACTIONS.SURRENDER:
        game.surrender(pi, hi);
        break;
    }
  }, [game, currentPlayer, audio, isMultiplayer, multiplayer, hintMode]);

  const handlePlaceBet = useCallback((playerIndex, amount) => {
    if (isMultiplayer && !multiplayer.isHost) {
      multiplayer.sendAction({ type: 'PLACE_BET', amount });
      return;
    }
    game.placeBet(playerIndex, amount);
  }, [game, isMultiplayer, multiplayer]);

  const handleInsurance = useCallback((accept) => {
    if (isMultiplayer && !multiplayer.isHost) {
      multiplayer.sendAction({ type: accept ? 'TAKE_INSURANCE' : 'DECLINE_INSURANCE' });
      return;
    }
    if (accept) game.takeInsurance();
    else game.declineInsurance();
  }, [game, isMultiplayer, multiplayer]);

  const handleDeal = useCallback(() => {
    game.deal();
    audio?.playFlip();
  }, [game, audio]);

  const handleStartSolo = useCallback((npcNames = []) => {
    setIsMultiplayer(false);
    setLocalPlayerId(null);
    for (const name of npcNames) {
      game.addPlayer(name, null, true);
    }
    // Place initial NPC bets (subsequent rounds handled by NEW_ROUND)
    setTimeout(() => {
      const g = gameRef.current;
      g.players.forEach((p, i) => {
        if (p.isNPC && p.hands[0]?.bet === 0) {
          g.placeBet(i, getNPCBet(p.chips));
        }
      });
    }, 0);
    setInLobby(false);
  }, [game]);

  const handleStartMultiplayer = useCallback(({ isHost: startAsHost }) => {
    setIsMultiplayer(true);

    if (startAsHost) {
      setLocalPlayerId('host');
      // Tag player 0 as host
      game.players[0].id = 'host';
      // Add already-connected remote players
      multiplayer.players.forEach(p => {
        if (!p.isHost) game.addPlayer(p.name, p.id);
      });
      // Broadcast initial state to guests
      setTimeout(() => {
        multiplayer.broadcastGameState(getSerializableState(gameRef.current));
      }, 100);
    } else {
      // Guest: localPlayerId is their peer connection id
      // We'll find it from the game state once synced
      setLocalPlayerId(null);
    }

    setInLobby(false);
  }, [game, multiplayer]);

  // Guest: resolve localPlayerId from our actual peer ID
  useEffect(() => {
    if (!isMultiplayer || multiplayer.isHost || localPlayerId) return;
    if (multiplayer.myPeerId) {
      setLocalPlayerId(multiplayer.myPeerId);
    }
  }, [isMultiplayer, multiplayer.isHost, localPlayerId, multiplayer.myPeerId]);

  const handleLeaveTable = useCallback(() => {
    if (game.phase !== GAME_PHASE.BETTING || confirm('Leave the table?')) {
      game.reset();
      multiplayer.leaveRoom();
      setIsMultiplayer(false);
      setLocalPlayerId(null);
      setInLobby(true);
    }
  }, [game, multiplayer]);

  const showNewShoe = needsNewShoe(game.shoe, game.config.deckCount, game.config.cutCardPercent);

  if (inLobby) {
    return (
      <BlackjackLobby
        multiplayer={multiplayer}
        onStartSolo={handleStartSolo}
        onStartMultiplayer={handleStartMultiplayer}
        themeStyles={themeStyles}
      />
    );
  }

  const localPlayer = game.players[localPlayerIndex] || game.players[0];

  return (
    <div style={styles.container}>
      {/* === TOP ZONE — pinned === */}
      <div style={styles.topZone}>
        {/* Top bar */}
        <div style={styles.topBar}>
          <div style={styles.topBarLeft}>
            <button
              onClick={handleLeaveTable}
              style={styles.iconBtn}
              aria-label="Back to lobby"
            >
              ←
            </button>
            <button
              onClick={() => setShowRules(true)}
              style={styles.iconBtn}
              aria-label="Rules"
            >
              📖
            </button>
            <button
              onClick={() => setShowStrategy(true)}
              style={styles.iconBtn}
              aria-label="Strategy chart"
            >
              📊
            </button>
          </div>
          <div style={styles.topBarRight}>
            <button
              onClick={() => setHintMode(m => m === 'off' ? 'before' : m === 'before' ? 'after' : 'off')}
              style={{ ...styles.toggleBtn, ...(hintMode !== 'off' ? styles.toggleActive : {}), ...themeStyles?.button }}
              aria-label="Cycle hint mode"
            >
              💡 {hintMode === 'off' ? 'OFF' : hintMode === 'before' ? 'BEFORE' : 'AFTER'}
            </button>
            <button
              onClick={() => setShowCount(c => !c)}
              style={{ ...styles.toggleBtn, ...(showCount ? styles.toggleActive : {}), ...themeStyles?.button }}
              aria-label="Toggle count"
              aria-pressed={showCount}
            >
              🔢 {showCount ? 'ON' : 'OFF'}
            </button>
          </div>
        </div>

        {/* Connection status bar (multiplayer only) */}
        {isMultiplayer && (
          <div style={styles.connectionBar}>
            <span style={{
              display: 'inline-block',
              width: 8,
              height: 8,
              borderRadius: '50%',
              background: multiplayer.isConnected ? '#27ae60' : '#e74c3c',
            }} />
            <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>
              {multiplayer.isConnected
                ? `Room: ${multiplayer.roomCode}`
                : 'Disconnected'}
            </span>
            <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>
              {multiplayer.players.length} player{multiplayer.players.length !== 1 ? 's' : ''}
            </span>
            {isPlayerTurn && isMultiplayer && turnTimeLeft !== null && (
              <span style={{
                fontSize: 11,
                fontWeight: 700,
                color: turnTimeLeft <= 10 ? '#e74c3c' : '#f39c12',
              }}>
                {turnTimeLeft}s
              </span>
            )}
          </div>
        )}

        {/* Multiplayer error overlay */}
        {isMultiplayer && multiplayer.error && !multiplayer.isConnected && (
          <div style={styles.errorOverlay}>
            <div style={{ ...themeStyles?.text, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
              {multiplayer.error}
            </div>
            <button
              onClick={handleLeaveTable}
              style={{ ...styles.insuranceBtn, ...themeStyles?.button, marginTop: 8 }}
            >
              Return to Lobby
            </button>
          </div>
        )}

        {/* Running count display */}
        {showCount && (
          <div style={styles.countBar}>
            <span style={{ fontSize: 12, color: '#95a5a6' }}>
              RC: <strong style={{ color: game.runningCount >= 0 ? '#27ae60' : '#e74c3c' }}>{game.runningCount > 0 ? '+' : ''}{game.runningCount}</strong>
            </span>
            <span style={{ fontSize: 12, color: '#95a5a6' }}>
              TC: <strong style={{ color: game.trueCount >= 0 ? '#27ae60' : '#e74c3c' }}>{game.trueCount > 0 ? '+' : ''}{game.trueCount}</strong>
            </span>
            <span style={{ fontSize: 12, color: '#95a5a6' }}>
              Decks: {game.decksRemaining}
            </span>
          </div>
        )}

        {/* Dealer hand */}
        <div style={styles.dealerArea}>
          <BlackjackHand
            hand={game.dealer.cards.length > 0 ? { cards: game.dealer.cards, status: HAND_STATUS.PLAYING } : { cards: [], status: HAND_STATUS.PLAYING }}
            isDealer
            hidden={game.dealer.hidden}
            themeStyles={themeStyles}
            label="Dealer"
          />
        </div>
      </div>

      {/* === MIDDLE ZONE — scrollable === */}
      <div style={styles.middleZone}>
        {/* Insurance prompt */}
        {game.phase === GAME_PHASE.INSURANCE && (
          <div style={styles.insurancePrompt}>
            <div style={{ ...themeStyles?.text, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
              Dealer shows Ace — Insurance?
            </div>
            <div style={{ ...themeStyles?.textMuted, fontSize: 12, textAlign: 'center' }}>
              Cost: ${Math.floor(localPlayer.hands[0].bet / 2)} (pays 2:1 if dealer has blackjack)
            </div>
            <div style={styles.insuranceActions}>
              <button
                onClick={() => handleInsurance(false)}
                style={{ ...styles.insuranceBtn, ...themeStyles?.button }}
              >
                No Thanks
              </button>
              <button
                onClick={() => handleInsurance(true)}
                style={{ ...styles.insuranceBtn, ...themeStyles?.buttonPrimary }}
              >
                Take Insurance
              </button>
            </div>
            {hintMode === 'before' && (
              <div style={{ fontSize: 11, color: '#f1c40f', textAlign: 'center' }}>
                💡 Basic strategy: Never take insurance
              </div>
            )}
          </div>
        )}

        {/* Player hands */}
        <div style={styles.playersArea}>
          {game.players.map((player, pi) => (
            <div key={pi} style={{
              ...styles.playerSection,
              ...((isMultiplayer || hasNPCs) && pi === localPlayerIndex ? styles.localPlayerSection : {}),
            }}>
              <div style={{ ...themeStyles?.textMuted, fontSize: 11, textAlign: 'center' }}>
                {player.name}
                {pi === localPlayerIndex && hasNPCs ? ' (You)' : ''}
                {isMultiplayer && pi === localPlayerIndex ? ' (You)' : ''}
                {player.isNPC && <span style={{ marginLeft: 4, fontSize: 10, opacity: 0.5 }}>NPC</span>}
                {player.hands.length > 1 ? ` — Hand ${player.activeHandIndex + 1}/${player.hands.length}` : ''}
                {(isMultiplayer || player.isNPC) && <span style={{ marginLeft: 6, fontSize: 11, opacity: 0.6 }}>${player.chips}</span>}
              </div>
              <div style={styles.handsRow}>
                {player.hands.map((hand, hi) => (
                  <BlackjackHand
                    key={hi}
                    hand={hand}
                    isActive={isPlayerTurn && pi === game.currentPlayerIndex && hi === player.activeHandIndex}
                    themeStyles={themeStyles}
                    label={player.hands.length > 1 ? `Hand ${hi + 1}` : null}
                    handIndex={hi}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Waiting for other player (multiplayer) */}
        {isPlayerTurn && !isLocalPlayerTurn && isMultiplayer && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <span style={{ ...themeStyles?.textMuted, fontSize: 14 }}>
              Waiting for {game.players[game.currentPlayerIndex]?.name}...
            </span>
          </div>
        )}

        {/* NPC thinking indicator */}
        {isPlayerTurn && !isLocalPlayerTurn && !isMultiplayer && currentPlayer?.isNPC && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <span style={{ ...themeStyles?.textMuted, fontSize: 14 }}>
              {currentPlayer.name} is thinking...
            </span>
          </div>
        )}

        {/* Dealer playing indicator */}
        {(game.phase === GAME_PHASE.DEALER_TURN || game.phase === GAME_PHASE.RESOLVING) && (
          <div style={{ textAlign: 'center', padding: 16 }}>
            <span style={{ ...themeStyles?.textMuted, fontSize: 14 }}>
              Dealer playing...
            </span>
          </div>
        )}
      </div>

      {/* === BOTTOM ZONE — pinned === */}
      <div style={styles.bottomZone}>
        {/* Betting phase */}
        {game.phase === GAME_PHASE.BETTING && (
          <BlackjackBetting
            players={game.players}
            onPlaceBet={handlePlaceBet}
            onDeal={handleDeal}
            lastBet={game.lastBet}
            localPlayerIndex={localPlayerIndex >= 0 ? localPlayerIndex : 0}
            isHost={isHost}
            themeStyles={themeStyles}
          />
        )}

        {/* Player controls — only show when it's the local player's turn */}
        {isLocalPlayerTurn && availableActions.length > 0 && (
          <BlackjackControls
            availableActions={availableActions}
            onAction={handleAction}
            hint={hint}
            showHint={hintMode === 'before'}
            themeStyles={themeStyles}
          />
        )}

        {/* Results */}
        {game.phase === GAME_PHASE.ROUND_OVER && (
          <BlackjackResults
            results={game.results}
            onNewRound={isHost ? game.newRound : undefined}
            showNewShoe={showNewShoe}
            themeStyles={themeStyles}
          />
        )}

        {/* Feedback bar (after-mode learning) */}
        {feedback && (
          <div style={{
            ...styles.feedbackBar,
            background: feedback.isCorrect
              ? 'rgba(39,174,96,0.15)'
              : 'rgba(231,76,60,0.15)',
            border: `1px solid ${feedback.isCorrect
              ? 'rgba(39,174,96,0.3)'
              : 'rgba(231,76,60,0.3)'}`,
          }}>
            <span style={{
              fontSize: 14,
              fontWeight: 700,
              color: feedback.isCorrect ? '#27ae60' : '#e74c3c',
            }}>
              {feedback.isCorrect ? '✓ Correct!' : '✗ Suboptimal'}
            </span>
            {!feedback.isCorrect && (
              <span style={{ fontSize: 12, color: '#e67e22' }}>
                Optimal: {ACTION_LABELS[feedback.optimalAction]} — {feedback.explanation}
              </span>
            )}
          </div>
        )}

        {/* Stats bar */}
        <div style={styles.statsBar}>
          <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>
            Played: {game.stats.handsPlayed}
          </span>
          <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>
            Won: {game.stats.handsWon}
          </span>
          <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>
            BJ: {game.stats.blackjacks}
          </span>
          <span style={{ ...themeStyles?.textMuted, fontSize: 11 }}>
            {game.stats.handsPlayed > 0
              ? `Win%: ${Math.round((game.stats.handsWon / game.stats.handsPlayed) * 100)}%`
              : 'Win%: —'}
          </span>
        </div>
      </div>

      {/* Rules modal */}
      {showRules && (
        <BlackjackRules
          onClose={() => setShowRules(false)}
          themeStyles={themeStyles}
        />
      )}

      {/* Strategy chart modal */}
      {showStrategy && (
        <BlackjackStrategy
          onClose={() => setShowStrategy(false)}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
    width: '100%',
    overflow: 'hidden',
  },
  topZone: {
    flexShrink: 0,
  },
  middleZone: {
    flex: 1,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',
    minHeight: 0,
  },
  bottomZone: {
    flexShrink: 0,
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '4px 12px',
  },
  topBarLeft: {
    display: 'flex',
    gap: 4,
  },
  topBarRight: {
    display: 'flex',
    gap: 4,
  },
  iconBtn: {
    background: 'none',
    border: 'none',
    fontSize: 18,
    cursor: 'pointer',
    padding: '4px 8px',
    borderRadius: 8,
  },
  toggleBtn: {
    fontSize: 11,
    padding: '4px 10px',
    borderRadius: 8,
    cursor: 'pointer',
    border: 'none',
    transition: 'all 0.15s',
  },
  toggleActive: {
    boxShadow: '0 0 0 1px rgba(241,196,0,0.4)',
    background: 'rgba(241,196,0,0.1)',
  },
  connectionBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '4px 12px',
    background: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
    margin: '0 12px 4px',
  },
  errorOverlay: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '16px 20px',
    margin: '0 16px',
    background: 'rgba(231,76,60,0.1)',
    borderRadius: 12,
    border: '1px solid rgba(231,76,60,0.3)',
  },
  countBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    padding: '4px 12px',
    background: 'rgba(0,0,0,0.15)',
    borderRadius: 8,
    margin: '0 12px',
  },
  dealerArea: {
    display: 'flex',
    justifyContent: 'center',
    padding: '8px 0',
    minHeight: 100,
  },
  playersArea: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '4px 0',
    gap: 8,
  },
  playerSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
    width: '100%',
  },
  localPlayerSection: {
    background: 'rgba(39,174,96,0.05)',
    borderRadius: 12,
    padding: '4px 8px',
  },
  handsRow: {
    display: 'flex',
    gap: 8,
    justifyContent: 'center',
    flexWrap: 'wrap',
  },
  insurancePrompt: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: '12px 20px',
    margin: '0 16px',
    background: 'rgba(241,196,0,0.08)',
    borderRadius: 12,
    border: '1px solid rgba(241,196,0,0.2)',
  },
  insuranceActions: {
    display: 'flex',
    gap: 8,
  },
  insuranceBtn: {
    flex: 1,
    padding: '10px 16px',
    borderRadius: 10,
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    cursor: 'pointer',
  },
  feedbackBar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: '8px 16px',
    margin: '0 12px',
    borderRadius: 8,
  },
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    padding: '8px 12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
  },
};
