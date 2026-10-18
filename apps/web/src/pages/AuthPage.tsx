import React, { useState } from 'react';
import { Feather, Lock, Mail, User, AlertCircle, ArrowRight, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccess: () => void;
  onNavigate: (page: string) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ initialMode = 'login', onSuccess, onNavigate }) => {
  const { login, register } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      if (mode === 'login') {
        await login({ login: email || username, password });
      } else {
        await register({
          full_name: fullName.trim(),
          username: username.trim().toLowerCase(),
          email: email.trim().toLowerCase(),
          password,
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        {/* Brand Header */}
        <div className="text-center mb-8 cursor-pointer" onClick={() => onNavigate('landing')}>
          <div className="inline-flex w-12 h-12 rounded-2xl bg-gradient-to-tr from-verse-violet via-verse-indigo to-verse-rose items-center justify-center shadow-lg shadow-verse-violet/25 mb-4">
            <Feather className="w-6 h-6 text-ivory-50 -rotate-12" />
          </div>
          <h2 className="font-serif text-3xl font-bold text-ivory-50 tracking-tight">Verseora</h2>
          <p className="text-xs text-ivory-400 mt-1">
            {mode === 'login' ? 'Welcome back to your writing sanctuary' : 'Begin your journey as a creator and reader'}
          </p>
        </div>

        {/* Auth Card */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 border border-charcoal-800 shadow-2xl relative">
          {/* Tab Selector */}
          <div className="grid grid-cols-2 p-1 bg-charcoal-900 rounded-xl mb-6 border border-charcoal-800">
            <button
              type="button"
              onClick={() => { setMode('login'); setError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-verse-violet text-ivory-50 shadow-md'
                  : 'text-ivory-400 hover:text-ivory-100'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setMode('register'); setError(null); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all ${
                mode === 'register'
                  ? 'bg-verse-violet text-ivory-50 shadow-md'
                  : 'text-ivory-400 hover:text-ivory-100'
              }`}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-verse-rose/10 border border-verse-rose/30 flex items-start space-x-2 text-xs text-verse-rose">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {mode === 'register' && (
              <>
                <div>
                  <label className="block text-xs font-medium text-ivory-300 mb-1.5">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3.5 top-3 text-ivory-400" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="e.g. Arun Sharma"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-verse-violet"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-ivory-300 mb-1.5">Pen Name / Username</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-2.5 text-xs text-ivory-400">@</span>
                    <input
                      type="text"
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="poet_arun"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-verse-violet"
                    />
                  </div>
                  <p className="text-[10px] text-ivory-400 mt-1">Letters, numbers, and underscores only.</p>
                </div>
              </>
            )}

            <div>
              <label className="block text-xs font-medium text-ivory-300 mb-1.5">
                {mode === 'login' ? 'Username or Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-3 text-ivory-400" />
                <input
                  type={mode === 'register' ? 'email' : 'text'}
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={mode === 'login' ? 'username or poet@example.com' : 'poet@example.com'}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-verse-violet"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-ivory-300 mb-1.5">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3.5 top-3 text-ivory-400" />
                <input
                  type="password"
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 8 characters"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl glass-input text-sm focus:outline-none focus:ring-2 focus:ring-verse-violet"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-4 py-3 rounded-xl bg-gradient-to-r from-verse-violet to-verse-indigo text-ivory-50 font-medium text-sm shadow-lg shadow-verse-violet/20 hover:opacity-95 disabled:opacity-50 transition flex items-center justify-center space-x-2"
            >
              {loading ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>{mode === 'login' ? 'Sign In to Journal' : 'Create Sanctuary Account'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Privacy Note */}
          <div className="mt-6 pt-4 border-t border-charcoal-800 flex items-center justify-center space-x-2 text-[11px] text-ivory-400">
            <ShieldCheck className="w-3.5 h-3.5 text-verse-teal" />
            <span>Encrypted with Argon2id & zero data reselling</span>
          </div>
        </div>
      </div>
    </div>
  );
};

