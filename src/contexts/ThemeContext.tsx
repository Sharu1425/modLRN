import React, { createContext, useContext, useState, useEffect } from 'react';

export type ThemeMode = 'casual' | 'professional';
export type ColorScheme = 'light' | 'dark';

interface ThemeContextType {
  mode: ThemeMode;
  colorScheme: ColorScheme;
  setMode: (mode: ThemeMode) => void;
  setColorScheme: (scheme: ColorScheme) => void;
  toggleColorScheme: () => void;
  toggleMode: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [mode, setMode] = useState<ThemeMode>(() => {
    const saved = localStorage.getItem('theme-mode');
    return (saved as ThemeMode) || 'casual';
  });

  const [colorScheme, setColorScheme] = useState<ColorScheme>(() => {
    const saved = localStorage.getItem('color-scheme');
    return (saved as ColorScheme) || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('theme-mode', mode);
    localStorage.setItem('color-scheme', colorScheme);
    
    // Apply theme classes to document
    const root = document.documentElement;
    root.className = `${mode} ${colorScheme}`;
    
    // Update CSS custom properties
    root.style.setProperty('--theme-mode', mode);
    root.style.setProperty('--color-scheme', colorScheme);
  }, [mode, colorScheme]);

  const toggleColorScheme = () => {
    setColorScheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const toggleMode = () => {
    setMode(prev => prev === 'casual' ? 'professional' : 'casual');
  };

  return (
    <ThemeContext.Provider value={{
      mode,
      colorScheme,
      setMode,
      setColorScheme,
      toggleColorScheme,
      toggleMode
    }}>
      {children}
    </ThemeContext.Provider>
  );
};
