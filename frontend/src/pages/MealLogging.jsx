import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClayCard, ClayButton, ClayInput } from '../components';
import { getMeals, logMeal, deleteMeal as deleteMealApi } from '../lib/api';

const quickActionClassNames = {
  'clay-primary': 'text-clay-primary',
  'clay-tertiary': 'text-clay-tertiary',
  'clay-secondary': 'text-clay-secondary'
};

const MealLogging = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [showAddMeal, setShowAddMeal] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    calories: '',
    protein: '',
    type: 'breakfast',
    notes: ''
  });

  useEffect(() => {
    fetchMeals();
  }, []);

  const fetchMeals = async () => {
    try {
      setLoading(true);
      const data = await getMeals();
      setMeals(data);
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

  const handleAddMeal = async () => {
    if (newMeal.name && newMeal.calories) {
      try {
        const payload = {
          name: newMeal.name,
          calories: parseInt(newMeal.calories),
          protein_g: parseFloat(newMeal.protein) || 0,
          meal_type: newMeal.type,
          notes: newMeal.notes
        };
        const created = await logMeal(payload);
        setMeals((prev) => [...prev, created]);
        setNewMeal({ name: '', calories: '', protein: '', type: 'breakfast', notes: '' });
        setShowAddMeal(false);
      } catch (err) {
        alert("Failed to log meal: " + err.message);
      }
    }
  };

  const handleDeleteMeal = async (id) => {
    try {
      await deleteMealApi(id);
      setMeals((prev) => prev.filter(m => m.id !== id));
    } catch (err) {
      alert("Failed to delete meal: " + err.message);
    }
  };

  const totalCalories = meals.reduce((sum, meal) => sum + meal.calories, 0);
  const totalProtein = meals.reduce((sum, meal) => sum + (meal.protein_g || 0), 0);

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
          >
            <span className="material-symbols-outlined font-bold">restaurant</span>
          </motion.div>
          <h1 className="text-xl font-black text-clay-secondary tracking-tight">Meal Logging</h1>
        </div>
        <motion.button 
          className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-clay-primary shadow-[6px_6px_12px_rgba(12,204,72,0.2),-6px_-6px_12px_rgba(255,255,255,1)]"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          <span className="material-symbols-outlined">calendar_today</span>
        </motion.button>
      </motion.header>

      <motion.main 
        className="pt-20 max-w-lg mx-auto space-y-6"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Daily Summary Card */}
        <motion.div variants={itemVariants}>
          <ClayCard className="p-8" hover={true}>
            <div className="text-center mb-6">
              <h2 className="text-lg font-black text-clay-secondary mb-2">Today's Summary</h2>
              <p className="text-sm text-clay-secondary/50">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
            </div>
            
            <div className="grid grid-cols-2 gap-6">
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-clay-primary/20 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[inset_4px_4px_8px_rgba(12,204,72,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)]">
                  <span className="text-2xl font-black text-clay-primary">{totalCalories}</span>
                </div>
                <p className="text-xs font-bold text-clay-secondary uppercase tracking-widest">Calories</p>
              </motion.div>
              
              <motion.div 
                className="text-center"
                whileHover={{ scale: 1.05 }}
              >
                <div className="w-16 h-16 bg-clay-tertiary/30 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-[inset_4px_4px_8px_rgba(154,253,210,0.1),inset_-8px_-8px_16px_rgba(255,255,255,0.8)]">
                  <span className="text-2xl font-black text-clay-secondary">{totalProtein.toFixed(0)}g</span>
                </div>
                <p className="text-xs font-bold text-clay-secondary uppercase tracking-widest">Protein</p>
              </motion.div>
            </div>
          </ClayCard>
        </motion.div>

        {/* Add Meal Button */}
        <motion.div variants={itemVariants}>
          <ClayButton
            variant="primary"
            size="large"
            className="w-full"
            icon="add"
            onClick={() => setShowAddMeal(true)}
          >
            Add Meal
          </ClayButton>
        </motion.div>

        {/* Meals List */}
        <motion.div variants={itemVariants} className="space-y-4">
          <h2 className="text-xs font-black text-clay-secondary uppercase tracking-[0.2em] px-2">Today's Meals</h2>
          
          <AnimatePresence>
            {meals.length === 0 && !loading && (
              <p className="text-center text-clay-secondary/40 py-8 text-sm">No meals logged yet today.</p>
            )}
            {meals.map((meal) => (
              <motion.div
                key={meal.id}
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                exit={{ opacity: 0, x: -100 }}
                layout
              >
                <ClayCard hover={true} className="p-5 group">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold text-white ${
                          meal.meal_type === 'breakfast' ? 'bg-clay-primary' :
                          meal.meal_type === 'lunch' ? 'bg-clay-secondary' :
                          meal.meal_type === 'dinner' ? 'bg-clay-neutral' : 'bg-clay-tertiary'
                        }`}>
                          {(meal.meal_type || 'S').charAt(0).toUpperCase()}
                        </div>
                        <h3 className="font-black text-clay-secondary">{meal.name}</h3>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-clay-primary">local_fire_department</span>
                          <span className="font-bold text-clay-secondary">{meal.calories} cal</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="material-symbols-outlined text-xs text-clay-tertiary">fitness_center</span>
                          <span className="font-bold text-clay-secondary">{(meal.protein_g || 0).toFixed(0)}g protein</span>
                        </div>
                        <div className="flex items-center gap-1 text-clay-secondary/50">
                          <span className="material-symbols-outlined text-xs">schedule</span>
                          <span className="text-xs">{new Date(meal.logged_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                    
                    <motion.button
                      className="w-8 h-8 bg-white rounded-full flex items-center justify-center text-clay-secondary/50 opacity-0 group-hover:opacity-100 transition-opacity"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => handleDeleteMeal(meal.id)}
                    >
                      <span className="material-symbols-outlined text-sm">close</span>
                    </motion.button>
                  </div>
                </ClayCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Quick Actions */}
        <motion.div variants={itemVariants}>
          <ClayCard className="p-6">
            <h3 className="text-sm font-black text-clay-secondary mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Scan Food', icon: 'qr_code_scanner', color: 'clay-primary' },
                { label: 'Recipe', icon: 'menu_book', color: 'clay-tertiary' },
                { label: 'Water', icon: 'water_drop', color: 'clay-secondary' }
              ].map((action, idx) => (
                <motion.button
                  key={idx}
                  className="flex flex-col items-center gap-2 p-3 bg-white rounded-2xl shadow-[6px_6px_12px_rgba(40,40,40,0.08),-6px_-6px_12px_rgba(255,255,255,1)] hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.1)] transition-all"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <span className={`material-symbols-outlined text-2xl ${quickActionClassNames[action.color]}`}>{action.icon}</span>
                  <span className="text-xs font-bold text-clay-secondary">{action.label}</span>
                </motion.button>
              ))}
            </div>
          </ClayCard>
        </motion.div>
      </motion.main>

      {/* Add Meal Modal */}
      <AnimatePresence>
        {showAddMeal && (
          <motion.div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-6 z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowAddMeal(false)}
          >
            <motion.div
              className="w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
            >
              <ClayCard className="p-8">
                <h3 className="text-lg font-black text-clay-secondary mb-6">Add New Meal</h3>
                
                <div className="space-y-4">
                  <ClayInput
                    label="Meal Name"
                    placeholder="Enter meal name"
                    value={newMeal.name}
                    onChange={(e) => setNewMeal({...newMeal, name: e.target.value})}
                    icon="restaurant"
                  />
                  
                  <div className="grid grid-cols-2 gap-4">
                    <ClayInput
                      label="Calories"
                      type="number"
                      placeholder="0"
                      value={newMeal.calories}
                      onChange={(e) => setNewMeal({...newMeal, calories: e.target.value})}
                      icon="local_fire_department"
                    />
                    
                    <ClayInput
                      label="Protein (g)"
                      type="number"
                      placeholder="0"
                      value={newMeal.protein}
                      onChange={(e) => setNewMeal({...newMeal, protein: e.target.value})}
                      icon="fitness_center"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-xs font-black text-clay-secondary uppercase tracking-widest">Meal Type</label>
                    <div className="grid grid-cols-4 gap-2">
                      {['breakfast', 'lunch', 'dinner', 'snack'].map((type) => (
                        <motion.button
                          key={type}
                          className={`py-2 px-3 rounded-xl text-xs font-bold transition-all ${
                            newMeal.type === type
                              ? 'bg-clay-primary text-white shadow-lg'
                              : 'bg-white text-clay-secondary shadow-[4px_4px_8px_rgba(0,0,0,0.05),-4px_-4px_8px_rgba(255,255,255,1)]'
                          }`}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          onClick={() => setNewMeal({...newMeal, type})}
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
                    onClick={() => setShowAddMeal(false)}
                  >
                    Cancel
                  </ClayButton>
                  <ClayButton
                    variant="primary"
                    className="flex-1"
                    onClick={handleAddMeal}
                  >
                    Add Meal
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

export default MealLogging;

