import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { createShuffledDeck } from '../game/deck.js';
import { STORAGE_KEYS } from '../constants.js';

export function useDeck() {
  const [deck, setDeck] = useLocalStorage(STORAGE_KEYS.DECK, createShuffledDeck());
  const [currentCard, setCurrentCard] = useLocalStorage(STORAGE_KEYS.CURRENT_CARD, null);
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.HISTORY, []);
  const [drawKey, setDrawKey] = useState(0);

  const draw = useCallback(() => {
    if (deck.length === 0) return null;
    const newDeck = [...deck];
    const card = newDeck.pop();

    if (currentCard) {
      setHistory((h) => [...h, currentCard]);
    }
    setDeck(newDeck);
    setCurrentCard(card);
    setDrawKey((k) => k + 1);
    return card;
  }, [deck, currentCard, setDeck, setCurrentCard, setHistory]);

  const undo = useCallback(() => {
    if (!currentCard) return;
    // Push current card back onto deck
    setDeck((d) => [...d, currentCard]);
    // Restore previous card from history
    if (history.length > 0) {
      const newHistory = [...history];
      const prevCard = newHistory.pop();
      setHistory(newHistory);
      setCurrentCard(prevCard);
    } else {
      setHistory([]);
      setCurrentCard(null);
    }
    setDrawKey((k) => k + 1);
  }, [currentCard, history, setDeck, setCurrentCard, setHistory]);

  const shuffle = useCallback(() => {
    setDeck(createShuffledDeck());
    setCurrentCard(null);
    setHistory([]);
    setDrawKey((k) => k + 1);
  }, [setDeck, setCurrentCard, setHistory]);

  return {
    deck,
    currentCard,
    history,
    drawKey,
    cardsRemaining: deck.length,
    draw,
    undo,
    shuffle,
    reset: shuffle,
  };
}
