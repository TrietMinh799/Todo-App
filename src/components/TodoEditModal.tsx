import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Todo, Category, Priority } from './TodoList';
import { useTheme } from '../contexts/ThemeContext';

interface TodoEditModalProps {
    todo: Todo;
    isOpen: boolean;
    onClose: () => void;
    onUpdate: (id: string, updates: Partial<Todo>) => void;
}

export const TodoEditModal: React.FC<TodoEditModalProps> = ({
    todo,
    isOpen,
    onClose,
    onUpdate,
}) => {
    const { isDarkMode } = useTheme();
    const [editedText, setEditedText] = useState(todo.text);
    const [editedCategory, setEditedCategory] = useState(todo.category);
    const [editedPriority, setEditedPriority] = useState(todo.priority);
    const [editedDueDate, setEditedDueDate] = useState(todo.dueDate || '');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onUpdate(todo.id, {
            text: editedText,
            category: editedCategory,
            priority: editedPriority,
            dueDate: editedDueDate || null,
        });
        onClose();
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className={`w-full max-w-md rounded-xl shadow-xl ${isDarkMode ? 'bg-gray-800' : 'bg-white'
                            } overflow-hidden`}
                    >
                        <div className={`p-4 border-b ${isDarkMode ? 'border-gray-700' : 'border-gray-200'
                            }`}>
                            <div className="flex items-center justify-between">
                                <h2 className={`text-xl font-semibold ${isDarkMode ? 'text-white' : 'text-gray-900'
                                    }`}>
                                    Edit Task
                                </h2>
                                <button
                                    onClick={onClose}
                                    className="p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"
                                >
                                    <XMarkIcon className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            {/* Task Text */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Task
                                </label>
                                <input
                                    type="text"
                                    value={editedText}
                                    onChange={(e) => setEditedText(e.target.value)}
                                    className="input w-full"
                                    required
                                />
                            </div>

                            {/* Category */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Category
                                </label>
                                <select
                                    value={editedCategory}
                                    onChange={(e) => setEditedCategory(e.target.value as Category)}
                                    className="input w-full"
                                >
                                    <option value="personal">Personal</option>
                                    <option value="work">Work</option>
                                    <option value="shopping">Shopping</option>
                                    <option value="health">Health</option>
                                </select>
                            </div>

                            {/* Priority */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Priority
                                </label>
                                <select
                                    value={editedPriority}
                                    onChange={(e) => setEditedPriority(e.target.value as Priority)}
                                    className="input w-full"
                                >
                                    <option value="low">Low</option>
                                    <option value="medium">Medium</option>
                                    <option value="high">High</option>
                                </select>
                            </div>

                            {/* Due Date */}
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Due Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={editedDueDate}
                                    onChange={(e) => setEditedDueDate(e.target.value)}
                                    className="input w-full"
                                />
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-end gap-3 mt-6">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className={`px-4 py-2 rounded-lg ${isDarkMode
                                            ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                                            : 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                                        }`}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600"
                                >
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};