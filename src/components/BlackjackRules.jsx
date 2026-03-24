import React, { useEffect } from 'react';

const SECTIONS = [
  {
    heading: 'Objective',
    text: 'Beat the dealer by getting a hand total closer to 21 without going over. You\'re not competing against other players — only the dealer.',
  },
  {
    heading: 'Card Values',
    items: [
      '2–10 — Face value',
      'J, Q, K — Worth 10',
      'A — Worth 1 or 11 (whichever benefits your hand)',
    ],
  },
  {
    heading: 'How a Round Works',
    items: [
      '1. Place your bet',
      '2. Dealer deals 2 cards to each player and 2 to themselves (one face-up, one face-down)',
      '3. Players take turns making decisions on their hand',
      '4. Once all players finish, the dealer reveals their hole card and plays',
      '5. Hands are compared, bets are settled',
    ],
  },
  {
    heading: 'Player Actions',
    items: [
      'Hit — Take another card. You can hit as many times as you want.',
      'Stand — Keep your current hand. End your turn.',
      'Double Down — Double your bet, take exactly one more card, then stand. Only on first 2 cards.',
      'Split — If you have a pair, split into 2 separate hands (each with its own bet). You can re-split up to 4 hands.',
      'Surrender — Give up your hand and get half your bet back. Only on first 2 cards.',
      'Insurance — When dealer shows an Ace, you can bet half your original bet that the dealer has blackjack. Pays 2:1.',
    ],
  },
  {
    heading: 'Dealer Rules',
    items: [
      'Dealer must hit on 16 or less',
      'Dealer must stand on hard 17 or higher',
      'Dealer stands on soft 17 (Ace + 6)',
      'Dealer has no choice — they follow fixed rules',
    ],
  },
  {
    heading: 'Payouts',
    items: [
      'Win — Pays 1:1 (bet $25, get back $50)',
      'Blackjack (A + 10-value on first 2 cards) — Pays 3:2 (bet $25, get back $62.50)',
      'Push (tie) — Bet returned',
      'Insurance — Pays 2:1 if dealer has blackjack',
      'Surrender — Half bet returned',
    ],
  },
  {
    heading: 'Special Rules',
    items: [
      'Blackjack beats a regular 21',
      'Split Aces receive only one card each',
      'You can double down after splitting',
      '6-deck shoe with cut card at ~75% penetration',
    ],
  },
  {
    heading: 'Casino Etiquette Tips',
    items: [
      'Tap the table to hit, wave your hand to stand',
      'Place additional chips next to (not on) your original bet to double/split',
      'Don\'t touch cards in a shoe game',
      'Tip the dealer occasionally (not required, but appreciated)',
      'Don\'t give unsolicited advice to other players',
      'Know the table minimum before sitting down',
    ],
  },
  {
    heading: 'Card Counting (Hi-Lo System)',
    items: [
      '2, 3, 4, 5, 6 → +1 (low cards leaving the shoe favor the player)',
      '7, 8, 9 → 0 (neutral)',
      '10, J, Q, K, A → −1 (high cards leaving the shoe favor the dealer)',
      'Running Count = sum of all card values seen',
      'True Count = Running Count ÷ Decks Remaining',
      'Higher true count = more favorable for the player',
      'Use the 🔢 toggle to practice tracking the count',
    ],
  },
];

export default function BlackjackRules({ onClose, themeStyles }) {
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
        aria-label="Blackjack Rules"
        style={{ ...styles.modal, ...themeStyles?.modal }}
        onClick={(e) => e.stopPropagation()}
      >
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 22 }}>🃏</span>
            <span style={{ ...themeStyles?.text, fontSize: 18, fontWeight: 'bold' }}>Blackjack Rules</span>
          </div>
          <button onClick={onClose} style={styles.closeBtn} aria-label="Close rules">×</button>
        </div>

        <div style={styles.content}>
          {SECTIONS.map((section, i) => (
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
