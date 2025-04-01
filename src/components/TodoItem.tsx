import React, { useState } from 'react';
import { CheckCircleIcon, TrashIcon, PencilIcon, PlusIcon, CalendarIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';
import { Todo, Priority, Category } from './TodoList';
import { TodoEditForm } from './TodoEditForm';

interface TodoItemProps {
  id: string;
  text: string;
  completed: boolean;
  category: Category;
  priority: Priority;
  dueDate: string | null;
  subtasks: { id: string; text: string; completed: boolean; }[];
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  isDarkMode: boolean;
}

const priorityColors = {
  low: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  high: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
};

const categoryColors = {
  work: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  personal: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-300',
  shopping: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-300',
  other: 'bg-gray-100 text-gray-800 dark:bg-gray-700/50 dark:text-gray-300',
};

export const TodoItem = ({
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
  isDarkMode,
}: TodoItemProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState(text);
  const [newSubtask, setNewSubtask] = useState('');
  const [showSubtasks, setShowSubtasks] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  const handleEdit = () => {
    if (editedText.trim() && editedText !== text) {
      onUpdate(id, { text: editedText.trim() });
    }
    setIsEditing(false);
  };

  const addSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;

    const subtask = {
      id: Date.now().toString(),
      text: newSubtask.trim(),
      completed: false,
    };

    onUpdate(id, {
      subtasks: [...subtasks, subtask],
    });
    setNewSubtask('');
  };

  const toggleSubtask = (subtaskId: string) => {
    onUpdate(id, {
      subtasks: subtasks.map((subtask) =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      ),
    });
  };

  const deleteSubtask = (subtaskId: string) => {
    onUpdate(id, {
      subtasks: subtasks.filter((subtask) => subtask.id !== subtaskId),
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      className={`flex flex-col gap-2 p-4 rounded-lg shadow-sm backdrop-blur-sm ${
        isDarkMode ? 'bg-gray-800/50' : 'bg-white/50'
      } border ${
        isDarkMode ? 'border-gray-700' : 'border-gray-200'
      }`}
    >
      <div className="flex items-start gap-3">
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onToggle(id)}
          className={`flex-shrink-0 w-6 h-6 rounded-full border-2 transition-colors duration-200 ${
            completed
              ? 'bg-primary-500 border-primary-500'
              : 'border-gray-300 hover:border-primary-500'
          }`}
        >
          {completed && (
            <CheckCircleIcon className="w-6 h-6 text-white" />
          )}
        </motion.button>

        <div className="flex-grow">
          {isEditing ? (
            <motion.input
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              type="text"
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              onBlur={handleEdit}
              onKeyDown={(e) => e.key === 'Enter' && handleEdit()}
              autoFocus
              className={`w-full input ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
            />
          ) : (
            <div className="flex items-center gap-2">
              <motion.span
                className={`text-lg ${
                  completed
                    ? isDarkMode
                      ? 'text-gray-500 line-through'
                      : 'text-gray-400 line-through'
                    : isDarkMode
                    ? 'text-white'
                    : 'text-gray-800'
                }`}
              >
                {text}
              </motion.span>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setIsEditing(true)}
                className="p-1 text-gray-400 hover:text-primary-500 transition-colors duration-200"
              >
                <PencilIcon className="w-4 h-4" />
              </motion.button>
            </div>
          )}

          <div className="flex flex-wrap gap-2 mt-2">
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-2 py-1 rounded-full text-sm ${categoryColors[category]}`}
            >
              {category}
            </motion.span>
            <motion.span
              whileHover={{ scale: 1.05 }}
              className={`px-2 py-1 rounded-full text-sm ${priorityColors[priority]}`}
            >
              {priority}
            </motion.span>
            {dueDate && (
              <motion.span
                whileHover={{ scale: 1.05 }}
                className={`flex items-center gap-1 px-2 py-1 rounded-full text-sm ${
                  isDarkMode ? 'bg-gray-700/50 text-gray-300' : 'bg-gray-100 text-gray-700'
                }`}
              >
                <CalendarIcon className="w-4 h-4" />
                {new Date(dueDate).toLocaleDateString()}
              </motion.span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowEditForm(!showEditForm)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
            }`}
          >
            <Cog6ToothIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setShowSubtasks(!showSubtasks)}
            className={`p-2 rounded-lg ${
              isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
            }`}
          >
            {subtasks.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className={`absolute -top-1 -right-1 w-5 h-5 rounded-full text-xs flex items-center justify-center ${
                  isDarkMode ? 'bg-primary-500 text-white' : 'bg-primary-100 text-primary-800'
                }`}
              >
                {subtasks.length}
              </motion.span>
            )}
            <PlusIcon className="w-5 h-5" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(id)}
            className="p-2 text-gray-400 hover:text-red-500 transition-colors duration-200"
          >
            <TrashIcon className="w-5 h-5" />
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {showEditForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2"
          >
            <TodoEditForm
              todo={{ id, text, completed, category, priority, dueDate, subtasks, createdAt: new Date().toISOString() }}
              onUpdate={onUpdate}
              onClose={() => setShowEditForm(false)}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showSubtasks && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-2 pl-9"
          >
            <form onSubmit={addSubtask} className="flex gap-2 mb-2">
              <input
                type="text"
                value={newSubtask}
                onChange={(e) => setNewSubtask(e.target.value)}
                placeholder="Add a subtask..."
                className={`input flex-1 ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
              />
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="submit"
                className={`p-2 rounded-lg ${
                  isDarkMode ? 'bg-gray-700 text-white' : 'bg-white text-gray-700'
                }`}
              >
                <PlusIcon className="w-5 h-5" />
              </motion.button>
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
                >
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => toggleSubtask(subtask.id)}
                    className={`flex-shrink-0 w-4 h-4 rounded-full border-2 transition-colors duration-200 ${
                      subtask.completed
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-gray-300 hover:border-primary-500'
                    }`}
                  >
                    {subtask.completed && (
                      <CheckCircleIcon className="w-4 h-4 text-white" />
                    )}
                  </motion.button>
                  <span
                    className={`flex-grow ${
                      subtask.completed
                        ? isDarkMode
                          ? 'text-gray-500 line-through'
                          : 'text-gray-400 line-through'
                        : isDarkMode
                        ? 'text-white'
                        : 'text-gray-800'
                    }`}
                  >
                    {subtask.text}
                  </span>
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => deleteSubtask(subtask.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors duration-200"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </motion.button>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}; 