import React, { useState, useCallback } from 'react';
import { GAME_MODES, HAPTIC_PATTERNS } from './constants.js';
import { useDeck } from './hooks/useDeck.js';
import { useGameMode } from './hooks/useGameMode.js';
import { useTurnTracker } from './hooks/useTurnTracker.js';
import { useAudio } from './hooks/useAudio.js';
import { useHaptics } from './hooks/useHaptics.js';
import { useShake } from './hooks/useShake.js';
import { useTheme } from './hooks/useTheme.js';
import { useAppearance } from './hooks/useAppearance.js';
import Card from './components/Card.jsx';
import DeckControls from './components/DeckControls.jsx';
import GameModeSelector from './components/GameModeSelector.jsx';
import HighLowControls from './components/HighLowControls.jsx';
import KingsCupOverlay from './components/KingsCupOverlay.jsx';
import TurnTracker from './components/TurnTracker.jsx';
import CardHistory from './components/CardHistory.jsx';
import SettingsPanel from './components/SettingsPanel.jsx';
import RulesEditor from './components/RulesEditor.jsx';
import ActiveRulesList from './components/ActiveRulesList.jsx';
import HowToPlay from './components/HowToPlay.jsx';
import BlackjackGame from './components/BlackjackGame.jsx';

export default function App() {
  const { theme, themeStyles, toggleTheme } = useTheme();
  const deck = useDeck();
  const gameMode = useGameMode();
  const turns = useTurnTracker();
  const audio = useAudio();
  const haptics = useHaptics();
  const appearance = useAppearance();

  const [showSettings, setShowSettings] = useState(false);
  const [showRules, setShowRules] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const [lastOutcome, setLastOutcome] = useState(null);

  const handleDraw = useCallback(() => {
    const result = deck.draw();
    if (!result) return;

    audio.playFlip();
    haptics.vibrate(HAPTIC_PATTERNS.tap);
    turns.nextTurn();

    if (gameMode.mode === GAME_MODES.KINGS_CUP) {
      gameMode.handleKingsCupDraw(result.card);
    }
  }, [deck.draw, audio, haptics, turns, gameMode]);

  const handleHighLowGuess = useCallback((guess) => {
    const result = deck.draw();
    if (!result) return;

    audio.playFlip();
    haptics.vibrate(HAPTIC_PATTERNS.tap);
    turns.nextTurn();

    if (result.prevCard) {
      const hlResult = gameMode.handleHighLowGuess(guess, result.prevCard, result.card);
      setLastOutcome(hlResult.outcome);
      if (hlResult.outcome === 'correct') {
        audio.playSuccess();
        haptics.vibrate(HAPTIC_PATTERNS.success);
      } else {
        audio.playFail();
        haptics.vibrate(HAPTIC_PATTERNS.fail);
      }
    }
  }, [deck.draw, audio, haptics, turns, gameMode]);

  const handleShuffle = useCallback(() => {
    deck.shuffle();
    audio.playShuffle();
    haptics.vibrate(HAPTIC_PATTERNS.shuffle);
    gameMode.resetModeState();
  }, [deck.shuffle, audio, haptics, gameMode]);

  const { shakeEnabled, setShakeEnabled, requestShakePermission } = useShake(handleShuffle);

  const handleReset = useCallback(() => {
    deck.reset();
    gameMode.resetModeState();
    setLastOutcome(null);
  }, [deck.reset, gameMode]);

  return (
    <div style={{ ...themeStyles.app, fontFamily: appearance.fontFamily }}>
      <header style={themeStyles.header}>
        <GameModeSelector
          mode={gameMode.mode}
          setMode={gameMode.setMode}
          hasActiveState={gameMode.activeRules?.length > 0 || gameMode.streak > 0 || gameMode.kingCount > 0}
          themeStyles={themeStyles}
        />
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={() => setShowHowToPlay(true)} style={styles.iconBtn} aria-label="How to play">
            ❓
          </button>
          <button onClick={toggleTheme} style={styles.iconBtn} aria-label={`Switch to ${theme === 'dark' ? 'light' : 'dark'} theme`}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <button onClick={() => setShowSettings(true)} style={styles.iconBtn} aria-label="Settings">
            ⚙️
          </button>
        </div>
      </header>

      {gameMode.mode === GAME_MODES.BLACKJACK ? (
        <BlackjackGame
          themeStyles={themeStyles}
          audio={audio}
          haptics={haptics}
        />
      ) : (
        <>
          <TurnTracker
            players={turns.players}
            currentPlayer={turns.currentPlayer}
            addPlayer={turns.addPlayer}
            removePlayer={turns.removePlayer}
            themeStyles={themeStyles}
          />

          <Card
            card={deck.currentCard}
            drawKey={deck.drawKey}
            themeStyles={themeStyles}
            cardBackColor={appearance.cardBackColor}
            cardBackStyle={appearance.cardBackStyle}
          />

          {gameMode.mode === GAME_MODES.KINGS_CUP && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, padding: '0 20px', marginBottom: 8, width: '100%' }}>
              <KingsCupOverlay
                card={deck.currentCard}
                kingCount={gameMode.kingCount}
                customRules={gameMode.customRules}
                currentPlayer={turns.currentPlayer}
                onAddRule={gameMode.addActiveRule}
                themeStyles={themeStyles}
              />
              <ActiveRulesList
                rules={gameMode.activeRules}
                onRemove={gameMode.removeActiveRule}
                themeStyles={themeStyles}
              />
            </div>
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
            onDraw={handleDraw}
            onUndo={deck.undo}
            onShuffle={handleShuffle}
            onReset={handleReset}
            themeStyles={themeStyles}
          />

          <CardHistory history={deck.history} themeStyles={themeStyles} />
        </>
      )}

      {showSettings && (
        <SettingsPanel
          muted={audio.muted}
          setMuted={audio.setMuted}
          hapticsEnabled={haptics.hapticsEnabled}
          setHapticsEnabled={haptics.setHapticsEnabled}
          shakeEnabled={shakeEnabled}
          setShakeEnabled={setShakeEnabled}
          requestShakePermission={requestShakePermission}
          theme={theme}
          toggleTheme={toggleTheme}
          players={turns.players}
          addPlayer={turns.addPlayer}
          removePlayer={turns.removePlayer}
          onResetAll={handleReset}
          onEditRules={() => { setShowSettings(false); setShowRules(true); }}
          onClose={() => setShowSettings(false)}
          themeStyles={themeStyles}
          appearance={appearance}
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

      {showHowToPlay && (
        <HowToPlay
          mode={gameMode.mode}
          onClose={() => setShowHowToPlay(false)}
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
