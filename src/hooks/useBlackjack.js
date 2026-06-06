import { useReducer, useCallback, useEffect, useRef, useState } from 'react';
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
import { getNPCBet } from '../game/npcPlayer.js';

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

      // Mark player blackjacks
      const updatedPlayers = players.map(p => {
        const hand = p.hands[0];
        if (isBlackjack(hand.cards)) {
          return { ...p, hands: [{ ...hand, status: HAND_STATUS.BLACKJACK }] };
        }
        return p;
      });

      // Determine opening phase. The dealer "peeks" for blackjack (US rules):
      // when the upcard is an Ace or a ten-value card the round ends before
      // players act if the dealer has a natural, so nobody can double/split
      // into a dealer blackjack and lose extra.
      let phase = GAME_PHASE.PLAYER_TURN;
      const dealerHasBlackjack = isBlackjack(dealer.cards);
      const firstPlayable = findFirstPlayableHand(updatedPlayers);

      if (state.config.insuranceAllowed && shouldOfferInsurance(dealer.cards)) {
        // Ace showing — offer insurance first; the peek is deferred until the
        // insurance decision is resolved (see TAKE/DECLINE_INSURANCE).
        phase = GAME_PHASE.INSURANCE;
      } else if (dealerHasBlackjack || !firstPlayable) {
        // Dealer peeked into a natural, or no hand needs a decision (e.g. every
        // player drew blackjack) — go straight to the dealer reveal.
        phase = GAME_PHASE.DEALER_TURN;
      }

      // Position the turn on the first hand that actually needs action so a
      // leading player dealt blackjack doesn't leave the turn stuck on a
      // resolved hand (advanceToNextHand only ever moves forward).
      let turnPlayers = updatedPlayers;
      let currentPlayerIndex = 0;
      if (phase === GAME_PHASE.PLAYER_TURN && firstPlayable) {
        currentPlayerIndex = firstPlayable.playerIndex;
        turnPlayers = updatedPlayers.map((p, i) =>
          i === currentPlayerIndex ? { ...p, activeHandIndex: firstPlayable.handIndex } : p
        );
      }

      return {
        ...state, shoe, dealtCards, dealer, players: turnPlayers,
        phase, currentPlayerIndex, message: null, results: null,
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

      // Insurance is settled — now the dealer peeks. If the dealer has a
      // natural (or every player already stands pat) the round ends before
      // any player acts.
      const dealerHasBlackjack = isBlackjack(state.dealer.cards);
      const firstPlayable = findFirstPlayableHand(players);

      if (dealerHasBlackjack || !firstPlayable) {
        return { ...state, players, phase: GAME_PHASE.DEALER_TURN, currentPlayerIndex: 0 };
      }

      // Position the turn on the first hand needing action (skipping any
      // leading blackjacks) so the round doesn't stall on a resolved hand.
      const positioned = players.map((p, i) =>
        i === firstPlayable.playerIndex ? { ...p, activeHandIndex: firstPlayable.handIndex } : p
      );
      return {
        ...state,
        players: positioned,
        phase: GAME_PHASE.PLAYER_TURN,
        currentPlayerIndex: firstPlayable.playerIndex,
      };
    }

    case 'RECHARGE': {
      // Top up a player's chips between rounds so a broke player can keep
      // playing. Restricted to non-active phases to avoid mid-hand edits.
      if (state.phase !== GAME_PHASE.BETTING && state.phase !== GAME_PHASE.ROUND_OVER) {
        return state;
      }
      const { playerIndex, amount } = action;
      if (!amount || amount <= 0) return state;
      const players = state.players.map((p, i) =>
        i === playerIndex ? { ...p, chips: p.chips + amount } : p
      );
      return { ...state, players };
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

      // Deduct the additional wager. Normally this matches the original bet,
      // but if the player is short on chips they "double for less" — staking
      // whatever they have left (down to nothing). Fold it into hand.bet so the
      // hand carries its full committed wager for payout/display.
      const extraBet = Math.min(hand.bet, player.chips);
      player.chips -= extraBet;
      hand.bet += extraBet;
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
          bet: h.bet,
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

      // Rebuy busted NPCs
      let preppedPlayers = state.players.map(p => {
        if (p.isNPC && p.chips < 5) {
          return { ...p, chips: state.config.startingChips };
        }
        return p;
      });

      // Shuffle seat order when NPCs are present (randomize each round)
      const hasNPCs = preppedPlayers.some(p => p.isNPC);
      if (hasNPCs) {
        const shuffled = [...preppedPlayers];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        preppedPlayers = shuffled;
      }

      const players = preppedPlayers.map(p => ({
        ...p,
        hands: [{
          cards: [],
          bet: p.isNPC ? getNPCBet(p.chips) : 0,
          status: HAND_STATUS.PLAYING,
          isDoubled: false,
          insuranceBet: 0,
        }],
        activeHandIndex: 0,
      }));

      // Deduct NPC bets from their chips
      const playersWithBets = players.map(p => {
        if (p.isNPC && p.hands[0].bet > 0) {
          return p; // Bet deducted at DEAL time
        }
        return p;
      });

      return {
        ...state, shoe, dealtCards, players: playersWithBets,
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
          isNPC: action.isNPC || false,
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

// Scan all players in seat order for the first hand still awaiting a decision.
// Used to position the turn when entering PLAYER_TURN so a leading player who
// was dealt a blackjack (or otherwise stands pat) doesn't stall the round —
// their already-resolved hand would never be advanced past otherwise. Returns
// { playerIndex, handIndex } or null when no hand needs action.
function findFirstPlayableHand(players) {
  for (let p = 0; p < players.length; p++) {
    for (let h = 0; h < players[p].hands.length; h++) {
      if (players[p].hands[h].status === HAND_STATUS.PLAYING) {
        return { playerIndex: p, handIndex: h };
      }
    }
  }
  return null;
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

  // Session buy-in total (in-memory): starting stake plus any recharges.
  // Net session P&L = current chips − totalBuyIn.
  const [totalBuyIn, setTotalBuyIn] = useState(config.startingChips);

  // Restore chips on mount
  useEffect(() => {
    if (savedChips !== null && state.phase === GAME_PHASE.BETTING) {
      // We don't dispatch here — chips are managed through the reducer
      // Instead, the initial state uses config.startingChips
    }
  }, []);

  // Save chips when round ends (find human player, not always index 0)
  useEffect(() => {
    if (state.phase === GAME_PHASE.ROUND_OVER) {
      const human = state.players.find(p => !p.isNPC);
      setSavedChips(human?.chips ?? config.startingChips);
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

  // Update stats when round ends (only count human player hands)
  useEffect(() => {
    if (state.phase === GAME_PHASE.ROUND_OVER && state.results) {
      setSavedStats(prev => {
        const newStats = { ...prev };
        for (let i = 0; i < state.results.length; i++) {
          if (state.players[i]?.isNPC) continue;
          for (const hand of state.results[i].hands) {
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
  const reset = useCallback(() => {
    dispatch({ type: 'RESET' });
    setTotalBuyIn(config.startingChips);
  }, [config.startingChips]);
  const recharge = useCallback((playerIndex, amount) => {
    dispatch({ type: 'RECHARGE', playerIndex, amount });
    setTotalBuyIn(prev => prev + amount);
    // Persist immediately so a top-up survives a refresh mid-betting.
    const human = stateRef.current.players.find(p => !p.isNPC);
    setSavedChips((human?.chips ?? config.startingChips) + amount);
  }, [config.startingChips, setSavedChips]);
  const addPlayer = useCallback((name, id, isNPC) => dispatch({ type: 'ADD_PLAYER', name, id, isNPC }), []);
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
    recharge,
    addPlayer,
    removePlayer,
    lastBet,
    totalBuyIn,
    stats: savedStats,
    runningCount,
    trueCount,
    decksRemaining,
    getAvailableActions: (hand, totalHands, chips, isFirstAction) =>
      getAvailableActions(hand, totalHands, state.config, chips, isFirstAction),
  };
}
