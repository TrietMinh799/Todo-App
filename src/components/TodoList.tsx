import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  PlusIcon,
  MagnifyingGlassIcon,
  AdjustmentsHorizontalIcon,
  SunIcon,
  MoonIcon,
  Bars2Icon,
  Squares2X2Icon,
  PlusSmallIcon,
  CalendarIcon,
  EyeIcon,
  TrashIcon,
  CheckCircleIcon,
  CheckCircleIcon as CheckCircleSolidIcon,
  PencilIcon,
} from '@heroicons/react/24/outline';
import { AnimatePresence, motion, Reorder } from 'framer-motion';
import { TodoItem } from './TodoItem';
import { LoadingSpinner } from './LoadingSpinner';
import { StatusBar } from './StatusBar';
import { TitleBar } from './TitleBar';
import { ThemeSelector } from './ThemeSelector';
import { useTheme } from '../contexts/ThemeContext';
import { Reminder } from './ReminderSettings';
import { notificationService } from '../services/notificationService';
import { SoundPlayer } from './SoundPlayer';
import { TodoDetailsModal } from './TodoDetailsModal';
import { TodoEditModal } from './TodoEditModal';
import { AddTodoModal } from './AddTodoModal';
import { priorityColors, defaultColors, categoryColors } from '../categoryColors';

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
  const [selectedTodo, setSelectedTodo] = useState<Todo | null>(null);
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showAddModal, setShowAddModal] = useState(false);

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
  const [newTag, setNewTag] = useState('');

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

  // Handlers
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

  const handleAddTag = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;
    setTodos(prev => prev.map(todo => {
      if (todo.id === selectedTodo?.id) {
        return { ...todo, tags: [...todo.tags, newTag.trim()] };
      }
      return todo;
    }));
    setNewTag('');
  }, [newTag, selectedTodo]);

  const handleToggleTodo = useCallback((id: string) => {
    setTodos(prev => prev.map(todo =>
      todo.id === id ? { ...todo, completed: !todo.completed } : todo
    ));
  }, []);

  const handleDeleteTodo = useCallback((id: string) => {
    setTodos(prev => prev.filter(todo => todo.id !== id));
  }, []);

  const handleUpdateTodo = useCallback((id: string, updates: Partial<Todo>) => {
    setTodos(prev => {
      const updatedTodos = prev.map(todo =>
        todo.id === id ? { ...todo, ...updates } : todo
      );
      const updatedTodo = updatedTodos.find(todo => todo.id === id);
      if (updatedTodo) {
        // Schedule the reminder if a due date and enabled reminder exist
        notificationService.scheduleReminder(
          updatedTodo.id,
          updatedTodo.text,
          updatedTodo.dueDate,
          updatedTodo.reminder
        );
      }
      return updatedTodos;
    });
  }, []);

  const handleEditTodo = useCallback((id: string) => {
    const todo = todos.find(t => t.id === id);
    if (todo) {
      setEditingTodo(todo);
    }
  }, [todos]);

  const handleAddNewTodo = (todoData: Omit<Todo, 'id' | 'createdAt'>) => {
    const todoId = Date.now().toString();
    const newTodo: Todo = {
      ...todoData,
      id: todoId,
      createdAt: new Date().toISOString(),
      reminder: {
        ...todoData.reminder,
        id: `${todoId}-reminder`,
      },
    };
    setTodos(prev => [newTodo, ...prev]);
  };

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
              'Reminder',
              `Task: ${todo.text} is due soon!`
            );
          }
        }
      });
    }, 60000);
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
  }, []);

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

      <div className="max-w-6xl mx-auto p-6 pb-16 pt-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex justify-between items-center mb-8"
        >
          <div className={`text-3xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-800'}`}>
            My Tasks
          </div>
          <div className="flex items-center gap-4">
            <SoundPlayer />
            <ThemeSelector />
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleDarkMode}
              className={`icon-button ${isDarkMode ? 'bg-gray-800 text-yellow-400' : 'bg-white text-gray-700'} shadow-md`}
            >
              {isDarkMode ? <SunIcon className="w-6 h-6" /> : <MoonIcon className="w-6 h-6" />}
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('list')}
              className={`icon-button ${viewMode === 'list' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'} shadow-md`}
              title="List View"
            >
              <Bars2Icon className="w-6 h-6" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setViewMode('grid')}
              className={`icon-button ${viewMode === 'grid' ? 'bg-primary-500 text-white' : 'bg-gray-200 text-gray-600'} shadow-md`}
              title="Grid View"
            >
              <Squares2X2Icon className="w-6 h-6" />
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
              className={`
                input flex-1 px-4 py-3 rounded-xl
                ${isDarkMode
                  ? 'bg-gray-800/40 backdrop-blur-sm border-gray-700/50 text-gray-100 placeholder-gray-500'
                  : 'bg-white/80 backdrop-blur-sm border-gray-200 text-gray-900 placeholder-gray-400'
                }
                shadow-lg hover:shadow-xl
                transition-all duration-200
                focus:ring-2 focus:ring-primary-500/50 focus:border-primary-500
                outline-none border
              `}
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowAddModal(true)}
              className={`
                px-6 py-3 rounded-xl font-medium
                flex items-center gap-2
                shadow-lg hover:shadow-xl
                transition-all duration-200
                ${isDarkMode
                  ? 'bg-primary-500/80 hover:bg-primary-500 text-white'
                  : 'bg-primary-500 hover:bg-primary-600 text-white'
                }
              `}
            >
              <PlusIcon className="w-5 h-5" />
              Add Task
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
              initial={{ opacity: 0, height: 0, marginBottom: 0 }}
              animate={{
                opacity: 1,
                height: "auto",
                marginBottom: 24 // equivalent to mb-6
              }}
              exit={{
                opacity: 0,
                height: 0,
                marginBottom: 0
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                opacity: { duration: 0.2 }
              }}
              className="overflow-hidden"
            >
              <div className="card p-6 shadow-lg rounded-lg bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-700">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Category</label>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value as Category | 'all')}
                      className="input shadow-md hover:shadow-lg transition-all rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
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
                      className="input shadow-md hover:shadow-lg transition-all rounded-lg border border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-primary-500 focus:outline-none"
                    >
                      <option value="all">All Priorities</option>
                      <option value="low">Low</option>
                      <option value="medium">Medium</option>
                      <option value="high">High</option>
                    </select>
                  </div>
                </div>
                <motion.form
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  onSubmit={handleAddTag}
                  className="mt-3"
                >
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      placeholder="Add a tag..."
                      className={`
                        flex-1 px-3 py-2 text-sm rounded-md border
                        ${isDarkMode
                          ? 'bg-gray-800 text-gray-100 placeholder-gray-500 border-gray-700 focus:ring-primary-500'
                          : 'bg-white text-gray-900 placeholder-gray-400 border-gray-300 focus:ring-primary-500'
                        }
                        focus:outline-none focus:ring-2 transition-all
                      `}
                    />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-1 px-3 py-2 text-sm font-medium text-white bg-primary-500 rounded-md hover:bg-primary-600 transition-colors"
                    >
                      <PlusSmallIcon className="w-4 h-4" />
                      Add
                    </button>
                  </div>
                </motion.form>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {isLoading ? (
          <div className="flex justify-center items-center h-[calc(100vh-400px)]">
            <LoadingSpinner isDarkMode={isDarkMode} />
          </div>
        ) : viewMode === 'list' ? (
          // List view with drag-to-reorder
          <Reorder.Group axis="y" values={todos} onReorder={setTodos} className="space-y-4">
            {filteredTodos.map((todo) => (
              <Reorder.Item key={todo.id} value={todo}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 20 }}
                  transition={{ duration: 0.3 }}
                  className="todo-item"
                >
                  <div className="bg-gray-800/40 backdrop-blur-sm rounded-xl p-4 shadow-lg border border-gray-700/50">
                    <TodoItem
                      todo={todo}
                      onToggle={handleToggleTodo}
                      onDelete={handleDeleteTodo}
                      onUpdate={handleUpdateTodo}
                      onViewDetails={handleViewDetails}
                    />
                  </div>
                </motion.div>
              </Reorder.Item>
            ))}
          </Reorder.Group>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredTodos.map((todo) => (
              <motion.div
                key={todo.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`
                  group flex flex-col h-full
                  ${isDarkMode
                    ? 'bg-gray-800/40 backdrop-blur-sm border-gray-700/50'
                    : 'bg-white/80 backdrop-blur-sm border-gray-200/50'
                  }
                  rounded-xl p-5 shadow-lg
                  border transition-all duration-200
                  hover:shadow-xl hover:-translate-y-1
                `}
              >
                {/* Header Section */}
                <div className="flex items-center justify-between mb-4">
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => handleToggleTodo(todo.id)}
                    className={`flex-shrink-0 transition-colors ${todo.completed ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'
                      }`}
                  >
                    {todo.completed ? (
                      <CheckCircleSolidIcon className="w-6 h-6" />
                    ) : (
                      <CheckCircleIcon className="w-6 h-6" />
                    )}
                  </motion.button>
                  <div className="flex items-center gap-2">
                    <span className={`
                      px-2.5 py-1 text-xs font-medium rounded-full
                      ${priorityColors[todo.priority]?.bg || defaultColors.bg}
                      ${priorityColors[todo.priority]?.text || defaultColors.text}
                    `}>
                      {todo.priority}
                    </span>
                  </div>
                </div>

                {/* Content Section */}
                <div className="flex-1 min-h-0">
                  <h3 className={`text-lg font-medium mb-3 line-clamp-2 ${todo.completed
                    ? 'text-gray-400 line-through'
                    : isDarkMode ? 'text-gray-100' : 'text-gray-900'
                    }`}>
                    {todo.text}
                  </h3>

                  <div className="space-y-3">
                    {/* Category Tag */}
                    <div className="flex items-center gap-2">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 text-xs font-medium rounded-full
                        ${categoryColors[todo.category]?.bg || defaultColors.bg}
                        ${categoryColors[todo.category]?.text || defaultColors.text}
                      `}>
                        {todo.category}
                      </span>
                    </div>

                    {/* Tags */}
                    {todo.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {todo.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className={`
                              inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full
                              ${isDarkMode
                                ? 'bg-gray-700/50 text-gray-300'
                                : 'bg-gray-100 text-gray-600'
                              }
                            `}
                          >
                            #{tag}
                          </span>
                        ))}
                        {todo.tags.length > 2 && (
                          <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-600 text-white">
                            +{todo.tags.length - 2}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer Section */}
                <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700/50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {todo.dueDate && (
                        <span className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                          <CalendarIcon className="w-4 h-4 mr-1" />
                          {new Date(todo.dueDate).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleViewDetails(todo.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="View Details"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleEditTodo(todo.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-blue-500 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Edit"
                      >
                        <PencilIcon className="w-4 h-4" />
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => handleDeleteTodo(todo.id)}
                        className="p-1.5 rounded-full text-gray-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {filteredTodos.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className={`text-center py-12 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
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

      {editingTodo && (
        <TodoEditModal
          todo={editingTodo}
          isOpen={true}
          onClose={() => setEditingTodo(null)}
          onUpdate={handleUpdateTodo}
        />
      )}

      {showAddModal && (
        <AddTodoModal
          isOpen={showAddModal}
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddNewTodo}
        />
      )}
    </div>
  );
};