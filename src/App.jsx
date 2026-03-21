import React, { useState, useCallback, useEffect, useRef } from 'react';
import { GAME_MODES, HAPTIC_PATTERNS } from './constants.js';
import { useDeck } from './hooks/useDeck.js';
import { useGameMode } from './hooks/useGameMode.js';
import { useTurnTracker } from './hooks/useTurnTracker.js';
import { useAudio } from './hooks/useAudio.js';
import { useHaptics } from './hooks/useHaptics.js';
import { useShake } from './hooks/useShake.js';
import { useTheme } from './hooks/useTheme.js';
import Card from './components/Card.jsx';
import DeckControls from './components/DeckControls.jsx';
import GameModeSelector from './components/GameModeSelector.jsx';
import HighLowControls from './components/HighLowControls.jsx';
import KingsCupOverlay from './components/KingsCupOverlay.jsx';
import TurnTracker from './components/TurnTracker.jsx';
import CardHistory from './components/CardHistory.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import RulesEditor from './components/RulesEditor.jsx';

export default function App() {
  const { theme, themeStyles, toggleTheme } = useTheme();
  const deck = useDeck();
  const gameMode = useGameMode();
  const turns = useTurnTracker();
  const audio = useAudio();
  const haptics = useHaptics();

  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null);
  const [pendingGuess, setPendingGuess] = useState(null);

  // React to new cards being drawn — handle game mode logic here
  const prevDrawKey = useRef(deck.drawKey);
  useEffect(() => {
    if (deck.drawKey === prevDrawKey.current) return;
    prevDrawKey.current = deck.drawKey;

    const card = deck.lastDrawn;
    if (!card) return;

    audio.playFlip();
    haptics.vibrate(HAPTIC_PATTERNS.tap);
    turns.nextTurn();

    if (gameMode.mode === GAME_MODES.KINGS_CUP) {
      gameMode.handleKingsCupDraw(card);
    }

    if (gameMode.mode === GAME_MODES.HIGH_LOW && pendingGuess && deck.prevCard) {
      const result = gameMode.handleHighLowGuess(pendingGuess, deck.prevCard, card);
      setLastOutcome(result.outcome);
      setPendingGuess(null);
      if (result.outcome === 'correct') {
        audio.playSuccess();
        haptics.vibrate(HAPTIC_PATTERNS.success);
      } else {
        audio.playFail();
        haptics.vibrate(HAPTIC_PATTERNS.fail);
      }
    }
  });

  const handleShuffle = useCallback(() => {
    deck.shuffle();
    audio.playShuffle();
    haptics.vibrate(HAPTIC_PATTERNS.shuffle);
    gameMode.resetModeState();
  }, [deck, audio, haptics, gameMode]);

  const { shakeEnabled, setShakeEnabled } = useShake(handleShuffle);

  const handleHighLowGuess = useCallback((guess) => {
    setPendingGuess(guess);
    deck.draw();
  }, [deck]);

  const handleReset = useCallback(() => {
    deck.reset();
    gameMode.resetModeState();
    setLastOutcome(null);
    setPendingGuess(null);
  }, [deck, gameMode]);

  return (
    <div style={themeStyles.app}>
      <header style={themeStyles.header}>
        <GameModeSelector mode={gameMode.mode} setMode={gameMode.setMode} themeStyles={themeStyles} />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={toggleTheme} style={styles.iconBtn}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setShowSettings(true)} style={styles.iconBtn}>
            ⚙️
          </button>
        </div>
      </header>

      <TurnTracker
        players={turns.players}
        currentPlayer={turns.currentPlayer}
        addPlayer={turns.addPlayer}
        removePlayer={turns.removePlayer}
        themeStyles={themeStyles}
      />

      <Card card={deck.currentCard} drawKey={deck.drawKey} themeStyles={themeStyles} />

      {gameMode.mode === GAME_MODES.KINGS_CUP && (
        <KingsCupOverlay
          card={deck.currentCard}
          kingCount={gameMode.kingCount}
          customRules={gameMode.customRules}
          themeStyles={themeStyles}
        />
      )}

      {gameMode.mode === GAME_MODES.HIGH_LOW && (
        <HighLowControls
          currentCard={deck.currentCard}
          streak={gameMode.streak}
          bestStreak={gameMode.bestStreak}
          onGuess={handleHighLowGuess}
          lastOutcome={lastOutcome}
          themeStyles={themeStyles}
        />
      )}

      <DeckControls
        cardsRemaining={deck.cardsRemaining}
        canUndo={!!deck.currentCard}
        onDraw={deck.draw}
        onUndo={deck.undo}
        onShuffle={handleShuffle}
        onReset={handleReset}
        themeStyles={themeStyles}
      />

      <CardHistory history={deck.history} themeStyles={themeStyles} />

      {showSettings && (
        <SettingsPanel
          muted={audio.muted}
          setMuted={audio.setMuted}
          hapticsEnabled={haptics.hapticsEnabled}
          setHapticsEnabled={haptics.setHapticsEnabled}
          shakeEnabled={shakeEnabled}
          setShakeEnabled={setShakeEnabled}
          theme={theme}
          toggleTheme={toggleTheme}
          players={turns.players}
          addPlayer={turns.addPlayer}
          removePlayer={turns.removePlayer}
          onResetAll={handleReset}
          onEditRules={() => { setShowSettings(false); setShowRules(true); }}
          onClose={() => setShowSettings(false)}
          themeStyles={themeStyles}
        />
      )}

      {showRules && (
        <RulesEditor
          customRules={gameMode.customRules}
          onSave={gameMode.saveRules}
          onReset={gameMode.resetRules}
          onClose={() => setShowRules(false)}
          themeStyles={themeStyles}
        />
      )}
    </div>
  );
}

const styles = {
  iconBtn: {
    background: 'none',
    border: 'none',
    fontSize: 20,
    cursor: 'pointer',
    padding: 4,
    borderRadius: 8,
    transition: 'opacity 0.2s',
  },
};
