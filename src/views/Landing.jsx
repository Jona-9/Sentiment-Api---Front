// src/views/Landing.jsx
import React from 'react';
import { Sparkles, Zap, Brain, BarChart3, Menu, X } from 'lucide-react';

const Landing = ({ setCurrentView, handleDemoStart, showMobileMenu, setShowMobileMenu }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-black text-white">SentimentAPI</span>
            </div>
            
            <div className="hidden md:flex items-center gap-4">
              <button
                onClick={() => setCurrentView('login')}
                className="px-6 py-2.5 text-white hover:text-purple-300 font-semibold transition-all"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => setCurrentView('register')}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-lg hover:shadow-xl"
              >
                Registrarse
              </button>
            </div>

            <button className="md:hidden text-white" onClick={() => setShowMobileMenu(!showMobileMenu)}>
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {showMobileMenu && (
          <div className="md:hidden bg-slate-800 border-t border-purple-500/20">
            <div className="px-4 py-4 space-y-3">
              <button
                onClick={() => { setCurrentView('login'); setShowMobileMenu(false); }}
                className="w-full px-6 py-3 text-white text-left font-semibold hover:bg-slate-700 rounded-lg transition-all"
              >
                Iniciar Sesión
              </button>
              <button
                onClick={() => { setCurrentView('register'); setShowMobileMenu(false); }}
                className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold"
              >
                Registrarse
              </button>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 border border-purple-500/30 rounded-full mb-8">
            <Zap className="w-4 h-4 text-purple-400" />
            <span className="text-purple-300 text-sm font-semibold">Análisis de sentimientos con IA</span>
          </div>

          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6 leading-tight">
            Descubre el poder del
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent"> análisis de sentimientos</span>
          </h1>

          <p className="text-xl text-gray-300 mb-12 max-w-3xl mx-auto leading-relaxed">
            Analiza opiniones, reseñas y comentarios al instante con nuestra inteligencia artificial avanzada. Obtén insights valiosos de tus datos en segundos.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={() => setCurrentView('register')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-lg rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all shadow-2xl hover:shadow-purple-500/50 transform hover:scale-105"
            >
              Comenzar Gratis
            </button>
            <button
              onClick={handleDemoStart}
              className="px-8 py-4 bg-white/10 backdrop-blur-sm text-white text-lg rounded-xl font-bold hover:bg-white/20 transition-all border border-white/20"
            >
              Ver Demo
            </button>
          </div>
        </div>

        {/* Features */}
        <div className="max-w-6xl mx-auto mt-32 grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 transition-all">
            <div className="p-3 bg-purple-500/20 rounded-xl w-fit mb-4">
              <Brain className="w-8 h-8 text-purple-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">IA Avanzada</h3>
            <p className="text-gray-400">Modelos de última generación entrenados con millones de textos</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-pink-500/50 transition-all">
            <div className="p-3 bg-pink-500/20 rounded-xl w-fit mb-4">
              <Zap className="w-8 h-8 text-pink-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Análisis Instantáneo</h3>
            <p className="text-gray-400">Resultados en segundos, procesa miles de textos simultáneamente</p>
          </div>

          <div className="bg-white/5 backdrop-blur-lg rounded-2xl p-8 border border-white/10 hover:border-cyan-500/50 transition-all">
            <div className="p-3 bg-cyan-500/20 rounded-xl w-fit mb-4">
              <BarChart3 className="w-8 h-8 text-cyan-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Estadísticas Detalladas</h3>
            <p className="text-gray-400">Visualiza tendencias y patrones con gráficas interactivas</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;