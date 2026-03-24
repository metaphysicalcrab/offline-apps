import React, { useState, useCallback } from 'react';
import { GAME_PHASE, BLACKJACK_ACTIONS, HAND_STATUS } from '../constants.js';
import { useBlackjack } from '../hooks/useBlackjack.js';
import { useMultiplayer } from '../hooks/useMultiplayer.js';
import { getOptimalAction, getActionExplanation } from '../game/blackjackStrategy.js';
import { needsNewShoe } from '../game/blackjack.js';
import BlackjackHand from './BlackjackHand.jsx';
import BlackjackBetting from './BlackjackBetting.jsx';
import BlackjackControls from './BlackjackControls.jsx';
import BlackjackResults from './BlackjackResults.jsx';
import BlackjackRules from './BlackjackRules.jsx';
import BlackjackStrategy from './BlackjackStrategy.jsx';
import BlackjackLobby from './BlackjackLobby.jsx';

export default function BlackjackGame({ themeStyles, audio, haptics }) {
  const game = useBlackjack();
  const multiplayer = useMultiplayer();
  const [showHints, setShowHints] = useState(false);
  const [showCount, setShowCount] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showStrategy, setShowStrategy] = useState(false);
  const [inLobby, setInLobby] = useState(true);

  const currentPlayer = game.players[game.currentPlayerIndex];
  const activeHand = currentPlayer?.hands[currentPlayer.activeHandIndex];
  const isPlayerTurn = game.phase === GAME_PHASE.PLAYER_TURN;

  // Get available actions for current hand
  const availableActions = isPlayerTurn && activeHand
    ? game.getAvailableActions(
        activeHand,
        currentPlayer.hands.length,
        currentPlayer.chips,
        activeHand.cards.length === 2 && !activeHand.isDoubled,
      )
    : [];

  // Get hint
  const hint = isPlayerTurn && activeHand && game.dealer.cards.length > 0
    ? (() => {
        const action = getOptimalAction(activeHand.cards, game.dealer.cards[0], availableActions);
        const explanation = getActionExplanation(action, activeHand.cards, game.dealer.cards[0]);
        return { action, explanation };
      })()
    : null;

  const handleAction = useCallback((action) => {
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
  }, [game, currentPlayer, audio]);

  const handleDeal = useCallback(() => {
    game.deal();
    audio?.playFlip();
  }, [game, audio]);

  const showNewShoe = needsNewShoe(game.shoe, game.config.deckCount, game.config.cutCardPercent);

  if (inLobby) {
    return (
      <BlackjackLobby
        multiplayer={multiplayer}
        onStartSolo={() => setInLobby(false)}
        onStartMultiplayer={() => setInLobby(false)}
        themeStyles={themeStyles}
      />
    );
  }

  return (
    <div style={styles.container}>
      {/* Top bar */}
      <div style={styles.topBar}>
        <div style={styles.topBarLeft}>
          <button
            onClick={() => {
              if (game.phase !== GAME_PHASE.BETTING || confirm('Leave the table?')) {
                game.reset();
                multiplayer.leaveRoom();
                setInLobby(true);
              }
            }}
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
            onClick={() => setShowHints(h => !h)}
            style={{ ...styles.toggleBtn, ...(showHints ? styles.toggleActive : {}), ...themeStyles?.button }}
            aria-label="Toggle hints"
            aria-pressed={showHints}
          >
            💡 {showHints ? 'ON' : 'OFF'}
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

      {/* Insurance prompt */}
      {game.phase === GAME_PHASE.INSURANCE && (
        <div style={styles.insurancePrompt}>
          <div style={{ ...themeStyles?.text, fontSize: 14, fontWeight: 600, textAlign: 'center' }}>
            Dealer shows Ace — Insurance?
          </div>
          <div style={{ ...themeStyles?.textMuted, fontSize: 12, textAlign: 'center' }}>
            Cost: ${Math.floor(currentPlayer.hands[0].bet / 2)} (pays 2:1 if dealer has blackjack)
          </div>
          <div style={styles.insuranceActions}>
            <button
              onClick={game.declineInsurance}
              style={{ ...styles.insuranceBtn, ...themeStyles?.button }}
            >
              No Thanks
            </button>
            <button
              onClick={game.takeInsurance}
              style={{ ...styles.insuranceBtn, ...themeStyles?.buttonPrimary }}
            >
              Take Insurance
            </button>
          </div>
          {showHints && (
            <div style={{ fontSize: 11, color: '#f1c40f', textAlign: 'center' }}>
              💡 Basic strategy: Never take insurance
            </div>
          )}
        </div>
      )}

      {/* Player hands */}
      <div style={styles.playersArea}>
        {game.players.map((player, pi) => (
          <div key={pi} style={styles.playerSection}>
            {player.hands.length > 1 && (
              <div style={{ ...themeStyles?.textMuted, fontSize: 11, textAlign: 'center' }}>
                {player.name} — Hand {currentPlayer.activeHandIndex + 1}/{player.hands.length}
              </div>
            )}
            <div style={styles.handsRow}>
              {player.hands.map((hand, hi) => (
                <BlackjackHand
                  key={hi}
                  hand={hand}
                  isActive={isPlayerTurn && pi === game.currentPlayerIndex && hi === player.activeHandIndex}
                  themeStyles={themeStyles}
                  label={player.hands.length > 1 ? `Hand ${hi + 1}` : player.name}
                  handIndex={hi}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Betting phase */}
      {game.phase === GAME_PHASE.BETTING && (
        <BlackjackBetting
          players={game.players}
          onPlaceBet={game.placeBet}
          onDeal={handleDeal}
          lastBet={game.lastBet}
          themeStyles={themeStyles}
        />
      )}

      {/* Player controls */}
      {isPlayerTurn && availableActions.length > 0 && (
        <BlackjackControls
          availableActions={availableActions}
          onAction={handleAction}
          hint={hint}
          showHint={showHints}
          themeStyles={themeStyles}
        />
      )}

      {/* Dealer playing indicator */}
      {(game.phase === GAME_PHASE.DEALER_TURN || game.phase === GAME_PHASE.RESOLVING) && (
        <div style={{ textAlign: 'center', padding: 16 }}>
          <span style={{ ...themeStyles?.textMuted, fontSize: 14 }}>
            Dealer playing...
          </span>
        </div>
      )}

      {/* Results */}
      {game.phase === GAME_PHASE.ROUND_OVER && (
        <BlackjackResults
          results={game.results}
          onNewRound={game.newRound}
          showNewShoe={showNewShoe}
          themeStyles={themeStyles}
        />
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
    flex: 1,
  },
  playerSection: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 4,
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
  statsBar: {
    display: 'flex',
    justifyContent: 'center',
    gap: 16,
    padding: '8px 12px',
    borderTop: '1px solid rgba(255,255,255,0.06)',
    marginTop: 'auto',
  },
};
