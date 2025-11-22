import React from 'react';
import { Link } from 'react-router-dom';
import { useTasks } from '../providers/TaskProvider';
import { exportAnalyticsAsJson } from '../services/analytics';

export const AdminPage: React.FC = () => {
  const { tasks, clearAll } = useTasks();
  const completed = tasks.filter(t => t.done).length;
  return (
    <section aria-label="Admin controls" className="space-y-4">
      <div className="bg-white p-4 rounded shadow border">
        <h2 className="text-xl font-semibold mb-2">Admin Controls</h2>
        <p className="text-sm text-gray-600">Manage tasks and analytics locally for offline-first workflows.</p>
      </div>
      <div className="flex flex-col md:flex-row gap-2">
        <button onClick={exportAnalyticsAsJson} className="bg-accent text-white px-4 py-2 rounded hover:bg-orange-600">Export Analytics</button>
        <button onClick={() => { if (confirm('Clear all data? This will remove all tasks.')) { clearAll(); } }} className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Clear All Data</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Overview</h3>
          <p className="text-sm text-gray-600">Total tasks: {tasks.length}</p>
          <p className="text-sm text-gray-600">Completed: {completed}</p>
        </div>
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium">Navigation</h3>
          <Link to="/" className="text-primary font-medium underline">Back to Tasks</Link>
        </div>
      </div>
    </section>
  );
};
