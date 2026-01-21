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
  
  const [historyData, setHistoryData] = useState([]);

  // Limpiar texto y resultados al cambiar de modo
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
        const comentarios = text.split('\n').filter(t => t.trim());
        
        // ✅ Si el usuario está registrado, guardar en BD
        if (user && !isDemo && user.token) {
          const result = await sentimentService.analyzeAndSave(comentarios, user.token);
          
          // Convertir la respuesta del backend al formato del frontend
          setResults({
            isBatch: true,
            totalAnalyzed: result.total,
            sessionSaved: true,
            sessionId: result.sessionId,
            items: comentarios.map((comentario) => ({
              text: comentario,
              sentiment: 'procesado', // El backend ya procesó todo
              score: result.avgScore,
            })),
            stats: {
              avgScore: result.avgScore,
              positivos: result.positivos,
              negativos: result.negativos,
              neutrales: result.neutrales,
            }
          });
        } else {
          // Modo demo: solo analizar sin guardar
          const result = await sentimentService.analyzeBatch(text);
          setResults(result);
        }
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
    
    // Si ya tenemos estadísticas del backend, usarlas
    if (results.stats) {
      const { positivos, negativos, neutrales } = results.stats;
      const total = positivos + negativos + neutrales;
      
      return [
        { name: 'Positivo', value: positivos, color: '#10b981', percentage: ((positivos / total) * 100).toFixed(1) },
        { name: 'Negativo', value: negativos, color: '#ef4444', percentage: ((negativos / total) * 100).toFixed(1) },
        { name: 'Neutral', value: neutrales, color: '#f59e0b', percentage: ((neutrales / total) * 100).toFixed(1) }
      ];
    }
    
    // Calcular desde items (modo demo)
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
    
    return [
      { name: 'Positivo', value: counts.positivo, color: '#10b981', percentage: ((counts.positivo / total) * 100).toFixed(1) },
      { name: 'Negativo', value: counts.negativo, color: '#ef4444', percentage: ((counts.negativo / total) * 100).toFixed(1) },
      { name: 'Neutral', value: counts.neutral, color: '#f59e0b', percentage: ((counts.neutral / total) * 100).toFixed(1) }
    ];
  };

  const handleLogin = (e, userData) => {
    e.preventDefault();
    setUser({
      id: userData.id,
      email: userData.correo,
      name: `${userData.nombre} ${userData.apellido}`,
      token: userData.token, // ✅ GUARDAR TOKEN
    });
    setIsDemo(false);
    setCurrentView('dashboard');
  };

  const handleRegister = (e, userData) => {
    e.preventDefault();
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

  const handleBackToLanding = () => {
    setUser(null);
    setIsDemo(false);
    setCurrentView('landing');
    setText('');
    setResults(null);
    setErrorMessage('');
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
        handleBackToLanding={handleBackToLanding}
      />
    );
  }

  // Dashboard (Main Menu)
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

  // Analysis Views (Simple & Batch)
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
        handleBackToLanding={handleBackToLanding}
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

  // History View
  if (currentView === 'history' && user && !isDemo) {
    return (
      <HistoryView
        currentView={currentView}
        setCurrentView={setCurrentView}
        user={user}
        handleLogout={handleLogout}
        historyData={historyData}
        getSentimentColor={getSentimentColor}
        userToken={user.token} // ✅ PASAR TOKEN
      />
    );
  }

  return null;
};

export default App;