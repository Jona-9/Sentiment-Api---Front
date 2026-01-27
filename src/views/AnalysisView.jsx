// src/views/AnalysisView.jsx
import React, { useState, useEffect } from 'react';
import { 
  Sparkles, TrendingUp, AlertCircle, Home, History, LogOut, 
  BarChart3, FileText, ArrowLeft, Upload, X, Package, CheckCircle2, 
  Grid3x3, ChevronRight, Plus, Loader2, Check, Clock 
} from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const AnalysisView = ({
  currentView, setCurrentView, user, isDemo, handleLogout, handleBackToLanding,
  isBatchMode, text, setText, analyzing, analyzeSentiment, results, setResults,
  getStatistics, getSentimentColor, errorMessage, 
  selectedProducts: propSelectedProducts 
}) => {
  
  // ==================== LÓGICA DEL ASISTENTE (WIZARD) ====================
  const [step, setStep] = useState((isBatchMode && !isDemo) ? 1 : 3);
  
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [wizardSelectedProducts, setWizardSelectedProducts] = useState([]); 
  const [loadingData, setLoadingData] = useState(false);
  const [newProductName, setNewProductName] = useState('');

  // Cargar Categorías (Solo si NO es demo)
  useEffect(() => {
    if (isBatchMode && step === 1 && user?.token && !isDemo) {
      setLoadingData(true);
      fetch('http://localhost:8080/project/api/v2/categoria', {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => setCategories(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingData(false));
    }
  }, [isBatchMode, step, user, isDemo]);

  // Cargar Productos (Solo si NO es demo)
  useEffect(() => {
    if (isBatchMode && step === 2 && selectedCategory && user?.token && !isDemo) {
      setLoadingData(true);
      fetch(`http://localhost:8080/project/api/v2/producto/por-categoria?categoriaId=${selectedCategory.categoriaId}`, {
        headers: { 'Authorization': `Bearer ${user.token}` }
      })
      .then(res => res.json())
      .then(data => setProducts(data))
      .catch(err => console.error(err))
      .finally(() => setLoadingData(false));
    }
  }, [isBatchMode, step, selectedCategory, user, isDemo]);

  const handleSelectCategory = (cat) => { setSelectedCategory(cat); setStep(2); };

  const toggleProduct = (prod) => {
    setWizardSelectedProducts(prev => {
      const exists = prev.find(p => p.productoId === prod.productoId);
      if (exists) return prev.filter(p => p.productoId !== prod.productoId);
      return [...prev, prod];
    });
  };

  const handleCreateProduct = async () => {
    if (!newProductName.trim()) return;
    setLoadingData(true);
    try {
      const response = await fetch('http://localhost:8080/project/api/v2/producto', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user.token}` },
        body: JSON.stringify({ nombreProducto: newProductName, categoriaId: selectedCategory.categoriaId })
      });
      if (response.ok) {
        const newProd = await response.json();
        setProducts([...products, newProd]);
        setWizardSelectedProducts(prev => [...prev, newProd]);
        setNewProductName('');
      }
    } catch (e) { console.error(e); } finally { setLoadingData(false); }
  };

  const finalSelectedProducts = isBatchMode ? wizardSelectedProducts : propSelectedProducts;

  // ==================== LÓGICA CSV ====================
  const [csvFile, setCsvFile] = useState(null);
  const [csvTexts, setCsvTexts] = useState([]);
  const [csvError, setCsvError] = useState('');

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) { setCsvError('Solo se permiten archivos .csv'); return; }
    setCsvError(''); setCsvFile(file);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const buffer = event.target.result;
        let textContent;
        try { textContent = new TextDecoder('utf-8', { fatal: true }).decode(buffer); } 
        catch (e) { textContent = new TextDecoder('iso-8859-1').decode(buffer); }

        const lines = textContent.split(/\r\n|\n/).filter(line => line.trim());
        if (lines.length === 0) { setCsvError('Archivo vacío'); setCsvFile(null); return; }

        const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/"/g, ''));
        const textoIndex = headers.indexOf('texto');
        if (textoIndex === -1) { setCsvError('Falta columna "texto"'); setCsvFile(null); return; }

        const texts = [];
        const limit = Math.min(lines.length, 501);
        for (let i = 1; i < limit; i++) {
          const values = lines[i].split(/,(?=(?:(?:[^"]*"){2})*[^"]*$)/);
          let texto = values[textoIndex]?.trim();
          if (texto) {
             if (texto.startsWith('"') && texto.endsWith('"')) texto = texto.slice(1, -1);
             texto = texto.replace(/""/g, '"');
             if(texto) texts.push(texto);
          }
        }
        if (texts.length === 0) { setCsvError('No hay textos válidos'); setCsvFile(null); return; }
        setCsvTexts(texts); setText(texts.join('\n'));
      } catch (error) { setCsvError('Error de lectura'); setCsvFile(null); }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleClearFile = () => { setCsvFile(null); setCsvTexts([]); setCsvError(''); setText(''); };

  // ==================== FUNCIONES DE ANÁLISIS POR PRODUCTO ====================
  const calculateProductStats = () => {
    if (results?.productosDetectados && results.productosDetectados.length > 0) {
      return results.productosDetectados.map(p => {
        const nombreProducto = p.nombreProducto || p.producto || p.name || 'Desconocido';
        const positivos = p.conteoPositivos || p.positivosSesion || p.positivos || 0;
        const negativos = p.conteoNegativos || p.negativosSesion || p.negativos || 0;
        const neutrales = p.conteoNeutrales || p.neutralesSesion || p.neutrales || 0;
        const total = positivos + negativos + neutrales;
        const safeTotal = total || 1;
        
        return {
          name: nombreProducto,
          pctPositivo: parseFloat(((positivos / safeTotal) * 100).toFixed(1)),
          pctNegativo: parseFloat(((negativos / safeTotal) * 100).toFixed(1)),
          pctNeutral: parseFloat(((neutrales / safeTotal) * 100).toFixed(1)),
          positivo: positivos,
          negativo: negativos,
          neutral: neutrales
        };
      });
    }

    if (!results?.items) return [];

    const statsMap = {};
    results.items.forEach(item => {
      const prodName = item.productoAsociado || 
                       item.nombreProducto || 
                       item.producto || 
                       (item.text && finalSelectedProducts.length > 0 
                        ? detectProductInText(item.text, finalSelectedProducts) 
                        : 'General');
      
      if (!statsMap[prodName]) {
        statsMap[prodName] = { name: prodName, positivo: 0, negativo: 0, neutral: 0, total: 0 };
      }
      
      const sent = item.sentiment?.toLowerCase();
      if (sent === 'positivo') statsMap[prodName].positivo++;
      else if (sent === 'negativo') statsMap[prodName].negativo++;
      else statsMap[prodName].neutral++;
      statsMap[prodName].total++;
    });

    return Object.values(statsMap).map(p => {
      const safeTotal = p.total || 1;
      return {
        ...p,
        pctPositivo: parseFloat(((p.positivo / safeTotal) * 100).toFixed(1)),
        pctNegativo: parseFloat(((p.negativo / safeTotal) * 100).toFixed(1)),
        pctNeutral: parseFloat(((p.neutral / safeTotal) * 100).toFixed(1)),
      };
    });
  };

  // ==================== GRÁFICO DE PASTEL POR PRODUCTO ====================
  const getPieDataByProduct = () => {
    const productStats = calculateProductStats();
    const result = {};
    
    productStats.forEach(prod => {
      result[prod.name] = [
        { name: 'Negativo', value: prod.negativo, color: '#ef4444' },
        { name: 'Neutral', value: prod.neutral, color: '#f59e0b' },
        { name: 'Positivo', value: prod.positivo, color: '#10b981' }
      ];
    });
    
    return result;
  };

  // ==================== DISTRIBUCIÓN GENERAL DE PUNTUACIONES ====================
  const getGeneralScoreDistribution = () => {
    if (!results?.items) return [];

    const distribution = [
      { range: '0.0-0.2', count: 0 },
      { range: '0.2-0.4', count: 0 },
      { range: '0.4-0.6', count: 0 },
      { range: '0.6-0.8', count: 0 },
      { range: '0.8-1.0', count: 0 },
    ];

    results.items.forEach(item => {
      const score = item.score || 0;
      if (score <= 0.2) distribution[0].count++;
      else if (score <= 0.4) distribution[1].count++;
      else if (score <= 0.6) distribution[2].count++;
      else if (score <= 0.8) distribution[3].count++;
      else distribution[4].count++;
    });

    return distribution;
  };

  const detectProductInText = (text, selectedProducts) => {
    const textLower = text.toLowerCase();
    for (const producto of selectedProducts) {
      if (textLower.includes(producto.nombreProducto.toLowerCase())) {
        return producto.nombreProducto;
      }
    }
    return 'General';
  };

  const renderProductBreakdownList = (sentimentType) => {
    const productStats = calculateProductStats();
    const filtered = productStats.filter(p => p[sentimentType] > 0);
    if (filtered.length === 0) return null;

    return (
      <div className="mt-3 pt-3 border-t border-white/10 w-full">
        <p className="text-[10px] text-white/50 uppercase font-bold mb-2">Desglose por Producto</p>
        <div className="space-y-1 max-h-24 overflow-y-auto custom-scrollbar">
          {filtered.map(p => (
            <div key={p.name} className="flex justify-between items-center text-xs">
              <span className="text-white/90 truncate max-w-[120px] font-medium" title={p.name}>{p.name}</span>
              <span className="font-mono font-bold bg-white/10 px-1.5 rounded text-white">{p[sentimentType]}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // ==================== RENDER DETALLADO (RESULTADOS) ====================
  const renderDetailedResults = () => {
    if (!results) return null;
    
    if (!results.isBatch) {
      return (
        <div className="mt-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-500/30 mb-8">
              <div className="flex items-center gap-4 mb-6">
                <TrendingUp className="w-10 h-10 text-cyan-400" />
                <h3 className="text-3xl font-black text-white">Análisis Completado</h3>
              </div>
              <div className="bg-[#1a0b2e]/50 rounded-2xl p-8 border border-white/10">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-cyan-400 font-bold text-lg">TEXTO ANALIZADO</span>
                  <span className="text-purple-300 font-semibold">Confianza: {(results.score * 100).toFixed(1)}%</span>
                </div>
                <p className="text-white text-xl mb-6 italic">"{results.text}"</p>
                <div className="flex items-center justify-between bg-gradient-to-r from-purple-600/20 to-pink-600/20 rounded-xl p-6 border border-purple-500/30">
                  <div>
                    <p className="text-purple-300 text-sm font-semibold mb-1">SENTIMIENTO</p>
                    <p className="text-4xl font-black uppercase" style={{color: getSentimentColor(results.sentiment)}}>{results.sentiment}</p>
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

    const stats = getStatistics();
    const pieDataByProduct = getPieDataByProduct();
    const generalScoreDistribution = getGeneralScoreDistribution();
    
    return (
      <div className="mt-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-cyan-500/30">
          <div className="flex items-center gap-4 mb-6">
            <TrendingUp className="w-10 h-10 text-cyan-400" />
            <h3 className="text-3xl font-black text-white">Análisis Completado</h3>
          </div>
          
          <div className="text-center py-4 border-b border-white/10 mb-6">
            <p className="text-xl text-purple-200 mb-2">Textos Analizados</p>
            <p className="text-6xl font-black text-white">{results.totalAnalyzed}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gradient-to-br from-emerald-500/10 to-emerald-600/10 border border-emerald-400/30 p-6 rounded-2xl flex flex-col items-center">
               <div className="mb-2 w-10 h-10 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-xl">+</div>
               <p className="text-emerald-300 font-bold mb-1">POSITIVOS</p>
               <p className="text-4xl text-white font-black">{stats[0].value}</p>
               {renderProductBreakdownList('positivo')}
            </div>

            <div className="bg-gradient-to-br from-amber-500/10 to-amber-600/10 border border-amber-400/30 p-6 rounded-2xl flex flex-col items-center">
               <div className="mb-2 w-10 h-10 bg-amber-500/20 rounded-full flex items-center justify-center text-amber-400 font-bold text-xl">~</div>
               <p className="text-amber-300 font-bold mb-1">NEUTRALES</p>
               <p className="text-4xl text-white font-black">{stats[2].value}</p>
               {renderProductBreakdownList('neutral')}
            </div>

            <div className="bg-gradient-to-br from-red-500/10 to-red-600/10 border border-red-400/30 p-6 rounded-2xl flex flex-col items-center">
               <div className="mb-2 w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center text-red-400 font-bold text-xl">-</div>
               <p className="text-red-300 font-bold mb-1">NEGATIVOS</p>
               <p className="text-4xl text-white font-black">{stats[1].value}</p>
               {renderProductBreakdownList('negativo')}
            </div>
          </div>
        </div>

        {/* GRÁFICOS: DISTRIBUCIÓN DE SENTIMIENTOS (PASTEL POR PRODUCTO) Y DISTRIBUCIÓN DE PUNTUACIONES (BARRAS GENERAL) */}
        {isBatchMode && !isDemo && finalSelectedProducts.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* GRÁFICOS DE PASTEL POR PRODUCTO */}
            {Object.entries(pieDataByProduct).map(([productName, pieData]) => (
              <div key={productName} className="bg-[#2d1b4e]/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-2 mb-4">
                  <BarChart3 className="w-5 h-5 text-purple-400" />
                  <h4 className="text-xl font-bold text-white">Distribución de Sentimientos</h4>
                </div>
                <p className="text-purple-300 text-sm mb-2">Producto: <span className="font-bold text-white">{productName}</span></p>
                
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={pieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                      label={(entry) => `${entry.name} ${((entry.value / pieData.reduce((a,b) => a + b.value, 0)) * 100).toFixed(1)}%`}
                      labelLine={false}
                    >
                      {pieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ))}
          </div>
        )}

        {/* DISTRIBUCIÓN GENERAL DE PUNTUACIONES (BARRAS) */}
        {isBatchMode && generalScoreDistribution.length > 0 && (
          <div className="bg-[#2d1b4e]/60 backdrop-blur-xl rounded-2xl p-6 border border-purple-500/30">
            <div className="flex items-center gap-2 mb-4">
              <BarChart3 className="w-5 h-5 text-cyan-400" />
              <h4 className="text-xl font-bold text-white">Distribución de Puntuaciones</h4>
            </div>
            
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={generalScoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" stroke="#ffffff10" />
                <XAxis 
                  dataKey="range" 
                  stroke="#9ca3af" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  stroke="#9ca3af" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1e1b4b', 
                    border: '1px solid #6366f1', 
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                  {generalScoreDistribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill="#a78bfa" />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-2xl p-8 border-2 border-purple-500/30">
          <h4 className="text-2xl font-black text-white mb-6">Detalle de Comentarios</h4>
          <div className="space-y-4">
            {results.items.map((item, index) => (
              <div key={index} className="bg-[#1a0b2e]/50 rounded-xl p-6 border border-white/10 hover:border-white/20 transition-all">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <span className="bg-purple-500/20 text-purple-300 px-3 py-1 rounded-lg font-bold text-sm">#{index + 1}</span>
                    <span className="px-3 py-1 rounded-lg font-bold uppercase text-sm" style={{ backgroundColor: `${getSentimentColor(item.sentiment)}20`, color: getSentimentColor(item.sentiment) }}>{item.sentiment}</span>
                    {item.productoAsociado && (
                      <span className="inline-flex items-center gap-1 text-sm bg-blue-500/20 text-blue-300 px-3 py-1 rounded-lg border border-blue-500/30">
                        <Package className="w-3 h-3"/> {item.productoAsociado}
                      </span>
                    )}
                  </div>
                  <div className="text-right"><p className="text-xl font-bold text-white">{(item.score * 100).toFixed(0)}%</p></div>
                </div>
                <p className="text-white italic text-sm">"{item.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#2d1b4e] to-[#1a0b2e]">
      <header className="bg-[#2d1b4e]/60 backdrop-blur-xl border-b border-purple-500/20 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-gradient-to-br from-pink-500 to-purple-600 rounded-2xl shadow-lg">
                <Sparkles className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tight">SentimentAPI</h1>
                <p className="text-sm text-purple-300 font-medium uppercase tracking-widest">Platform</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              {isDemo ? (
                <>
                  <button 
                    onClick={() => setCurrentView('demo-selection')} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 rounded-xl border border-purple-500/30 transition-all"
                  >
                    <ArrowLeft className="w-4 h-4" /> <span className="hidden sm:inline">Volver</span>
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl border border-red-500/30 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
                  </button>
                </>
              ) : (
                <>
                  <button 
                    onClick={() => setCurrentView('dashboard')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all ${currentView === 'dashboard' ? 'bg-purple-600 text-white border-purple-400' : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border-purple-500/30'}`}
                  >
                    <Home className="w-4 h-4" /> <span className="hidden sm:inline">Dashboard</span>
                  </button>
                  <button 
                    onClick={() => setCurrentView('history')}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl border transition-all ${currentView === 'history' ? 'bg-purple-600 text-white border-purple-400' : 'bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border-purple-500/30'}`}
                  >
                    <Clock className="w-4 h-4" /> <span className="hidden sm:inline">Historial</span>
                  </button>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-2 px-5 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-300 rounded-xl border border-red-500/30 transition-all"
                  >
                    <LogOut className="w-4 h-4" /> <span className="hidden sm:inline">Salir</span>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {isBatchMode && step === 1 && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <div className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 mb-4">
                <Grid3x3 className="w-4 h-4 text-purple-300"/> <span className="text-purple-300 font-bold text-sm">PASO 1 DE 3</span>
              </div>
              <h2 className="text-5xl font-black text-white mb-4">Selecciona una Categoría</h2>
            </div>
            {loadingData ? <div className="flex justify-center p-12"><Loader2 className="w-12 h-12 text-purple-400 animate-spin"/></div> : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {categories.map((cat) => (
                  <button key={cat.categoriaId} onClick={() => handleSelectCategory(cat)} className="group bg-gradient-to-br from-purple-600/10 to-purple-800/10 hover:from-purple-600/30 hover:to-purple-800/30 border-2 border-purple-500/30 hover:border-purple-400 p-8 rounded-2xl text-left transition-all hover:scale-[1.02]">
                    <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-purple-500/20 rounded-xl"><Package className="w-6 h-6 text-purple-300"/></div>
                      <ChevronRight className="w-6 h-6 text-purple-500 group-hover:translate-x-1 transition-transform"/>
                    </div>
                    <h3 className="text-2xl font-bold text-white mb-2">{cat.nombreCategoria}</h3>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {isBatchMode && step === 2 && (
          <div className="max-w-5xl mx-auto animate-in fade-in slide-in-from-right-8 duration-300">
            <button onClick={() => setStep(1)} className="flex items-center gap-2 text-purple-300 hover:text-white mb-6 transition-colors"><ArrowLeft className="w-4 h-4"/> Volver</button>
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/20 rounded-full border border-purple-500/30 mb-4">
                <Package className="w-4 h-4 text-purple-300"/> <span className="text-purple-300 font-bold text-sm">PASO 2 DE 3</span>
              </div>
              <h2 className="text-4xl font-black text-white">Selecciona Productos</h2>
              <p className="text-purple-300 mt-2">Categoría: <span className="text-white font-bold">{selectedCategory?.nombreCategoria}</span></p>
            </div>
            <div className="bg-[#2d1b4e]/30 border border-purple-500/30 rounded-3xl p-8 mb-8">
              {loadingData ? <div className="flex justify-center p-8"><Loader2 className="w-10 h-10 text-purple-400 animate-spin"/></div> : (
                <>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8 max-h-[400px] overflow-y-auto custom-scrollbar pr-2">
                    {products.map((prod) => {
                      const isSelected = wizardSelectedProducts.find(p => p.productoId === prod.productoId);
                      return (
                        <button key={prod.productoId} onClick={() => toggleProduct(prod)} className={`p-4 rounded-xl border-2 text-left transition-all flex items-center justify-between ${isSelected ? 'bg-purple-600/30 border-purple-400' : 'bg-white/5 border-white/10 hover:border-purple-500/50'}`}>
                          <span className="text-white font-medium truncate pr-2">{prod.nombreProducto}</span>
                          {isSelected ? <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0"/> : <div className="w-5 h-5 rounded-full border border-purple-500/30 flex-shrink-0"/>}
                        </button>
                      );
                    })}
                  </div>
                  <div className="bg-white/5 p-4 rounded-xl border border-white/10 flex flex-col md:flex-row gap-4 items-center">
                    <input type="text" value={newProductName} onChange={(e) => setNewProductName(e.target.value)} placeholder="Nuevo producto..." className="flex-1 bg-[#1a0b2e] border border-purple-500/30 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-400"/>
                    <button onClick={handleCreateProduct} disabled={!newProductName.trim()} className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-bold flex items-center justify-center gap-2"><Plus className="w-5 h-5"/> Crear</button>
                  </div>
                </>
              )}
            </div>
            <div className="flex justify-end">
              <button onClick={() => setStep(3)} disabled={wizardSelectedProducts.length === 0} className="px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white rounded-xl font-bold text-lg shadow-xl hover:scale-105 transition-all flex items-center gap-2 disabled:opacity-50">Continuar <ChevronRight className="w-5 h-5"/></button>
            </div>
          </div>
        )}

        {((isBatchMode && step === 3) || !isBatchMode) && (
          <div className="animate-in fade-in slide-in-from-bottom-8 duration-300">
            {isBatchMode && !isDemo && (
              <div className="mb-8 flex items-center justify-between">
                <button onClick={() => setStep(2)} className="flex items-center gap-2 text-purple-300 hover:text-white transition-colors"><ArrowLeft className="w-4 h-4"/> Editar</button>
                <div className="bg-purple-500/20 px-4 py-2 rounded-full border border-purple-500/30 text-sm text-white flex items-center gap-2">
                  <Check className="w-4 h-4 text-green-400"/> {finalSelectedProducts.length} Productos
                </div>
              </div>
            )}
            
            {!results && (
              <>
                <div className="text-center mb-12">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    {isBatchMode ? <BarChart3 className="w-12 h-12 text-purple-400" /> : <FileText className="w-12 h-12 text-purple-400" />}
                    <h2 className="text-5xl font-black text-white">Análisis {isBatchMode ? 'Múltiple' : 'Simple'}</h2>
                  </div>
                  <p className="text-purple-300 text-lg">Procesando datos con modelos de lenguaje.</p>
                </div>

                <div className="max-w-4xl mx-auto">
                  <div className="bg-gradient-to-br from-purple-600/20 to-purple-800/20 backdrop-blur-xl rounded-3xl p-8 border-2 border-purple-500/30 shadow-2xl">
                    {(isBatchMode && !isDemo) ? (
                      <div className="space-y-6">
                        {!csvFile ? (
                          <div className="border-2 border-dashed border-purple-500/30 rounded-2xl p-12 text-center hover:border-purple-500/50 transition-all">
                            <Upload className="w-16 h-16 text-purple-400 mx-auto mb-4" />
                            <h3 className="text-2xl font-bold text-white mb-2">Selecciona un archivo CSV</h3>
                            <p className="text-purple-300 mb-6">Columna requerida: 'texto'</p>
                            <label className="inline-block px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold rounded-xl cursor-pointer transition-all shadow-xl">
                              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
                              Seleccionar archivo
                            </label>
                          </div>
                        ) : (
                          <div className="bg-[#1a0b2e]/50 border-2 border-purple-500/30 rounded-2xl p-6">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <FileText className="w-8 h-8 text-purple-400" />
                                <div><p className="text-white font-bold">{csvFile.name}</p><p className="text-purple-300 text-sm">{csvTexts.length} filas</p></div>
                              </div>
                              <button onClick={handleClearFile} className="p-2 bg-red-500/20 text-red-400 rounded-lg"><X className="w-5 h-5" /></button>
                            </div>
                          </div>
                        )}
                        {csvError && <div className="p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-300"><AlertCircle className="w-5 h-5" /> {csvError}</div>}
                      </div>
                    ) : (
                      <textarea 
                        value={text} 
                        onChange={(e) => setText(e.target.value)} 
                        maxLength={isBatchMode ? 10000 : 500} 
                        placeholder={isBatchMode ? "Escribe tus comentarios aquí (uno por línea)..." : "Escribe aquí..."} 
                        className="w-full h-56 bg-[#1a0b2e]/50 border-2 border-purple-500/30 rounded-xl p-6 text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-purple-400 resize-none text-lg" 
                      />
                    )}

                    {errorMessage && <div className="mb-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-300"><AlertCircle className="w-5 h-5" /> {errorMessage}</div>}
                    <button onClick={() => analyzeSentiment()} disabled={(!text.trim() && !csvFile) || analyzing} className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 disabled:opacity-50 text-white font-bold py-5 rounded-xl flex items-center justify-center gap-3 transition-all text-lg shadow-xl mt-6">{analyzing ? 'Analizando...' : 'Analizar ahora'}</button>
                  </div>
                </div>
              </>
            )}

            {renderDetailedResults()}
          </div>
        )}
      </main>
    </div>
  );
};

export default AnalysisView;