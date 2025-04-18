import { XMarkIcon } from '@heroicons/react/24/outline';
import { Todo, Category, Priority } from './TodoList';

interface TodoEditFormProps {
  todo: Todo;
  onUpdate: (id: string, updates: Partial<Todo>) => void;
  onClose: () => void;
  isDarkMode: boolean;
}

const TodoEditForm = ({ todo, onUpdate, onClose, isDarkMode }: TodoEditFormProps) => {
  return (
    <div className={`p-4 rounded-lg ${isDarkMode ? 'bg-gray-800' : 'bg-white'} shadow-lg`}>
      <div className="flex justify-between items-center mb-4">
        <h3 className={`text-lg font-semibold ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          Edit Todo
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
        >
          <XMarkIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Category
          </label>
          <select
            value={todo.category}
            onChange={(e) => onUpdate(todo.id, { category: e.target.value as Category })}
            className={`input w-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
          >
            <option value="work">Work</option>
            <option value="personal">Personal</option>
            <option value="shopping">Shopping</option>
            <option value="other">Other</option>
          </select>
        </div>

        <div>
          <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Priority
          </label>
          <select
            value={todo.priority}
            onChange={(e) => onUpdate(todo.id, { priority: e.target.value as Priority })}
            className={`input w-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div>
          <label className={`block mb-2 ${isDarkMode ? 'text-white' : 'text-gray-700'}`}>
            Due Date
          </label>
          <input
            type="date"
            value={todo.dueDate ? new Date(todo.dueDate).toISOString().split('T')[0] : ''}
            onChange={(e) => onUpdate(todo.id, { dueDate: e.target.value || null })}
            className={`input w-full ${isDarkMode ? 'bg-gray-700 text-white' : 'bg-white'}`}
          />
        </div>
      </div>
    </div>
  );
};

export default TodoEditForm;