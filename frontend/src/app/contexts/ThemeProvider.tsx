import {createContext, useContext, useEffect, useState} from 'react';

// Määritellään mahdolliset teemat
type Theme = 'dark' | 'light' | 'system';

type ThemeProviderProps = {
  children: React.ReactNode;
  defaultTheme?: Theme;
  storageKey?: string;
};

type ThemeProviderState = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const initialState: ThemeProviderState = {
  theme: 'system',
  setTheme: () => null,
};

// Luodaan Context
const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export function ThemeProvider({
  children,
  defaultTheme = 'system',
  storageKey = 'quantix-ui-theme', // LocalStoragen avain
  ...props
}: ThemeProviderProps) {
  // Alustetaan tila LocalStoragesta tai käytetään oletusta
  const [theme, setTheme] = useState<Theme>(
    () => (localStorage.getItem(storageKey) as Theme) || defaultTheme
  );

  useEffect(() => {
    const root = window.document.documentElement;

    // Poistetaan vanhat luokat aina kun teema vaihtuu
    root.classList.remove('light', 'dark');

    // Jos valinta on "system", katsotaan selaimen/käyttöjärjestelmän asetus
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)')
        .matches
        ? 'dark'
        : 'light';

      root.classList.add(systemTheme);
      return;
    }

    // Muuten pakotetaan valittu teema (light tai dark)
    root.classList.add(theme);
  }, [theme]);

  const value = {
    theme,
    setTheme: (theme: Theme) => {
      // Tallennetaan uusi valinta selaimeen, jotta se muistetaan ensi kerralla
      localStorage.setItem(storageKey, theme);
      setTheme(theme);
    },
  };

  return (
    <ThemeProviderContext.Provider {...props} value={value}>
      {children}
    </ThemeProviderContext.Provider>
  );
}

// Custom hook, jota muiden komponenttien on helppo käyttää
export const useTheme = () => {
  const context = useContext(ThemeProviderContext);

  if (context === undefined)
    throw new Error('useTheme täytyy olla ThemeProviderin sisällä');

  return context;
};
