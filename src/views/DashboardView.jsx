// src/views/DashboardView.jsx
import React, { useState } from 'react';
import { Sparkles, Home, Clock, LogOut, Zap, Send, TrendingUp, AlertCircle, History, BarChart3 } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const DashboardView = ({
  currentView,
  setCurrentView,
  user,
  isDemo,
  handleLogout,
  isBatchMode,
  setIsBatchMode,
  text,
  setText,
  analyzing,
  analyzeSentiment,
  results,
  setResults,
  getStatistics,
  getSentimentColor,
  errorMessage
}) => {
  const [showHistoryPrompt, setShowHistoryPrompt] = useState(false);

  // 🔹 Simulación de datos históricos (reemplazar con API real cuando esté lista)
  const historicalSessionsCount = 12; // Total de sesiones guardadas en BD

  if (currentView !== 'dashboard' || !user) return null;

  // 🎨 Renderizado del gráfico de pastel
  const renderPieChart = () => {
    const stats = getStatistics();
    if (!stats) return null;

    const data = stats.map(stat => ({
      name: stat.name,
      value: stat.value,
      color: stat.color
    }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    );
  };

  // 🎨 Renderizado del gráfico de barras (distribución de puntuaciones)
  const renderScoreDistribution = () => {
    if (!results?.isBatch || !results.items) return null;

    const ranges = {
      '0.0-0.2': 0,
      '0.2-0.4': 0,
      '0.4-0.6': 0,
      '0.6-0.8': 0,
      '0.8-1.0': 0
    };

    results.items.forEach(item => {
      const score = item.score;
      if (score < 0.2) ranges['0.0-0.2']++;
      else if (score < 0.4) ranges['0.2-0.4']++;
      else if (score < 0.6) ranges['0.4-0.6']++;
      else if (score < 0.8) ranges['0.6-0.8']++;
      else ranges['0.8-1.0']++;
    });

    const data = Object.entries(ranges).map(([name, value]) => ({ name, value }));

    return (
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <XAxis dataKey="name" stroke="#a78bfa" />
          <YAxis stroke="#a78bfa" />
          <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #6366f1' }} />
          <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">SentimentAPI</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  currentView === 'dashboard' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              {!isDemo && (
                <button
                  onClick={() => setCurrentView('history')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 relative ${
                    currentView === 'history' ? 'bg-purple-600 text-white' : 'text-gray-300 hover:text-white'
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Historial</span>
                  {historicalSessionsCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-pink-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
                      {historicalSessionsCount}
                    </span>
                  )}
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-300 hover:text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="p-4 sm:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header con botón de historial */}
          <div className="mb-8 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">
                {isDemo ? '¡Prueba SentimentAPI!' : `Hola, ${user.name}!`}
              </h1>
              <p className="text-purple-300">
                {isDemo
                  ? 'Estás en modo demo. Regístrate para acceder al historial y más funciones.'
                  : 'Analiza sentimientos de forma rápida y precisa'}
              </p>
            </div>

            {!isDemo && historicalSessionsCount > 0 && (
              <button
                onClick={() => setCurrentView('history')}
                className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl font-bold hover:from-indigo-700 hover:to-purple-700 transition-all shadow-xl flex items-center gap-3 group"
              >
                <History className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                <div className="text-left">
                  <div className="text-sm opacity-90">Ver Historial</div>
                  <div className="text-xs opacity-75">{historicalSessionsCount} sesiones guardadas</div>
                </div>
                <BarChart3 className="w-5 h-5" />
              </button>
            )}
          </div>

          {isDemo && (
            <button
              onClick={() => setCurrentView('register')}
              className="mb-6 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Registrarse para más funciones
            </button>
          )}

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-8 py-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-400/20 rounded-lg">
                  <Zap className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Analizador</h2>
                  <p className="text-sm text-purple-200">Análisis simple o múltiple</p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Toggle */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <button
                  onClick={() => {
                    setIsBatchMode(false);
                    setText('');
                    setResults(null);
                  }}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    !isBatchMode
                      ? 'bg-cyan-500 text-white shadow-lg'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => {
                    setIsBatchMode(true);
                    setText('');
                    setResults(null);
                  }}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    isBatchMode
                      ? 'bg-cyan-500 text-white shadow-lg'
                      : 'bg-white/10 text-purple-200 hover:bg-white/20'
                  }`}
                >
                  Múltiple
                </button>
              </div>

              {/* Input */}
              <div className="relative mb-6">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={isBatchMode ? 5000 : 500}
                  placeholder={
                    isBatchMode
                      ? "Ingresa múltiples textos (uno por línea):\nEste producto es excelente\nMuy mal servicio\nEstá bien, nada especial"
                      : "Escribe un texto para analizar..."
                  }
                  className="w-full h-44 bg-white/5 border-2 border-white/20 rounded-2xl p-5 text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none transition-all text-lg"
                />
                <div className="absolute bottom-5 right-5 px-3 py-1 bg-purple-500/30 rounded-lg text-sm text-purple-200 font-medium backdrop-blur-sm">
                  {text.length}/{isBatchMode ? 5000 : 500}
                  {isBatchMode && text.trim() && (
                    <span className="ml-2 text-cyan-300">• {text.split('\n').filter(t => t.trim()).length} textos</span>
                  )}
                </div>
              </div>

              {/* Error Message */}
              {errorMessage && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                  <p className="text-red-300 text-sm">{errorMessage}</p>
                </div>
              )}

              {/* Button */}
              <button
                onClick={analyzeSentiment}
                disabled={!text.trim() || analyzing}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl text-lg"
              >
                <Send className="w-6 h-6" />
                {analyzing ? 'Analizando...' : 'Analizar'}
              </button>

              {/* Loading */}
              {analyzing && (
                <div className="mt-10 text-center">
                  <div className="inline-block mb-6">
                    <div className="w-20 h-20 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">Procesando...</p>
                  <p className="text-purple-300">Analizando con IA</p>
                </div>
              )}

              {/* Results */}
              {results && !analyzing && (
                <div className="mt-10">
                  {results.isBatch ? (
                    <div className="space-y-6">
                      {/* Resumen Visual Compacto - SIEMPRE VISIBLE */}
                      <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-2xl p-6 border-2 border-purple-500/30">
                        <div className="flex items-center gap-3 mb-6">
                          <TrendingUp className="w-6 h-6 text-purple-300" />
                          <h3 className="text-2xl font-bold text-white">📋 Análisis Completado</h3>
                        </div>

                        {/* Tarjeta grande de total */}
                        <div className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 rounded-2xl p-8 mb-6 text-center border border-purple-400/30">
                          <div className="text-7xl font-black text-white mb-2">{results.totalAnalyzed}</div>
                          <div className="text-xl text-purple-200 font-semibold">Textos Analizados</div>
                        </div>

                        {/* Tarjetas de sentimientos */}
                        <div className="grid grid-cols-3 gap-4">
                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 text-center">
                            <div className="text-5xl font-black text-green-400 mb-2">{getStatistics()[0].value}</div>
                            <div className="text-sm text-green-300 font-semibold mb-1">Positivos ({getStatistics()[0].percentage}%)</div>
                          </div>

                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/30 text-center">
                            <div className="text-5xl font-black text-red-400 mb-2">{getStatistics()[1].value}</div>
                            <div className="text-sm text-red-300 font-semibold mb-1">Negativos ({getStatistics()[1].percentage}%)</div>
                          </div>

                          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30 text-center">
                            <div className="text-5xl font-black text-amber-400 mb-2">{getStatistics()[2].value}</div>
                            <div className="text-sm text-amber-300 font-semibold mb-1">Neutrales ({getStatistics()[2].percentage}%)</div>
                          </div>
                        </div>
                      </div>

                      {/* Panel de Estadísticas Avanzadas - SOLO PARA USUARIOS CON CUENTA */}
                      {!isDemo && (
                        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-2xl p-8 border-2 border-indigo-500/30">
                          <div className="flex items-center gap-3 mb-6">
                            <BarChart3 className="w-7 h-7 text-indigo-300" />
                            <h3 className="text-3xl font-bold text-white">Panel de Estadísticas Avanzadas</h3>
                          </div>
                          <p className="text-indigo-200 mb-8">Gráficos y análisis detallado disponibles solo para usuarios registrados</p>

                          {/* Gráficos */}
                          <div className="grid md:grid-cols-2 gap-6">
                            {/* Gráfico de Pastel */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-cyan-400 rounded-full"></div>
                                Distribución de Sentimientos
                              </h4>
                              {renderPieChart()}
                            </div>

                            {/* Gráfico de Barras */}
                            <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                              <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                <div className="w-2 h-2 bg-purple-400 rounded-full"></div>
                                Distribución de Puntuaciones
                              </h4>
                              {renderScoreDistribution()}
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Results List - SIEMPRE VISIBLE */}
                      <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border-2 border-white/20">
                        <h3 className="text-2xl font-bold text-white mb-6">
                          Resultados Detallados
                        </h3>
                        <div className="space-y-3 max-h-96 overflow-y-auto">
                          {results.items.map((item, index) => (
                            <div key={index} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:bg-white/10 transition-all">
                              <div className="flex items-start gap-4">
                                <div className="flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center font-bold text-lg"
                                  style={{ backgroundColor: getSentimentColor(item.sentiment) + '30', color: getSentimentColor(item.sentiment) }}>
                                  #{index + 1}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-3 mb-2">
                                    <span className="px-3 py-1 rounded-lg text-xs font-bold uppercase"
                                      style={{ backgroundColor: getSentimentColor(item.sentiment) + '20', color: getSentimentColor(item.sentiment) }}>
                                      {item.sentiment}
                                    </span>
                                    <span className="text-sm text-purple-300">
                                      Confianza: <span className="font-bold text-white">{(item.score * 100).toFixed(1)}%</span>
                                    </span>
                                  </div>
                                  <p className="text-white/90 text-sm leading-relaxed">"{item.text}"</p>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border-2 border-white/20 shadow-2xl">
                      <div className="flex items-center gap-2 mb-6">
                        <TrendingUp className="w-6 h-6 text-cyan-400" />
                        <h3 className="text-2xl font-bold text-white">Resultado</h3>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mb-6">
                        <div className="p-6 rounded-xl font-bold text-xl border-2 text-center shadow-lg"
                          style={{ backgroundColor: getSentimentColor(results.sentiment) + '20', borderColor: getSentimentColor(results.sentiment), color: getSentimentColor(results.sentiment) }}>
                          <div className="text-sm opacity-75 mb-2">SENTIMIENTO</div>
                          <div className="text-3xl uppercase tracking-wider">{results.sentiment}</div>
                        </div>

                        <div className="p-6 bg-gradient-to-br from-indigo-500/20 to-purple-500/20 rounded-xl border-2 border-indigo-400/40 text-center shadow-lg">
                          <div className="text-sm text-indigo-300 mb-2">CONFIANZA</div>
                          <div className="text-4xl font-bold text-white">{(results.score * 100).toFixed(1)}%</div>
                          <div className="mt-3 bg-white/10 rounded-full h-3 overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-indigo-400 to-purple-500 transition-all duration-1000 rounded-full"
                              style={{ width: `${results.score * 100}%` }}></div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <div className="text-sm text-purple-300 mb-3 font-semibold uppercase">Texto analizado:</div>
                        <p className="text-white/95 leading-relaxed text-lg">"{results.text}"</p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;