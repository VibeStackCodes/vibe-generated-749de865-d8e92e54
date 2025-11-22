import React from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { TaskProvider } from './providers/TaskProvider';
import { HomePage } from './pages/Home';
import { AdminPage } from './pages/Admin';

export const App: React.FC = () => {
  return (
    <TaskProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <header className="bg-primary text-white">
          <div className="container mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="h-6 w-6 rounded-full" style={{ backgroundColor: '#FF6B00' }} aria-label="Brand" />
              <span className="text-xl font-semibold" style={{ fontFamily: 'Inter, system-ui' }}>TaskMaster</span>
            </div>
            <nav className="flex gap-4">
              <Link to="/" className="text-white hover:opacity-90" aria-label="Navigate to Home">Home</Link>
              <Link to="/admin" className="text-white hover:opacity-90" aria-label="Navigate to Admin">Admin</Link>
            </nav>
          </div>
        </header>
        <main className="p-4 container mx-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/admin" element={<AdminPage />} />
          </Routes>
        </main>
      </div>
    </TaskProvider>
  );
};
