import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XMarkIcon,
  CheckCircleIcon,
  BellIcon,
  BellSlashIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';
import type { Todo } from './TodoList';
import { useTheme } from '../contexts/ThemeContext';

interface TodoDetailsModalProps {
  todo: Todo;
  isOpen: boolean;
  onClose: () => void;
  onToggle: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
}

export const TodoDetailsModal: React.FC<TodoDetailsModalProps> = ({
  todo,
  isOpen,
  onClose,
  onToggle,
  onUpdate
}) => {
  const { isDarkMode, currentTheme } = useTheme();
  const [newSubtask, setNewSubtask] = useState('');

  const handleAddSubtask = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const newSubtaskObj = {
      id: Date.now().toString(),
      text: newSubtask.trim(),
      completed: false,
    };
    onUpdate(todo.id, { subtasks: [...todo.subtasks, newSubtaskObj] });
    setNewSubtask('');
  }, [newSubtask, onUpdate, todo]);

  // Handler to delete a subtask
  const handleDeleteSubtask = useCallback((subtaskId: string) => {
    const updatedSubtasks = todo.subtasks.filter(subtask => subtask.id !== subtaskId);
    onUpdate(todo.id, { subtasks: updatedSubtasks });
  }, [onUpdate, todo]);

  if (!isOpen) return null;

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className={`relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg shadow-xl ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-white text-gray-800'
              } border ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}
          >
            {/* Header */}
            <div className={`flex items-center justify-between p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <h2 className="text-xl font-semibold">Task Details</h2>
              <button
                onClick={onClose}
                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Title and completion status */}
              <div className="flex items-start gap-3">
                <button
                  onClick={() => onToggle(todo.id)}
                  className={`mt-1 ${todo.completed ? 'text-primary-500' : 'text-gray-400 dark:text-gray-500'}`}
                >
                  {todo.completed ?
                    <CheckCircleSolidIcon className="w-6 h-6" /> :
                    <CheckCircleIcon className="w-6 h-6" />
                  }
                </button>
                <div className="flex-1">
                  <h3
                    className={`text-2xl font-bold ${todo.completed ? 'line-through text-gray-500 dark:text-gray-400' : ''
                      }`}
                  >
                    {todo.text}
                  </h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                      }`}>
                      {todo.category}
                    </span>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${todo.priority === 'high' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                      todo.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                      {todo.priority}
                    </span>
                  </div>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Created</div>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5 text-gray-400" />
                    <span>{formatDate(todo.createdAt)}</span>
                  </div>
                </div>

                {todo.dueDate && (
                  <div className="space-y-1">
                    <div className="text-sm text-gray-500 dark:text-gray-400">Due Date</div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <span>{formatDate(todo.dueDate)}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Reminder */}
              {todo.dueDate && (
                <div className="space-y-1">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Reminder</div>
                  <div className="flex items-center gap-2">
                    {todo.reminder.enabled ? (
                      <>
                        <BellIcon className="w-5 h-5 text-blue-500" />
                        <span>
                          {todo.reminder.time === 'custom'
                            ? `${todo.reminder.customTime} minutes before due`
                            : `${todo.reminder.time} before due`}
                        </span>
                      </>
                    ) : (
                      <>
                        <BellSlashIcon className="w-5 h-5 text-gray-400" />
                        <span>No reminder set</span>
                      </>
                    )}
                  </div>
                </div>
              )}

              {/* Tags */}
              {todo.tags.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Tags</div>
                  <div className="flex flex-wrap gap-2">
                    {todo.tags.map(tag => (
                      <div key={tag} className={`flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${isDarkMode ? 'bg-gray-700' : 'bg-gray-200'
                        }`}>
                        <TagIcon className="w-3 h-3" />
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Subtasks */}
              {todo.subtasks.length > 0 && (
                <div className="space-y-2">
                  <div className="text-sm text-gray-500 dark:text-gray-400">Subtasks</div>
                  <AnimatePresence>
                    {todo.subtasks.map(subtask => (
                      <motion.div
                        key={subtask.id}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 10 }}
                        transition={{ duration: 0.3 }}
                        className={`flex items-center gap-2 p-2 rounded ${isDarkMode ? 'bg-gray-700/50' : 'bg-gray-100'}`}
                      >
                        <button
                          onClick={() => {
                            const updatedSubtasks = todo.subtasks.map(st =>
                              st.id === subtask.id ? { ...st, completed: !st.completed } : st
                            );
                            onUpdate(todo.id, { subtasks: updatedSubtasks });
                          }}
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
                          onClick={() => handleDeleteSubtask(subtask.id)}
                          className="text-red-500 hover:text-red-700"
                          title="Delete Subtask"
                        >
                          <XMarkIcon className="w-4 h-4" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
              <form onSubmit={handleAddSubtask} className="flex gap-2 mb-4">
                <input
                  type="text"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  placeholder="Add a new subtask"
                  className="input flex-1"
                />
                <button type="submit" className="btn-primary">
                  Add
                </button>
              </form>
            </div>

            {/* Footer */}
            <div className={`flex justify-end p-4 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
              }`}>
              <button
                onClick={onClose}
                className={`px-4 py-2 rounded-lg ${isDarkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-200 hover:bg-gray-300'
                  }`}
              >
                Close
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};