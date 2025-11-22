import React, { createContext, useContext, useEffect, useState } from 'react';
import { Task } from '../types';
import { loadFromStorage, saveToStorage } from '../lib/storage';
import { logEvent } from '../services/analytics';

type NewTaskPayload = { title: string; description?: string; priority?: number; dueDate?: string };

type TaskContextType = {
  tasks: Task[];
  addTask: (payload: NewTaskPayload) => Task;
  updateTask: (id: string, patch: Partial<Task>) => void;
  deleteTask: (id: string) => void;
  reorderTasks: (fromIndex: number, toIndex: number) => void;
  clearAll: () => void;
};

const TaskContext = createContext<TaskContextType | undefined>(undefined);

export const TaskProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tasks, setTasks] = useState<Task[]>([]);

  useEffect(() => {
    const loaded = loadFromStorage<Task[]>('tm_tasks_v1', []);
    setTasks(loaded);
  }, []);

  useEffect(() => {
    saveToStorage('tm_tasks_v1', tasks);
  }, [tasks]);

  const addTask = (payload: NewTaskPayload) => {
    const now = Date.now();
    const t: Task = {
      id: Math.random().toString(36).slice(2, 9),
      title: payload.title,
      description: payload.description,
      done: false,
      priority: payload.priority ?? 1,
      createdAt: now,
      updatedAt: now,
      dueDate: payload.dueDate
    };
    setTasks(prev => [t, ...prev]);
    logEvent('task_created', { id: t.id, title: t.title });
    return t;
  };

  const updateTask = (id: string, patch: Partial<Task>) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...patch, updatedAt: Date.now() } : t));
    logEvent('task_updated', { id, patch });
  };

  const deleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    logEvent('task_deleted', { id });
  };

  const reorderTasks = (fromIndex: number, toIndex: number) => {
    setTasks(prev => {
      const arr = prev.slice();
      const [moved] = arr.splice(fromIndex, 1);
      arr.splice(toIndex, 0, moved);
      return arr;
    });
    logEvent('task_reordered', { fromIndex, toIndex });
  };

  const clearAll = () => {
    setTasks([]);
    logEvent('data_cleared', {});
  };

  const value = { tasks, addTask, updateTask, deleteTask, reorderTasks, clearAll };

  return <TaskContext.Provider value={value}>{children}</TaskContext.Provider>;
};

export const useTasks = (): TaskContextType => {
  const ctx = useContext(TaskContext);
  if (!ctx) throw new Error('TaskProvider is missing in the component tree');
  return ctx;
};
