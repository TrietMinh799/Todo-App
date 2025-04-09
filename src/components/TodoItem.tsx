import React, { useState, useCallback, memo, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircleIcon,
  TrashIcon,
  PencilIcon,
  XMarkIcon,
  BellIcon,
  BellSlashIcon,
  PlusSmallIcon,
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon, PlusCircleIcon } from '@heroicons/react/24/solid';
import type { Todo } from './TodoList';
import { useTheme } from '../contexts/ThemeContext';
import { Reminder } from './ReminderSettings';
import { EyeIcon } from '@heroicons/react/24/outline';
import { categoryColors, defaultColors, priorityColors } from '../categoryColors';

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
  onViewDetails: (id: string) => void;
}

export const TodoItem = memo<TodoItemProps>(({ todo, onToggle, onDelete, onUpdate, onViewDetails }) => {
  const { isDarkMode, currentTheme } = useTheme();
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(todo.text);
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

  const MAX_VISIBLE_TAGS = 3;
  const visibleTags = todo.tags.slice(0, MAX_VISIBLE_TAGS);
  const remainingCount = todo.tags.length - MAX_VISIBLE_TAGS;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -100 }}
      className={`group relative overflow-hidden rounded-xl border ${isDarkMode ? 'border-gray-700/50' : 'border-gray-200'
        } transition-all duration-200 hover:shadow-lg ${completed ? 'bg-opacity-50' : ''
        }`}
      style={containerStyle}
    >
      <div className="p-6">
        {/* Header Section */}
        <div className="flex items-start gap-4">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onToggle(id)}
            className={`flex-shrink-0 transition-colors ${completed ? 'text-primary-500' : 'text-gray-400 hover:text-primary-500'
              }`}
          >
            {completed ? (
              <CheckCircleSolidIcon className="w-6 h-6" />
            ) : (
              <CheckCircleIcon className="w-6 h-6" />
            )}
          </motion.button>

          <div className="flex-1 min-w-0">
            {/* Title */}
            {isEditing ? (
              <input
                type="text"
                value={editedText}
                onChange={(e) => setEditedText(e.target.value)}
                className="w-full px-2 py-1 text-lg bg-transparent border-b-2 border-primary-500 focus:outline-none"
                autoFocus
              />
            ) : (
              <h3
                className={`text-lg font-medium truncate ${completed ? 'text-gray-400 line-through' : ''
                  }`}
                style={textStyle}
              >
                {text}
              </h3>
            )}

            {/* Metadata */}
            <div className="flex flex-wrap items-center gap-2 mt-2">
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryColors[category]?.bg || defaultColors.bg
                } ${categoryColors[category]?.text || defaultColors.text}`}>
                {category}
              </span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityColors[priority]?.bg || defaultColors.bg
                } ${priorityColors[priority]?.text || defaultColors.text}`}>
                {priority}
              </span>
              {dueDate && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300">
                  {new Date(dueDate).toLocaleDateString()}
                </span>
              )}
            </div>

            {/* Tags */}
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-3">
                {visibleTags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300"
                  >
                    #{tag}
                    <button
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    >
                      <XMarkIcon className="w-3 h-3" />
                    </button>
                  </span>
                ))}
                {remainingCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-gray-600 text-white">
                    +{remainingCount}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <ActionButton onClick={toggleReminder} title={reminder.enabled ? "Disable Reminder" : "Enable Reminder"}>
              {reminder.enabled ? <BellIcon className="w-4 h-4" /> : <BellSlashIcon className="w-4 h-4" />}
            </ActionButton>
            <ActionButton onClick={handleEdit} title="Edit">
              <PencilIcon className="w-4 h-4" />
            </ActionButton>
            <ActionButton onClick={() => onDelete(id)} title="Delete">
              <TrashIcon className="w-4 h-4" />
            </ActionButton>
            <ActionButton onClick={() => onViewDetails(todo.id)} title="View Details">
              <EyeIcon className="w-4 h-4" />
            </ActionButton>
          </div>
        </div>

        {/* Add Tag Button */}
        {!showTagInput && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowTagInput(true)}
            className="mt-3 inline-flex items-center gap-1 text-xs text-gray-500 hover:text-primary-500 transition-colors"
          >
            <PlusCircleIcon className="w-4 h-4" />
            Add Tag
          </motion.button>
        )}

        {/* Tag Input Form */}
        <AnimatePresence>
          {showTagInput && (
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
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
});

// Add a reusable ActionButton component
const ActionButton: React.FC<{
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ onClick, title, children }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
    title={title}
  >
    {children}
  </motion.button>
);

// Add display name for better debugging
TodoItem.displayName = 'TodoItem';