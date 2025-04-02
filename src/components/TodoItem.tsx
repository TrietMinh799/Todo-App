import React, { useState, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircleIcon, 
  TrashIcon, 
  PencilIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  PlusIcon,
  XMarkIcon,
  BellIcon,
  BellSlashIcon,
  TagIcon,
  PlusSmallIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import type { Todo, Priority, Category } from './TodoList';
import { useTheme } from '../contexts/ThemeContext';
import { ReminderSettings, Reminder } from './ReminderSettings';

// Default reminder object
const defaultReminder: Reminder = {
  id: '',
  time: '30min',
  enabled: false,
};

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

// Memoize the TodoItem component
export const TodoItem = memo<TodoItemProps>(({
  id,
  text,
  completed,
  category,
  priority,
  dueDate,
  subtasks,
  reminder = defaultReminder,
  tags = [],
  onToggle,
  onDelete,
  onUpdate,
}) => {
  const { isDarkMode, currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  // Memoize handlers
  const handleEdit = useCallback(() => {
    if (isEditing) {
      onUpdate(id, { text: editedText });
    }
    setIsEditing(!isEditing);
  }, [isEditing, editedText, id, onUpdate]);

  const handleAddSubtask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const newSubtaskObj = {
      id: Date.now().toString(),
      text: newSubtask.trim(),
      completed: false,
    };

    onUpdate(id, { subtasks: [...subtasks, newSubtaskObj] });
    setNewSubtask('');
  }, [newSubtask, id, subtasks, onUpdate]);

  const toggleSubtask = useCallback((subtaskId: string) => {
    const updatedSubtasks = subtasks.map((subtask) =>
      subtask.id === subtaskId ? { ...subtask, completed: !subtask.completed } : subtask
    );
    onUpdate(id, { subtasks: updatedSubtasks });
  }, [id, subtasks, onUpdate]);

  const deleteSubtask = useCallback((subtaskId: string) => {
    const updatedSubtasks = subtasks.filter((subtask) => subtask.id !== subtaskId);
    onUpdate(id, { subtasks: updatedSubtasks });
  }, [id, subtasks, onUpdate]);

  const handleReminderUpdate = useCallback((updatedReminder: Reminder) => {
    onUpdate(id, { 
      reminder: {
        ...updatedReminder,
        id: reminder.id || `${id}-reminder`,
      }
    });
  }, [id, reminder.id, onUpdate]);

  const toggleReminder = useCallback(() => {
    onUpdate(id, {
      reminder: {
        ...reminder,
        id: reminder.id || `${id}-reminder`,
        enabled: !reminder.enabled,
      },
    });
  }, [id, reminder, onUpdate]);

  const handleAddTag = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newTag.trim()) return;

    const tagToAdd = newTag.trim().toLowerCase();
    if (!tags.includes(tagToAdd)) {
      onUpdate(id, { tags: [...tags, tagToAdd] });
    }
    setNewTag('');
    setShowTagInput(false);
  }, [newTag, id, tags, onUpdate]);

  const handleRemoveTag = useCallback((tagToRemove: string) => {
    onUpdate(id, { tags: tags.filter(tag => tag !== tagToRemove) });
  }, [id, tags, onUpdate]);

  // Memoize styles
  const containerStyle = useMemo(() => ({
    backgroundColor: isDarkMode ? currentTheme.colors.surface : 'white',
    borderColor: isDarkMode ? currentTheme.colors.border : '#e5e7eb',
  }), [isDarkMode, currentTheme.colors.surface, currentTheme.colors.border]);

  const textStyle = useMemo(() => ({
    color: completed 
      ? isDarkMode ? currentTheme.colors.textSecondary : '#6b7280' 
      : isDarkMode ? currentTheme.colors.text : '#111827',
  }), [completed, isDarkMode, currentTheme.colors.text, currentTheme.colors.textSecondary]);

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
      style={containerStyle}
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
                style={textStyle}
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
              {reminder.enabled && dueDate && (
                <span 
                  className={`px-2 py-1 rounded-full text-xs font-medium ${
                    isDarkMode ? 'bg-blue-900/30 text-blue-400' : 'bg-blue-100 text-blue-700'
                  }`}
                  style={{
                    backgroundColor: isDarkMode ? `${currentTheme.colors.primary}20` : '#dbeafe',
                    color: isDarkMode ? currentTheme.colors.primary : '#1d4ed8',
                  }}
                >
                  <BellIcon className="w-3 h-3 inline mr-1" />
                  {reminder.time === 'custom' 
                    ? `${reminder.customTime} min before` 
                    : reminder.time === '5min' ? '5 min before' :
                      reminder.time === '15min' ? '15 min before' :
                      reminder.time === '30min' ? '30 min before' :
                      reminder.time === '1hour' ? '1 hour before' :
                      '1 day before'}
                </span>
              )}
              {tags.map((tag) => (
                <span
                  key={tag}
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'
                  }`}
                  style={{
                    backgroundColor: isDarkMode ? `${currentTheme.colors.secondary}20` : '#f3f4f6',
                    color: isDarkMode ? currentTheme.colors.secondary : '#4b5563',
                  }}
                >
                  <TagIcon className="w-3 h-3" />
                  {tag}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveTag(tag);
                    }}
                    className="ml-1 hover:text-red-500"
                  >
                    ×
                  </button>
                </span>
              ))}
              {showTagInput ? (
                <form onSubmit={handleAddTag} className="inline-flex">
                  <input
                    type="text"
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    placeholder="Add tag..."
                    className={`px-2 py-1 text-xs rounded-full ${
                      isDarkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-gray-50 text-gray-900 border-gray-200'
                    } border focus:outline-none focus:ring-1 focus:ring-blue-500`}
                    style={{
                      backgroundColor: isDarkMode ? currentTheme.colors.surface : '#f9fafb',
                      borderColor: isDarkMode ? currentTheme.colors.border : '#e5e7eb',
                      color: isDarkMode ? currentTheme.colors.text : '#111827',
                    }}
                    autoFocus
                    onBlur={() => {
                      if (!newTag) setShowTagInput(false);
                    }}
                  />
                </form>
              ) : (
                <button
                  onClick={() => setShowTagInput(true)}
                  className={`px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${
                    isDarkMode ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                  style={{
                    backgroundColor: isDarkMode ? `${currentTheme.colors.secondary}20` : '#f3f4f6',
                    color: isDarkMode ? currentTheme.colors.secondary : '#4b5563',
                  }}
                >
                  <PlusSmallIcon className="w-4 h-4" />
                  Add Tag
                </button>
              )}
            </div>

            <div className="mt-4">
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

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setShowSubtasks(!showSubtasks)}
                className={`flex items-center gap-1 text-sm ${
                  isDarkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-500 hover:text-gray-700'
                }`}
                style={{
                  color: isDarkMode ? currentTheme.colors.textSecondary : '#6b7280',
                }}
              >
                {showSubtasks ? <ChevronUpIcon className="w-4 h-4" /> : <ChevronDownIcon className="w-4 h-4" />}
                {subtasks.length} subtask{subtasks.length !== 1 ? 's' : ''}
              </motion.button>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {dueDate && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowReminderSettings(!showReminderSettings)}
                className={`p-1 rounded-full ${
                  reminder.enabled
                    ? isDarkMode ? 'text-blue-400 hover:bg-blue-900/30' : 'text-blue-500 hover:bg-blue-100'
                    : isDarkMode ? 'text-gray-400 hover:bg-gray-700' : 'text-gray-500 hover:bg-gray-100'
                }`}
                style={{
                  color: reminder.enabled
                    ? currentTheme.colors.primary
                    : isDarkMode ? currentTheme.colors.textSecondary : '#6b7280',
                }}
              >
                {reminder.enabled ? <BellIcon className="w-5 h-5" /> : <BellSlashIcon className="w-5 h-5" />}
              </motion.button>
            )}
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
          {showReminderSettings && (
            <ReminderSettings
              reminder={reminder}
              onUpdate={handleReminderUpdate}
              onClose={() => setShowReminderSettings(false)}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// Add display name for better debugging
TodoItem.displayName = 'TodoItem'; 