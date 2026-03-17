import React, {
  useEffect,
  useState,
  useCallback,
  useRef,
  useMemo,
} from "react";
import type { Todo } from "../types/todo";
import { todoApi } from "../services/api";
import TodoItem from "./TodoItem";
import TodoForm from "./TodoForm";
import { Loader2 } from "lucide-react";

const TodoList: React.FC = () => {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filter, setFilter] = useState<"all" | "active" | "completed">("all");

  const observerRef = useRef<IntersectionObserver | null>(null);
  const lastTodoRef = useRef<HTMLDivElement>(null);
  
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchTodos = useCallback(async (pageNum: number) => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      setLoading(true);
      const response = await todoApi.getAll(pageNum, 20);

      setTodos((prev) =>
        pageNum === 1 ? response.data : [...prev, ...response.data],
      );

      setHasMore(response.data.length === 20);
      setError(null);
    } catch (err) {
      const error = err as { name?: string; message?: string };
      
      if (error.name !== 'CanceledError' && error.message !== 'canceled') {
        setError("Failed to fetch todos");
        console.error(err);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTodos(1);
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [fetchTodos]);

  useEffect(() => {
    if (page > 1) {
      fetchTodos(page);
    }
  }, [page, fetchTodos]);

  useEffect(() => {
    if (loading) return;

    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver((entries) => {
      const firstEntry = entries[0];
      if (firstEntry?.isIntersecting && hasMore && !loading) {
        setPage((prev) => prev + 1);
      }
    }, {
      rootMargin: '100px',
    });

    if (lastTodoRef.current) {
      observerRef.current.observe(lastTodoRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [loading, hasMore]);

  const handleAddTodo = useCallback(async (title: string) => {
    try {
      const newTodo = await todoApi.create({ title });
      setTodos((prev) => [newTodo, ...prev]);
    } catch (err) {
      setError("Failed to add todo");
      console.error(err);
    }
  }, []);

  const handleToggleTodo = useCallback(
    async (id: number, completed: boolean) => {
      try {
        const updatedTodo = await todoApi.update(id, { completed });
        setTodos((prev) =>
          prev.map((todo) => (todo.id === id ? updatedTodo : todo)),
        );
      } catch (err) {
        setError("Failed to update todo");
        console.error(err);
      }
    },
    [],
  );

  const handleUpdateTodo = useCallback(async (id: number, title: string) => {
    try {
      const updatedTodo = await todoApi.update(id, { title });
      setTodos((prev) =>
        prev.map((todo) => (todo.id === id ? updatedTodo : todo)),
      );
    } catch (err) {
      setError("Failed to update todo");
      console.error(err);
    }
  }, []);

  const handleDeleteTodo = useCallback(async (id: number) => {
    try {
      await todoApi.delete(id);
      setTodos((prev) => prev.filter((todo) => todo.id !== id));
    } catch (err) {
      setError("Failed to delete todo");
      console.error(err);
    }
  }, []);

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case "active":
        return todos.filter((todo) => !todo.completed);
      case "completed":
        return todos.filter((todo) => todo.completed);
      default:
        return todos;
    }
  }, [todos, filter]);

  if (loading && page === 1) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8">Todo List</h1>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      <TodoForm onSubmit={handleAddTodo} />

      <div className="flex gap-2 mb-4">
        <button
          onClick={() => setFilter("all")}
          className={`px-3 py-1 rounded ${
            filter === "all" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter("active")}
          className={`px-3 py-1 rounded ${
            filter === "active" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Active
        </button>
        <button
          onClick={() => setFilter("completed")}
          className={`px-3 py-1 rounded ${
            filter === "completed" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
        >
          Completed
        </button>
      </div>
      
      {filteredTodos.length === 0 ? (
        <p className="text-center text-gray-500 py-8">No todos found.</p>
      ) : (
        <div className="space-y-2 max-h-[500px] overflow-y-auto">
          {filteredTodos.map((todo) => (
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={handleToggleTodo}
              onUpdate={handleUpdateTodo}
              onDelete={handleDeleteTodo}
            />
          ))}
        </div>
      )}

      {loading && page > 1 && (
        <div className="flex justify-center py-4">
          <Loader2 className="w-6 h-6 animate-spin text-blue-500" />
        </div>
      )}

      <div ref={lastTodoRef} />

      <div className="mt-4 text-sm text-gray-500">
        Total: {filteredTodos.length} todo
        {filteredTodos.length !== 1 ? "s" : ""}
        {filter !== "all" && ` (filtered from ${todos.length} total)`}
      </div>
    </div>
  );
};

export default TodoList;