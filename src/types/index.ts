export interface Task {
  id: string;
  title: string;
  description?: string;
  done: boolean;
  priority: number;
  createdAt: number;
  updatedAt: number;
  dueDate?: string;
}

export type TaskUpdate = Partial<Task> & { id: string };
