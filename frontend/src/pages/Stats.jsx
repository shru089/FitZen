import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, BarChart, Bar, Cell } from 'recharts';
import { ClayCard } from '../components';
import { getProgressData } from '../lib/api';

const Stats = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await getProgressData();
        setData(result);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fcf9] flex items-center justify-center">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-clay-primary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const chartData = data?.days.map(d => ({
    name: new Date(d.date).toLocaleDateString('en-US', { weekday: 'short' }),
    calories: d.calories_consumed,
    workouts: d.workout_minutes,
    sleep: d.hours_slept || 0
  })) || [];

  return (
    <div className="min-h-screen bg-[#f7fcf9] p-6 pb-24 font-['Public_Sans',sans-serif]">
      <motion.header 
        className="fixed top-0 left-0 w-full z-50 bg-[#f7fcf9]/80 backdrop-blur-lg px-6 h-16 flex items-center gap-3 shadow-sm"
        initial={{ y: -50 }}
        animate={{ y: 0 }}
      >
        <div className="w-10 h-10 bg-clay-primary rounded-xl flex items-center justify-center text-white shadow-lg">
          <span className="material-symbols-outlined font-bold">insights</span>
        </div>
        <h1 className="text-xl font-black text-clay-secondary tracking-tight">Zen Stats</h1>
      </motion.header>

      <motion.main 
        className="pt-20 max-w-2xl mx-auto space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Averages Section */}
        <motion.div variants={itemVariants} className="grid grid-cols-3 gap-4">
          {[
            { label: 'Avg Cals', value: data?.avg_calories.toFixed(0), icon: 'bolt', color: 'clay-primary' },
            { label: 'Avg Work', value: `${data?.avg_workout_minutes.toFixed(0)}m`, icon: 'fitness_center', color: 'clay-secondary' },
            { label: 'Avg Sleep', value: `${data?.avg_sleep_hours.toFixed(1)}h`, icon: 'bedtime', color: 'clay-tertiary' }
          ].map((stat, i) => (
            <ClayCard key={i} className="p-4 text-center" hover={true}>
              <span className={`material-symbols-outlined text-xl mb-1 text-${stat.color}`}>{stat.icon}</span>
              <p className="text-lg font-black text-clay-secondary">{stat.value}</p>
              <p className="text-[10px] uppercase font-bold text-slate-400">{stat.label}</p>
            </ClayCard>
          ))}
        </motion.div>

        {/* Calorie Trend Chart */}
        <motion.div variants={itemVariants}>
          <ClayCard className="p-6 md:p-8" hover={true}>
            <div className="mb-6">
              <h3 className="text-sm font-black text-clay-secondary uppercase tracking-widest">Calorie Consumption</h3>
              <p className="text-xs text-slate-400">7-day trend analysis</p>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorCal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0ccc48" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#0ccc48" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '8px 8px 16px rgba(0,0,0,0.05)', fontFamily: 'Public Sans' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="calories" 
                    stroke="#0ccc48" 
                    strokeWidth={4} 
                    fillOpacity={1} 
                    fill="url(#colorCal)" 
                    animationDuration={2000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </ClayCard>
        </motion.div>

        {/* Workout Activity Chart */}
        <motion.div variants={itemVariants}>
          <ClayCard className="p-6 md:p-8" hover={true}>
            <div className="mb-6">
              <h3 className="text-sm font-black text-clay-secondary uppercase tracking-widest">Workout Minutes</h3>
              <p className="text-xs text-slate-400">Consistency check</p>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fill: '#94A3B8', fontSize: 10, fontWeight: 700 }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    cursor={{fill: '#F8FAFC'}}
                    contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '8px 8px 16px rgba(0,0,0,0.05)' }}
                  />
                  <Bar dataKey="workouts" radius={[10, 10, 10, 10]} barSize={20}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.workouts > 30 ? '#0ccc48' : '#e0fde4'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ClayCard>
        </motion.div>

        {/* Motivational Quote */}
        <motion.div variants={itemVariants} className="text-center px-8 py-4">
          <p className="italic text-clay-secondary/60 text-sm">
            "The only bad workout is the one that didn't happen. Keep flowing."
          </p>
        </motion.div>
      </motion.main>
    </div>
  );
};

export default Stats;
