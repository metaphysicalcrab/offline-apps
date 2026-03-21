import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { GAME_MODES, STORAGE_KEYS, DEFAULT_KINGS_CUP_RULES } from '../constants.js';
import { compareCards } from '../game/deck.js';
import { getRuleForCard, mergeWithDefaults } from '../game/kingsCupRules.js';

export function useGameMode() {
  const [mode, setMode] = useLocalStorage(STORAGE_KEYS.GAME_MODE, GAME_MODES.FREE_DRAW);
  const [kingCount, setKingCount] = useLocalStorage(STORAGE_KEYS.KING_COUNT, 0);
  const [streak, setStreak] = useLocalStorage(STORAGE_KEYS.HIGH_LOW_STREAK, 0);
  const [bestStreak, setBestStreak] = useLocalStorage(STORAGE_KEYS.HIGH_LOW_BEST, 0);
  const [customRules, setCustomRules] = useLocalStorage(STORAGE_KEYS.RULES, DEFAULT_KINGS_CUP_RULES);
  const [activeRules, setActiveRules] = useLocalStorage(STORAGE_KEYS.ACTIVE_RULES, []);

  const handleKingsCupDraw = useCallback((card) => {
    if (card.rank === 'K') {
      const newCount = kingCount + 1;
      setKingCount(newCount);
      return { outcome: newCount >= 4 ? 'game-over' : 'king', kingCount: newCount };
    }
    const rule = getRuleForCard(card, customRules);
    return { outcome: 'rule', rule };
  }, [kingCount, customRules, setKingCount]);

  const handleHighLowGuess = useCallback((guess, prevCard, newCard) => {
    if (!prevCard) return { outcome: 'first-card' };
    const cmp = compareCards(newCard, prevCard);
    const correct =
      (guess === 'higher' && cmp >= 0) ||
      (guess === 'lower' && cmp <= 0);

    if (correct) {
      const newStreak = streak + 1;
      setStreak(newStreak);
      if (newStreak > bestStreak) setBestStreak(newStreak);
      return { outcome: 'correct', streak: newStreak };
    } else {
      setStreak(0);
      return { outcome: 'wrong', streak: 0 };
    }
  }, [streak, bestStreak, setStreak, setBestStreak]);

  const addActiveRule = useCallback((ruleText, createdBy) => {
    setActiveRules((prev) => [...prev, { text: ruleText, createdBy: createdBy || null, id: Date.now() }]);
  }, [setActiveRules]);

  const removeActiveRule = useCallback((id) => {
    setActiveRules((prev) => prev.filter((r) => r.id !== id));
  }, [setActiveRules]);

  const resetModeState = useCallback(() => {
    setKingCount(0);
    setStreak(0);
    setActiveRules([]);
  }, [setKingCount, setStreak, setActiveRules]);

  const saveRules = useCallback((rules) => {
    setCustomRules(mergeWithDefaults(rules));
  }, [setCustomRules]);

  const resetRules = useCallback(() => {
    setCustomRules(DEFAULT_KINGS_CUP_RULES);
  }, [setCustomRules]);

  return {
    mode,
    setMode,
    kingCount,
    streak,
    bestStreak,
    customRules,
    activeRules,
    addActiveRule,
    removeActiveRule,
    handleKingsCupDraw,
    handleHighLowGuess,
    resetModeState,
    saveRules,
    resetRules,
  };
}
