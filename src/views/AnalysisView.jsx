// src/views/AnalysisView.jsx
import React from 'react';
import { Sparkles, Send, TrendingUp, AlertCircle, Home, History, LogOut, BarChart3, FileText } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AnalysisView = ({
  currentView,
  setCurrentView,
  user,
  isDemo,
  handleLogout,
  isBatchMode,
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
  // Renderizado del gráfico de pastel
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

  // Renderizado del gráfico de barras
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
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
      {/* Header */}
      <header className="bg-[#2d1b4e]/60 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">SentimentAPI</h1>
                <p className="text-sm text-purple-300 font-medium">POWERED BY AI</p>
              </div>
            </div>

            {/* Navigation */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView('dashboard')}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white rounded-xl font-semibold transition-all border border-purple-500/30"
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              {!isDemo && (
                <button
                  onClick={() => setCurrentView('history')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white rounded-xl font-semibold transition-all border border-purple-500/30"
                >
                  <History className="w-4 h-4" />
                  <span className="hidden sm:inline">Historial</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white rounded-xl font-semibold transition-all border border-purple-500/30"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Title */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            {isBatchMode ? (
              <BarChart3 className="w-12 h-12 text-purple-400" />
            ) : (
              <FileText className="w-12 h-12 text-purple-400" />
            )}
            <h2 className="text-5xl font-black text-white">
              Análisis {isBatchMode ? 'Múltiple' : 'Simple'}
            </h2>
          </div>
          <p className="text-purple-300 text-lg">
            {isBatchMode 
              ? 'Analiza múltiples textos simultáneamente'
              : 'Analiza el sentimiento de un texto individual'}
          </p>
        </div>

        {/* Analysis Card */}
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl">
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
                className="w-full h-56 bg-[#1a0b2e]/50 border-2 border-purple-500/30 rounded-2xl p-6 text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent resize-none transition-all text-lg"
              />
              <div className="absolute bottom-6 right-6 px-4 py-2 bg-purple-500/30 rounded-lg text-sm text-purple-200 font-medium backdrop-blur-sm">
                {text.length}/{isBatchMode ? 5000 : 500}
                {isBatchMode && text.trim() && (
                  <span className="ml-2 text-cyan-300">
                    • {text.split('\n').filter(t => t.trim()).length} textos
                  </span>
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
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl text-lg"
            >
              <Send className="w-6 h-6" />
              {analyzing ? 'Analizando...' : 'Analizar'}
            </button>
          </div>

          {/* Loading */}
          {analyzing && (
            <div className="mt-12 text-center">
              <div className="inline-block mb-6">
                <div className="w-20 h-20 border-4 border-purple-400/30 border-t-purple-400 rounded-full animate-spin"></div>
              </div>
              <p className="text-2xl font-bold text-white mb-2">Procesando...</p>
              <p className="text-purple-300">Analizando con IA</p>
            </div>
          )}

          {/* Results */}
          {results && !analyzing && (
            <div className="mt-12">
              {results.isBatch ? (
                <div className="space-y-8">
                  {/* Summary */}
                  <div className="bg-gradient-to-br from-purple-900/50 to-indigo-900/50 rounded-3xl p-8 border-2 border-purple-500/30">
                    <div className="flex items-center gap-3 mb-6">
                      <TrendingUp className="w-8 h-8 text-purple-300" />
                      <h3 className="text-3xl font-bold text-white">Resumen de Análisis</h3>
                    </div>

                    {/* Total Card */}
                    <div className="bg-gradient-to-r from-purple-600/30 to-indigo-600/30 rounded-2xl p-8 mb-6 text-center border border-purple-400/30">
                      <div className="text-7xl font-black text-white mb-2">{results.totalAnalyzed}</div>
                      <div className="text-xl text-purple-200 font-semibold">Textos Analizados</div>
                    </div>

                    {/* Sentiment Cards */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-green-500/30 text-center">
                        <div className="text-5xl font-black text-green-400 mb-2">{getStatistics()[0].value}</div>
                        <div className="text-sm text-green-300 font-semibold">
                          Positivos ({getStatistics()[0].percentage}%)
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-red-500/30 text-center">
                        <div className="text-5xl font-black text-red-400 mb-2">{getStatistics()[1].value}</div>
                        <div className="text-sm text-red-300 font-semibold">
                          Negativos ({getStatistics()[1].percentage}%)
                        </div>
                      </div>

                      <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30 text-center">
                        <div className="text-5xl font-black text-amber-400 mb-2">{getStatistics()[2].value}</div>
                        <div className="text-sm text-amber-300 font-semibold">
                          Neutrales ({getStatistics()[2].percentage}%)
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Charts (available for all users including demo) */}
                  <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-3xl p-8 border-2 border-indigo-500/30">
                    <div className="flex items-center gap-3 mb-8">
                      <BarChart3 className="w-8 h-8 text-indigo-300" />
                      <h3 className="text-3xl font-bold text-white">Estadísticas Avanzadas</h3>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h4 className="text-xl font-bold text-white mb-4">Distribución de Sentimientos</h4>
                        {renderPieChart()}
                      </div>

                      <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                        <h4 className="text-xl font-bold text-white mb-4">Distribución de Puntuaciones</h4>
                        {renderScoreDistribution()}
                      </div>
                    </div>
                  </div>

                  {/* Results List */}
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border-2 border-white/20">
                    <h3 className="text-2xl font-bold text-white mb-6">Resultados Detallados</h3>
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
                // Single Result
                <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-3xl p-8 border-2 border-white/20 shadow-2xl">
                  <div className="flex items-center gap-2 mb-6">
                    <TrendingUp className="w-6 h-6 text-cyan-400" />
                    <h3 className="text-2xl font-bold text-white">Resultado del Análisis</h3>
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
      </main>
    </div>
  );
};

export default AnalysisView;