import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ClayCard, ClayButton } from './components';
import LoginPage from './pages/Login';
import Dashboard from './pages/Dashboard';
import MealLogging from './pages/MealLogging';
import WorkoutLogging from './pages/WorkoutLogging';
import Stats from './pages/Stats';
import { clearStoredToken, getStoredToken } from './lib/api';

const pageVariants = {
  initial: { opacity: 0, x: -20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: 20 }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.4
};

const Navigation = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { path: '/dashboard', icon: 'home' },
    { path: '/meal-logging', icon: 'restaurant' },
    { path: '/workout-logging', icon: 'fitness_center' },
    { path: '/stats', icon: 'insights' },
    { path: '/settings', icon: 'settings' }
  ];
  
  return (
    <motion.nav 
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[92%] max-w-sm h-18 bg-white/90 backdrop-blur-xl rounded-[2.5rem] shadow-[16px_16px_32px_rgba(0,0,0,0.1),-8px_-8px_24px_rgba(255,255,255,1)] border border-white/80 flex items-center justify-around px-2 z-50"
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.6 }}
    >
      {navItems.map((item) => (
        <motion.button 
          key={item.path}
          className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${
            location.pathname === item.path
              ? 'bg-clay-primary text-white shadow-lg scale-110' 
              : 'text-slate-300 hover:text-clay-primary'
          }`}
          whileHover={{ scale: location.pathname === item.path ? 1.2 : 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => navigate(item.path)}
        >
          <span className="material-symbols-outlined text-3xl font-bold">{item.icon}</span>
        </motion.button>
      ))}
    </motion.nav>
  );
};

const App = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(() => Boolean(getStoredToken()));

  useEffect(() => {
    const syncAuthState = () => {
      setIsAuthenticated(Boolean(getStoredToken()));
    };

    window.addEventListener('storage', syncAuthState);
    return () => window.removeEventListener('storage', syncAuthState);
  }, []);

  const handleAuthSuccess = () => {
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    clearStoredToken();
    setIsAuthenticated(false);
  };

  return (
    <Router>
      <AnimatePresence mode="wait">
        <Routes>
          <Route
            path="/login"
            element={isAuthenticated ? <Navigate to="/dashboard" replace /> : <LoginPage onAuthSuccess={handleAuthSuccess} />}
          />
          <Route path="/dashboard" element={
            isAuthenticated ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Dashboard />
                <Navigation />
              </motion.div>
            ) : <Navigate to="/login" replace />
          } />
          <Route path="/meal-logging" element={
            isAuthenticated ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <MealLogging />
                <Navigation />
              </motion.div>
            ) : <Navigate to="/login" replace />
          } />
          <Route path="/workout-logging" element={
            isAuthenticated ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <WorkoutLogging />
                <Navigation />
              </motion.div>
            ) : <Navigate to="/login" replace />
          } />
          <Route path="/stats" element={
            isAuthenticated ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <Stats />
                <Navigation />
              </motion.div>
            ) : <Navigate to="/login" replace />
          } />
          <Route path="/settings" element={
            isAuthenticated ? (
              <motion.div
                initial="initial"
                animate="in"
                exit="out"
                variants={pageVariants}
                transition={pageTransition}
              >
                <div className="min-h-screen bg-[#f7fcf9] flex items-center justify-center p-6 font-['Public_Sans',sans-serif]">
                  <ClayCard className="p-8 max-w-md w-full space-y-4">
                    <h2 className="text-2xl font-black text-clay-secondary">Settings</h2>
                    <p className="text-clay-secondary/70">Your session is stored locally on this device.</p>
                    <ClayButton variant="primary" className="w-full" onClick={handleLogout}>
                      Sign Out
                    </ClayButton>
                    <ClayButton variant="default" className="w-full" onClick={() => window.history.back()}>
                      Go Back
                    </ClayButton>
                  </ClayCard>
                </div>
                <Navigation />
              </motion.div>
            ) : <Navigate to="/login" replace />
          } />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
          <Route path="*" element={<Navigate to={isAuthenticated ? "/dashboard" : "/login"} replace />} />
        </Routes>
      </AnimatePresence>
    </Router>
  );
};

export default App;
