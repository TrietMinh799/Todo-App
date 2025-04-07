import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { PlusIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { AnimatePresence, motion } from 'framer-motion';
import { TodoItem } from './TodoItem';
import { LoadingSpinner } from './LoadingSpinner';
import { StatusBar } from './StatusBar';
import { TitleBar } from './TitleBar';
import { ThemeSelector } from './ThemeSelector';
import { useTheme } from '../contexts/ThemeContext';
import { Reminder } from './ReminderSettings';
import { notificationService } from '../services/notificationService';
import { useVirtualizer } from '@tanstack/react-virtual';
import { TodoDetailsModal } from './TodoDetailsModal';

// Declare window.electron type
declare global {
  interface Window {
    electron?: {
      onWindowStateChange: (callback: (maximized: boolean) => void) => void;
      minimizeWindow: () => void;
      maximizeWindow: () => void;
      closeWindow: () => void;
    };
  }
}

export type Priority = 'low' | 'medium' | 'high';
export type Category = 'personal' | 'work' | 'shopping' | 'health';

export interface Todo {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  dueDate: string | null;
  subtasks: { id: string; text: string; completed: boolean }[];
  createdAt: string;
  reminder: Reminder;
  tags: string[];
}

// Default reminder object
const defaultReminder: Reminder = {
  id: '',
  time: '30min',
  enabled: false,
};

export const TodoList = () => {
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [selectedTodoId, setSelectedTodoId] = useState<string | null>(null);
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);

  const [todos, setTodos] = useState<Todo[]>(() => {
    const savedTodos = localStorage.getItem('todos');
    if (savedTodos) {
      const parsedTodos = JSON.parse(savedTodos);
      return parsedTodos.map((todo: Todo) => ({
        ...todo,
        reminder: todo.reminder || {
          ...defaultReminder,
          id: `${todo.id}-reminder`,
        },
        tags: todo.tags || [],
      }));
    }
    return [];
  });
  const [newTodo, setNewTodo] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<Category | 'all'>('all');
  const [selectedPriority, setSelectedPriority] = useState<Priority | 'all'>('all');
  const [selectedTag, setSelectedTag] = useState<string | 'all'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Memoize filtered todos to prevent unnecessary re-renders
  const filteredTodos = useMemo(() => {
    return todos.filter((todo) => {
      const matchesSearch = todo.text.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'all' || todo.category === selectedCategory;
      const matchesPriority = selectedPriority === 'all' || todo.priority === selectedPriority;
      const matchesTag = selectedTag === 'all' || todo.tags.includes(selectedTag);
      return matchesSearch && matchesCategory && matchesPriority && matchesTag;
    });
  }, [todos, searchQuery, selectedCategory, selectedPriority, selectedTag]);

  // Memoize unique tags
  const allTags = useMemo(() =>
    Array.from(new Set(todos.flatMap(todo => todo.tags))),
    [todos]
  );

  // Memoize handlers
  const handleAddTodo = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;

    const todoId = Date.now().toString();
    const todo: Todo = {
      id: todoId,
      text: newTodo.trim(),
      completed: false,
      category: 'personal',
      priority: 'medium',
      dueDate: null,
      subtasks: [],
      createdAt: new Date().toISOString(),
      reminder: {
        ...defaultReminder,
        id: `${todoId}-reminder`,
      },
      tags: [],
    };

    setTodos(prev => [todo, ...prev]);
    setNewTodo('');
  }, [newTodo]);

  const handleToggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const handleUpdateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, ...updates } : todo
    ));
  }, []);

  // Setup virtualization
  const parentRef = useRef<HTMLDivElement>(null);
  // Update the virtualizer configuration to increase item height

  // Update virtualizer to use dynamic sizing
  // Update the virtualizer configuration with larger estimate size and padding
  // Update the virtualizer configuration with larger spacing
  // Update the virtualizer configuration
  const rowVirtualizer = useVirtualizer({
    count: filteredTodos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 240, // Increased to accommodate larger spacing
    overscan: 5,
    paddingStart: 16,
    paddingEnd: 16,
  });

  useEffect(() => {
    localStorage.setItem('todos', JSON.stringify(todos));
  }, [todos]);

  useEffect(() => {
    // Listen for window state changes
    window.electron?.onWindowStateChange((maximized) => {
      setIsMaximized(maximized);
    });
  }, []);

  // Check for due reminders
  useEffect(() => {
    const now = new Date();
    const interval = setInterval(() => {
      todos.forEach((todo) => {
        if (todo.reminder.enabled && todo.dueDate) {
          const dueDate = new Date(todo.dueDate);
          let reminderTime = new Date(dueDate);

          switch (todo.reminder.time) {
            case '5min':
              reminderTime.setMinutes(dueDate.getMinutes() - 5);
              break;
            case '15min':
              reminderTime.setMinutes(dueDate.getMinutes() - 15);
              break;
            case '30min':
              reminderTime.setMinutes(dueDate.getMinutes() - 30);
              break;
            case '1hour':
              reminderTime.setHours(dueDate.getHours() - 1);
              break;
            case '1day':
              reminderTime.setDate(dueDate.getDate() - 1);
              break;
            case 'custom':
              if (todo.reminder.customTime) {
                reminderTime.setMinutes(dueDate.getMinutes() - todo.reminder.customTime);
              }
              break;
          }

          if (now >= reminderTime && now < new Date(reminderTime.getTime() + 60000)) {
            notificationService.showNotification(
              'Reminder', // Title
              `Task: ${todo.text} is due soon!` // Body
            );
          }

        }
      });
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [todos]);

  // Add view details handler
  const handleViewDetails = useCallback((id: string) => {
    const todo = todos.find((t) => t.id === id);
    if (todo) {
      setSelectedTodo(todo);
    }
  }, [todos]);

  useEffect(() => {
    if (selectedTodo) {
      const updated = todos.find(t => t.id === selectedTodo.id);
      if (updated) {
        setSelectedTodo(updated);
      }
    }
  }, [todos, selectedTodo]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, [])

  return (
    <div
      className={`min-h-screen ${isDarkMode ? 'dark' : ''}`}
      style={{
        background: isDarkMode
          ? 'linear-gradient(135deg, #1e1e2f, #111827)'
          : 'linear-gradient(135deg, #f9fafb, #e5e7eb)',
      }}
    >
      <TitleBar isMaximized={isMaximized} />

      <div className="max-w-3xl mx-auto p-6 pb-16 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div
            className={`text-2xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}
          >
            My Tasks
          </div>
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`icon-button ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700'}`}
            >
              {isDarkMode ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </motion.button>
          </div>
        </motion.div>

        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          onSubmit={handleAddTodo}
          className="mb-8"
        >
          <div className="flex gap-3">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => setNewTodo(e.target.value)}
              placeholder="Add a new task..."
              className="input flex-1 shadow-md hover:shadow-lg transition-all"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="btn-primary flex items-center gap-2 px-4 shadow-md hover:shadow-lg"
            >
              <PlusIcon className="w-5 h-5" />
              Add
            </motion.button>
          </div>
        </motion.form>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-6"
        >
          <div className="flex gap-4">
            <div className="relative flex-1">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tasks..."
                className="input pl-10 w-full shadow-md hover:shadow-lg transition-all"
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${showFilters ? 'bg-primary-500 text-white' : ''} shadow-md hover:shadow-lg`}
            >
              <AdjustmentsHorizontalIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>

        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="card mb-6 p-4 shadow-md hover:shadow-lg transition-all"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                    className="input shadow-md hover:shadow-lg transition-all"
                  >
                    <option value="all">All Categories</option>
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="shopping">Shopping</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2 dark:text-gray-300">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
                    className="input shadow-md hover:shadow-lg transition-all"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-400px)]">
            <LoadingSpinner isDarkMode={isDarkMode} />
          </div>
        ) : (
          <div
            ref={parentRef}
            className="h-[calc(100vh-400px)] overflow-auto px-2"
          >
            <div
              style={{
                height: `${rowVirtualizer.getTotalSize()}px`,
                position: 'relative',
                width: '100%',
              }}
            >
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const todo = filteredTodos[virtualRow.index];
                if (!todo) return null;

                return (
                  <motion.div
                    key={todo.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    style={{
                      position: 'absolute',
                      top: `${virtualRow.start}px`,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      padding: '24px 0', // Increased padding
                    }}
                  >
                    <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700/50 mb-8"> {/* Increased margin bottom */}
                      <TodoItem
                        todo={todo}
                        onToggle={handleToggleTodo}
                        onDelete={handleDeleteTodo}
                        onUpdate={handleUpdateTodo}
                        onViewDetails={handleViewDetails}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'
              }`}
          >
            <div className="text-6xl mb-4">📝</div>
            <p className="text-lg mb-2">No tasks found</p>
            <p className="text-sm">
              {searchQuery || selectedCategory !== 'all' || selectedPriority !== 'all' || selectedTag !== 'all'
                ? 'Try adjusting your filters'
                : 'Add a new task to get started!'}
            </p>
          </motion.div>
        )}
      </div>

      <StatusBar isDarkMode={isDarkMode} />

      {/* Render the details modal outside the scrollable container */}
      {selectedTodo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <TodoDetailsModal
            todo={selectedTodo}
            isOpen={true}
            onToggle={() => setSelectedTodo(null)}
            onUpdate={handleUpdateTodo}
            onClose={() => setSelectedTodo(null)}
          />
        </div>
      )}
    </div>
  );
};