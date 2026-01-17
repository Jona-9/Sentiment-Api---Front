import React, { useState } from 'react';
import Landing from './views/Landing';
import DashboardView from './views/DashboardView';
import Navbar from './components/layout/Navbar';
import Auth from './views/Auth';

const App = () => {
  const [currentView, setCurrentView] = useState('landing');
  const [user, setUser] = useState(null);
  const [isDemo, setIsDemo] = useState(false);
  const [text, setText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [results, setResults] = useState(null);
  const [isBatchMode, setIsBatchMode] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      {currentView === 'landing' && (
        <Landing
          setCurrentView={setCurrentView}
          setUser={setUser}
          setIsDemo={setIsDemo}
          showMobileMenu={showMobileMenu}
          setShowMobileMenu={setShowMobileMenu}
        />
      )}

      {currentView === 'dashboard' && (
        <>
          <Navbar
            currentView={currentView}
            setCurrentView={setCurrentView}
            user={user}
            isDemo={isDemo}
            handleLogout={() => setCurrentView('landing')}
            showMobileMenu={showMobileMenu}
            setShowMobileMenu={setShowMobileMenu}
          />
          <DashboardView
            user={user}
            isDemo={isDemo}
            text={text}
            setText={setText}
            isBatchMode={isBatchMode}
            setIsBatchMode={setIsBatchMode}
            analyzing={analyzing}
            results={results}
            setCurrentView={setCurrentView}
          />
        </>
      )}

      {(currentView === 'login' || currentView === 'register') && (
        <Auth type={currentView} />
      )}
    </>
  );
};

export default App;
