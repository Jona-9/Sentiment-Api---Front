// src/App.jsx
import React, { useState, useEffect } from 'react';
import Landing from './views/Landing';
import Auth from './views/Auth';
import DashboardView from './views/DashboardView';
import AnalysisView from './views/AnalysisView';
import HistoryView from './views/HistoryView';
import DemoSelectionView from './views/DemoSelectionView';
import { sentimentService } from './services/sentimentService';

const App = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  
  const [historyData] = useState([
    { sentiment: 'positivo', score: 0.85, text: 'Excelente producto', date: '2025-01-15' },
    { sentiment: 'negativo', score: 0.92, text: 'Muy mal servicio', date: '2025-01-15' },
    { sentiment: 'positivo', score: 0.78, text: 'Me encanta', date: '2025-01-16' },
    { sentiment: 'neutral', score: 0.55, text: 'Está bien', date: '2025-01-16' },
    { sentiment: 'positivo', score: 0.91, text: 'Increíble experiencia', date: '2025-01-17' },
  ]);

  // ✅ NUEVO: Limpiar texto y resultados al cambiar de modo
  useEffect(() => {
    setText('');
    setResults(null);
    setErrorMessage('');
  }, [currentView]);

  const analyzeSentiment = async () => {
    if (!text.trim()) return;
    
    setAnalyzing(true);
    setErrorMessage('');
    
    const isBatchMode = currentView === 'analysis-batch' || currentView === 'demo-batch';
    
    try {
      if (isBatchMode) {
        const result = await sentimentService.analyzeBatch(text);
        console.log('✅ Resultado batch:', result);
        setResults(result);
      } else {
        const result = await sentimentService.analyzeSingle(text);
        console.log('✅ Resultado simple:', result);
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
    const normalizedSentiment = sentiment?.toLowerCase().trim();
    switch(normalizedSentiment) {
      case 'positivo': return '#10b981';
      case 'negativo': return '#ef4444';
      case 'neutral': return '#f59e0b';
      default: 
        console.warn('⚠️ Sentimiento desconocido:', sentiment);
        return '#8b5cf6';
    }
  };

  const getStatistics = () => {
    if (!results?.isBatch) return null;
    const items = results.items || [];
    if (items.length === 0) return null;
    
    const counts = {
      positivo: 0,
      negativo: 0,
      neutral: 0
    };
    
    items.forEach(item => {
      const sentiment = item.sentiment?.toLowerCase().trim();
      if (sentiment === 'positivo') counts.positivo++;
      else if (sentiment === 'negativo') counts.negativo++;
      else if (sentiment === 'neutral') counts.neutral++;
      else console.warn('⚠️ Sentimiento no reconocido:', item.sentiment);
    });
    
    const total = items.length;
    
    return [
      { 
        name: 'Positivo', 
        value: counts.positivo, 
        color: '#10b981', 
        percentage: ((counts.positivo / total) * 100).toFixed(1)
      },
      { 
        name: 'Negativo', 
        value: counts.negativo, 
        color: '#ef4444', 
        percentage: ((counts.negativo / total) * 100).toFixed(1)
      },
      { 
        name: 'Neutral', 
        value: counts.neutral, 
        color: '#f59e0b', 
        percentage: ((counts.neutral / total) * 100).toFixed(1)
      }
    ];
  };

  const handleLogin = (e, userData) => {
    e.preventDefault();
    setUser({
      id: userData.id,
      email: userData.correo,
      name: `${userData.nombre} ${userData.apellido}`,
    });
    setIsDemo(false);
    setCurrentView('dashboard');
  };

  const handleRegister = (e, userData) => {
    e.preventDefault();
    // No crear sesión automáticamente, solo redirigir al login
    setCurrentView('login');
  };

  const handleLogout = () => {
    setUser(null);
    setIsDemo(false);
    setCurrentView('landing');
    setText('');
    setResults(null);
    setErrorMessage('');
  };

  const handleDemoStart = () => {
    setUser({ email: 'demo@sentimentapi.com', name: 'Demo' });
    setIsDemo(true);
    setCurrentView('demo-selection');
  };

  // Landing Page
  if (currentView === 'landing') {
    return (
      <Landing 
        setCurrentView={setCurrentView} 
        handleDemoStart={handleDemoStart}
        showMobileMenu={showMobileMenu} 
        setShowMobileMenu={setShowMobileMenu} 
      />
    );
  }

  // Login Page
  if (currentView === 'login') {
    return (
      <Auth 
        type="login" 
        handleSubmit={handleLogin} 
        setCurrentView={setCurrentView} 
      />
    );
  }

  // Register Page
  if (currentView === 'register') {
    return (
      <Auth 
        type="register" 
        handleSubmit={handleRegister} 
        setCurrentView={setCurrentView} 
      />
    );
  }

  // Demo Selection View
  if (currentView === 'demo-selection' && user && isDemo) {
    return (
      <DemoSelectionView
        setCurrentView={setCurrentView}
        handleLogout={handleLogout}
      />
    );
  }

  // Dashboard (Main Menu) - Solo para usuarios registrados
  if (currentView === 'dashboard' && user && !isDemo) {
    return (
      <DashboardView
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        isDemo={isDemo}
        handleLogout={handleLogout}
      />
    );
  }

  // Analysis Views (Simple & Batch) - Para usuarios registrados Y demo
  if ((currentView === 'analysis-simple' || currentView === 'analysis-batch' || 
       currentView === 'demo-simple' || currentView === 'demo-batch') && user) {
    
    const isBatchMode = currentView === 'analysis-batch' || currentView === 'demo-batch';
    
    return (
      <AnalysisView
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        isDemo={isDemo}
        handleLogout={handleLogout}
        isBatchMode={isBatchMode}
        text={text}
        setText={setText}
        analyzing={analyzing}
        analyzeSentiment={analyzeSentiment}
        results={results}
        setResults={setResults}
        getStatistics={getStatistics}
        getSentimentColor={getSentimentColor}
        errorMessage={errorMessage}
      />
    );
  }

  // History View - Solo para usuarios registrados
  if (currentView === 'history' && user && !isDemo) {
    return (
      <HistoryView
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        handleLogout={handleLogout}
        historyData={historyData}
        getSentimentColor={getSentimentColor}
      />
    );
  }

  // Fallback
  return null;
};

export default App;