import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { STORAGE_KEYS } from '../constants.js';

export function useTurnTracker() {
  const [players, setPlayers] = useLocalStorage(STORAGE_KEYS.PLAYERS, []);
  const [currentIndex, setCurrentIndex] = useLocalStorage(STORAGE_KEYS.CURRENT_PLAYER_INDEX, 0);

  const addPlayer = useCallback((name) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setPlayers((prev) => [...prev, trimmed]);
  }, [setPlayers]);

  const removePlayer = useCallback((index) => {
    setPlayers((prev) => {
      const next = prev.filter((_, i) => i !== index);
      setCurrentIndex((ci) => {
        if (next.length === 0) return 0;
        if (ci >= next.length) return 0;
        if (index < ci) return ci - 1;
        return ci;
      });
      return next;
    });
  }, [setPlayers, setCurrentIndex]);

  const nextTurn = useCallback(() => {
    if (players.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % players.length);
  }, [players.length, setCurrentIndex]);

  const resetTurns = useCallback(() => {
    setCurrentIndex(0);
  }, [setCurrentIndex]);

  return {
    players,
    currentPlayer: players.length > 0 ? players[currentIndex % players.length] : null,
    currentIndex,
    addPlayer,
    removePlayer,
    nextTurn,
    resetTurns,
  };
}
