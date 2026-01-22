import React from 'react';
import { useNavigate } from 'react-router-dom';

function DashboardPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Dashboard</h1>
          <div className="space-x-4">
            <button
              onClick={() => navigate('/tasks')}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Tareas
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Configuración
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Salir
            </button>
          </div>
        </div>
      </nav>
      <div className="container mx-auto mt-8 p-4">
        <h2 className="text-2xl font-bold mb-4">Bienvenido al Dashboard</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Total Tareas</h3>
            <p className="text-3xl font-bold text-blue-500">24</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Completadas</h3>
            <p className="text-3xl font-bold text-green-500">18</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h3 className="text-lg font-semibold mb-2">Pendientes</h3>
            <p className="text-3xl font-bold text-orange-500">6</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;