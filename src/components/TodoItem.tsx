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

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onToggleExpand?: (id: string) => void; // Add this line
  isExpanded?: boolean; // Add this line
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

// Default color styles for unknown categories or priorities
const defaultColors = {
  bg: 'bg-gray-100 dark:bg-gray-900/30',
  text: 'text-gray-700 dark:text-gray-400'
};

// Memoize the TodoItem component
export const TodoItem = memo<TodoItemProps>(({
  todo,
  onToggle,
  onDelete,
  onUpdate,
  onToggleExpand,
  isExpanded,
}) => {
  const { isDarkMode, currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);
  const [newSubtask, setNewSubtask] = useState('');
  const [showReminderSettings, setShowReminderSettings] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [newTag, setNewTag] = useState('');

  const {
    id,
    text,
    completed,
    category,
    priority,
    dueDate,
    subtasks,
    reminder = defaultReminder,
    tags = [],
  } = todo;

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
      className="todo-item relative mb-4"
      style={{
        backgroundColor: isDarkMode ? currentTheme.colors.surface : 'white',
        borderColor: isDarkMode ? currentTheme.colors.border : '#e5e7eb',
        borderRadius: '0.5rem',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        overflow: 'visible',
        marginBottom: isExpanded ? `${Math.max((subtasks.length + 1) * 50, 100)}px` : '16px',
        position: 'relative',
        zIndex: isExpanded ? 10 : 1
      }}
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggle(id)}
            className={`icon-button ${completed ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}
          >
            {completed ? <CheckCircleSolidIcon className="w-6 h-6" /> : <CheckCircleIcon className="w-6 h-6" />}
          </motion.button>

          <div className="flex-1 min-w-0">
            {isEditing ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="input w-full bg-transparent border-b border-gray-300 dark:border-gray-600 focus:border-primary-500"
                autoFocus
              />
            ) : (
              <div
                className={`text-lg font-medium ${completed
                    ? 'line-through text-gray-500 dark:text-gray-400'
                    : 'text-gray-900 dark:text-white'
                  }`}
              >
                {text}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-2">
              <span className={`badge-category`}>
                {category}
              </span>
              <span className={`badge-priority badge-priority-${priority}`}>
                {priority}
              </span>
              {dueDate && (
                <span className="badge-date">
                  {new Date(dueDate).toLocaleDateString()}
                </span>
              )}
              {reminder.enabled && dueDate && (
                <span className="badge-reminder">
                  Reminder: {reminder.time}
                </span>
              )}
            </div>

            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="badge-tag flex items-center gap-1"
                  >
                    {tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setShowReminderSettings(!showReminderSettings)}
              className={`icon-button ${reminder.enabled
                  ? 'text-blue-500'
                  : 'text-gray-400 dark:text-gray-500'
                }`}
            >
              {reminder.enabled ? <BellIcon className="w-5 h-5" /> : <BellSlashIcon className="w-5 h-5" />}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleEdit}
              className="icon-button text-gray-400 dark:text-gray-500"
            >
              <PencilIcon className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onDelete(id)}
              className="icon-button text-gray-400 dark:text-gray-500"
            >
              <TrashIcon className="w-5 h-5" />
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => onToggleExpand && onToggleExpand(id)}
              className="icon-button text-gray-400 dark:text-gray-500"
            >
              {isExpanded ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ 
                opacity: 1, 
                height: 'auto',
                transition: { duration: 0.3 }
              }}
              exit={{ 
                opacity: 0, 
                height: 0,
                transition: { duration: 0.2 }
              }}
              className="mt-4 pl-8 space-y-3 pb-4"
            >
              <div className="space-y-2">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className="flex items-center gap-2 p-2 bg-gray-100 dark:bg-gray-800 rounded"
                  >
                    <button
                      onClick={() => toggleSubtask(subtask.id)}
                      className={`${subtask.completed ? 'text-primary-500' : 'text-gray-400'}`}
                    >
                      {subtask.completed ? (
                        <CheckCircleSolidIcon className="w-5 h-5" />
                      ) : (
                        <CheckCircleIcon className="w-5 h-5" />
                      )}
                    </button>
                    <span className={`flex-1 ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                      {subtask.text}
                    </span>
                    <button
                      onClick={() => deleteSubtask(subtask.id)}
                      className="text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300"
                    >
                      <XMarkIcon className="w-5 h-5" />
                    </button>
                  </div>
                ))}
              </div>

              <form onSubmit={handleAddSubtask} className="mt-2">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    placeholder="Add a subtask..."
                    className="input flex-1"
                  />
                  <button
                    type="submit"
                    className="btn-primary flex items-center gap-1 px-3"
                  >
                    <PlusSmallIcon className="w-5 h-5" />
                    Add
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showReminderSettings && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4"
            >
              <ReminderSettings
                reminder={reminder}
                onUpdate={handleReminderUpdate}
                onClose={() => setShowReminderSettings(false)}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTagInput && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleAddTag}
              className="mt-2"
            >
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  className="input flex-1"
                />
                <button
                  type="submit"
                  className="btn-primary flex items-center gap-1 px-3"
                >
                  <PlusSmallIcon className="w-5 h-5" />
                  Add
                </button>
              </div>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// Add display name for better debugging
TodoItem.displayName = 'TodoItem';