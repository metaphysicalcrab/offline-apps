export const SUITS = ['♠', '♥', '♦', '♣'];

export const SUIT_COLORS = {
  '♠': '#1a1a2e',
  '♥': '#c0392b',
  '♦': '#c0392b',
  '♣': '#1a1a2e',
};

export const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export const RANK_VALUES = {
  A: 1, 2: 2, 3: 3, 4: 4, 5: 5, 6: 6, 7: 7,
  8: 8, 9: 9, 10: 10, J: 11, Q: 12, K: 13,
};

export const GAME_MODES = {
  FREE_DRAW: 'free-draw',
  KINGS_CUP: 'kings-cup',
  HIGH_LOW: 'high-low',
};

export const STORAGE_KEYS = {
  DECK: 'card-app-deck',
  HISTORY: 'card-app-history',
  CURRENT_CARD: 'card-app-current',
  PLAYERS: 'card-app-players',
  CURRENT_PLAYER_INDEX: 'card-app-player-index',
  RULES: 'card-app-rules',
  THEME: 'card-app-theme',
  SETTINGS: 'card-app-settings',
  GAME_MODE: 'card-app-mode',
  HIGH_LOW_STREAK: 'card-app-streak',
  HIGH_LOW_BEST: 'card-app-best-streak',
  KING_COUNT: 'card-app-king-count',
};

export const AUDIO_PARAMS = {
  flip: { freq: 800, duration: 0.08, type: 'square' },
  shuffle: { freq: 400, duration: 0.03, type: 'square', repeat: 6, gap: 40 },
  success: { freqs: [523, 659], duration: 0.15, type: 'sine' },
  fail: { freqs: [330, 220], duration: 0.2, type: 'sawtooth' },
};

export const HAPTIC_PATTERNS = {
  tap: [15],
  success: [15, 50, 15],
  fail: [40, 30, 40],
  shuffle: [10, 20, 10, 20, 10],
};

export const DEFAULT_KINGS_CUP_RULES = {
  A: { title: 'Waterfall', desc: 'Everyone drinks in order. You can\'t stop until the person before you stops.' },
  2: { title: 'You', desc: 'Pick someone to drink.' },
  3: { title: 'Me', desc: 'You drink.' },
  4: { title: 'Floor', desc: 'Last person to touch the floor drinks.' },
  5: { title: 'Guys', desc: 'All guys drink.' },
  6: { title: 'Chicks', desc: 'All girls drink.' },
  7: { title: 'Heaven', desc: 'Last person to point up drinks.' },
  8: { title: 'Mate', desc: 'Pick a mate. They drink when you drink.' },
  9: { title: 'Rhyme', desc: 'Say a word. Go around rhyming. First to fail drinks.' },
  10: { title: 'Categories', desc: 'Pick a category. Go around naming items. First to fail drinks.' },
  J: { title: 'Make a Rule', desc: 'Create a rule everyone must follow.' },
  Q: { title: 'Questions', desc: 'Ask someone a question. They must respond with a question. First to fail drinks.' },
  K: { title: 'King\'s Cup', desc: 'Pour into the King\'s Cup. 4th King drinks it all!' },
};
