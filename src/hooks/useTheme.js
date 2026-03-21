import { useEffect } from 'react';
import { useLocalStorage } from './useLocalStorage.js';
import { STORAGE_KEYS } from '../constants.js';
import { darkTheme, lightTheme } from '../styles/themes.js';

export function useTheme() {
  const [theme, setTheme] = useLocalStorage(STORAGE_KEYS.THEME, 'dark');
  const themeStyles = theme === 'dark' ? darkTheme : lightTheme;

  useEffect(() => {
    document.body.style.backgroundColor = themeStyles.app.background;
    document.body.style.color = themeStyles.text.color;
  }, [themeStyles]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  return { theme, themeStyles, toggleTheme };
}
