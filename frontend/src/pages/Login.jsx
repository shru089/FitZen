import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClayCard, ClayButton, ClayInput } from '../components';
import { loginUser, registerUser, storeToken } from '../lib/api';

const LoginPage = ({ onAuthSuccess }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: ''
  });

  const handleInputChange = (e) => {
    setErrorMessage('');
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    try {
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : { name: formData.name.trim(), email: formData.email, password: formData.password };

      const response = isLogin ? await loginUser(payload) : await registerUser(payload);
      storeToken(response.access_token);
      onAuthSuccess?.(response.user);
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 }
  };

  return (
    <div className="min-h-screen bg-[#f7fcf9] flex items-center justify-center p-6 font-['Public_Sans',sans-serif] relative overflow-hidden">
      {/* Floating aesthetic elements */}
      <div className="fixed top-[-10%] right-[-5%] w-[400px] h-[400px] bg-clay-tertiary/20 blur-[120px] rounded-full -z-10"></div>
      <div className="fixed bottom-[-10%] left-[-5%] w-[300px] h-[300px] bg-clay-neutral/30 blur-[100px] rounded-full -z-10"></div>

      <motion.main 
        className="w-full max-w-md flex flex-col items-center"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
        transition={{ duration: 0.6 }}
      >
        {/* Logo Branding Header */}
        <motion.div 
          className="mb-12 text-center"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <div className="flex items-center justify-center mb-6">
            <motion.div 
              className="w-16 h-16 bg-clay-primary rounded-2xl flex items-center justify-center shadow-[12px_12px_24px_rgba(12,204,72,0.3),-4px_-4px_12px_rgba(255,255,255,0.1)]"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <span className="material-symbols-outlined text-white text-4xl" style={{fontVariationSettings: "'FILL' 1"}}>
                spa
              </span>
            </motion.div>
          </div>
          <h1 className="font-['Domine',serif] text-4xl font-bold text-clay-secondary tracking-tight mb-2">Sanctuary</h1>
          <p className="text-sm uppercase tracking-[0.2em] text-clay-secondary/50 font-medium">Your Wellness Haven</p>
        </motion.div>

        {/* Auth Card */}
        <ClayCard className="w-full p-8 md:p-10" variant="default">
          {/* Segmented Control Toggle */}
          <div className="flex bg-[#f7fcf8] p-1.5 rounded-xl mb-10 shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.8)]">
            <motion.button
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                isLogin 
                  ? 'bg-white text-clay-primary shadow-[4px_4px_8px_rgba(0,0,0,0.1)]' 
                  : 'text-clay-secondary/50 hover:text-clay-secondary'
              }`}
              onClick={() => setIsLogin(true)}
              whileTap={{ scale: 0.95 }}
            >
              Login
            </motion.button>
            <motion.button
              className={`flex-1 py-3 text-sm font-bold rounded-lg transition-all duration-200 ${
                !isLogin 
                  ? 'bg-white text-clay-primary shadow-[4px_4px_8px_rgba(0,0,0,0.1)]' 
                  : 'text-clay-secondary/50 hover:text-clay-secondary'
              }`}
              onClick={() => setIsLogin(false)}
              whileTap={{ scale: 0.95 }}
            >
              Sign Up
            </motion.button>
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={isLogin ? 'login' : 'signup'}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {/* Social Login */}
              <motion.button
                className="w-full flex items-center justify-center gap-3 bg-white border border-white/50 py-4 rounded-xl hover:shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05)] transition-all duration-200 group"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <img 
                  alt="Google logo" 
                  className="w-5 h-5" 
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuDEbZZL65gvaZv3xoCke5Imh2-9e0bqMQgKa-PZZAi3O5IdAF-g2z5zQX_G6zOwy329XqQCWVNFxqKip60y9bQ7XA0oaBTA-oLXNFXMF3GtKYvIsmdzw2ZYRfRlGBESq78qD1_G9NpXTp02TLzSsU_IG20rQi4mil9VxlvUodNdaSYiYlCnL-g5kzGXW9GpcCa9LYOhJgFaE4VNEUXJOUHnbS02UKPkyz7w8poFD2tGUm4wpAMErjN2_lUSt1Sl3ewx29_ilHj4AAoK"
                />
                <span className="font-bold text-sm text-clay-secondary">Continue with Google</span>
              </motion.button>

              {/* Divider */}
              <div className="flex items-center gap-4 py-2">
                <div className="h-[1px] flex-1 bg-clay-secondary/20"></div>
                <span className="text-[10px] font-bold uppercase tracking-widest text-clay-secondary/50">or email</span>
                <div className="h-[1px] flex-1 bg-clay-secondary/20"></div>
              </div>

              {/* Form Inputs */}
              <form onSubmit={handleSubmit} className="space-y-5">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <ClayInput
                      label="Full Name"
                      name="name"
                      type="text"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleInputChange}
                      icon="person"
                      required={!isLogin}
                    />
                  </motion.div>
                )}

                <ClayInput
                  label="Email Address"
                  name="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleInputChange}
                  icon="mail"
                  required
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center px-1">
                    <label className="text-[11px] font-bold uppercase tracking-widest text-clay-secondary/50">Password</label>
                    <button 
                      className="text-[11px] font-bold text-clay-primary hover:text-clay-primary/80 transition-colors" 
                      type="button"
                    >
                      Forgot?
                    </button>
                  </div>
                  <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-clay-secondary/50 group-focus-within:text-clay-primary transition-colors">
                      <span className="material-symbols-outlined">lock</span>
                    </div>
                    <motion.input
                      className="w-full bg-white shadow-[inset_4px_4px_8px_rgba(0,0,0,0.05),inset_-4px_-4px_8px_rgba(255,255,255,0.9)] border border-white/50 focus:border-clay-primary/30 focus:ring-2 focus:ring-clay-primary/20 rounded-xl pl-12 pr-12 py-4 text-clay-secondary placeholder:text-clay-secondary/30 transition-all duration-200 font-medium focus:outline-none"
                      placeholder="••••••••"
                      type={showPassword ? "text" : "password"}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      whileFocus={{ scale: 1.02 }}
                    />
                    <button 
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-clay-secondary/50 hover:text-clay-secondary transition-colors" 
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {showPassword ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                {errorMessage && (
                  <p className="text-sm font-bold text-red-600 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    {errorMessage}
                  </p>
                )}

                {/* Primary CTA */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <ClayButton
                    type="submit"
                    variant="primary"
                    size="large"
                    className="w-full"
                    icon="arrow_forward"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? 'Please wait...' : isLogin ? 'Sign In' : 'Create Account'}
                  </ClayButton>
                </motion.div>
              </form>
            </motion.div>
          </AnimatePresence>
        </ClayCard>

        {/* Terms Footer */}
        <motion.p 
          className="mt-10 text-[13px] text-center text-clay-secondary/50 leading-relaxed max-w-[320px]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          By continuing, you agree to Sanctuary's{' '}
          <a className="text-clay-primary font-bold hover:underline" href="#">Terms of Service</a>{' '}
          and{' '}
          <a className="text-clay-primary font-bold hover:underline" href="#">Privacy Policy</a>.
        </motion.p>
      </motion.main>

      {/* Support Link */}
      <div className="fixed bottom-8 text-center w-full pointer-events-none">
        <motion.a 
          className="pointer-events-auto inline-flex items-center gap-2 text-sm font-bold text-clay-secondary/50 hover:text-clay-primary transition-colors"
          href="#"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <span className="material-symbols-outlined text-[18px]">help</span>
          Need assistance?
        </motion.a>
      </div>
    </div>
  );
};

export default LoginPage;
