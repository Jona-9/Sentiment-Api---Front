import {
  Sparkles,
  Home,
  Clock,
  LogOut,
  Zap,
  Send,
  TrendingUp
} from "lucide-react";

const DashboardView = ({
  currentView,
  setCurrentView,
  user,
  isDemo,
  handleLogout,
  isBatchMode,
  setIsBatchMode,
  text,
  setText,
  analyzing,
  analyzeSentiment,
  results,
  getStatistics,
  getSentimentColor
}) => {
  if (currentView !== "dashboard" || !user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
      {/* Navigation */}
      <nav className="bg-slate-900/80 backdrop-blur-xl border-b border-purple-500/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-pink-500 to-purple-600 rounded-xl">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-black text-white">SentimentAPI</span>
            </div>

            <div className="flex items-center gap-4">
              <button
                onClick={() => setCurrentView("dashboard")}
                className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                  currentView === "dashboard"
                    ? "bg-purple-600 text-white"
                    : "text-gray-300 hover:text-white"
                }`}
              >
                <Home className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </button>

              {!isDemo && (
                <button
                  onClick={() => setCurrentView("history")}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all flex items-center gap-2 ${
                    currentView === "history"
                      ? "bg-purple-600 text-white"
                      : "text-gray-300 hover:text-white"
                  }`}
                >
                  <Clock className="w-4 h-4" />
                  <span className="hidden sm:inline">Historial</span>
                </button>
              )}

              <button
                onClick={handleLogout}
                className="px-4 py-2 text-gray-300 hover:text-white rounded-lg font-semibold transition-all flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Salir</span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Content */}
      <div className="p-4 sm:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-white mb-2">
              {isDemo ? "¡Prueba SentimentAPI!" : `Hola, ${user.name}!`}
            </h1>
            <p className="text-purple-300">
              {isDemo
                ? "Estás en modo demo. Regístrate para acceder al historial y más funciones."
                : "Analiza sentimientos de forma rápida y precisa"}
            </p>

            {isDemo && (
              <button
                onClick={() => setCurrentView("register")}
                className="mt-4 px-6 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-bold hover:from-purple-700 hover:to-pink-700 transition-all"
              >
                Registrarse para más funciones
              </button>
            )}
          </div>

          <div className="bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 overflow-hidden">
            <div className="bg-gradient-to-r from-cyan-500/20 to-blue-500/20 px-8 py-6 border-b border-white/10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-cyan-400/20 rounded-lg">
                  <Zap className="w-6 h-6 text-cyan-300" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Analizador</h2>
                  <p className="text-sm text-purple-200">
                    Análisis simple o múltiple
                  </p>
                </div>
              </div>
            </div>

            <div className="p-8">
              {/* Toggle */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <button
                  onClick={() => {
                    setIsBatchMode(false);
                    setText("");
                  }}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    !isBatchMode
                      ? "bg-cyan-500 text-white shadow-lg"
                      : "bg-white/10 text-purple-200 hover:bg-white/20"
                  }`}
                >
                  Simple
                </button>
                <button
                  onClick={() => {
                    setIsBatchMode(true);
                    setText("");
                  }}
                  className={`px-6 py-2.5 rounded-xl font-semibold transition-all ${
                    isBatchMode
                      ? "bg-cyan-500 text-white shadow-lg"
                      : "bg-white/10 text-purple-200 hover:bg-white/20"
                  }`}
                >
                  Múltiple
                </button>
              </div>

              {/* Input */}
              <div className="relative mb-6">
                <textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  maxLength={isBatchMode ? 5000 : 500}
                  placeholder={
                    isBatchMode
                      ? "Ingresa múltiples textos (uno por línea):\nEste producto es excelente\nMuy mal servicio\nEstá bien, nada especial"
                      : "Escribe un texto para analizar..."
                  }
                  className="w-full h-44 bg-white/5 border-2 border-white/20 rounded-2xl p-5 text-white placeholder-purple-300/60 focus:outline-none focus:ring-2 focus:ring-cyan-400 focus:border-transparent resize-none transition-all text-lg"
                />
              </div>

              {/* Button */}
              <button
                onClick={analyzeSentiment}
                disabled={!text.trim() || analyzing}
                className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-700 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl text-lg"
              >
                <Send className="w-6 h-6" />
                {analyzing ? "Analizando..." : "Analizar"}
              </button>

              {analyzing && (
                <div className="mt-10 text-center">
                  <div className="inline-block mb-6">
                    <div className="w-20 h-20 border-4 border-cyan-400/30 border-t-cyan-400 rounded-full animate-spin"></div>
                  </div>
                  <p className="text-2xl font-bold text-white mb-2">
                    Procesando...
                  </p>
                  <p className="text-purple-300">Analizando con IA</p>
                </div>
              )}

              {results && !analyzing && (
                <div className="mt-10">
                  <div className="bg-gradient-to-br from-white/10 to-white/5 rounded-2xl p-8 border-2 border-white/20 shadow-2xl">
                    <div className="flex items-center gap-2 mb-6">
                      <TrendingUp className="w-6 h-6 text-cyan-400" />
                      <h3 className="text-2xl font-bold text-white">
                        Resultado
                      </h3>
                    </div>

                    <div className="p-6 rounded-xl font-bold text-xl border-2 text-center shadow-lg"
                      style={{
                        backgroundColor:
                          getSentimentColor(results.sentiment) + "20",
                        borderColor: getSentimentColor(results.sentiment),
                        color: getSentimentColor(results.sentiment)
                      }}
                    >
                      <div className="text-sm opacity-75 mb-2">
                        SENTIMIENTO
                      </div>
                      <div className="text-3xl uppercase tracking-wider">
                        {results.sentiment}
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardView;
