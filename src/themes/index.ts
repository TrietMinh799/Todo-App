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
      primary: '#0ea5e9',
      secondary: '#64748b',
      background: '#ffffff',
      surface: '#f8fafc',
      text: '#0f172a',
      textSecondary: '#475569',
      border: '#e2e8f0',
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
      primary: '#38bdf8',
      secondary: '#94a3b8',
      background: '#0f172a',
      surface: '#1e293b',
      text: '#f8fafc',
      textSecondary: '#cbd5e1',
      border: '#334155',
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
      secondary: '#bb9af7',
      background: '#1a1b26',
      surface: '#24283b',
      text: '#c0caf5',
      textSecondary: '#9aa5ce',
      border: '#414868',
      success: '#9ece6a',
      warning: '#e0af68',
      error: '#f7768e',
      info: '#2ac3de',
    },
  },
  {
    id: 'dracula',
    name: 'Dracula',
    colors: {
      primary: '#ff79c6',
      secondary: '#bd93f9',
      background: '#282a36',
      surface: '#44475a',
      text: '#f8f8f2',
      textSecondary: '#6272a4',
      border: '#44475a',
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
      border: '#4c566a',
      success: '#a3be8c',
      warning: '#ebcb8b',
      error: '#bf616a',
      info: '#5e81ac',
    },
  },
  {
    id: 'catppuccin',
    name: 'Catppuccin',
    colors: {
      primary: '#f5c2e7',
      secondary: '#cba6f7',
      background: '#1e1e2e',
      surface: '#302d41',
      text: '#cdd6f4',
      textSecondary: '#bac2de',
      border: '#45475a',
      success: '#a6e3a1',
      warning: '#f9e2af',
      error: '#f38ba8',
      info: '#89dceb',
    },
  },
  {
    id: 'rosepine',
    name: 'Rosé Pine',
    colors: {
      primary: '#ebbcba',
      secondary: '#c4a7e7',
      background: '#191724',
      surface: '#1f1d2e',
      text: '#e0def4',
      textSecondary: '#908caa',
      border: '#26233a',
      success: '#31748f',
      warning: '#f6c177',
      error: '#eb6f92',
      info: '#9ccfd8',
    },
  },
  {
    id: 'gruvbox',
    name: 'Gruvbox',
    colors: {
      primary: '#fe8019',
      secondary: '#d3869b',
      background: '#282828',
      surface: '#3c3836',
      text: '#ebdbb2',
      textSecondary: '#a89984',
      border: '#504945',
      success: '#b8bb26',
      warning: '#fabd2f',
      error: '#fb4934',
      info: '#83a598',
    },
  },
  {
    id: 'everforest',
    name: 'Everforest',
    colors: {
      primary: '#83c092',
      secondary: '#dbbc7f',
      background: '#2d353b',
      surface: '#343f44',
      text: '#d3c6aa',
      textSecondary: '#859289',
      border: '#475258',
      success: '#a7c080',
      warning: '#e69875',
      error: '#e67e80',
      info: '#7fbbb3',
    },
  }
];

export const getThemeById = (id: string): Theme => {
  return themes.find(theme => theme.id === id) || themes[0];
};