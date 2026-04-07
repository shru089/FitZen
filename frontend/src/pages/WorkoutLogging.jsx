import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClayCard, ClayButton, ClayProgressRing } from '../components';
import { getWorkouts, logWorkout, toggleWorkoutComplete as toggleWorkoutCompleteApi } from '../lib/api';

const quickWorkoutClassNames = {
  'clay-tertiary': 'text-clay-tertiary',
  'clay-primary': 'text-clay-primary',
  'clay-secondary': 'text-clay-secondary',
  'clay-neutral': 'text-clay-neutral'
};

const WorkoutLogging = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddWorkout, setShowAddWorkout] = useState(false);
  const [newWorkout, setNewWorkout] = useState({
    name: '',
    duration: '',
    calories: '',
    type: 'cardio'
  });

  useEffect(() => {
    fetchWorkouts();
  }, []);

  const fetchWorkouts = async () => {
    try {
      setLoading(true);
      const data = await getWorkouts();
      setWorkouts(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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

  const handleAddWorkout = async () => {
    if (newWorkout.name && newWorkout.duration) {
      try {
        const payload = {
          name: newWorkout.name,
          activity_type: newWorkout.type,
          duration_minutes: parseInt(newWorkout.duration),
          calories_burned: parseInt(newWorkout.calories) || 0,
          completed: false
        };
        const created = await logWorkout(payload);
        setWorkouts((prev) => [...prev, created]);
        setNewWorkout({ name: '', duration: '', calories: '', type: 'cardio' });
        setShowAddWorkout(false);
      } catch (err) {
        alert("Failed to log workout: " + err.message);
      }
    }
  };

  const handleToggleComplete = async (id) => {
    try {
      const updated = await toggleWorkoutCompleteApi(id);
      setWorkouts((prev) => prev.map(w => w.id === id ? updated : w));
    } catch (err) {
      alert("Failed to update workout: " + err.message);
    }
  };

  const completedWorkouts = workouts.filter(w => w.completed);
  const totalDuration = completedWorkouts.reduce((sum, workout) => sum + workout.duration_minutes, 0);
  const totalCalories = completedWorkouts.reduce((sum, workout) => sum + workout.calories_burned, 0);
  const completionRate = workouts.length > 0 ? Math.round((completedWorkouts.length / workouts.length) * 100) : 0;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f7fcf9] flex items-center justify-center font-['Public_Sans',sans-serif]">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-clay-secondary border-t-transparent rounded-full"
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f7fcf9] p-6 pb-24 font-['Public_Sans',sans-serif]">
      {/* Header */}
      <motion.header 
        className="fixed top-0 left-0 w-full z-50 bg-[#f7fcf9]/80 backdrop-blur-lg px-6 h-16 flex justify-between items-center shadow-[0_4px_30px_rgba(12,204,72,0.05)]"
        variants={itemVariants}
      >
        <div className="flex items-center gap-3">
          <motion.div 
            className="w-10 h-10 bg-clay-secondary rounded-xl flex items-center justify-center text-white shadow-[4px_4px_12px_rgba(60,134,66,0.3)]"
            whileHover={{ scale: 1.1, rotate: 15 }}
          >
            <span className="material-symbols-outlined font-bold">fitness_center</span>
          </motion.div>
          <h1 className="text-xl font-black text-clay-secondary tracking-tight">Workout Tracking</h1>
        </div>
        <motion.button 
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-clay-secondary shadow-[6px_6px_12px_rgba(60,134,66,0.2),-6px_-6px_12px_rgba(255,255,255,1)]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="material-symbols-outlined">insights</span>
        </motion.button>
      </motion.header>

      <motion.main 
        className="pt-20 max-w-lg mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Daily Progress Card */}
        <motion.div variants={itemVariants}>
          <ClayCard className="p-8" hover={true}>
            <div className="text-center mb-6">
              <h2 className="text-lg font-black text-clay-secondary mb-2">Today's Progress</h2>
              <p className="text-sm text-clay-secondary/50">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="flex justify-center mb-6">
              <ClayProgressRing 
                progress={completionRate}
                size={160}
                strokeWidth={16}
                color="secondary"
              >
                <div className="flex flex-col items-center">
                  <motion.span 
                    className="text-3xl font-black text-clay-secondary"
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 }}
                  >
                    {completionRate}%
                  </motion.span>
                  <span className="text-xs font-bold uppercase tracking-widest text-clay-secondary/50">Complete</span>
                </div>
              </ClayProgressRing>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <motion.div 
                className="bg-clay-tertiary/20 p-4 rounded-2xl text-center shadow-[inset_4px_4px_8px_rgba(154,253,210,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)]"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-2xl font-black text-clay-secondary">{totalDuration}</span>
                <p className="text-xs font-bold text-clay-secondary uppercase tracking-widest mt-1">Minutes</p>
              </motion.div>
              
              <motion.div 
                className="bg-clay-primary/20 p-4 rounded-2xl text-center shadow-[inset_4px_4px_8px_rgba(12,204,72,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)]"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-2xl font-black text-clay-secondary">{totalCalories}</span>
                <p className="text-xs font-bold text-clay-secondary uppercase tracking-widest mt-1">Calories</p>
              </motion.div>
            </div>
          </ClayCard>
        </motion.div>

        {/* Add Workout Button */}
        <motion.div variants={itemVariants}>
          <ClayButton
            variant="secondary"
            size="large"
            className="w-full"
            icon="add"
            onClick={() => setShowAddWorkout(true)}
          >
            Add Workout
          </ClayButton>
        </motion.div>

        {/* Workouts List */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xs font-black text-clay-secondary uppercase tracking-[0.2em] px-2">Today's Workouts</h2>
          
          <AnimatePresence>
            {workouts.length === 0 && !loading && (
              <p className="text-center text-clay-secondary/40 py-8 text-sm">No workouts planned yet today.</p>
            )}
            {workouts.map((workout) => (
              <motion.div
                key={workout.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -100 }}
                layout
              >
                <ClayCard 
                  hover={true} 
                  className={`p-5 group ${workout.completed ? 'opacity-75' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <motion.button
                          className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all ${
                            workout.completed 
                              ? 'bg-clay-primary text-white shadow-[inset_2px_2px_4px_rgba(0,0,0,0.2)]' 
                              : 'bg-white shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,1)]'
                          }`}
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleToggleComplete(workout.id)}
                        >
                          {workout.completed && <span className="material-symbols-outlined text-sm">check</span>}
                        </motion.button>
                        
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white ${
                          workout.activity_type === 'cardio' ? 'bg-clay-primary' :
                          workout.activity_type === 'strength' ? 'bg-clay-secondary' :
                          workout.activity_type === 'flexibility' ? 'bg-clay-tertiary' : 'bg-clay-neutral'
                        }`}>
                          {(workout.activity_type || 'A').charAt(0).toUpperCase()}
                        </div>
                        
                        <h3 className={`font-black ${workout.completed ? 'text-clay-secondary/50 line-through' : 'text-clay-secondary'}`}>
                          {workout.name}
                        </h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-clay-primary">schedule</span>
                          <span className="font-bold text-clay-secondary">{workout.duration_minutes} min</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-clay-tertiary">local_fire_department</span>
                          <span className="font-bold text-clay-secondary">{workout.calories_burned} cal</span>
                        </div>
                        <div className="flex items-center gap-1 text-clay-secondary/50">
                          <span className="material-symbols-outlined text-xs">access_time</span>
                          <span className="text-xs">{new Date(workout.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </ClayCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Quick Workouts */}
        <motion.div variants={itemVariants}>
          <ClayCard className="p-6">
            <h3 className="text-sm font-black text-clay-secondary mb-4">Quick Workouts</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { name: '5 min Stretch', duration: 5, icon: 'self_improvement', color: 'clay-tertiary' },
                { name: '10 min HIIT', duration: 10, icon: 'directions_run', color: 'clay-primary' },
                { name: '15 min Yoga', duration: 15, icon: 'sports_gymnastics', color: 'clay-secondary' },
                { name: '20 min Walk', duration: 20, icon: 'hiking', color: 'clay-neutral' }
              ].map((quick, idx) => (
                <motion.button
                  key={idx}
                  className="bg-white p-4 rounded-2xl shadow-[6px_6px_12px_rgba(40,40,40,0.08),-6px_-6px_12px_rgba(255,255,255,1)] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={async () => {
                    try {
                      await logWorkout({
                        name: quick.name,
                        activity_type: 'cardio',
                        duration_minutes: quick.duration,
                        calories_burned: quick.duration * 5,
                        completed: false
                      });
                      fetchWorkouts();
                    } catch (err) { alert(err.message); }
                  }}
                >
                  <div className="flex flex-col items-center gap-2">
                    <span className={`material-symbols-outlined text-2xl ${quickWorkoutClassNames[quick.color]}`}>{quick.icon}</span>
                    <span className="text-xs font-bold text-clay-secondary text-center">{quick.name}</span>
                    <span className="text-xs text-clay-secondary/50">{quick.duration} min</span>
                  </div>
                </motion.button>
              ))}
            </div>
          </ClayCard>
        </motion.div>
      </motion.main>

      {/* Add Workout Modal */}
      <AnimatePresence>
        {showAddWorkout && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddWorkout(false)}
          >
            <motion.div
              className="w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ClayCard className="p-8">
                <h3 className="text-lg font-black text-clay-secondary mb-6">Add New Workout</h3>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-clay-secondary uppercase tracking-widest">Workout Name</label>
                    <input
                      className="w-full bg-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-white/50 focus:border-clay-secondary/30 focus:ring-2 focus:ring-clay-secondary/20 rounded-xl px-4 py-3 text-clay-secondary placeholder:text-clay-secondary/30 transition-all font-medium focus:outline-none"
                      placeholder="Enter workout name"
                      value={newWorkout.name}
                      onChange={(e) => setNewWorkout({...newWorkout, name: e.target.value})}
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-black text-clay-secondary uppercase tracking-widest">Duration (min)</label>
                      <input
                        className="w-full bg-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-white/50 focus:border-clay-secondary/30 focus:ring-2 focus:ring-clay-secondary/20 rounded-xl px-4 py-3 text-clay-secondary placeholder:text-clay-secondary/30 transition-all font-medium focus:outline-none"
                        placeholder="0"
                        type="number"
                        value={newWorkout.duration}
                        onChange={(e) => setNewWorkout({...newWorkout, duration: e.target.value})}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <label className="text-xs font-black text-clay-secondary uppercase tracking-widest">Calories</label>
                      <input
                        className="w-full bg-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-white/50 focus:border-clay-secondary/30 focus:ring-2 focus:ring-clay-secondary/20 rounded-xl px-4 py-3 text-clay-secondary placeholder:text-clay-secondary/30 transition-all font-medium focus:outline-none"
                        placeholder="0"
                        type="number"
                        value={newWorkout.calories}
                        onChange={(e) => setNewWorkout({...newWorkout, calories: e.target.value})}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-clay-secondary uppercase tracking-widest">Workout Type</label>
                    <div className="grid grid-cols-3 gap-2">
                      {['cardio', 'strength', 'flexibility'].map((type) => (
                        <motion.button
                          key={type}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            newWorkout.type === type
                              ? 'bg-clay-secondary text-white shadow-lg'
                              : 'bg-white text-clay-secondary shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,1)]'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setNewWorkout({...newWorkout, type})}
                        >
                          {type.charAt(0).toUpperCase() + type.slice(1)}
                        </motion.button>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <ClayButton
                    variant="default"
                    className="flex-1"
                    onClick={() => setShowAddWorkout(false)}
                  >
                    Cancel
                  </ClayButton>
                  <ClayButton
                    variant="secondary"
                    className="flex-1"
                    onClick={handleAddWorkout}
                  >
                    Add Workout
                  </ClayButton>
                </div>
              </ClayCard>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default WorkoutLogging;

