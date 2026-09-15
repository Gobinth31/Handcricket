import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, EyeOff } from 'lucide-react';
import { signInWithGoogle, signInWithEmail } from '../../services/firebase';
import { useAuthStore } from '../../stores/authStore';

interface LoginModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSwitchToSignUp: () => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen = true, onClose, onSwitchToSignUp }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    setIsLoading(true);
    try {
      await signInWithGoogle();
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ y: 50, opacity: 0, rotate: -2 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 50, opacity: 0, rotate: 2 }}
              className="bg-[#fdfbf7] w-full max-w-md rounded-lg shadow-2xl relative overflow-hidden pointer-events-auto border-2 border-gray-300"
              style={{
                backgroundImage: 'linear-gradient(transparent 95%, #cbd5e1 95%)',
                backgroundSize: '100% 2rem',
                lineHeight: '2rem'
              }}
            >
              {/* Red margin line */}
              <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-red-400/60 z-0" />
              
              <button
                onClick={onClose}
                className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-200 transition-colors z-10"
              >
                <X className="w-6 h-6 text-gray-600" />
              </button>

              <div className="p-8 pt-6 relative z-10 pl-14">
                <h2 className="text-4xl font-bold mb-6 text-gray-800" style={{ fontFamily: '"Caveat", cursive' }}>
                  Sign In
                </h2>

                {error && (
                  <div className="mb-4 text-red-600 font-medium" style={{ fontFamily: '"Kalam", cursive' }}>
                    * {error}
                  </div>
                )}

                <button
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  className="w-full bg-white border-2 border-gray-200 rounded-md py-2 px-4 flex items-center justify-center gap-3 hover:bg-gray-50 hover:shadow-md transition-all mb-6 disabled:opacity-50"
                  style={{ fontFamily: '"Patrick Hand", cursive' }}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#EA4335" d="M5.266 9.765A7.077 7.077 0 0112 4.909c1.69 0 3.218.6 4.418 1.582L19.91 3C17.782 1.145 15.055 0 12 0 7.27 0 3.198 2.698 1.24 6.65l4.026 3.115z"/>
                    <path fill="#34A853" d="M16.04 18.013c-1.09.703-2.474 1.078-4.04 1.078a7.077 7.077 0 01-6.723-4.806L1.24 17.35C3.198 21.3 7.27 24 12 24c3.24 0 5.914-1.08 7.882-2.91l-3.842-3.077z"/>
                    <path fill="#4A90E2" d="M19.882 21.09C21.936 19.16 23.2 16.29 23.2 12.596c0-.85-.085-1.7-.24-2.506H12v4.84h6.516c-.28 1.48-1.126 2.73-2.476 3.58l3.842 3.08z"/>
                    <path fill="#FBBC05" d="M5.277 14.268A7.12 7.12 0 014.909 12c0-.782.125-1.533.357-2.235L1.24 6.65A11.934 11.934 0 000 12c0 1.92.445 3.73 1.237 5.35l4.04-3.082z"/>
                  </svg>
                  <span className="text-lg">Sign in with Google</span>
                </button>

                <div className="relative flex items-center mb-6">
                  <div className="flex-grow border-t-2 border-gray-300 border-dashed"></div>
                  <span className="flex-shrink-0 px-3 text-gray-500 text-lg" style={{ fontFamily: '"Caveat", cursive' }}>
                    — or —
                  </span>
                  <div className="flex-grow border-t-2 border-gray-300 border-dashed"></div>
                </div>

                <form onSubmit={handleEmailSignIn} className="space-y-4">
                  <div>
                    <input
                      type="email"
                      placeholder="Email Address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent border-none border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 px-2 text-lg pb-1"
                      style={{ fontFamily: '"Kalam", cursive' }}
                      required
                    />
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-none border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 px-2 text-lg pb-1 pr-10"
                      style={{ fontFamily: '"Kalam", cursive' }}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-2 bottom-2 text-gray-500 hover:text-gray-700"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-transparent border-2 border-red-500 text-red-600 hover:bg-red-50 rounded-sm py-2 px-4 text-2xl font-bold mt-4 transition-colors disabled:opacity-50 inline-block transform -rotate-1"
                    style={{ fontFamily: '"Caveat", cursive' }}
                  >
                    Sign In
                  </button>
                </form>

                <div className="mt-6 text-center">
                  <p className="text-gray-600 text-lg" style={{ fontFamily: '"Patrick Hand", cursive' }}>
                    Don't have an account?{' '}
                    <button
                      onClick={() => {
                        onClose();
                        onSwitchToSignUp();
                      }}
                      className="text-blue-600 hover:text-blue-800 underline decoration-wavy"
                    >
                      Sign Up
                    </button>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
