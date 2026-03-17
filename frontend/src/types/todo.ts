export interface Todo {
  id: number;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export type TodoCreate = Pick<Todo, 'title'>;
export type TodoUpdate = Partial<Pick<Todo, 'title' | 'completed'>>;