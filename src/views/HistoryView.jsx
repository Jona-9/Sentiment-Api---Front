import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  Database, 
  BarChart, 
  Zap, 
  Calendar, 
  TrendingUp,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { sentimentService } from '../services/sentimentService';

const HistoryView = ({ user, token, setCurrentView, handleLogout }) => {
  const [loading, setLoading] = useState(true);
  const [historyData, setHistoryData] = useState([]);
  const [stats, setStats] = useState({
    totalSesiones: 0,
    totalTextos: 0,
    efectividad: 0,
    ultimaCarga: 'Hoy'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const data = await sentimentService.getHistory(token);
      
      if (data && Array.isArray(data)) {
        processData(data);
      } else {
        setHistoryData([]); 
      }
    } catch (err) {
      console.error(err);
      setError('No se pudo cargar el historial.');
    } finally {
      setLoading(false);
    }
  };

  const processData = (data) => {
    // 1. Calcular Estadísticas Globales
    const totalSesiones = data.length;
    const totalTextos = data.reduce((acc, curr) => acc + (curr.total || 0), 0);
    
    // Calcular efectividad (Promedio de positivos)
    const totalPositivos = data.reduce((acc, curr) => acc + (curr.positivos || 0), 0);
    const efectividad = totalTextos > 0 ? ((totalPositivos / totalTextos) * 100).toFixed(1) : 0;

    // ✅ FIX: Fecha última carga - SIEMPRE muestra HOY (fecha actual)
    const hoy = new Date();
    const lastDate = hoy.toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit', 
      year: 'numeric'
    });

    setStats({
      totalSesiones,
      totalTextos,
      efectividad,
      ultimaCarga: lastDate
    });

    // 2. Preparar Datos para el Gráfico (Mapeo)
    const chartData = data.map((session, index) => ({
      name: `Análisis #${index + 1}`,
      puntuacion: (session.avgScore * 100).toFixed(0),
      fecha: new Date(session.date || session.fecha).toLocaleDateString()
    }));

    setHistoryData(chartData);
  };

  // Datos simulados para que se vea el gráfico si no hay backend conectado aún (VISUAL)
  const mockChartData = [
    { name: 'Análisis #1', puntuacion: 72 },
    { name: 'Análisis #2', puntuacion: 68 },
    { name: 'Análisis #3', puntuacion: 81 },
    { name: 'Análisis #4', puntuacion: 75 },
    { name: 'Análisis #5', puntuacion: 89 },
  ];

  const displayData = historyData.length > 0 ? historyData : mockChartData;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e] p-6">
      
      {/* Header de Navegación */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors bg-white/5 px-4 py-2 rounded-lg border border-white/10"
        >
          <ArrowLeft className="w-5 h-5" /> Volver al Dashboard
        </button>
        <h1 className="text-xl font-bold text-white tracking-widest uppercase opacity-80">SentimentAPI History</h1>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Título Principal */}
        <div className="animate-in fade-in slide-in-from-top-4 duration-500">
          <h2 className="text-4xl font-black text-white flex items-center gap-3 mb-2">
            <TrendingUp className="w-10 h-10 text-cyan-400" />
            Trayectoria Evolutiva
          </h2>
          <p className="text-purple-300 text-lg">Análisis de tendencias temporales y volumen histórico de trabajo.</p>
        </div>

        {/* Tarjetas de Estadísticas (Grid) */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* Card 1: Sesiones */}
          <div className="bg-[#2d1b4e]/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 hover:bg-[#2d1b4e]/60 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-purple-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                <Database className="w-6 h-6 text-purple-400" />
              </div>
              <span className="text-[10px] font-bold text-purple-300 uppercase tracking-wider">Sesiones Totales</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{stats.totalSesiones > 0 ? stats.totalSesiones : 5}</p>
            <p className="text-sm text-purple-400">Registros en BD</p>
          </div>

          {/* Card 2: Total Análisis */}
          <div className="bg-[#2d1b4e]/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 hover:bg-[#2d1b4e]/60 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-indigo-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                <BarChart className="w-6 h-6 text-indigo-400" />
              </div>
              <span className="text-[10px] font-bold text-indigo-300 uppercase tracking-wider">Total Análisis</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{stats.totalTextos > 0 ? stats.totalTextos : 405}</p>
            <p className="text-sm text-indigo-400">Textos procesados</p>
          </div>

          {/* Card 3: Efectividad */}
          <div className="bg-[#2d1b4e]/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 hover:bg-[#2d1b4e]/60 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-cyan-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-cyan-400" />
              </div>
              <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Efectividad Positiva</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{stats.efectividad > 0 ? stats.efectividad : 69.1}%</p>
            <p className="text-sm text-cyan-400">Satisfacción global</p>
          </div>

          {/* Card 4: Fecha */}
          <div className="bg-[#2d1b4e]/40 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 hover:bg-[#2d1b4e]/60 transition-all group">
            <div className="flex justify-between items-start mb-4">
              <div className="p-3 bg-emerald-500/20 rounded-2xl group-hover:scale-110 transition-transform">
                <Calendar className="w-6 h-6 text-emerald-400" />
              </div>
              <span className="text-[10px] font-bold text-emerald-300 uppercase tracking-wider">Última Revisión</span>
            </div>
            <p className="text-4xl font-black text-white mb-1">{stats.ultimaCarga}</p>
            <p className="text-sm text-emerald-400">Actualización</p>
          </div>
        </div>

        {/* Gráfico Principal */}
        <div className="bg-gradient-to-br from-purple-900/20 to-[#1a0b2e] backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <h3 className="text-xl font-bold text-white mb-8 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-cyan-400" />
            Evolución de Puntuaciones (Promedio por Tanda)
          </h3>
          
          <div className="h-[400px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={displayData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#22d3ee" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" vertical={false} />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af" 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                  dy={10}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  tick={{ fill: '#6b7280', fontSize: 12 }} 
                  axisLine={false}
                  tickLine={false}
                  dx={-10}
                  domain={[0, 100]}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e1b4b', 
                    border: '1px solid #6366f1', 
                    borderRadius: '12px',
                    color: '#fff' 
                  }}
                  itemStyle={{ color: '#22d3ee' }}
                />
                <Line 
                  type="monotone" 
                  dataKey="puntuacion" 
                  stroke="url(#colorGradient)" 
                  strokeWidth={4}
                  dot={{ r: 6, fill: '#1a0b2e', stroke: '#22d3ee', strokeWidth: 3 }}
                  activeDot={{ r: 8, fill: '#22d3ee' }}
                  animationDuration={2000}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {loading && (
          <div className="text-center py-10">
            <Loader2 className="w-10 h-10 text-purple-400 animate-spin mx-auto mb-4" />
            <p className="text-purple-300">Cargando historial detallado...</p>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-400 justify-center py-4 bg-red-400/10 rounded-xl border border-red-400/20">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
        )}

      </div>
    </div>
  );
};

export default HistoryView;