import React from 'react';
import { Sparkles, Send, TrendingUp, AlertCircle, Home, History, LogOut, BarChart3, FileText, ArrowLeft } from 'lucide-react';
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
          <Tooltip contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #6366f1', borderRadius: '8px' }} />
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
          <XAxis dataKey="name" stroke="#a78bfa" fontSize={12} />
          <YAxis stroke="#a78bfa" fontSize={12} />
          <Tooltip 
            cursor={{fill: 'rgba(139, 92, 246, 0.1)'}}
            contentStyle={{ backgroundColor: '#1e1b4b', border: '1px solid #6366f1', borderRadius: '8px' }} 
          />
          <Bar dataKey="value" fill="#8b5cf6" radius={[8, 8, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    );
  };

  // ✅ NUEVO: Renderizado de resultados detallados (como en la imagen 2)
  const renderDetailedResults = () => {
    if (!results) return null;

    // Si es análisis simple
    if (!results.isBatch) {
      return (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header de Análisis Completado */}
          <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-500/30 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <TrendingUp className="w-10 h-10 text-cyan-400" />
              <h3 className="text-3xl font-black text-white">Análisis Completado</h3>
            </div>
            
            <div className="text-center py-8">
              <p className="text-xl text-purple-200 mb-2">Textos Analizados</p>
              <p className="text-7xl font-black text-white mb-8">1</p>
            </div>

            {/* Resultado del Sentimiento */}
            <div className="bg-[#1a0b2e]/50 rounded-2xl p-8 border border-white/10">
              <div className="flex items-center justify-between mb-4">
                <span className="text-cyan-400 font-bold text-lg">TEXTO ANALIZADO</span>
                <span className="text-purple-300 font-semibold">Confianza: {(results.score * 100).toFixed(1)}%</span>
              </div>
              <p className="text-white text-xl mb-6 italic">"{results.text}"</p>
              
              <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
                <div>
                  <p className="text-purple-300 text-sm font-semibold mb-1">SENTIMIENTO DETECTADO</p>
                  <p className="text-4xl font-black uppercase" style={{color: getSentimentColor(results.sentiment)}}>
                    {results.sentiment}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-purple-300 text-sm font-semibold mb-1">PROBABILIDAD</p>
                  <p className="text-4xl font-black text-white">{(results.score * 100).toFixed(1)}%</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    // Si es análisis múltiple (batch)
    const stats = getStatistics();
    
    return (
      <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        {/* Header de Análisis Completado */}
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-500/30">
          <div className="flex items-center gap-4 mb-6">
            <TrendingUp className="w-10 h-10 text-cyan-400" />
            <h3 className="text-3xl font-black text-white">Análisis Completado</h3>
          </div>
          
          <div className="text-center py-8">
            <p className="text-xl text-purple-200 mb-2">Textos Analizados</p>
            <p className="text-7xl font-black text-white mb-8">{results.totalAnalyzed}</p>
          </div>

          {/* Tarjetas de Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-green-500/10 border-2 border-green-500/30 p-6 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-green-400 font-bold text-lg mb-2">POSITIVOS</p>
              <p className="text-5xl text-white font-black mb-2">{stats[0].value}</p>
              <p className="text-green-300 text-sm">({stats[0].percentage}%)</p>
            </div>
            
            <div className="bg-red-500/10 border-2 border-red-500/30 p-6 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-red-400 font-bold text-lg mb-2">NEGATIVOS</p>
              <p className="text-5xl text-white font-black mb-2">{stats[1].value}</p>
              <p className="text-red-300 text-sm">({stats[1].percentage}%)</p>
            </div>
            
            <div className="bg-amber-500/10 border-2 border-amber-500/30 p-6 rounded-2xl text-center backdrop-blur-sm">
              <p className="text-amber-400 font-bold text-lg mb-2">NEUTRALES</p>
              <p className="text-5xl text-white font-black mb-2">{stats[2].value}</p>
              <p className="text-amber-300 text-sm">({stats[2].percentage}%)</p>
            </div>
          </div>
        </div>

        {/* Lista Detallada de Resultados */}
        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/30">
          <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-purple-400" />
            Detalle de Análisis
          </h4>
          
          <div className="space-y-4">
            {results.items.map((item, index) => (
              <div 
                key={index}
                className="bg-[#1a0b2e]/50 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg font-bold text-lg">
                      #{index + 1}
                    </span>
                    <span 
                      className="px-4 py-2 rounded-lg font-bold text-lg uppercase"
                      style={{
                        backgroundColor: `${getSentimentColor(item.sentiment)}20`,
                        color: getSentimentColor(item.sentiment),
                        border: `2px solid ${getSentimentColor(item.sentiment)}50`
                      }}
                    >
                      {item.sentiment}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="text-purple-300 text-sm font-semibold">Confianza</p>
                    <p className="text-2xl font-black text-white">{(item.score * 100).toFixed(1)}%</p>
                  </div>
                </div>
                <p className="text-white text-lg italic">"{item.text}"</p>
              </div>
            ))}
          </div>
        </div>

        {/* Gráficos Opcionales */}
        <div className="grid md:grid-cols-2 gap-8">
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h4 className="text-white font-bold mb-4 text-xl">Distribución de Sentimientos</h4>
            {renderPieChart()}
          </div>
          <div className="bg-white/5 p-6 rounded-3xl border border-white/10">
            <h4 className="text-white font-bold mb-4 text-xl">Distribución de Confianza</h4>
            {renderScoreDistribution()}
          </div>
        </div>
      </div>
    );
  };

  // ==================== VISTA MODO DEMO ====================
  if (isDemo) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
        <header className="bg-[#2d1b4e]/60 backdrop-blur-xl border-b border-purple-500/20">
          <div className="max-w-7xl mx-auto px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <span className="text-2xl font-black text-white">SentimentAPI</span>
                  <p className="text-xs text-purple-300 font-medium">MODO DEMO</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setCurrentView('demo-selection')}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Retroceder
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 hover:text-white rounded-xl font-semibold transition-all border border-purple-500/30"
                >
                  <LogOut className="w-4 h-4" />
                  Salir
                </button>
              </div>
            </div>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-12">
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              {isBatchMode ? <BarChart3 className="w-10 h-10 text-purple-400" /> : <FileText className="w-10 h-10 text-purple-400" />}
              <h2 className="text-4xl font-black text-white">Análisis {isBatchMode ? 'Múltiple' : 'Simple'}</h2>
            </div>
            <p className="text-purple-300">Prueba la potencia de nuestra IA. Regístrate para guardar tus resultados.</p>
          </div>

          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/30 mb-8">
            <div className="relative mb-6">
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                maxLength={isBatchMode ? 5000 : 500}
                placeholder={isBatchMode ? "Un texto por línea..." : "Escribe aquí..."}
                className="w-full h-56 bg-[#1a0b2e]/50 border-2 border-purple-500/30 rounded-xl p-6 text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none transition-all text-lg"
              />
            </div>
            {errorMessage && (
              <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-300">
                <AlertCircle className="w-5 h-5" /> {errorMessage}
              </div>
            )}
            <button
              onClick={analyzeSentiment}
              disabled={!text.trim() || analyzing}
              className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:from-gray-600 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-all text-lg shadow-xl shadow-purple-500/20"
            >
              <Send className="w-6 h-6" />
              {analyzing ? 'Analizando...' : 'Analizar ahora'}
            </button>
          </div>

          {/* Resultados Detallados MODO DEMO */}
          {results && !analyzing && (
            <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
              {!results.isBatch ? (
                // Análisis Simple Demo
                <>
                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-500/30 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                      <TrendingUp className="w-10 h-10 text-cyan-400" />
                      <h3 className="text-3xl font-black text-white">Análisis Completado</h3>
                    </div>
                    
                    <div className="text-center py-8">
                      <p className="text-xl text-purple-200 mb-2">Textos Analizados</p>
                      <p className="text-7xl font-black text-white mb-8">1</p>
                    </div>

                    <div className="bg-[#1a0b2e]/50 rounded-2xl p-8 border border-white/10">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-cyan-400 font-bold text-lg">TEXTO ANALIZADO</span>
                        <span className="text-purple-300 font-semibold">Confianza: {(results.score * 100).toFixed(1)}%</span>
                      </div>
                      <p className="text-white text-xl mb-6 italic">"{results.text}"</p>
                      
                      <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
                        <div>
                          <p className="text-purple-300 text-sm font-semibold mb-1">SENTIMIENTO DETECTADO</p>
                          <p className="text-4xl font-black uppercase" style={{color: getSentimentColor(results.sentiment)}}>
                            {results.sentiment}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-purple-300 text-sm font-semibold mb-1">PROBABILIDAD</p>
                          <p className="text-4xl font-black text-white">{(results.score * 100).toFixed(1)}%</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                // Análisis Múltiple Demo
                <>
                  <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-500/30 mb-8">
                    <div className="flex items-center gap-4 mb-6">
                      <TrendingUp className="w-10 h-10 text-cyan-400" />
                      <h3 className="text-3xl font-black text-white">Análisis Completado</h3>
                    </div>
                    
                    <div className="text-center py-8">
                      <p className="text-xl text-purple-200 mb-2">Textos Analizados</p>
                      <p className="text-7xl font-black text-white mb-8">{results.totalAnalyzed}</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div className="bg-green-500/10 border-2 border-green-500/30 p-6 rounded-2xl text-center backdrop-blur-sm">
                        <p className="text-green-400 font-bold text-lg mb-2">POSITIVOS</p>
                        <p className="text-5xl text-white font-black mb-2">{getStatistics()[0].value}</p>
                        <p className="text-green-300 text-sm">({getStatistics()[0].percentage}%)</p>
                      </div>
                      
                      <div className="bg-red-500/10 border-2 border-red-500/30 p-6 rounded-2xl text-center backdrop-blur-sm">
                        <p className="text-red-400 font-bold text-lg mb-2">NEGATIVOS</p>
                        <p className="text-5xl text-white font-black mb-2">{getStatistics()[1].value}</p>
                        <p className="text-red-300 text-sm">({getStatistics()[1].percentage}%)</p>
                      </div>
                      
                      <div className="bg-amber-500/10 border-2 border-amber-500/30 p-6 rounded-2xl text-center backdrop-blur-sm">
                        <p className="text-amber-400 font-bold text-lg mb-2">NEUTRALES</p>
                        <p className="text-5xl text-white font-black mb-2">{getStatistics()[2].value}</p>
                        <p className="text-amber-300 text-sm">({getStatistics()[2].percentage}%)</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/30">
                    <h4 className="text-2xl font-black text-white mb-6 flex items-center gap-3">
                      <BarChart3 className="w-6 h-6 text-purple-400" />
                      Detalle de Análisis
                    </h4>
                    
                    <div className="space-y-4">
                      {results.items.map((item, index) => (
                        <div 
                          key={index}
                          className="bg-[#1a0b2e]/50 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all"
                        >
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3">
                              <span className="bg-purple-500/20 text-purple-300 px-4 py-2 rounded-lg font-bold text-lg">
                                #{index + 1}
                              </span>
                              <span 
                                className="px-4 py-2 rounded-lg font-bold text-lg uppercase"
                                style={{
                                  backgroundColor: `${getSentimentColor(item.sentiment)}20`,
                                  color: getSentimentColor(item.sentiment),
                                  border: `2px solid ${getSentimentColor(item.sentiment)}50`
                                }}
                              >
                                {item.sentiment}
                              </span>
                            </div>
                            <div className="text-right">
                              <p className="text-purple-300 text-sm font-semibold">Confianza</p>
                              <p className="text-2xl font-black text-white">{(item.score * 100).toFixed(1)}%</p>
                            </div>
                          </div>
                          <p className="text-white text-lg italic">"{item.text}"</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }

  // ==================== VISTA USUARIOS REGISTRADOS ====================
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
      <header className="bg-[#2d1b4e]/60 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg shadow-purple-500/50">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">SentimentAPI</h1>
                <p className="text-sm text-purple-300 font-medium uppercase tracking-widest">Platform</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <button onClick={() => setCurrentView('dashboard')} className="nav-button-custom flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl border border-purple-500/30 transition-all">
                <Home className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
              </button>
              <button onClick={() => setCurrentView('history')} className="nav-button-custom flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl border border-purple-500/30 transition-all">
                <History className="w-4 h-4" /> <span className="hidden sm:inline">Historial</span>
              </button>
              <button onClick={handleLogout} className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl border border-red-500/30 transition-all">
                <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-4 mb-4">
            {isBatchMode ? <BarChart3 className="w-12 h-12 text-purple-400" /> : <FileText className="w-12 h-12 text-purple-400" />}
            <h2 className="text-5xl font-black text-white">Análisis {isBatchMode ? 'Múltiple' : 'Simple'}</h2>
          </div>
          <p className="text-purple-300 text-lg">Procesando datos con modelos de lenguaje de última generación.</p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl">
            <textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={isBatchMode ? 5000 : 500}
              placeholder={isBatchMode ? "Ingresa múltiples textos (uno por línea)..." : "Escribe un texto para analizar..."}
              className="w-full h-56 bg-[#1a0b2e]/50 border-2 border-purple-500/30 rounded-2xl p-6 text-white focus:ring-2 focus:ring-purple-400 outline-none resize-none text-lg transition-all"
            />
            {errorMessage && (
              <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-300">
                <AlertCircle className="w-5 h-5" /> {errorMessage}
              </div>
            )}
            <button
              onClick={analyzeSentiment}
              disabled={!text.trim() || analyzing}
              className="w-full mt-6 bg-gradient-to-r from-pink-500 to-purple-600 py-5 rounded-2xl text-white font-bold text-xl hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
            >
              {analyzing ? 'Procesando...' : 'Analizar Texto'}
            </button>
          </div>

          {/* Resultados Detallados */}
          {renderDetailedResults()}
        </div>
      </main>
    </div>
  );
};

export default AnalysisView;