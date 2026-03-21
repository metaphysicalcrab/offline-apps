import { useState, useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { createShuffledDeck } from '../game/deck.js';
import { STORAGE_KEYS } from '../constants.js';

export function useDeck() {
  const [deck, setDeck] = useLocalStorage(STORAGE_KEYS.DECK, () => createShuffledDeck());
  const [currentCard, setCurrentCard] = useLocalStorage(STORAGE_KEYS.CURRENT_CARD, null);
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.HISTORY, []);
  const [drawKey, setDrawKey] = useState(0);

  const draw = useCallback(() => {
    if (deck.length === 0) return null;
    const newDeck = [...deck];
    const card = newDeck.pop();
    setDeck(newDeck);
    if (currentCard) {
      setHistory((prev) => [...prev, currentCard]);
    }
    setCurrentCard(card);
    setDrawKey((k) => k + 1);
    return card;
  }, [deck, currentCard, setDeck, setCurrentCard, setHistory]);

  const undo = useCallback(() => {
    if (!currentCard) return;
    setDeck((prev) => [...prev, currentCard]);
    if (history.length > 0) {
      const newHistory = [...history];
      const prevCard = newHistory.pop();
      setHistory(newHistory);
      setCurrentCard(prevCard);
    } else {
      setCurrentCard(null);
    }
    setDrawKey((k) => k + 1);
  }, [currentCard, history, setDeck, setCurrentCard, setHistory]);

  const shuffle = useCallback(() => {
    const allCards = [...deck];
    if (currentCard) allCards.push(currentCard);
    history.forEach((c) => allCards.push(c));
    setDeck(createShuffledDeck());
    setCurrentCard(null);
    setHistory([]);
    setDrawKey((k) => k + 1);
  }, [deck, currentCard, history, setDeck, setCurrentCard, setHistory]);

  const reset = useCallback(() => {
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
    reset,
  };
}
