import axios from "axios";
import type { Todo, TodoCreate, TodoUpdate } from "../types/todo";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const pendingRequests = new Map();

class APICache {
  private cache: Map<string, { data: unknown; timestamp: number }> = new Map();
  private TTL = 5 * 60 * 1000;

  set(key: string, data: unknown) {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;

    if (Date.now() - item.timestamp > this.TTL) {
      this.cache.delete(key);
      return null;
    }

    return item.data;
  }

  clear() {
    this.cache.clear();
  }

  invalidate(key: string) {
    this.cache.delete(key);
  }
}

const cache = new APICache();

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const requestKey = `${config.method}-${config.url}`;
  if (pendingRequests.has(requestKey)) {
    pendingRequests.get(requestKey).abort();
  }

  const controller = new AbortController();
  config.signal = controller.signal;
  pendingRequests.set(requestKey, controller);

  return config;
});

api.interceptors.response.use(
  (response) => {
    const requestKey = `${response.config.method}-${response.config.url}`;
    pendingRequests.delete(requestKey);
    return response;
  },
  (error) => {
    if (error.config) {
      const requestKey = `${error.config.method}-${error.config.url}`;
      pendingRequests.delete(requestKey);
    }
    return Promise.reject(error);
  },
);

export const todoApi = {
  getAll: async (
    page = 1,
    limit = 10,
  ): Promise<{ data: Todo[]; meta: unknown }> => {
    const cacheKey = `todos-${page}-${limit}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return cached as { data: Todo[]; meta: unknown };
    }

    const response = await api.get("/todos", {
      params: { page, limit },
    });

    cache.set(cacheKey, response.data);
    return response.data;
  },

  getById: async (id: number): Promise<Todo> => {
    const cacheKey = `todo-${id}`;
    const cached = cache.get(cacheKey);

    if (cached) {
      return cached as Todo;
    }

    const response = await api.get(`/todos/${id}`);
    cache.set(cacheKey, response.data);
    return response.data;
  },

  create: async (todo: TodoCreate): Promise<Todo> => {
    const response = await api.post("/todos", todo);

    cache.invalidate("todos-1-10");
    return response.data;
  },

  createBatch: async (
    todos: TodoCreate[],
  ): Promise<{ message: string; count: number }> => {
    const response = await api.post("/todos", todos);
    cache.clear();
    return response.data;
  },

  update: async (id: number, todo: TodoUpdate): Promise<Todo> => {
    const response = await api.put(`/todos/${id}`, todo);

    cache.invalidate(`todo-${id}`);
    cache.invalidate("todos-1-10");
    return response.data;
  },

  delete: async (id: number, permanent = false): Promise<void> => {
    await api.delete(`/todos/${id}`, {
      params: { permanent },
    });

    cache.invalidate(`todo-${id}`);
    cache.invalidate("todos-1-10");
  },
};
