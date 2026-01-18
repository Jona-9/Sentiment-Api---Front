// src/App.jsx
import React, { useState } from 'react';
import Landing from './views/Landing';
import Auth from './views/Auth';
import DashboardView from './views/DashboardView';
import HistoryView from './views/HistoryView';
import { sentimentService } from './services/sentimentService';

const App = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // ← NUEVO
  
  const [historyData] = useState([
    { sentiment: 'positivo', score: 0.85, text: 'Excelente producto', date: '2025-01-15' },
    { sentiment: 'negativo', score: 0.92, text: 'Muy mal servicio', date: '2025-01-15' },
    { sentiment: 'positivo', score: 0.78, text: 'Me encanta', date: '2025-01-16' },
    { sentiment: 'neutral', score: 0.55, text: 'Está bien', date: '2025-01-16' },
    { sentiment: 'positivo', score: 0.91, text: 'Increíble experiencia', date: '2025-01-17' },
  ]);

  // ✅ FUNCIÓN MODIFICADA - Ahora conectada a la API real
  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    
    setAnalyzing(true);
    setErrorMessage('');
    
    try {
      if (isBatchMode) {
        const result = await sentimentService.analyzeBatch(text);
        setResults(result);
      } else {
        const result = await sentimentService.analyzeSingle(text);
        setResults(result);
      }
    } catch (error) {
      setErrorMessage(error.message || 'Error al analizar el texto');
      setResults(null);
    } finally {
      setAnalyzing(false);
    }
  };

  const getSentimentColor = (sentiment) => {
    switch(sentiment) {
      case 'positivo': return '#10b981';
      case 'negativo': return '#ef4444';
      case 'neutral': return '#f59e0b';
      default: return '#8b5cf6';
    }
  };

  const getStatistics = () => {
    if (!isBatchMode || !results?.isBatch) return null;
    const items = results.items || [];
    if (items.length === 0) return null;
    
    const counts = {
      positivo: items.filter(h => h.sentiment === 'positivo').length,
      negativo: items.filter(h => h.sentiment === 'negativo').length,
      neutral: items.filter(h => h.sentiment === 'neutral').length
    };
    
    return [
      { name: 'Positivo', value: counts.positivo, color: '#10b981', percentage: (counts.positivo / items.length * 100).toFixed(1) },
      { name: 'Negativo', value: counts.negativo, color: '#ef4444', percentage: (counts.negativo / items.length * 100).toFixed(1) },
      { name: 'Neutral', value: counts.neutral, color: '#f59e0b', percentage: (counts.neutral / items.length * 100).toFixed(1) }
    ];
  };

  const getHistoryStatistics = () => {
    const counts = {
      positivo: historyData.filter(h => h.sentiment === 'positivo').length,
      negativo: historyData.filter(h => h.sentiment === 'negativo').length,
      neutral: historyData.filter(h => h.sentiment === 'neutral').length
    };
    
    return [
      { name: 'Positivo', value: counts.positivo, color: '#10b981', percentage: (counts.positivo / historyData.length * 100).toFixed(1) },
      { name: 'Negativo', value: counts.negativo, color: '#ef4444', percentage: (counts.negativo / historyData.length * 100).toFixed(1) },
      { name: 'Neutral', value: counts.neutral, color: '#f59e0b', percentage: (counts.neutral / historyData.length * 100).toFixed(1) }
    ];
  };

  const getScoreDistribution = () => {
    const ranges = { '0.0-0.2': 0, '0.2-0.4': 0, '0.4-0.6': 0, '0.6-0.8': 0, '0.8-1.0': 0 };
    historyData.forEach(h => {
      if (h.score < 0.2) ranges['0.0-0.2']++;
      else if (h.score < 0.4) ranges['0.2-0.4']++;
      else if (h.score < 0.6) ranges['0.4-0.6']++;
      else if (h.score < 0.8) ranges['0.6-0.8']++;
      else ranges['0.8-1.0']++;
    });
    return Object.entries(ranges).map(([name, value]) => ({ name, value }));
  };

  // ✅ FUNCIÓN MODIFICADA - Ahora recibe datos del usuario de la API
  const handleLogin = (e, userData) => {
    e.preventDefault();
    setUser({
      email: userData.correo,
      name: userData.nombre || userData.correo.split('@')[0],
    });
    setIsDemo(false);
    setCurrentView('dashboard');
  };

  // ✅ FUNCIÓN MODIFICADA - Ahora recibe datos del usuario de la API
  const handleRegister = (e, userData) => {
    e.preventDefault();
    setUser({
      email: userData.correo,
      name: `${userData.nombre} ${userData.apellido}`,
    });
    setIsDemo(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setIsDemo(false);
    setCurrentView('landing');
    setText('');
    setResults(null);
    setErrorMessage('');
  };

  // Renderizar vistas
  if (currentView === 'landing') {
    return <Landing setCurrentView={setCurrentView} setUser={setUser} setIsDemo={setIsDemo} showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />;
  }

  if (currentView === 'login') {
    return <Auth type="login" handleSubmit={handleLogin} setCurrentView={setCurrentView} />;
  }

  if (currentView === 'register') {
    return <Auth type="register" handleSubmit={handleRegister} setCurrentView={setCurrentView} />;
  }

  if (currentView === 'dashboard' && user) {
    return (
      <DashboardView
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        isDemo={isDemo}
        handleLogout={handleLogout}
        isBatchMode={isBatchMode}
        setIsBatchMode={setIsBatchMode}
        text={text}
        setText={setText}
        analyzing={analyzing}
        analyzeSentiment={analyzeSentiment}
        results={results}
        setResults={setResults}
        getStatistics={getStatistics}
        getSentimentColor={getSentimentColor}
        errorMessage={errorMessage} // ← NUEVO: Pasar el mensaje de error
      />
    );
  }

  if (currentView === 'history' && user && !isDemo) {
    return (
      <HistoryView
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        handleLogout={handleLogout}
        historyData={historyData}
        getHistoryStatistics={getHistoryStatistics}
        getScoreDistribution={getScoreDistribution}
        getSentimentColor={getSentimentColor}
      />
    );
  }

  return null;
};

export default App;