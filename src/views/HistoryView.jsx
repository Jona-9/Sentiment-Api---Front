import React, { useState, useEffect } from 'react';
import { Sparkles, Home, Clock, LogOut, TrendingUp, BarChart3, Calendar, Database, Zap, AlertCircle } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const HistoryView = ({ currentView, setCurrentView, user, handleLogout }) => {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 🔹 Aquí conectarás con tu API de Java: GET /api/v1/usuario/{id}/trayectoria
    const fetchHistoricalData = async () => {
      setLoading(true);
      const mockData = [
        { sessionId: 1, date: '2025-01-10', avgScore: 0.72, total: 50, positivos: 30, negativos: 10, neutrales: 10 },
        { sessionId: 2, date: '2025-01-12', avgScore: 0.68, total: 75, positivos: 45, negativos: 20, neutrales: 10 },
        { sessionId: 3, date: '2025-01-14', avgScore: 0.81, total: 100, positivos: 70, negativos: 15, neutrales: 15 },
        { sessionId: 4, date: '2025-01-15', avgScore: 0.75, total: 60, positivos: 40, negativos: 12, neutrales: 8 },
        { sessionId: 5, date: '2025-01-17', avgScore: 0.88, total: 120, positivos: 95, negativos: 15, neutrales: 10 },
      ];
      setTimeout(() => { setHistoryData(mockData); setLoading(false); }, 500);
    };
    fetchHistoricalData();
  }, [user]);

  if (currentView !== 'history' || !user) return null;

  // 🔹 Cálculos de Tarjetas de Resumen Global (Persistente)
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
        ) : (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* 🔹 TARJETAS DE RESUMEN GLOBAL */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <StatCard title="SESIONES TOTALES" value={totalSesiones} sub="Registros en BD" icon={<Database/>} color="text-indigo-400" />
              <StatCard title="TOTAL ANÁLISIS" value={totalGlobalTextos} sub="Textos procesados" icon={<BarChart3/>} color="text-purple-400" />
              <StatCard title="EFECTIVIDAD POSITIVA" value={`${((totalPositivos/totalGlobalTextos)*100).toFixed(1)}%`} sub="Satisfacción global" icon={<Zap/>} color="text-cyan-400" />
              <StatCard title="FECHA ÚLTIMA CARGA" value="Hoy" sub="Actualización" icon={<Calendar/>} color="text-emerald-400" />
            </div>

            {/* 🔹 GRÁFICO DE TENDENCIA (Spline Area Chart) */}
            {totalSesiones >= 2 && (
              <div className="bg-white/5 backdrop-blur-2xl rounded-3xl p-8 border border-white/10 shadow-2xl">
                <h3 className="text-xl font-bold mb-8 flex items-center gap-2"><TrendingUp className="w-5 h-5 text-cyan-400"/> Evolución de Puntuaciones (Promedio por Tanda)</h3>
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={historyData.map((s, i) => ({ name: `Análisis #${i+1}`, score: (s.avgScore * 100).toFixed(0) }))}>
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
                        type="monotone" // Esto crea el efecto "Spline" (suavizado)
                        dataKey="score" 
                        stroke="#22d3ee" 
                        strokeWidth={4} 
                        fill="url(#colorTrend)" 
                        dot={{ r: 6, fill: '#22d3ee', strokeWidth: 2, stroke: '#fff' }} // Puntos marcados
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

// Componente Interno para las Tarjetas
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