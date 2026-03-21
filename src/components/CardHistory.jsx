import React, { useRef, useEffect } from 'react';
import DrawnCardMini from './DrawnCardMini.jsx';

export default function CardHistory({ history, themeStyles }) {
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = scrollRef.current.scrollWidth;
    }
  }, [history.length]);

  if (history.length === 0) return null;

  return (
    <div style={{ ...styles.container, ...themeStyles?.history }}>
      <div
        ref={scrollRef}
        className="history-scroll"
        style={styles.scroll}
      >
        {history.map((card, i) => (
          <DrawnCardMini key={`${card.id}-${i}`} card={card} themeStyles={themeStyles} />
        ))}
      </div>
      <span style={{ ...styles.count, ...themeStyles?.textMuted }}>
        {history.length} drawn
      </span>
    </div>
  );
}

const styles = {
  container: {
    padding: '8px 12px',
    display: 'flex',
    alignItems: 'center',
    gap: 10,
  },
  scroll: {
    display: 'flex',
    gap: 6,
    overflowX: 'auto',
    flex: 1,
    scrollSnapType: 'x mandatory',
    paddingBottom: 4,
  },
  count: {
    fontSize: 11,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
};
