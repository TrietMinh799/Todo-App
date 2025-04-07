import React, { useEffect } from 'react';
import { TodoList } from './components/TodoList';
import { useTheme } from './contexts/ThemeContext';

function App() {
  const { isDarkMode, currentTheme } = useTheme();

  useEffect(() => {
    // Apply theme background to the body element
    document.body.style.backgroundColor = isDarkMode 
      ? currentTheme.colors.background 
      : '#f9fafb';
  }, [isDarkMode, currentTheme]);

  return (
    <div 
      className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}
      style={{
        backgroundColor: isDarkMode ? currentTheme.colors.background : '#f9fafb',
        color: isDarkMode ? currentTheme.colors.text : '#111827',
      }}
    >
      <TodoList />
    </div>
  );
}

export default App;