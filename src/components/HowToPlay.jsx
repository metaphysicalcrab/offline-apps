import React, { useEffect } from 'react';
import { GAME_MODES } from '../constants.js';

const RULES = {
  [GAME_MODES.FREE_DRAW]: {
    title: 'Free Draw',
    icon: '🎴',
    sections: [
      {
        heading: 'How it works',
        text: 'Tap "Draw" to flip cards one at a time from a standard 52-card deck. No scoring, no rules — just a simple way to draw cards for any occasion.',
      },
      {
        heading: 'Use it for',
        items: [
          'Deciding turns or settling disputes',
          'Playing any card game that needs a shared deck',
          'Practicing card counting or memorization',
        ],
      },
      {
        heading: 'Controls',
        items: [
          'Draw — flip the next card',
          'Undo — put the last card back',
          'Shuffle — reshuffle remaining cards',
          'Reset — restore the full 52-card deck',
        ],
      },
    ],
  },
  [GAME_MODES.KINGS_CUP]: {
    title: "King's Cup",
    icon: '👑',
    sections: [
      {
        heading: 'Overview',
        text: "A classic drinking/party game. Players take turns drawing cards, and each card triggers a rule. When the 4th King is drawn, the game ends!",
      },
      {
        heading: 'Default rules',
        items: [
          'A — Waterfall: everyone drinks in sequence',
          '2 — You: pick someone to drink',
          '3 — Me: you drink',
          '4 — Floor: last to touch the floor drinks',
          '5 — Guys: all guys drink',
          '6 — Chicks: all girls drink',
          '7 — Heaven: last to raise hand drinks',
          '8 — Mate: pick a drinking buddy',
          '9 — Rhyme: say a word, go around rhyming',
          '10 — Categories: pick a category, go around naming items',
          'J — Make a Rule: create a rule everyone must follow',
          'Q — Questions: ask questions around the circle',
          'K — King\'s Cup: pour into the central cup (4th King drinks it)',
        ],
      },
      {
        heading: 'Tips',
        items: [
          'Add players in Settings to track whose turn it is',
          'Tap "Edit King\'s Cup Rules" in Settings to customize',
          'Jack lets you type a new active rule on the spot',
        ],
      },
    ],
  },
  [GAME_MODES.HIGH_LOW]: {
    title: 'High-Low',
    icon: '📈',
    sections: [
      {
        heading: 'Overview',
        text: 'Guess whether the next card will be higher or lower than the current one. Build the longest streak you can!',
      },
      {
        heading: 'How to play',
        items: [
          'A card is shown face-up',
          'Tap "Higher" or "Lower" to predict the next card',
          'Correct guesses extend your streak',
          'A wrong guess resets your streak to zero',
          'Equal value counts as correct for either guess',
        ],
      },
      {
        heading: 'Card order (low to high)',
        text: 'A, 2, 3, 4, 5, 6, 7, 8, 9, 10, J, Q, K',
      },
    ],
  },
  [GAME_MODES.BLACKJACK]: {
    title: 'Blackjack',
    icon: '🃏',
    sections: [
      {
        heading: 'Overview',
        text: 'Practice casino blackjack with full rules. Beat the dealer by getting closer to 21 without going over. Supports multiplayer across devices!',
      },
      {
        heading: 'Quick start',
        items: [
          'Place a bet using the chip buttons',
          'Tap "Deal" to start the round',
          'Choose Hit, Stand, Double, Split, or Surrender',
          'Dealer plays automatically after all players finish',
          'Winnings are added to your balance',
        ],
      },
      {
        heading: 'Practice tools',
        items: [
          'Toggle hints (💡) to see the optimal play for every hand',
          'Toggle count (🔢) to practice Hi-Lo card counting',
          'Open 📊 for the full basic strategy chart',
          'Open 📖 for detailed rules and casino etiquette',
        ],
      },
      {
        heading: 'Multiplayer',
        items: [
          'Tap "Create Room" to host a game',
          'Share the room code with friends',
          'Others tap "Join Room" and enter the code',
          'Up to 6 players at one table',
        ],
      },
    ],
  },
};

export default function HowToPlay({ mode, onClose, themeStyles }) {
  const rules = RULES[mode] || RULES[GAME_MODES.FREE_DRAW];

  useEffect(() => {
    const handleKey = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [onClose]);

  return (
    <div style={{ ...styles.overlay, ...themeStyles?.overlay }} onClick={onClose}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`How to play ${rules.title}`}
        style={{ ...styles.modal, ...themeStyles?.modal }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>{rules.icon}</span>
            <span style={{ ...themeStyles?.text, fontSize: 18, fontWeight: 'bold' }}>{rules.title}</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close how to play">×</button>
        </div>

        <div style={styles.content}>
          {rules.sections.map((section, i) => (
            <div key={i} style={styles.section}>
              <div style={{ ...themeStyles?.textAccent, fontSize: 14, fontWeight: 700 }}>
                {section.heading}
              </div>
              {section.text && (
                <div style={{ ...themeStyles?.text, fontSize: 14, lineHeight: 1.6 }}>
                  {section.text}
                </div>
              )}
              {section.items && (
                <ul style={styles.list}>
                  {section.items.map((item, j) => (
                    <li key={j} style={{ ...themeStyles?.text, fontSize: 13, lineHeight: 1.5 }}>
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div style={styles.footer}>
          <button
            onClick={onClose}
            style={{ ...styles.doneBtn, ...themeStyles?.buttonPrimary }}
          >
            Got it!
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: {
    position: 'fixed',
    inset: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    animation: 'fadeIn 0.2s',
    padding: 16,
  },
  modal: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '85vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 20px',
  },
  closeBtn: {
    background: 'none',
    border: 'none',
    fontSize: 24,
    cursor: 'pointer',
    opacity: 0.5,
    color: 'inherit',
  },
  content: {
    padding: '0 20px 20px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 16,
  },
  section: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  list: {
    margin: '4px 0 0 0',
    paddingLeft: 20,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  footer: {
    padding: '12px 20px',
  },
  doneBtn: {
    width: '100%',
    padding: '12px 16px',
    borderRadius: 12,
    border: 'none',
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    textAlign: 'center',
  },
};
