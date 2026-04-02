import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Flame, Mail, Lock, User, ArrowRight, Chrome } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function AuthPage() {
  const { login, loginWithEmail, signupWithEmail, continueAsGuest } = useAuth();
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      if (isSignUp) {
        await signupWithEmail(email, password, name);
      } else {
        await loginWithEmail(email, password);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden flex items-center justify-center p-4">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-500/10 blur-[120px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-500/10 blur-[120px] rounded-full animate-pulse delay-700" />
        
        {/* Floating Particles */}
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            initial={{ 
              x: Math.random() * 1000, 
              y: Math.random() * 800 
            }}
            animate={{
              y: [null, -100],
              opacity: [0, 1, 0]
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="bg-[#111118]/80 backdrop-blur-2xl border border-[#2a2a3a] rounded-[32px] p-8 lg:p-10 shadow-2xl">
          {/* Logo & Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.1, rotate: 5 }}
              className="w-16 h-16 bg-orange-500/10 border border-orange-500/20 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-[0_0_30px_rgba(249,115,22,0.15)]"
            >
              <Flame className="w-8 h-8 text-orange-500" />
            </motion.div>
            <h1 className="text-5xl font-bebas tracking-wider text-white mb-2">STUDYSYNC</h1>
            <p className="text-gray-400 text-sm font-medium tracking-tight">
              Conquer your exams. One day at a time.
            </p>
          </div>

          <div className="space-y-4">
            {/* Error Message */}
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm font-medium"
              >
                {error}
              </motion.div>
            )}

            {/* Google Auth */}
            <button
              onClick={login}
              disabled={loading}
              className="w-full h-14 bg-white text-black rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-gray-100 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Chrome className="w-5 h-5" />
              Continue with Google
            </button>

            {/* Email Auth Toggle */}
            {!showEmailForm ? (
              <button
                onClick={() => setShowEmailForm(true)}
                className="w-full h-14 bg-[#1a1a24] text-white border border-[#2a2a3a] rounded-2xl font-bold flex items-center justify-center gap-3 hover:bg-[#22222e] transition-all active:scale-[0.98]"
              >
                <Mail className="w-5 h-5 text-gray-400" />
                Continue with Email
              </button>
            ) : (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-4 pt-2"
              >
                {/* Tab Switcher */}
                <div className="bg-[#0a0a0f] p-1 rounded-xl flex mb-6">
                  <button
                    onClick={() => setIsSignUp(false)}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                      !isSignUp ? "bg-[#1a1a24] text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    SIGN IN
                  </button>
                  <button
                    onClick={() => setIsSignUp(true)}
                    className={cn(
                      "flex-1 py-2 text-xs font-bold rounded-lg transition-all",
                      isSignUp ? "bg-[#1a1a24] text-white shadow-lg" : "text-gray-500 hover:text-gray-300"
                    )}
                  >
                    SIGN UP
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  {isSignUp && (
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                      <input
                        type="text"
                        placeholder="Full Name"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all"
                      />
                    </div>
                  )}
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="email"
                      placeholder="Email Address"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <input
                      type="password"
                      placeholder="Password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-14 bg-[#0a0a0f] border border-[#2a2a3a] rounded-2xl pl-12 pr-4 text-white focus:outline-none focus:border-orange-500/50 transition-all"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-14 bg-orange-500 text-white rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-orange-600 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        {isSignUp ? 'Create Account' : 'Sign In'}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowEmailForm(false)}
                    className="w-full text-center text-gray-500 text-xs font-medium hover:text-gray-400 transition-colors"
                  >
                    Back to options
                  </button>
                </form>
              </motion.div>
            )}
          </div>

          <div className="mt-8 text-center space-y-4">
            <button
              onClick={continueAsGuest}
              className="text-gray-500 text-sm font-medium hover:text-orange-500 transition-colors"
            >
              Continue as Guest
            </button>
            
            <div className="pt-6 border-t border-[#2a2a3a]">
              <p className="text-[10px] text-gray-600 leading-relaxed uppercase tracking-widest">
                By continuing, you agree to our<br />
                <span className="text-gray-500 cursor-pointer hover:text-gray-400">Privacy Policy</span> & <span className="text-gray-500 cursor-pointer hover:text-gray-400">Terms of Service</span>
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
