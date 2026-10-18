import React, { useState } from 'react';
import {
  Feather,
  Compass,
  BookOpen,
  Sparkles,
  Bell,
  Sun,
  Moon,
  Zap,
  ZapOff,
  User as UserIcon,
  LogOut,
  ShieldAlert,
  Settings,
  PlusCircle,
  Menu,
  X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

interface NavbarProps {
  onNavigate: (page: string, params?: any) => void;
  currentPage: string;
}

export const Navbar: React.FC<NavbarProps> = ({ onNavigate, currentPage }) => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme, lowEffects, toggleLowEffects } = useTheme();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNav = (page: string, params?: any) => {
    onNavigate(page, params);
    setMobileMenuOpen(false);
    setUserMenuOpen(false);
  };

  return (
    <nav className="sticky top-0 z-50 glass-panel border-b border-charcoal-800/80 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => handleNav(user ? 'dashboard' : 'landing')}>
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-verse-violet via-verse-indigo to-verse-rose flex items-center justify-center shadow-lg shadow-verse-violet/20">
              <Feather className="w-5 h-5 text-ivory-50 transform -rotate-12" />
            </div>
            <div>
              <span className="font-serif text-2xl font-bold tracking-tight bg-gradient-to-r from-ivory-50 via-ivory-100 to-verse-violet bg-clip-text text-transparent">
                Verseora
              </span>
              <span className="hidden sm:inline-block ml-2 text-[10px] tracking-widest uppercase text-ivory-400 font-sans px-1.5 py-0.5 rounded border border-charcoal-700">
                साहित्य
              </span>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center space-x-1 lg:space-x-2">
            <button
              onClick={() => handleNav('explore')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                currentPage === 'explore'
                  ? 'text-verse-violet bg-verse-violet/10 border border-verse-violet/20'
                  : 'text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800/50'
              }`}
            >
              <Compass className="w-4 h-4" />
              <span>Explore</span>
            </button>

            {user && (
              <>
                <button
                  onClick={() => handleNav('dashboard')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'dashboard'
                      ? 'text-verse-violet bg-verse-violet/10 border border-verse-violet/20'
                      : 'text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800/50'
                  }`}
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Journal</span>
                </button>

                <button
                  onClick={() => handleNav('collections')}
                  className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'collections'
                      ? 'text-verse-violet bg-verse-violet/10 border border-verse-violet/20'
                      : 'text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800/50'
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>Collections</span>
                </button>
              </>
            )}

            {user?.role === 'ADMIN' && (
              <button
                onClick={() => handleNav('admin')}
                className={`flex items-center space-x-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'admin'
                    ? 'text-verse-rose bg-verse-rose/10 border border-verse-rose/20'
                    : 'text-verse-rose/80 hover:text-verse-rose hover:bg-verse-rose/10'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                <span>Admin</span>
              </button>
            )}
          </div>

          {/* Right Action Icons & Auth Controls */}
          <div className="flex items-center space-x-2">
            {/* Low Effects / Motion Mode Toggle */}
            <button
              onClick={toggleLowEffects}
              title={lowEffects ? 'Low effects mode enabled (Click for 3D & motion)' : 'Rich effects enabled (Click for low-effects mode)'}
              className="p-2 rounded-lg text-ivory-400 hover:text-ivory-50 hover:bg-charcoal-800 transition"
              aria-label="Toggle motion effects"
            >
              {lowEffects ? <ZapOff className="w-4 h-4 text-verse-amber" /> : <Zap className="w-4 h-4" />}
            </button>

            {/* Dark/Light Theme Toggle */}
            <button
              onClick={toggleTheme}
              title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
              className="p-2 rounded-lg text-ivory-400 hover:text-ivory-50 hover:bg-charcoal-800 transition"
              aria-label="Toggle color theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {user ? (
              <>
                {/* Write CTA */}
                <button
                  onClick={() => handleNav('studio')}
                  className="hidden sm:flex items-center space-x-1.5 bg-gradient-to-r from-verse-violet to-verse-indigo text-ivory-50 px-3.5 py-1.5 rounded-lg text-sm font-medium shadow-md shadow-verse-violet/20 hover:opacity-95 transition"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Write</span>
                </button>

                {/* Notifications Bell */}
                <button
                  onClick={() => handleNav('notifications')}
                  className="p-2 rounded-lg text-ivory-400 hover:text-ivory-50 hover:bg-charcoal-800 relative transition"
                  aria-label="Notifications"
                >
                  <Bell className="w-4 h-4" />
                </button>

                {/* User Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 p-1.5 rounded-full hover:bg-charcoal-800 transition"
                  >
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-verse-violet to-verse-rose flex items-center justify-center font-bold text-xs text-ivory-50">
                      {user.full_name.charAt(0).toUpperCase()}
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-56 rounded-xl glass-panel shadow-2xl py-2 border border-charcoal-700/80 z-50">
                      <div className="px-4 py-2 border-b border-charcoal-800">
                        <p className="text-sm font-semibold text-ivory-50 truncate">{user.full_name}</p>
                        <p className="text-xs text-ivory-400 truncate">@{user.username}</p>
                      </div>

                      <button
                        onClick={() => handleNav('profile', { username: user.username })}
                        className="w-full text-left px-4 py-2 text-sm text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800 flex items-center space-x-2"
                      >
                        <UserIcon className="w-4 h-4" />
                        <span>My Profile</span>
                      </button>

                      <button
                        onClick={() => handleNav('settings')}
                        className="w-full text-left px-4 py-2 text-sm text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800 flex items-center space-x-2"
                      >
                        <Settings className="w-4 h-4" />
                        <span>Settings & Privacy</span>
                      </button>

                      <div className="border-t border-charcoal-800 my-1" />

                      <button
                        onClick={async () => {
                          await logout();
                          handleNav('landing');
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-verse-rose hover:bg-verse-rose/10 flex items-center space-x-2"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleNav('auth', { mode: 'login' })}
                  className="px-3.5 py-1.5 text-sm font-medium text-ivory-300 hover:text-ivory-50 transition"
                >
                  Sign In
                </button>
                <button
                  onClick={() => handleNav('auth', { mode: 'register' })}
                  className="bg-verse-violet text-ivory-50 px-3.5 py-1.5 rounded-lg text-sm font-medium hover:bg-verse-violet/90 shadow-md shadow-verse-violet/20 transition"
                >
                  Start Writing
                </button>
              </div>
            )}

            {/* Mobile Hamburger Menu */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-ivory-400 hover:text-ivory-50 hover:bg-charcoal-800"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden px-4 pt-2 pb-4 space-y-1 bg-charcoal-900 border-b border-charcoal-800">
          <button
            onClick={() => handleNav('explore')}
            className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800"
          >
            Explore Poetry & Shayari
          </button>
          {user ? (
            <>
              <button
                onClick={() => handleNav('studio')}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-verse-violet hover:bg-verse-violet/10"
              >
                + Write New Piece
              </button>
              <button
                onClick={() => handleNav('dashboard')}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800"
              >
                Journal & Drafts
              </button>
              <button
                onClick={() => handleNav('collections')}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800"
              >
                Saved Collections
              </button>
              <button
                onClick={() => handleNav('profile', { username: user.username })}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800"
              >
                My Profile
              </button>
              <button
                onClick={() => handleNav('settings')}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-ivory-300 hover:text-ivory-50 hover:bg-charcoal-800"
              >
                Settings & Export
              </button>
            </>
          ) : (
            <div className="pt-2 flex flex-col space-y-2">
              <button
                onClick={() => handleNav('auth', { mode: 'login' })}
                className="w-full text-center py-2 text-sm text-ivory-300 hover:text-ivory-50"
              >
                Sign In
              </button>
              <button
                onClick={() => handleNav('auth', { mode: 'register' })}
                className="w-full py-2 bg-verse-violet text-ivory-50 rounded-lg text-sm font-medium"
              >
                Create Account
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
};

