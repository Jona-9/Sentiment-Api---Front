import React from 'react';
import { useNavigate } from 'react-router-dom';

function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Configuración</h1>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Volver al Dashboard
          </button>
        </div>
      </nav>
      <div className="container mx-auto mt-8 p-4">
        <h2 className="text-2xl font-bold mb-4">Configuración de Usuario</h2>
        <div className="bg-white rounded-lg shadow p-4">
          <p className="text-gray-600">Opciones de configuración...</p>
        </div>
      </div>
    </div>
  );
}

export default SettingsPage;