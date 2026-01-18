import React, { useState } from 'react';
import Landing from './views/Landing';
import Auth from './views/Auth';
import DashboardView from './views/DashboardView';
import HistoryView from './views/HistoryView';

const App = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  
  const [historyData] = useState([
    { sentiment: 'positivo', score: 0.85, text: 'Excelente producto', date: '2025-01-15' },
    { sentiment: 'negativo', score: 0.92, text: 'Muy mal servicio', date: '2025-01-15' },
    { sentiment: 'positivo', score: 0.78, text: 'Me encanta', date: '2025-01-16' },
    { sentiment: 'neutral', score: 0.55, text: 'Está bien', date: '2025-01-16' },
    { sentiment: 'positivo', score: 0.91, text: 'Increíble experiencia', date: '2025-01-17' },
  ]);

  const analyzeSentiment = () => {
    if (!text.trim()) return;
    setAnalyzing(true);
    
    setTimeout(() => {
      const textsToAnalyze = isBatchMode 
        ? text.split('\n').filter(t => t.trim())
        : [text];
      
      const newResults = textsToAnalyze.map(txt => {
        const sentiment = Math.random();
        let label, score;
        
        if (sentiment < 0.33) {
          label = 'negativo';
          score = Math.random() * 0.33 + 0.67;
        } else if (sentiment < 0.66) {
          label = 'neutral';
          score = Math.random() * 0.2 + 0.4;
        } else {
          label = 'positivo';
          score = Math.random() * 0.34 + 0.66;
        }
        
        return { text: txt, sentiment: label, score: score };
      });
      
      if (isBatchMode) {
        setResults({ isBatch: true, totalAnalyzed: newResults.length, items: newResults });
      } else {
        setResults(newResults[0]);
      }
      
      setAnalyzing(false);
    }, 2000);
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

  const handleLogin = (e) => {
    e.preventDefault();
    setUser({ email: 'usuario@ejemplo.com', name: 'Usuario Demo' });
    setIsDemo(false);
    setCurrentView('dashboard');
  };

  const handleRegister = (e) => {
    e.preventDefault();
    setUser({ email: 'nuevo@ejemplo.com', name: 'Usuario Nuevo' });
    setIsDemo(false);
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setIsDemo(false);
    setCurrentView('landing');
    setText('');
    setResults(null);
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