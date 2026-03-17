import React, { memo, useState, useCallback } from "react";
import { Trash2, Edit2, Check, X } from "lucide-react";
import type { Todo } from "../types/todo";

interface TodoItemProps {
  todo: Todo;
  onToggle: (id: number, completed: boolean) => void;
  onUpdate: (id: number, title: string) => void;
  onDelete: (id: number) => void;
}

const TodoItem: React.FC<TodoItemProps> = memo(
  ({ todo, onToggle, onUpdate, onDelete }) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editTitle, setEditTitle] = useState(todo.title);

    const handleToggle = useCallback(() => {
      onToggle(todo.id, !todo.completed);
    }, [todo.id, todo.completed, onToggle]);

    const handleUpdate = useCallback(() => {
      if (editTitle.trim() && editTitle !== todo.title) {
        onUpdate(todo.id, editTitle);
      }
      setIsEditing(false);
    }, [editTitle, todo.id, todo.title, onUpdate]);

    const handleCancel = useCallback(() => {
      setEditTitle(todo.title);
      setIsEditing(false);
    }, [todo.title]);

    const handleDelete = useCallback(() => {
      if (window.confirm("Are you sure you want to delete this todo?")) {
        onDelete(todo.id);
      }
    }, [todo.id, onDelete]);

    return (
      <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:shadow-sm transition-shadow will-change-transform">
        <input
          type="checkbox"
          checked={todo.completed}
          onChange={handleToggle}
          className="w-5 h-5 text-blue-500 rounded focus:ring-blue-500 cursor-pointer"
          aria-label={`Mark ${todo.title} as ${todo.completed ? "incomplete" : "complete"}`}
        />

        {isEditing ? (
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="flex-1 px-2 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
              onKeyPress={(e) => e.key === "Enter" && handleUpdate()}
            />
            <button
              onClick={handleUpdate}
              className="p-1 text-green-500 hover:text-green-600"
              aria-label="Save"
            >
              <Check size={20} />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-500 hover:text-red-600"
              aria-label="Cancel"
            >
              <X size={20} />
            </button>
          </div>
        ) : (
          <>
            <span
              className={`flex-1 truncate ${
                todo.completed ? "line-through text-gray-400" : "text-gray-700"
              }`}
              title={todo.title}
            >
              {todo.title}
            </span>
            <button
              onClick={() => setIsEditing(true)}
              className="p-1 text-blue-500 hover:text-blue-600"
              aria-label="Edit"
            >
              <Edit2 size={18} />
            </button>
            <button
              onClick={handleDelete}
              className="p-1 text-red-500 hover:text-red-600"
              aria-label="Delete"
            >
              <Trash2 size={18} />
            </button>
          </>
        )}
      </div>
    );
  },
);

TodoItem.displayName = "TodoItem";

export default TodoItem;
