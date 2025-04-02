import React, { useState, useEffect, Suspense, useCallback, useMemo } from 'react';
import { PlusIcon, MagnifyingGlassIcon, AdjustmentsHorizontalIcon, SunIcon, MoonIcon, TagIcon } from '@heroicons/react/24/outline';
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
  const parentRef = React.useRef<HTMLDivElement>(null);
  const rowVirtualizer = useVirtualizer({
    count: filteredTodos.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 200, // Estimated height of each todo item
    overscan: 5,
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

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark bg-gray-900' : 'bg-gray-50'}`}>
      <TitleBar isMaximized={isMaximized} />
      
      <div className="max-w-3xl mx-auto p-6 pb-16 pt-20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className={`text-lg font-medium ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
            My Tasks
          </div>
          <div className="flex items-center gap-3">
            <ThemeSelector />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700'
              } shadow-md`}
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
              className={`input flex-1 ${
                isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'
              } shadow-sm`}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="btn-primary flex items-center gap-2 px-4"
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
                className={`input pl-10 w-full ${
                  isDarkMode ? 'bg-gray-800 text-white border-gray-700' : 'bg-white border-gray-200'
                } shadow-sm`}
              />
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary ${
                showFilters ? 'bg-blue-500 text-white' : ''
              }`}
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
              className="mb-6 p-4 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700"
            >
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                    className={`select w-full ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="all">All Categories</option>
                    <option value="personal">Personal</option>
                    <option value="work">Work</option>
                    <option value="shopping">Shopping</option>
                    <option value="health">Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Priority</label>
                  <select
                    value={selectedPriority}
                    onChange={(e) => setSelectedPriority(e.target.value as Priority | 'all')}
                    className={`select w-full ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Tags</label>
                  <select
                    value={selectedTag}
                    onChange={(e) => setSelectedTag(e.target.value)}
                    className={`select w-full ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white border-gray-200'
                    }`}
                  >
                    <option value="all">All Tags</option>
                    {allTags.map((tag) => (
                      <option key={tag} value={tag}>{tag}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Virtualized Todo List */}
        <div
          ref={parentRef}
          className="h-[calc(100vh-300px)] overflow-auto"
        >
          <div
            style={{
              height: `${rowVirtualizer.getTotalSize()}px`,
              width: '100%',
              position: 'relative',
            }}
          >
            <AnimatePresence mode="popLayout">
              {rowVirtualizer.getVirtualItems().map((virtualRow) => {
                const todo = filteredTodos[virtualRow.index];
                return (
                  <motion.div
                    key={todo.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      width: '100%',
                      height: `${virtualRow.size}px`,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    <TodoItem
                      {...todo}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                      onUpdate={handleUpdateTodo}
                    />
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>

        {filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 ${
              isDarkMode ? 'text-gray-400' : 'text-gray-500'
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
    </div>
  );
}; 