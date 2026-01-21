// src/views/HistoryView.jsx
import React, { useState, useEffect } from 'react';
import { Sparkles, Home, LogOut, TrendingUp, BarChart3, Calendar, Database, Zap, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { sentimentService } from '../services/sentimentService';

const HistoryView = ({ currentView, setCurrentView, user, handleLogout }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchHistoricalData = async () => {
      if (!user?.token) {
        setError('No hay token de autenticación');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError('');
      
      try {
        // 🔥 LLAMADA REAL AL BACKEND
        const data = await sentimentService.getHistory(user.token);
        setHistoryData(data);
      } catch (err) {
        console.error('Error al cargar historial:', err);
        setError(err.message || 'Error al cargar el historial');
        setHistoryData([]);
      } finally {
        setLoading(false);
      }
    };

    if (currentView === 'history' && user) {
      fetchHistoricalData();
    }
  }, [currentView, user]);

  if (currentView !== 'history' || !user) return null;

  const totalSesiones = historyData.length;
  const totalGlobalTextos = historyData.reduce((sum, s) => sum + s.total, 0);
  const totalPositivos = historyData.reduce((sum, s) => sum + s.positivos, 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900 text-white font-sans">
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20 px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl"><Sparkles className="w-5 h-5" /></div>
          <span className="text-xl font-black">SentimentAPI</span>
        </div>
        <div className="flex gap-4">
          <button onClick={() => setCurrentView('dashboard')} className="flex items-center gap-2 hover:text-purple-400 transition-colors"><Home className="w-4 h-4"/> Dashboard</button>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-400"><LogOut className="w-4 h-4"/> Salir</button>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto p-8">
        <header className="mb-10">
          <h1 className="text-4xl font-bold flex items-center gap-3"><TrendingUp className="text-cyan-400 w-10 h-10"/> Trayectoria Evolutiva</h1>
          <p className="text-purple-300 mt-2">Análisis de tendencias temporales y volumen histórico de trabajo.</p>
        </header>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin mb-4"></div>
            <p className="text-xl font-bold">Consultando base de datos PostgreSQL...</p>
          </div>
        ) : error ? (
          <div className="bg-red-500/20 border-2 border-red-500/50 rounded-2xl p-8 flex items-start gap-4">
            <AlertCircle className="w-8 h-8 text-red-400 flex-shrink-0" />
            <div>
              <h3 className="text-xl font-bold text-red-300 mb-2">Error al cargar historial</h3>
              <p className="text-red-200">{error}</p>
            </div>
          </div>
        ) : totalSesiones === 0 ? (
          <div className="bg-purple-500/20 border-2 border-purple-500/50 rounded-2xl p-12 text-center">
            <Database className="w-16 h-16 text-purple-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">No hay sesiones registradas</h3>
            <p className="text-purple-300 mb-6">Comienza a analizar comentarios para ver tu historial aquí</p>
            <button
              onClick={() => setCurrentView('analysis-batch')}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
            >
              Analizar Comentarios
            </button>
          </div>
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="SESIONES TOTALES" value={totalSesiones} sub="Registros en BD" icon={<Database/>} color="text-indigo-400" />
              <StatCard title="TOTAL ANÁLISIS" value={totalGlobalTextos} sub="Textos procesados" icon={<BarChart3/>} color="text-purple-400" />
              <StatCard title="EFECTIVIDAD POSITIVA" value={totalGlobalTextos > 0 ? `${((totalPositivos/totalGlobalTextos)*100).toFixed(1)}%` : '0%'} sub="Satisfacción global" icon={<Zap/>} color="text-cyan-400" />
              <StatCard title="ÚLTIMA SESIÓN" value={historyData[0]?.date || 'N/A'} sub="Fecha" icon={<Calendar/>} color="text-emerald-400" />
            </div>

            {totalSesiones >= 2 && (
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cyan-400"/> Evolución de Puntuaciones (Promedio por Tanda)</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData.map((s, i) => ({ name: `#${i+1}`, score: (s.avgScore * 100).toFixed(0) }))}>
                      <defs>
                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#22d3ee" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="#22d3ee" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                      <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickMargin={10} />
                      <YAxis stroke="#64748b" fontSize={12} unit="%" />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: '1px solid #334155' }} />
                      <Area 
                        type="monotone"
                        dataKey="score" 
                        stroke="#22d3ee" 
                        strokeWidth={4} 
                        fill="url(#colorTrend)" 
                        dot={{ r: 6, fill: '#22d3ee', strokeWidth: 2, stroke: '#fff' }}
                        activeDot={{ r: 8, strokeWidth: 0 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const StatCard = ({ title, value, sub, icon, color }) => (
  <div className="bg-white/5 backdrop-blur-md p-6 rounded-3xl border border-white/10 hover:bg-white/10 transition-all duration-300">
    <div className="flex justify-between items-start mb-4">
      <div className={`p-3 rounded-2xl bg-slate-900/50 ${color}`}>{icon}</div>
      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{title}</span>
    </div>
    <div className="text-3xl font-black text-white">{value}</div>
    <div className="text-xs text-slate-400 mt-1">{sub}</div>
  </div>
);

export default HistoryView;