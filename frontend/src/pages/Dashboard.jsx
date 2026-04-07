import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ClayCard, ClayProgressRing } from '../components';
import { getDashboardData, getDailyHydration, logHydration } from '../lib/api';

const streakBarHeights = [52, 68, 76, 88, 72, 94, 82];
const healthBubbleClassNames = {
  'clay-primary': 'text-clay-primary',
  'clay-neutral': 'text-clay-neutral',
  'clay-tertiary': 'text-clay-tertiary',
  'clay-secondary': 'text-clay-secondary'
};

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [hydration, setHydration] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dash, water] = await Promise.all([
          getDashboardData(),
          getDailyHydration()
        ]);
        setData(dash);
        setHydration(water || 0);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleAddWater = async (amount) => {
    try {
      await logHydration(amount);
      setHydration(prev => prev + amount);
    } catch (err) {
      console.error("Hydration log failed", err);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fcf9] flex items-center justify-center font-['Public_Sans',sans-serif]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-clay-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#f7fcf9] flex items-center justify-center p-6 font-['Public_Sans',sans-serif]">
        <ClayCard className="p-8 text-center max-w-sm">
          <span className="material-symbols-outlined text-4xl text-red-500 mb-4">error</span>
          <h2 className="text-xl font-black text-clay-secondary mb-2">Failed to load data</h2>
          <p className="text-clay-secondary/60 mb-6">{error}</p>
          <button 
            className="px-6 py-2 bg-clay-primary text-white rounded-xl font-bold shadow-lg"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </ClayCard>
      </div>
    );
  }

  const calProgress = data ? Math.min(100, Math.round((data.calories_consumed / data.calorie_goal) * 100)) : 0;
  const primarySuggestion = data?.coaching_suggestions?.[0] || {
    title: "Stay hydrated",
    message: "Drinking enough water boosts energy and helps with hunger.",
    icon: "water_drop"
  };

  return (
    <div className="min-h-screen bg-[#f7fcf9] p-6 pb-24 font-['Public_Sans',sans-serif]">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 w-full z-50 bg-[#f7fcf9]/80 backdrop-blur-lg px-6 h-16 flex justify-between items-center shadow-[0_4px_30px_rgba(12,204,72,0.05)]"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-clay-primary rounded-xl flex items-center justify-center text-white shadow-[4px_4px_12px_rgba(12,204,72,0.3)]"
            whileHover={{ scale: 1.1, rotate: 15 }}
            transition={{ type: "spring", stiffness: 400 }}
          >
            <span className="material-symbols-outlined font-bold">exercise</span>
          </motion.div>
          <h1 className="text-lg font-black text-clay-secondary tracking-tight">Hi, {data?.user_name || 'Hiker'}</h1>
        </div>
        <motion.button 
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-clay-primary shadow-[6px_6px_12px_rgba(12,204,72,0.2),-6px_-6px_12px_rgba(255,255,255,1)]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="material-symbols-outlined">notifications</span>
        </motion.button>
      </motion.header>

      <motion.main 
        className="pt-20 max-w-2xl mx-auto space-y-12"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Streak Card - Clay Style */}
        <motion.div variants={itemVariants}>
          <ClayCard hover={true}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="w-12 h-12 bg-clay-neutral rounded-2xl flex items-center justify-center shadow-lg"
                  initial={{ rotate: -12 }}
                  whileHover={{ rotate: 0, scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 400 }}
                >
                  <span className="text-2xl">🔥</span>
                </motion.div>
                <div>
                  <p className="text-sm font-black text-clay-secondary">{data?.current_streak || 0} Day Streak</p>
                  <p className="text-[10px] uppercase tracking-widest font-bold text-clay-primary">Level: {data?.current_streak > 3 ? 'Energized' : 'Getting Started'}</p>
                </div>
              </div>
              <div className="flex gap-1.5 h-10 items-end">
                {streakBarHeights.map((height, index) => (
                  <motion.div 
                    key={index} 
                    className="w-3 bg-clay-primary rounded-full shadow-[inset_1px_1px_2px_rgba(0,0,0,0.1)]" 
                    style={{ height: `${height}%`, filter: `brightness(${1 - index * 0.05})` }}
                    initial={{ scaleY: 0 }}
                    animate={{ scaleY: 1 }}
                    transition={{ delay: (index + 1) * 0.1, duration: 0.3 }}
                  />
                ))}
              </div>
            </div>
          </ClayCard>
        </motion.div>

        {/* Calorie Progress - High Clay Effect */}
        <motion.div variants={itemVariants}>
          <ClayCard className="p-12" hover={true}>
            <div className="flex flex-col items-center gap-12">
              <ClayProgressRing 
                progress={calProgress}
                size={280}
                strokeWidth={16}
                color="primary"
              >
                <div className="flex flex-col items-center">
                  <motion.span 
                    className="text-2xl font-black text-clay-secondary"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                  >
                    {data?.calories_consumed?.toLocaleString() || 0}
                  </motion.span>
                  <span className="text-[7px] font-black uppercase tracking-widest text-clay-primary opacity-60">CONSUMED</span>
                </div>
              </ClayProgressRing>

              <div className="grid grid-cols-2 gap-8 w-full max-w-md">
                <motion.div 
                  className="bg-clay-neutral p-8 rounded-[2.5rem] shadow-[inset_8px_8px_16px_rgba(255,255,255,0.4),inset_-8px_-8px_16px_rgba(74,29,74,0.1)]"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-sm text-[#4a1d4a]">flag</span>
                    <p className="text-[11px] uppercase font-black text-[#4a1d4a] opacity-50">Goal</p>
                  </div>
                  <p className="text-2xl font-black text-[#4a1d4a]">{data?.calorie_goal?.toLocaleString() || 2000}</p>
                </motion.div>
                <motion.div 
                  className="bg-clay-tertiary p-8 rounded-[2.5rem] shadow-[inset_8px_8px_16px_rgba(255,255,255,0.4),inset_-8px_-8px_16px_rgba(12,204,72,0.15)]"
                  whileHover={{ scale: 1.05 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <span className="material-symbols-outlined text-sm text-clay-secondary">restaurant</span>
                    <p className="text-[11px] uppercase font-black text-clay-secondary opacity-50">Remaining</p>
                  </div>
                  <p className="text-2xl font-black text-clay-secondary">{data?.calories_remaining?.toLocaleString() || 0}</p>
                </motion.div>
              </div>
            </div>
          </ClayCard>
        </motion.div>

        {/* AI Actionable Box */}
        <motion.div variants={itemVariants}>
          <ClayCard variant="primary" className="relative overflow-hidden group">
            <div className="flex gap-5 relative z-10 items-center">
              <motion.div 
                className="w-14 h-14 bg-clay-tertiary rounded-3xl flex items-center justify-center shadow-lg"
                whileHover={{ scale: 1.1, rotate: 15 }}
              >
                <span className="material-symbols-outlined text-clay-secondary text-3xl font-bold">{primarySuggestion.icon || 'bolt'}</span>
              </motion.div>
              <div className="flex-1">
                <span className="text-[10px] font-black uppercase tracking-widest bg-white/20 px-2 py-0.5 rounded-full inline-block mb-2">Coach Suggestion</span>
                <p className="text-sm font-bold leading-relaxed text-emerald-50">
                  {primarySuggestion.message}
                </p>
              </div>
            </div>
            <motion.div 
              className="absolute top-2 right-4 w-10 h-10 bg-white/10 rounded-full blur-xl"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </ClayCard>
        </motion.div>

        {/* Hydration Widget */}
        <motion.div variants={itemVariants}>
          <ClayCard className="p-8" hover={true}>
            <div className="flex items-center justify-between gap-8">
              <div className="flex-1">
                <h3 className="text-sm font-black text-clay-secondary uppercase tracking-widest mb-1">Hydration Hub</h3>
                <p className="text-2xl font-black text-clay-secondary">{hydration} <span className="text-xs text-slate-400">ml</span></p>
                <div className="flex gap-2 mt-4">
                  {[250, 500].map(amount => (
                    <motion.button
                      key={amount}
                      onClick={() => handleAddWater(amount)}
                      className="px-4 py-2 bg-clay-neutral rounded-xl text-xs font-bold text-clay-primary shadow-sm"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      +{amount}ml
                    </motion.button>
                  ))}
                </div>
              </div>
              <div className="relative w-24 h-24 bg-clay-tertiary/20 rounded-[2rem] flex items-center justify-center overflow-hidden shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)]">
                <motion.div 
                  className="absolute bottom-0 w-full bg-clay-primary/40"
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.min(100, (hydration / 2000) * 100)}%` }}
                  transition={{ type: "spring", stiffness: 50 }}
                />
                <span className="material-symbols-outlined text-4xl text-clay-primary relative z-10">water_drop</span>
              </div>
            </div>
          </ClayCard>
        </motion.div>

        {/* Health Bubbles */}
        <motion.div variants={itemVariants}>
          <section className="grid grid-cols-4 gap-6">
            {[
              {label: 'Protein', icon: 'nutrition', color: 'clay-primary', value: `${data?.protein_g?.toFixed(0) || 0}g`},
              {label: 'Sleep', icon: 'bedtime', color: 'clay-neutral', value: `${data?.hours_slept || 0}h`},
              {label: 'Activity', icon: 'fitness_center', color: 'clay-tertiary', value: `${data?.total_workout_minutes || 0}m`},
              {label: 'Tasks', icon: 'list_alt', color: 'clay-secondary', value: `${data?.tasks_completed || 0}/${data?.tasks_today || 0}`}
            ].map((item, idx) => (
              <motion.button 
                key={idx} 
                className="flex flex-col items-center gap-3 group"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
              >
                <div className={`w-16 h-16 bg-white rounded-3xl flex items-center justify-center shadow-[8px_8px_16px_rgba(40,40,40,0.08),-8px_-8px_16px_rgba(255,255,255,1)] group-hover:shadow-[inset_6px_6px_12px_rgba(0,0,0,0.1)] transition-all`}>
                  <span className={`material-symbols-outlined text-3xl font-bold ${healthBubbleClassNames[item.color]}`}>{item.icon}</span>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-black uppercase tracking-tight text-slate-400">{item.label}</span>
                  <span className="text-[9px] font-bold text-clay-secondary">{item.value}</span>
                </div>
              </motion.button>
            ))}
          </section>
        </motion.div>

        {/* Actionable Suggestions (Secondary) */}
        {data?.coaching_suggestions?.length > 1 && (
          <motion.div variants={itemVariants} className="space-y-4">
            <h2 className="text-xs font-black text-clay-secondary uppercase tracking-[0.2em] px-2">More Insights</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {data.coaching_suggestions.slice(1).map((s, i) => (
                <ClayCard key={i} className="p-6" hover={true}>
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-clay-neutral rounded-xl flex items-center justify-center text-clay-primary shrink-0">
                      <span className="material-symbols-outlined text-xl">{s.icon}</span>
                    </div>
                    <div>
                      <h4 className="font-black text-clay-secondary text-sm mb-1">{s.title}</h4>
                      <p className="text-xs text-clay-secondary/60 leading-relaxed">{s.message}</p>
                    </div>
                  </div>
                </ClayCard>
              ))}
            </div>
          </motion.div>
        )}
      </motion.main>
    </div>
  );
};

export default Dashboard;

