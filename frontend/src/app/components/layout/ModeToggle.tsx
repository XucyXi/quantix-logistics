import {Moon, Sun} from 'lucide-react';
import {useTheme} from '../../contexts/ThemeProvider.tsx';

export function ModeToggle() {
  const {theme, setTheme} = useTheme();

  // Koska teema voi olla "system", tarkistetaan onko laite oikeasti tummassa vai vaaleassa tilassa,
  // jotta tiedämme kumpaan suuntaan sitten nappia pitääkin vaihtaa.
  const isDark =
    theme === 'dark' ||
    (theme === 'system' &&
      window.matchMedia('(prefers-color-scheme: dark)').matches);

  return (
    <button
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      title={isDark ? 'Vaihda vaaleaan teemaan' : 'Vaihda tummaan teemaan'}
      aria-label="Vaihda teemaa"
    >
      {/* Näytetään kuu, jos ollaan tummassa tilassa, muuten aurinko */}
      {isDark ? <Moon size={18} /> : <Sun size={18} />}
    </button>
  );
}
