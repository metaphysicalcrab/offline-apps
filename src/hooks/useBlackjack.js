import { useReducer, useCallback, useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import {
  BLACKJACK_CONFIG, GAME_PHASE, HAND_STATUS,
  STORAGE_KEYS, CHIP_DENOMINATIONS,
} from '../constants.js';
import {
  createShoe, dealCard, calculateHand, isBlackjack, isBusted,
  shouldDealerHit, resolveHand, getAvailableActions, needsNewShoe,
  shouldOfferInsurance,
} from '../game/blackjack.js';
import { getHiLoValue } from '../game/blackjackStrategy.js';

function createInitialState(config) {
  return {
    shoe: createShoe(config.deckCount),
    phase: GAME_PHASE.BETTING,
    dealer: { cards: [], hidden: true },
    players: [{
      name: 'You',
      id: null,
      chips: config.startingChips,
      hands: [{ cards: [], bet: 0, status: HAND_STATUS.PLAYING, isDoubled: false, insuranceBet: 0 }],
      activeHandIndex: 0,
    }],
    currentPlayerIndex: 0,
    dealtCards: [],
    config,
    message: null,
    results: null,
  };
}

function dealCardFromShoe(state) {
  const result = dealCard(state.shoe);
  if (!result) return { card: null, shoe: state.shoe };
  return result;
}

function reducer(state, action) {
  switch (action.type) {
    case 'PLACE_BET': {
      const { playerIndex, amount } = action;
      const players = [...state.players];
      const player = { ...players[playerIndex] };
      if (amount > player.chips || amount <= 0) return state;
      player.hands = [{ cards: [], bet: amount, status: HAND_STATUS.PLAYING, isDoubled: false, insuranceBet: 0 }];
      player.activeHandIndex = 0;
      players[playerIndex] = player;
      return { ...state, players, message: null };
    }

    case 'DEAL': {
      // Check all players have bets
      const allBetsPlaced = state.players.every(p => p.hands[0].bet > 0);
      if (!allBetsPlaced) return state;

      let shoe = [...state.shoe];
      let dealtCards = [...state.dealtCards];
      const players = state.players.map(p => ({
        ...p,
        chips: p.chips - p.hands[0].bet,
        hands: p.hands.map(h => ({ ...h, cards: [] })),
      }));
      const dealer = { cards: [], hidden: true };

      // Deal 2 cards to each player, then 2 to dealer
      for (let round = 0; round < 2; round++) {
        for (let pi = 0; pi < players.length; pi++) {
          const result = dealCard(shoe);
          if (!result) break;
          shoe = result.shoe;
          players[pi].hands[0].cards.push(result.card);
          dealtCards.push(result.card);
        }
        const result = dealCard(shoe);
        if (!result) break;
        shoe = result.shoe;
        dealer.cards.push(result.card);
        // Only count the face-up card for counting
        if (round === 0) dealtCards.push(result.card);
      }

      // Check for dealer blackjack possibility (ace showing)
      let phase = GAME_PHASE.PLAYER_TURN;

      // Check if insurance should be offered
      if (state.config.insuranceAllowed && shouldOfferInsurance(dealer.cards)) {
        phase = GAME_PHASE.INSURANCE;
      }

      // Check all players for blackjack
      const updatedPlayers = players.map(p => {
        const hand = p.hands[0];
        if (isBlackjack(hand.cards)) {
          return { ...p, hands: [{ ...hand, status: HAND_STATUS.BLACKJACK }] };
        }
        return p;
      });

      // If all players have blackjack and no insurance phase, skip to dealer
      const allBlackjack = updatedPlayers.every(p => p.hands[0].status === HAND_STATUS.BLACKJACK);
      if (allBlackjack && phase !== GAME_PHASE.INSURANCE) {
        phase = GAME_PHASE.DEALER_TURN;
      }

      return {
        ...state, shoe, dealtCards, dealer, players: updatedPlayers,
        phase, currentPlayerIndex: 0, message: null, results: null,
      };
    }

    case 'DECLINE_INSURANCE':
    case 'TAKE_INSURANCE': {
      const players = state.players.map((p, i) => {
        if (action.type === 'TAKE_INSURANCE') {
          const insuranceBet = Math.floor(p.hands[0].bet / 2);
          if (p.chips >= insuranceBet) {
            return {
              ...p,
              chips: p.chips - insuranceBet,
              hands: p.hands.map(h => ({ ...h, insuranceBet })),
            };
          }
        }
        return p;
      });

      // Check if all players have blackjack — skip to dealer
      const allDone = players.every(p =>
        p.hands.every(h => h.status !== HAND_STATUS.PLAYING)
      );

      return {
        ...state,
        players,
        phase: allDone ? GAME_PHASE.DEALER_TURN : GAME_PHASE.PLAYER_TURN,
        currentPlayerIndex: 0,
      };
    }

    case 'HIT': {
      const { playerIndex, handIndex } = action;
      const result = dealCard(state.shoe);
      if (!result) return state;

      const players = [...state.players];
      const player = { ...players[playerIndex] };
      const hands = [...player.hands];
      const hand = { ...hands[handIndex] };

      hand.cards = [...hand.cards, result.card];

      if (isBusted(hand.cards)) {
        hand.status = HAND_STATUS.BUST;
      } else if (calculateHand(hand.cards).total === 21) {
        hand.status = HAND_STATUS.STAND;
      }

      hands[handIndex] = hand;
      player.hands = hands;
      players[playerIndex] = player;

      const dealtCards = [...state.dealtCards, result.card];
      let nextState = { ...state, shoe: result.shoe, players, dealtCards };

      // If hand is done, advance
      if (hand.status !== HAND_STATUS.PLAYING) {
        nextState = advanceToNextHand(nextState);
      }

      return nextState;
    }

    case 'STAND': {
      const { playerIndex, handIndex } = action;
      const players = [...state.players];
      const player = { ...players[playerIndex] };
      const hands = [...player.hands];
      hands[handIndex] = { ...hands[handIndex], status: HAND_STATUS.STAND };
      player.hands = hands;
      players[playerIndex] = player;

      return advanceToNextHand({ ...state, players });
    }

    case 'DOUBLE': {
      const { playerIndex, handIndex } = action;
      const result = dealCard(state.shoe);
      if (!result) return state;

      const players = [...state.players];
      const player = { ...players[playerIndex] };
      const hands = [...player.hands];
      const hand = { ...hands[handIndex] };

      // Deduct additional bet
      player.chips -= hand.bet;
      hand.cards = [...hand.cards, result.card];
      hand.isDoubled = true;
      hand.status = isBusted(hand.cards) ? HAND_STATUS.BUST : HAND_STATUS.STAND;

      hands[handIndex] = hand;
      player.hands = hands;
      players[playerIndex] = player;

      const dealtCards = [...state.dealtCards, result.card];
      return advanceToNextHand({ ...state, shoe: result.shoe, players, dealtCards });
    }

    case 'SPLIT': {
      const { playerIndex, handIndex } = action;
      const players = [...state.players];
      const player = { ...players[playerIndex] };
      const hands = [...player.hands];
      const hand = hands[handIndex];

      // Deduct additional bet for split hand
      player.chips -= hand.bet;

      const card1 = hand.cards[0];
      const card2 = hand.cards[1];

      // Deal one card to each split hand
      let shoe = state.shoe;
      let dealtCards = [...state.dealtCards];

      const result1 = dealCard(shoe);
      if (!result1) return state;
      shoe = result1.shoe;
      dealtCards.push(result1.card);

      const result2 = dealCard(shoe);
      if (!result2) return state;
      shoe = result2.shoe;
      dealtCards.push(result2.card);

      const hand1 = {
        cards: [card1, result1.card],
        bet: hand.bet,
        status: HAND_STATUS.PLAYING,
        isDoubled: false,
        insuranceBet: 0,
      };
      const hand2 = {
        cards: [card2, result2.card],
        bet: hand.bet,
        status: HAND_STATUS.PLAYING,
        isDoubled: false,
        insuranceBet: 0,
      };

      // Split aces only get one card each
      if (card1.rank === 'A') {
        hand1.status = isBlackjack(hand1.cards) ? HAND_STATUS.BLACKJACK : HAND_STATUS.STAND;
        hand2.status = isBlackjack(hand2.cards) ? HAND_STATUS.BLACKJACK : HAND_STATUS.STAND;
      } else {
        // Check for 21
        if (calculateHand(hand1.cards).total === 21) hand1.status = HAND_STATUS.STAND;
        if (calculateHand(hand2.cards).total === 21) hand2.status = HAND_STATUS.STAND;
      }

      // Replace the split hand with two new hands
      const newHands = [...hands];
      newHands.splice(handIndex, 1, hand1, hand2);
      player.hands = newHands;
      player.activeHandIndex = handIndex;
      players[playerIndex] = player;

      let nextState = { ...state, shoe, players, dealtCards };

      // If first hand is already done, advance
      if (hand1.status !== HAND_STATUS.PLAYING) {
        nextState = advanceToNextHand(nextState);
      }

      return nextState;
    }

    case 'SURRENDER': {
      const { playerIndex, handIndex } = action;
      const players = [...state.players];
      const player = { ...players[playerIndex] };
      const hands = [...player.hands];
      hands[handIndex] = { ...hands[handIndex], status: HAND_STATUS.SURRENDER };
      player.hands = hands;
      // Return half the bet
      player.chips += Math.ceil(hands[handIndex].bet / 2);
      players[playerIndex] = player;

      return advanceToNextHand({ ...state, players });
    }

    case 'DEALER_PLAY': {
      let shoe = [...state.shoe];
      let dealtCards = [...state.dealtCards];
      const dealer = { ...state.dealer, hidden: false, cards: [...state.dealer.cards] };

      // Count the hole card now that it's revealed
      if (state.dealer.cards.length > 1) {
        dealtCards.push(state.dealer.cards[1]);
      }

      // Dealer draws
      while (shouldDealerHit(dealer.cards, state.config.dealerStandsSoft17)) {
        const result = dealCard(shoe);
        if (!result) break;
        shoe = result.shoe;
        dealer.cards.push(result.card);
        dealtCards.push(result.card);
      }

      return { ...state, shoe, dealer, dealtCards, phase: GAME_PHASE.RESOLVING };
    }

    case 'RESOLVE': {
      const dealerTotal = calculateHand(state.dealer.cards).total;
      const dealerBJ = isBlackjack(state.dealer.cards);

      const players = state.players.map(p => {
        let totalPayout = 0;
        const handResults = p.hands.map(hand => {
          const { payout, result } = resolveHand(hand, dealerTotal, dealerBJ, state.config);
          totalPayout += payout;
          return { ...hand, result, payout };
        });
        return {
          ...p,
          chips: p.chips + totalPayout,
          hands: handResults,
        };
      });

      const results = players.map(p => ({
        name: p.name,
        hands: p.hands.map(h => ({
          cards: h.cards,
          result: h.result,
          payout: h.payout,
          bet: h.isDoubled ? h.bet * 2 : h.bet,
        })),
        chips: p.chips,
      }));

      return {
        ...state, players, results,
        dealer: { ...state.dealer, hidden: false },
        phase: GAME_PHASE.ROUND_OVER,
      };
    }

    case 'NEW_ROUND': {
      let shoe = state.shoe;
      let dealtCards = state.dealtCards;

      if (needsNewShoe(shoe, state.config.deckCount, state.config.cutCardPercent)) {
        shoe = createShoe(state.config.deckCount);
        dealtCards = [];
      }

      const players = state.players.map(p => ({
        ...p,
        hands: [{ cards: [], bet: 0, status: HAND_STATUS.PLAYING, isDoubled: false, insuranceBet: 0 }],
        activeHandIndex: 0,
      }));

      return {
        ...state, shoe, dealtCards, players,
        dealer: { cards: [], hidden: true },
        phase: GAME_PHASE.BETTING,
        currentPlayerIndex: 0,
        results: null,
        message: null,
      };
    }

    case 'RESET': {
      return createInitialState(state.config);
    }

    case 'SYNC_STATE': {
      // Guest receives full state from host — replace everything except config
      return { ...action.state, config: state.config };
    }

    case 'ADD_PLAYER': {
      if (state.phase !== GAME_PHASE.BETTING) return state;
      const { name, id } = action;
      if (state.players.length >= 6) return state;
      // Deduplicate by id (multiplayer) or name (solo)
      if (id && state.players.some(p => p.id === id)) return state;
      if (!id && state.players.some(p => p.name === name)) return state;
      return {
        ...state,
        players: [...state.players, {
          name,
          id: id || null,
          chips: state.config.startingChips,
          hands: [{ cards: [], bet: 0, status: HAND_STATUS.PLAYING, isDoubled: false, insuranceBet: 0 }],
          activeHandIndex: 0,
        }],
      };
    }

    case 'REMOVE_PLAYER': {
      if (state.phase !== GAME_PHASE.BETTING) return state;
      if (state.players.length <= 1) return state;
      // Support removal by id (multiplayer) or by index (solo)
      if (action.id) {
        return {
          ...state,
          players: state.players.filter(p => p.id !== action.id),
        };
      }
      return {
        ...state,
        players: state.players.filter((_, i) => i !== action.playerIndex),
      };
    }

    default:
      return state;
  }
}

function advanceToNextHand(state) {
  const player = state.players[state.currentPlayerIndex];

  // Find next playable hand for current player
  for (let h = player.activeHandIndex + 1; h < player.hands.length; h++) {
    if (player.hands[h].status === HAND_STATUS.PLAYING) {
      const players = [...state.players];
      players[state.currentPlayerIndex] = { ...player, activeHandIndex: h };
      return { ...state, players };
    }
  }

  // Find next player with playable hands
  for (let p = state.currentPlayerIndex + 1; p < state.players.length; p++) {
    const nextPlayer = state.players[p];
    for (let h = 0; h < nextPlayer.hands.length; h++) {
      if (nextPlayer.hands[h].status === HAND_STATUS.PLAYING) {
        const players = [...state.players];
        players[p] = { ...nextPlayer, activeHandIndex: h };
        return { ...state, players, currentPlayerIndex: p };
      }
    }
  }

  // All players done — dealer's turn
  return { ...state, phase: GAME_PHASE.DEALER_TURN };
}

export function useBlackjack() {
  const [savedChips, setSavedChips] = useLocalStorage(STORAGE_KEYS.BLACKJACK_CHIPS, null);
  const [savedStats, setSavedStats] = useLocalStorage(STORAGE_KEYS.BLACKJACK_STATS, {
    handsPlayed: 0, handsWon: 0, blackjacks: 0, pushes: 0,
  });
  const [savedSettings, setSavedSettings] = useLocalStorage(STORAGE_KEYS.BLACKJACK_SETTINGS, BLACKJACK_CONFIG);
  const [lastBet, setLastBet] = useLocalStorage(STORAGE_KEYS.BLACKJACK_LAST_BET, 25);

  const config = savedSettings;
  const [state, dispatch] = useReducer(reducer, config, createInitialState);
  const stateRef = useRef(state);
  stateRef.current = state;

  // Restore chips on mount
  useEffect(() => {
    if (savedChips !== null && state.phase === GAME_PHASE.BETTING) {
      // We don't dispatch here — chips are managed through the reducer
      // Instead, the initial state uses config.startingChips
    }
  }, []);

  // Save chips when round ends
  useEffect(() => {
    if (state.phase === GAME_PHASE.ROUND_OVER) {
      setSavedChips(state.players[0]?.chips ?? config.startingChips);
    }
  }, [state.phase]);

  // Auto-advance dealer turn
  useEffect(() => {
    if (state.phase === GAME_PHASE.DEALER_TURN) {
      const timer = setTimeout(() => dispatch({ type: 'DEALER_PLAY' }), 500);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // Auto-resolve after dealer plays
  useEffect(() => {
    if (state.phase === GAME_PHASE.RESOLVING) {
      const timer = setTimeout(() => dispatch({ type: 'RESOLVE' }), 300);
      return () => clearTimeout(timer);
    }
  }, [state.phase]);

  // Update stats when round ends
  useEffect(() => {
    if (state.phase === GAME_PHASE.ROUND_OVER && state.results) {
      setSavedStats(prev => {
        const newStats = { ...prev };
        for (const player of state.results) {
          for (const hand of player.hands) {
            newStats.handsPlayed++;
            if (hand.result === 'win' || hand.result === 'blackjack') newStats.handsWon++;
            if (hand.result === 'blackjack') newStats.blackjacks++;
            if (hand.result === 'push') newStats.pushes++;
          }
        }
        return newStats;
      });
    }
  }, [state.phase]);

  const placeBet = useCallback((playerIndex, amount) => {
    dispatch({ type: 'PLACE_BET', playerIndex, amount });
    setLastBet(amount);
  }, [setLastBet]);

  const deal = useCallback(() => dispatch({ type: 'DEAL' }), []);
  const hit = useCallback((pi, hi) => dispatch({ type: 'HIT', playerIndex: pi, handIndex: hi }), []);
  const stand = useCallback((pi, hi) => dispatch({ type: 'STAND', playerIndex: pi, handIndex: hi }), []);
  const double = useCallback((pi, hi) => dispatch({ type: 'DOUBLE', playerIndex: pi, handIndex: hi }), []);
  const split = useCallback((pi, hi) => dispatch({ type: 'SPLIT', playerIndex: pi, handIndex: hi }), []);
  const surrender = useCallback((pi, hi) => dispatch({ type: 'SURRENDER', playerIndex: pi, handIndex: hi }), []);
  const takeInsurance = useCallback(() => dispatch({ type: 'TAKE_INSURANCE' }), []);
  const declineInsurance = useCallback(() => dispatch({ type: 'DECLINE_INSURANCE' }), []);
  const newRound = useCallback(() => dispatch({ type: 'NEW_ROUND' }), []);
  const reset = useCallback(() => dispatch({ type: 'RESET' }), []);
  const addPlayer = useCallback((name, id) => dispatch({ type: 'ADD_PLAYER', name, id }), []);
  const removePlayer = useCallback((idxOrId) => {
    if (typeof idxOrId === 'string') {
      dispatch({ type: 'REMOVE_PLAYER', id: idxOrId });
    } else {
      dispatch({ type: 'REMOVE_PLAYER', playerIndex: idxOrId });
    }
  }, []);

  // Counting helpers
  const runningCount = state.dealtCards.reduce((c, card) => c + getHiLoValue(card), 0);
  const decksRemaining = Math.max(0.5, Math.round((state.shoe.length / 52) * 10) / 10);
  const trueCount = Math.round((runningCount / decksRemaining) * 10) / 10;

  return {
    ...state,
    dispatch,
    placeBet,
    deal,
    hit,
    stand,
    double,
    split,
    surrender,
    takeInsurance,
    declineInsurance,
    newRound,
    reset,
    addPlayer,
    removePlayer,
    lastBet,
    stats: savedStats,
    runningCount,
    trueCount,
    decksRemaining,
    getAvailableActions: (hand, totalHands, chips, isFirstAction) =>
      getAvailableActions(hand, totalHands, state.config, chips, isFirstAction),
  };
}
