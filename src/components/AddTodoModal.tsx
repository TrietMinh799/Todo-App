import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { Todo, Category, Priority } from './TodoList';
import { useTheme } from '../contexts/ThemeContext';

interface AddTodoModalProps {
    isOpen: boolean;
    onClose: () => void;
    onAdd: (todo: Omit<Todo, 'id' | 'createdAt'>) => void;
}

export const AddTodoModal: React.FC<AddTodoModalProps> = ({
    isOpen,
    onClose,
    onAdd,
}) => {
    const { isDarkMode } = useTheme();
    const [text, setText] = useState('');
    const [category, setCategory] = useState<Category>('personal');
    const [priority, setPriority] = useState<Priority>('medium');
    const [dueDate, setDueDate] = useState('');
    const [tags, setTags] = useState<string[]>([]);
    const [newTag, setNewTag] = useState('');

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onAdd({
            text,
            completed: false,
            category,
            priority,
            dueDate: dueDate || null,
            subtasks: [],
            reminder: {
                id: '',
                time: '30min',
                enabled: false,
            },
            tags,
        });
        onClose();
    };

    const handleAddTag = (e: React.FormEvent) => {
        e.preventDefault();
        if (newTag.trim() && !tags.includes(newTag.trim())) {
            setTags([...tags, newTag.trim()]);
            setNewTag('');
        }
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
                                    Add New Task
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
                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Task
                                </label>
                                <input
                                    type="text"
                                    value={text}
                                    onChange={(e) => setText(e.target.value)}
                                    placeholder="Enter task description"
                                    className="input w-full"
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Category
                                    </label>
                                    <select
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value as Category)}
                                        className="input w-full"
                                    >
                                        <option value="personal">Personal</option>
                                        <option value="work">Work</option>
                                        <option value="shopping">Shopping</option>
                                        <option value="health">Health</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Priority
                                    </label>
                                    <select
                                        value={priority}
                                        onChange={(e) => setPriority(e.target.value as Priority)}
                                        className="input w-full"
                                    >
                                        <option value="low">Low</option>
                                        <option value="medium">Medium</option>
                                        <option value="high">High</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Due Date
                                </label>
                                <input
                                    type="datetime-local"
                                    value={dueDate}
                                    onChange={(e) => setDueDate(e.target.value)}
                                    className="input w-full"
                                />
                            </div>

                            <div>
                                <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Tags
                                </label>
                                <div className="flex flex-wrap gap-2 mb-2">
                                    {tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-2 py-1 text-sm rounded-full bg-gray-200 dark:bg-gray-700"
                                        >
                                            #{tag}
                                            <button
                                                type="button"
                                                onClick={() => setTags(tags.filter(t => t !== tag))}
                                                className="ml-2 text-gray-500 hover:text-gray-700"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newTag}
                                        onChange={(e) => setNewTag(e.target.value)}
                                        placeholder="Add a tag"
                                        className="input flex-1"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddTag}
                                        className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg"
                                    >
                                        Add
                                    </button>
                                </div>
                            </div>

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
                                    Add Task
                                </button>
                            </div>
                        </form>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};