import React from 'react';
import { Sparkles, LogIn, UserPlus } from 'lucide-react';

const Auth = ({ type, handleSubmit, setCurrentView }) => {
  const isLogin = type === 'login';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <span className="text-3xl font-black text-white">SentimentAPI</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">
            {isLogin ? 'Bienvenido de nuevo' : 'Crea tu cuenta'}
          </h2>
          <p className="text-gray-400">
            {isLogin ? 'Inicia sesión para continuar' : 'Comienza a analizar sentimientos hoy'}
          </p>
        </div>

        <div className="bg-white/10 backdrop-blur-xl rounded-2xl p-8 border border-white/20">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && (
              <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Nombre completo</label>
                <input
                  type="text"
                  required
                  className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Juan Pérez"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="tu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-300 mb-2">Contraseña</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              className="w-full px-6 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-xl flex items-center justify-center gap-2"
            >
              {isLogin ? <LogIn className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
              {isLogin ? 'Iniciar Sesión' : 'Crear Cuenta'}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => setCurrentView(isLogin ? 'register' : 'login')}
              className="text-purple-400 hover:text-purple-300 font-semibold"
            >
              {isLogin ? '¿No tienes cuenta? Regístrate aquí' : '¿Ya tienes cuenta? Inicia sesión'}
            </button>
          </div>

          <div className="mt-4 text-center">
            <button
              onClick={() => setCurrentView('landing')}
              className="text-gray-400 hover:text-gray-300 text-sm"
            >
              ← Volver al inicio
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;