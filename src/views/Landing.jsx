import React from 'react';
import { Zap, Brain, BarChart3 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

const Landing = ({ setCurrentView, setUser, setIsDemo, showMobileMenu, setShowMobileMenu }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <Navbar currentView="landing" setCurrentView={setCurrentView} user={null}
        showMobileMenu={showMobileMenu} setShowMobileMenu={setShowMobileMenu} />

      <div className="pt-32 pb-20 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-5xl sm:text-7xl font-black text-white mb-6">
            Descubre el poder del <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
              análisis de sentimientos
            </span>
          </h1>

          <div className="flex justify-center gap-4">
            <button onClick={() => setCurrentView('register')}
              className="px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold">
              Comenzar Gratis
            </button>

            <button onClick={() => {
              setUser({ name: 'Demo', email: 'demo@sentimentapi.com' });
              setIsDemo(true);
              setCurrentView('dashboard');
            }}
              className="px-8 py-4 bg-white/10 text-white rounded-xl font-bold border border-white/20">
              Ver Demo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
