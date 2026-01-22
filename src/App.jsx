import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import Landing from './views/Landing';
import Auth from './views/Auth';
import DashboardView from './views/DashboardView';
import AnalysisView from './views/AnalysisView';
import HistoryView from './views/HistoryView';
import DemoSelectionView from './views/DemoSelectionView';
import { sentimentService } from './services/sentimentService';

// Componente principal con la lógica
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [historyData, setHistoryData] = useState([]);

  // Limpiar estado cuando cambia la ruta
  useEffect(() => {
    setText('');
    setResults(null);
    setErrorMessage('');
  }, [location.pathname]);

  const analyzeSentiment = async () => {
    // Si no hay texto, no hacemos nada
    if (!text.trim()) return;
    
    setAnalyzing(true);
    setErrorMessage('');
    
    const isBatchMode = location.pathname === '/analysis-batch' || location.pathname === '/demo-batch';
    
    try {
      if (isBatchMode) {
        // Convertimos el texto (que viene del CSV con saltos de línea) en un array
        const comentarios = text.split('\n').filter(t => t.trim());

        if (comentarios.length === 0) {
           setErrorMessage('No hay textos válidos para analizar.');
           setAnalyzing(false);
           return;
        }
        
        // ✅ SOLO para usuarios autenticados NO DEMO
        if (user && !isDemo && user.token) {
          const result = await sentimentService.analyzeAndSave(comentarios, user.token);
          
          setResults({
            isBatch: true,
            totalAnalyzed: result.total,
            sessionSaved: true,
            sessionId: result.sessionId,
            items: result.comentarios, 
            stats: {
              avgScore: result.avgScore,
              positivos: result.positivos,
              negativos: result.negativos,
              neutrales: result.neutrales,
            }
          });
        } else {
          // ✅ MODO DEMO
          // Para demo, enviamos el texto completo para que el servicio simule el batch
          const result = await sentimentService.analyzeBatch(text);
          setResults(result);
        }
      } else {
        // Análisis Simple
        const result = await sentimentService.analyzeSingle(text);
        setResults(result);
      }
    } catch (error) {
      console.error(error);
      setErrorMessage(error.message || 'Error al analizar el texto');
      setResults(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    const normalizedSentiment = sentiment?.toLowerCase().trim();
    switch(normalizedSentiment) {
      case 'positivo': return '#10b981';
      case 'negativo': return '#ef4444';
      case 'neutral': return '#f59e0b';
      default: return '#8b5cf6';
    }
  };

  const getStatistics = () => {
    if (!results?.isBatch) return null;
    
    if (results.stats) {
      const { positivos, negativos, neutrales } = results.stats;
      const total = positivos + negativos + neutrales;
      // Evitar división por cero
      const safeTotal = total === 0 ? 1 : total;
      
      return [
        { name: 'Positivo', value: positivos, color: '#10b981', percentage: ((positivos / safeTotal) * 100).toFixed(1) },
        { name: 'Negativo', value: negativos, color: '#ef4444', percentage: ((negativos / safeTotal) * 100).toFixed(1) },
        { name: 'Neutral', value: neutrales, color: '#f59e0b', percentage: ((neutrales / safeTotal) * 100).toFixed(1) }
      ];
    }
    
    // Fallback si no hay stats precalculados (ej. Demo)
    const items = results.items || [];
    if (items.length === 0) return null;
    
    const counts = { positivo: 0, negativo: 0, neutral: 0 };
    
    items.forEach(item => {
      const sentiment = item.sentiment?.toLowerCase().trim();
      if (sentiment === 'positivo') counts.positivo++;
      else if (sentiment === 'negativo') counts.negativo++;
      else if (sentiment === 'neutral') counts.neutral++;
    });
    
    const total = items.length;
    const safeTotal = total === 0 ? 1 : total;
    
    return [
      { name: 'Positivo', value: counts.positivo, color: '#10b981', percentage: ((counts.positivo / safeTotal) * 100).toFixed(1) },
      { name: 'Negativo', value: counts.negativo, color: '#ef4444', percentage: ((counts.negativo / safeTotal) * 100).toFixed(1) },
      { name: 'Neutral', value: counts.neutral, color: '#f59e0b', percentage: ((counts.neutral / safeTotal) * 100).toFixed(1) }
    ];
  };

  const handleLogin = (e, userData) => {
    e.preventDefault();
    setUser({
      id: userData.id,
      email: userData.correo,
      name: userData.nombreCompleto || `${userData.nombre} ${userData.apellido}`,
      token: userData.token,
    });
    setIsDemo(false);
    navigate('/dashboard');
  };

  const handleRegister = (e, userData) => {
    e.preventDefault();
    navigate('/login');
  };

  const handleLogout = () => {
    setUser(null);
    setIsDemo(false);
    navigate('/');
    setText('');
    setResults(null);
    setErrorMessage('');
  };

  const handleDemoStart = () => {
    setUser({ email: 'demo@sentimentapi.com', name: 'Demo' });
    setIsDemo(true);
    navigate('/demo-selection');
  };

  const handleBackToLanding = () => {
    setUser(null);
    setIsDemo(false);
    navigate('/');
    setText('');
    setResults(null);
    setErrorMessage('');
  };

  // Wrapper para setCurrentView que usa navigate
  const setCurrentView = (view) => {
    navigate(`/${view}`);
  };

  // Props comunes para AnalysisView
  const analysisProps = {
    setCurrentView,
    user,
    isDemo,
    handleLogout,
    handleBackToLanding,
    text,
    setText,
    analyzing,
    analyzeSentiment,
    results,
    setResults,
    getStatistics,
    getSentimentColor,
    errorMessage
  };

  return (
    <Routes>
      {/* Landing Page */}
      <Route 
        path="/" 
        element={
          <Landing 
            setCurrentView={setCurrentView}
            handleDemoStart={handleDemoStart}
            showMobileMenu={showMobileMenu} 
            setShowMobileMenu={setShowMobileMenu} 
          />
        } 
      />

      {/* Login */}
      <Route 
        path="/login" 
        element={
          <Auth 
            type="login" 
            handleSubmit={handleLogin} 
            setCurrentView={setCurrentView} 
          />
        } 
      />

      {/* Register */}
      <Route 
        path="/register" 
        element={
          <Auth 
            type="register" 
            handleSubmit={handleRegister} 
            setCurrentView={setCurrentView} 
          />
        } 
      />

      {/* Demo Selection */}
      <Route 
        path="/demo-selection" 
        element={
          user && isDemo ? (
            <DemoSelectionView
              setCurrentView={setCurrentView}
              handleBackToLanding={handleBackToLanding}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Dashboard */}
      <Route 
        path="/dashboard" 
        element={
          user && !isDemo ? (
            <DashboardView
              currentView="dashboard"
              setCurrentView={setCurrentView}
              user={user}
              isDemo={isDemo}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Analysis Simple */}
      <Route 
        path="/analysis-simple" 
        element={
          user && !isDemo ? (
            <AnalysisView
              currentView="analysis-simple"
              isBatchMode={false}
              {...analysisProps}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Analysis Batch */}
      <Route 
        path="/analysis-batch" 
        element={
          user && !isDemo ? (
            <AnalysisView
              currentView="analysis-batch"
              isBatchMode={true}
              {...analysisProps}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Demo Simple */}
      <Route 
        path="/demo-simple" 
        element={
          user && isDemo ? (
            <AnalysisView
              currentView="demo-simple"
              isBatchMode={false}
              {...analysisProps}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Demo Batch */}
      <Route 
        path="/demo-batch" 
        element={
          user && isDemo ? (
            <AnalysisView
              currentView="demo-batch"
              isBatchMode={true}
              {...analysisProps}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* History */}
      <Route 
        path="/history" 
        element={
          user && !isDemo ? (
            <HistoryView
              currentView="history"
              setCurrentView={setCurrentView}
              user={user}
              handleLogout={handleLogout}
              historyData={historyData}
              getSentimentColor={getSentimentColor}
              userToken={user.token}
            />
          ) : (
            <Navigate to="/" replace />
          )
        } 
      />

      {/* Ruta por defecto */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
};

export default App;