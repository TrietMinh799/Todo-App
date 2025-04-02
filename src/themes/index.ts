export type Theme = {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
    border: string;
    success: string;
    warning: string;
    error: string;
    info: string;
  };
};

export const themes: Theme[] = [
  {
    id: 'light',
    name: 'Light',
    colors: {
      primary: '#3b82f6',
      secondary: '#6b7280',
      background: '#f9fafb',
      surface: '#ffffff',
      text: '#111827',
      textSecondary: '#4b5563',
      border: '#e5e7eb',
      success: '#10b981',
      warning: '#f59e0b',
      error: '#ef4444',
      info: '#3b82f6',
    },
  },
  {
    id: 'dark',
    name: 'Dark',
    colors: {
      primary: '#60a5fa',
      secondary: '#9ca3af',
      background: '#111827',
      surface: '#1f2937',
      text: '#f9fafb',
      textSecondary: '#d1d5db',
      border: '#374151',
      success: '#34d399',
      warning: '#fbbf24',
      error: '#f87171',
      info: '#60a5fa',
    },
  },
  {
    id: 'tokyo-night',
    name: 'Tokyo Night',
    colors: {
      primary: '#7aa2f7',
      secondary: '#9aa5ce',
      background: '#1a1b26',
      surface: '#24283b',
      text: '#a9b1d6',
      textSecondary: '#565f89',
      border: '#414868',
      success: '#9ece6a',
      warning: '#e0af68',
      error: '#f7768e',
      info: '#7aa2f7',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      primary: '#bd93f9',
      secondary: '#6272a4',
      background: '#282a36',
      surface: '#44475a',
      text: '#f8f8f2',
      textSecondary: '#6272a4',
      border: '#6272a4',
      success: '#50fa7b',
      warning: '#ffb86c',
      error: '#ff5555',
      info: '#8be9fd',
    },
  },
  {
    id: 'nord',
    name: 'Nord',
    colors: {
      primary: '#88c0d0',
      secondary: '#81a1c1',
      background: '#2e3440',
      surface: '#3b4252',
      text: '#eceff4',
      textSecondary: '#d8dee9',
      border: '#434c5e',
      success: '#a3be8c',
      warning: '#ebcb8b',
      error: '#bf616a',
      info: '#88c0d0',
    },
  },
  {
    id: 'solarized',
    name: 'Solarized',
    colors: {
      primary: '#268bd2',
      secondary: '#586e75',
      background: '#fdf6e3',
      surface: '#eee8d5',
      text: '#657b83',
      textSecondary: '#93a1a1',
      border: '#eee8d5',
      success: '#859900',
      warning: '#b58900',
      error: '#dc322f',
      info: '#268bd2',
    },
  },
];

export const getThemeById = (id: string): Theme => {
  return themes.find(theme => theme.id === id) || themes[0];
}; 