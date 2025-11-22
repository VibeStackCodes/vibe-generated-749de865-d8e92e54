import React, { useState, useMemo } from 'react';
import { Task } from '../types';
import { useTasks } from '../providers/TaskProvider';
import { logEvent } from '../services/analytics';

export const HomePage: React.FC = () => {
  const { tasks, addTask, updateTask, deleteTask, reorderTasks } = useTasks();
  const [title, setTitle] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [query, setQuery] = useState<string>('');

  const filtered = useMemo(() => {
    if (!query.trim()) return tasks;
    const q = query.toLowerCase();
    return tasks.filter(t => t.title.toLowerCase().includes(q) || (t.description ?? '').toLowerCase().includes(q));
  }, [tasks, query]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    const created = addTask({ title: t, description: description.trim(), priority: 2 });
    setTitle('');
    setDescription('');
    logEvent('task_created', { id: created.id, title: created.title });
  };

  const handleToggle = (id: string) => {
    const current = tasks.find(x => x.id === id);
    if (current) {
      updateTask(id, { done: !current.done });
      logEvent('task_toggled', { id, done: !current.done });
    }
  };

  const handleEditInline = (id: string) => {
    const current = tasks.find(t => t.id === id);
    if (!current) return;
    const newTitle = prompt('Edit task title', current.title);
    if (newTitle != null) {
      updateTask(id, { title: newTitle });
      logEvent('task_updated', { id, field: 'title' });
    }
  };

  const onDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/task-id', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const onDropRow = (index: number, e: React.DragEvent) => {
    const fromId = e.dataTransfer.getData('text/task-id');
    if (!fromId) return;
    const fromIndex = tasks.findIndex(t => t.id === fromId);
    const toTask = filtered[index];
    if (!toTask) return;
    const toIndex = tasks.findIndex(t => t.id === toTask.id);
    if (fromIndex >= 0 && toIndex >= 0 && fromIndex !== toIndex) {
      reorderTasks(fromIndex, toIndex);
      logEvent('task_reordered', { fromId, toId: toTask.id });
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const currentTask = filtered[index];
      if (!currentTask) return;
      const fromIndex = tasks.findIndex(t => t.id === currentTask.id);
      const toIndex = Math.max(0, fromIndex - 1);
      if (fromIndex !== toIndex) reorderTasks(fromIndex, toIndex);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      const currentTask = filtered[index];
      if (!currentTask) return;
      const fromIndex = tasks.findIndex(t => t.id === currentTask.id);
      const toIndex = Math.min(tasks.length - 1, fromIndex + 1);
      if (fromIndex !== toIndex) reorderTasks(fromIndex, toIndex);
    }
  };

  return (
    <section aria-label="Task dashboard" className="space-y-4">
      <form onSubmit={onSubmit} className="flex flex-col md:flex-row gap-2 items-center">
        <input value={title} onChange={e => setTitle(e.target.value)} placeholder="New task title" className="flex-1 border rounded px-3 py-2" aria-label="Task title" />
        <input value={description} onChange={e => setDescription(e.target.value)} placeholder="Description (optional)" className="flex-1 border rounded px-3 py-2" aria-label="Task description" />
        <button type="submit" className="bg-primary text-white px-4 py-2 rounded">Add Task</button>
      </form>

      <div className="flex items-center gap-2">
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Search tasks" className="flex-1 border rounded px-3 py-2" aria-label="Search tasks" />
        <span className="text-sm text-gray-600">{tasks.length} tasks</span>
      </div>

      <ul className="space-y-2" role="list">
        {filtered.map((task, idx) => (
          <li key={task.id} draggable onDragStart={e => onDragStart(e, task.id)} onDragOver={e => e.preventDefault()} onDrop={e => onDropRow(idx, e)} tabIndex={0} onKeyDown={e => handleKeyDown(idx, e)} className="flex items-center justify-between bg-white rounded shadow p-3 border border-gray-200">
            <div className="flex items-center gap-3" style={{ minWidth: 0 }}>
              <input type="checkbox" checked={task.done} onChange={() => handleToggle(task.id)} aria-label="Mark task complete" />
              <div className="flex-1" style={{ minWidth: 0 }}>
                <div className={task.done ? 'line-through' : ''} style={{ fontFamily: 'Inter' }}>{task.title}</div>
                {task.description && <div className="text-sm text-gray-500" style={{ maxWidth: '40ch', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{task.description}</div>}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: task.priority >= 3 ? '#b45309' : '#1d4ed8' }}>P{task.priority}</span>
              <button className="text-sm text-blue-600" onClick={() => handleEditInline(task.id)} aria-label="Edit task">Edit</button>
              <button className="text-sm text-red-600" onClick={() => { if (confirm('Delete this task?')) { deleteTask(task.id); logEvent('task_deleted', { id: task.id }); } }} aria-label="Delete task">Delete</button>
              <span className="ml-1 text-xs text-gray-500" aria-label="Drag hint">Drag to reorder</span>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
};
