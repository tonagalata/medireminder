import { createContext, useContext, ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material';
import { useApp } from '../context/AppContext';

const ThemeContext = createContext<null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings } = useApp();

  const theme = createTheme({
    palette: {
      primary: {
        main: settings.theme.primary,
      },
      secondary: {
        main: settings.theme.secondary,
      },
      background: {
        default: settings.theme.background,
        paper: settings.theme.background,
      },
      text: {
        primary: settings.theme.text,
      },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          body: {
            backgroundColor: settings.theme.background,
            color: settings.theme.text,
          },
        },
      },
    },
  });

  return (
    <ThemeContext.Provider value={null}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
} 