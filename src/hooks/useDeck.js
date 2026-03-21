import { useState, useCallback, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { createShuffledDeck } from '../game/deck.js';
import { STORAGE_KEYS } from '../constants.js';

export function useDeck() {
  const [deck, setDeck] = useLocalStorage(STORAGE_KEYS.DECK, createShuffledDeck());
  const [currentCard, setCurrentCard] = useLocalStorage(STORAGE_KEYS.CURRENT_CARD, null);
  const [history, setHistory] = useLocalStorage(STORAGE_KEYS.HISTORY, []);
  const [drawKey, setDrawKey] = useState(0);
  const drawnCardRef = useRef(null);

  const draw = useCallback(() => {
    let drawn = null;
    setDeck((prevDeck) => {
      if (prevDeck.length === 0) return prevDeck;
      const newDeck = [...prevDeck];
      drawn = newDeck.pop();
      drawnCardRef.current = drawn;
      return newDeck;
    });
    if (!drawnCardRef.current) return null;
    drawn = drawnCardRef.current;
    setCurrentCard((prev) => {
      if (prev) {
        setHistory((h) => [...h, prev]);
      }
      return drawn;
    });
    setDrawKey((k) => k + 1);
    return drawn;
  }, [setDeck, setCurrentCard, setHistory]);

  const undo = useCallback(() => {
    setCurrentCard((prev) => {
      if (!prev) return prev;
      setDeck((d) => [...d, prev]);
      return null;
    });
    setHistory((prev) => {
      if (prev.length === 0) return prev;
      const newHistory = [...prev];
      const lastCard = newHistory.pop();
      setCurrentCard(lastCard);
      return newHistory;
    });
    setDrawKey((k) => k + 1);
  }, [setDeck, setCurrentCard, setHistory]);

  const shuffle = useCallback(() => {
    setDeck(createShuffledDeck());
    setCurrentCard(null);
    setHistory([]);
    setDrawKey((k) => k + 1);
  }, [setDeck, setCurrentCard, setHistory]);

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
