import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { signUpWithEmail } from '../../services/firebase';
import { AVATAR_CONFIG } from '../../types/game';

interface SignUpModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin: () => void;
}

const AVATAR_OPTIONS = ['1', '2', '3', '4', '5', '6'];

export const SignUpModal: React.FC<SignUpModalProps> = ({ isOpen, onClose, onSwitchToLogin }) => {
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedAvatar, setSelectedAvatar] = useState('1');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (displayName.length < 3) {
      setError('Display name must be at least 3 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);
    try {
      await signUpWithEmail(email, password, displayName, selectedAvatar);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Failed to create account.');
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
              initial={{ y: 50, opacity: 0, rotate: 2 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              exit={{ y: 50, opacity: 0, rotate: -2 }}
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
                <h2 className="text-4xl font-bold mb-4 text-gray-800" style={{ fontFamily: '"Caveat", cursive' }}>
                  Join the Class!
                </h2>

                {error && (
                  <div className="mb-4 text-red-600 font-medium leading-tight" style={{ fontFamily: '"Kalam", cursive' }}>
                    * {error}
                  </div>
                )}

                <form onSubmit={handleSignUp} className="space-y-3">
                  <div>
                    <label className="block text-gray-600 mb-1" style={{ fontFamily: '"Patrick Hand", cursive' }}>Choose your avatar:</label>
                    <div className="flex justify-between items-center mb-4 overflow-x-auto pb-2 gap-2">
                      {AVATAR_OPTIONS.map(id => {
                        const avatarData = AVATAR_CONFIG[id as keyof typeof AVATAR_CONFIG];
                        const isSelected = selectedAvatar === id;
                        return (
                          <button
                            key={id}
                            type="button"
                            onClick={() => setSelectedAvatar(id)}
                            className={`flex-shrink-0 w-12 h-12 rounded-lg flex items-center justify-center text-2xl transition-all ${
                              isSelected 
                                ? 'bg-blue-100 border-2 border-blue-500 shadow-md scale-110' 
                                : 'bg-white border-2 border-gray-200 hover:bg-gray-50 opacity-70 hover:opacity-100'
                            }`}
                          >
                            {avatarData?.emoji || '👤'}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-transparent border-none border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 px-2 text-lg pb-1"
                      style={{ fontFamily: '"Kalam", cursive' }}
                      required
                      maxLength={15}
                    />
                  </div>
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
                  <div>
                    <input
                      type="password"
                      placeholder="Password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent border-none border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 px-2 text-lg pb-1"
                      style={{ fontFamily: '"Kalam", cursive' }}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full bg-transparent border-none border-b-2 border-blue-400 focus:outline-none focus:border-blue-600 px-2 text-lg pb-1"
                      style={{ fontFamily: '"Kalam", cursive' }}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-transparent border-2 border-blue-500 text-blue-600 hover:bg-blue-50 rounded-sm py-2 px-4 text-2xl font-bold mt-6 transition-colors disabled:opacity-50 inline-block transform rotate-1"
                    style={{ fontFamily: '"Caveat", cursive' }}
                  >
                    Create Account
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-gray-600 text-lg" style={{ fontFamily: '"Patrick Hand", cursive' }}>
                    Already have an account?{' '}
                    <button
                      onClick={() => {
                        onClose();
                        onSwitchToLogin();
                      }}
                      className="text-red-600 hover:text-red-800 underline decoration-wavy"
                    >
                      Sign In
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
