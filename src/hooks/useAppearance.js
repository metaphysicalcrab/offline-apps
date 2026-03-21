import { useLocalStorage } from './useLocalStorage.js';
import { STORAGE_KEYS } from '../constants.js';

export const CARD_BACK_COLORS = [
  { label: 'Forest', value: '#1a472a' },
  { label: 'Navy', value: '#1a2744' },
  { label: 'Wine', value: '#4a1a2a' },
  { label: 'Charcoal', value: '#2a2a2a' },
  { label: 'Royal', value: '#2a1a44' },
  { label: 'Teal', value: '#1a3a3a' },
];

export const CARD_BACK_STYLES = [
  { label: 'Classic', value: 'classic' },
  { label: 'Minimal', value: 'minimal' },
  { label: 'Ornate', value: 'ornate' },
];

export const FONT_OPTIONS = [
  { label: 'System', value: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' },
  { label: 'Serif', value: 'Georgia, "Times New Roman", serif' },
  { label: 'Mono', value: '"SF Mono", "Fira Code", "Courier New", monospace' },
  { label: 'Rounded', value: 'system-ui, "Nunito", "Varela Round", sans-serif' },
];

export function useAppearance() {
  const [cardBackColor, setCardBackColor] = useLocalStorage(STORAGE_KEYS.CARD_BACK_COLOR, '#1a472a');
  const [cardBackStyle, setCardBackStyle] = useLocalStorage(STORAGE_KEYS.CARD_BACK_STYLE, 'classic');
  const [fontFamily, setFontFamily] = useLocalStorage(STORAGE_KEYS.FONT_FAMILY, FONT_OPTIONS[0].value);

  return {
    cardBackColor,
    setCardBackColor,
    cardBackStyle,
    setCardBackStyle,
    fontFamily,
    setFontFamily,
  };
}
