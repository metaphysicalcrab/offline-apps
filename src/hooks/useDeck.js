import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
import { createShuffledDeck, shuffleDeck } from '../game/deck.js';

const STORAGE_KEY = 'card-app-deck-state';

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed.deck)) return parsed;
    }
  } catch { /* ignore corrupt data */ }
  return {
    deck: createShuffledDeck(),
    currentCard: null,
    history: [],
  };
}

function saveState(state) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      deck: state.deck,
      currentCard: state.currentCard,
      history: state.history,
    }));
  } catch { /* storage full */ }
}

function reducer(state, action) {
  switch (action.type) {
    case 'draw': {
      if (state.deck.length === 0) return state;
      const newDeck = [...state.deck];
      const card = newDeck.pop();
      return {
        ...state,
        deck: newDeck,
        currentCard: card,
        history: state.currentCard
          ? [...state.history, state.currentCard]
          : state.history,
        lastDrawn: card,
        prevCard: state.currentCard,
      };
    }
    case 'undo': {
      if (!state.currentCard) return state;
      const newHistory = [...state.history];
      const prevCard = newHistory.pop() || null;
      return {
        ...state,
        deck: [...state.deck, state.currentCard],
        currentCard: prevCard,
        history: prevCard !== null ? newHistory : [],
        lastDrawn: null,
        prevCard: null,
      };
    }
    case 'shuffle': {
      const allCards = [...state.deck];
      if (state.currentCard) allCards.push(state.currentCard);
      state.history.forEach((c) => allCards.push(c));
      return {
        deck: shuffleDeck(allCards),
        currentCard: null,
        history: [],
        lastDrawn: null,
        prevCard: null,
      };
    }
    case 'reset':
      return {
        deck: createShuffledDeck(),
        currentCard: null,
        history: [],
        lastDrawn: null,
        prevCard: null,
      };
    default:
      return state;
  }
}

export function useDeck() {
  const [state, dispatch] = useReducer(reducer, null, loadState);
  const [drawKey, setDrawKey] = useState(0);
  const prevStateRef = useRef(state);

  useEffect(() => {
    if (state !== prevStateRef.current) {
      saveState(state);
      prevStateRef.current = state;
    }
  }, [state]);

  const draw = useCallback(() => {
    dispatch({ type: 'draw' });
    setDrawKey((k) => k + 1);
  }, []);

  const undo = useCallback(() => {
    dispatch({ type: 'undo' });
    setDrawKey((k) => k + 1);
  }, []);

  const shuffle = useCallback(() => {
    dispatch({ type: 'shuffle' });
    setDrawKey((k) => k + 1);
  }, []);

  const reset = useCallback(() => {
    dispatch({ type: 'reset' });
    setDrawKey((k) => k + 1);
  }, []);

  return {
    currentCard: state.currentCard,
    lastDrawn: state.lastDrawn || null,
    prevCard: state.prevCard || null,
    history: state.history,
    drawKey,
    cardsRemaining: state.deck.length,
    draw,
    undo,
    shuffle,
    reset,
  };
}
