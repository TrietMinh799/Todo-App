import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  TrashIcon, 
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  XMarkIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import type { Todo, Priority, Category } from './TodoList';
import { useTheme } from '../contexts/ThemeContext';

interface TodoItemProps extends Todo {
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

const priorityColors: Record<Priority, { bg: string; text: string }> = {
  low: { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400' },
  medium: { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
  high: { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
};

const categoryColors: Record<Category, { bg: string; text: string }> = {
  personal: { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
  work: { bg: 'bg-purple-100 dark:bg-purple-900/30', text: 'text-purple-700 dark:text-purple-400' },
  shopping: { bg: 'bg-pink-100 dark:bg-pink-900/30', text: 'text-pink-700 dark:text-pink-400' },
  health: { bg: 'bg-emerald-100 dark:bg-emerald-900/30', text: 'text-emerald-700 dark:text-emerald-400' },
};

export const TodoItem: React.FC<TodoItemProps> = ({
  id,
  text,
  completed,
  category,
  priority,
  dueDate,
  subtasks,
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const { isDarkMode, currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');

  const handleEdit = () => {
    if (isEditing) {
      onUpdate(id, { text: editedText });
    }
    setIsEditing(!isEditing);
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const newSubtaskObj = {
      id: Date.now().toString(),
      text: newSubtask.trim(),
      completed: false,
    };

    onUpdate(id, { subtasks: [...subtasks, newSubtaskObj] });
    setNewSubtask('');
  };

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    onUpdate(id, { subtasks: updatedSubtasks });
  };

  const deleteSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.filter((subtask) => subtask.id !== subtaskId);
    onUpdate(id, { subtasks: updatedSubtasks });
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`rounded-xl overflow-hidden ${
        isDarkMode ? 'bg-gray-800' : 'bg-white'
      } shadow-lg border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
      style={{
        backgroundColor: isDarkMode ? currentTheme.colors.surface : 'white',
        borderColor: isDarkMode ? currentTheme.colors.border : '#e5e7eb',
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggle(id)}
            className={`mt-1 ${completed ? 'text-green-500' : isDarkMode ? 'text-gray-600' : 'text-gray-400'}`}
            style={{ color: completed ? currentTheme.colors.success : isDarkMode ? currentTheme.colors.textSecondary : '#9ca3af' }}
          >
            {completed ? <CheckCircleSolidIcon className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
          </motion.button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className={`w-full bg-transparent border-b ${
                  isDarkMode ? 'border-gray-600 text-white' : 'border-gray-300 text-gray-900'
                } focus:outline-none focus:border-blue-500`}
                style={{
                  borderColor: isDarkMode ? currentTheme.colors.border : '#d1d5db',
                  color: isDarkMode ? currentTheme.colors.text : '#111827',
                }}
                autoFocus
              />
            ) : (
              <div 
                className={`text-lg ${completed ? 'line-through text-gray-500' : isDarkMode ? 'text-gray-200' : 'text-gray-900'}`}
                style={{
                  color: completed 
                    ? isDarkMode ? currentTheme.colors.textSecondary : '#6b7280' 
                    : isDarkMode ? currentTheme.colors.text : '#111827',
                }}
              >
                {text}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium ${categoryColors[category].bg} ${categoryColors[category].text}`}
                style={{
                  backgroundColor: isDarkMode 
                    ? `${currentTheme.colors.primary}20` 
                    : categoryColors[category].bg.split(' ')[0].replace('bg-', ''),
                  color: isDarkMode 
                    ? currentTheme.colors.primary 
                    : categoryColors[category].text.split(' ')[0].replace('text-', ''),
                }}
              >
                {category}
              </span>
              <span 
                className={`px-2 py-1 rounded-full text-xs font-medium ${priorityColors[priority].bg} ${priorityColors[priority].text}`}
                style={{
                  backgroundColor: isDarkMode 
                    ? `${currentTheme.colors[priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'success']}20` 
                    : priorityColors[priority].bg.split(' ')[0].replace('bg-', ''),
                  color: isDarkMode 
                    ? currentTheme.colors[priority === 'high' ? 'error' : priority === 'medium' ? 'warning' : 'success'] 
                    : priorityColors[priority].text.split(' ')[0].replace('text-', ''),
                }}
              >
                {priority}
              </span>
              {dueDate && (
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                  style={{
                    backgroundColor: isDarkMode ? `${currentTheme.colors.secondary}20` : '#f3f4f6',
                    color: isDarkMode ? currentTheme.colors.secondary : '#4b5563',
                  }}
                >
                  {new Date(dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {subtasks.length > 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSubtasks(!showSubtasks)}
                className={`mt-2 flex items-center gap-1 text-sm ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  color: isDarkMode ? currentTheme.colors.textSecondary : '#6b7280',
                }}
              >
                {showSubtasks ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
              </motion.button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEdit}
              className={`p-1 rounded-full ${
                isDarkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
              style={{
                color: isDarkMode ? currentTheme.colors.textSecondary : '#6b7280',
              }}
            >
              <PencilIcon className="w-5 h-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(id)}
              className={`p-1 rounded-full ${
                isDarkMode ? 'hover:bg-red-500/20 text-red-400' : 'hover:bg-red-100 text-red-500'
              }`}
              style={{
                color: isDarkMode ? currentTheme.colors.error : '#ef4444',
              }}
            >
              <TrashIcon className="w-5 h-5" />
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {showSubtasks && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pl-9"
            >
              <form onSubmit={handleAddSubtask} className="mb-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a subtask..."
                    className={`flex-1 px-3 py-1.5 rounded-lg text-sm ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    style={{
                      backgroundColor: isDarkMode ? currentTheme.colors.surface : '#f9fafb',
                      borderColor: isDarkMode ? currentTheme.colors.border : '#e5e7eb',
                      color: isDarkMode ? currentTheme.colors.text : '#111827',
                    }}
                  />
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit"
                    className={`p-1.5 rounded-lg ${
                      isDarkMode ? 'bg-blue-600 text-white' : 'bg-blue-500 text-white'
                    }`}
                    style={{
                      backgroundColor: currentTheme.colors.primary,
                    }}
                  >
                    <PlusIcon className="w-4 h-4" />
                  </motion.button>
                </div>
              </form>

              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <motion.div
                    key={subtask.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className={`flex items-center gap-2 p-2 rounded-lg ${
                      isDarkMode ? 'bg-gray-700/50' : 'bg-gray-50'
                    }`}
                    style={{
                      backgroundColor: isDarkMode 
                        ? `${currentTheme.colors.surface}80` 
                        : '#f9fafb',
                    }}
                  >
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => toggleSubtask(subtask.id)}
                      className={subtask.completed ? 'text-green-500' : isDarkMode ? 'text-gray-500' : 'text-gray-400'}
                      style={{
                        color: subtask.completed 
                          ? currentTheme.colors.success 
                          : isDarkMode ? currentTheme.colors.textSecondary : '#9ca3af',
                      }}
                    >
                      {subtask.completed ? <CheckCircleSolidIcon className="w-5 h-5" /> : <CheckCircleIcon className="w-5 h-5" />}
                    </motion.button>
                    <span 
                      className={`flex-1 text-sm ${
                        subtask.completed ? 'line-through text-gray-500' : isDarkMode ? 'text-gray-300' : 'text-gray-700'
                      }`}
                      style={{
                        color: subtask.completed 
                          ? isDarkMode ? currentTheme.colors.textSecondary : '#6b7280' 
                          : isDarkMode ? currentTheme.colors.text : '#374151',
                      }}
                    >
                      {subtask.text}
                    </span>
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => deleteSubtask(subtask.id)}
                      className={`p-1 rounded-full ${
                        isDarkMode ? 'hover:bg-gray-600 text-gray-400' : 'hover:bg-gray-200 text-gray-500'
                      }`}
                      style={{
                        color: isDarkMode ? currentTheme.colors.textSecondary : '#6b7280',
                      }}
                    >
                      <XMarkIcon className="w-4 h-4" />
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}; 