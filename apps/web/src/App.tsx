import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { LandingPage } from './pages/LandingPage';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { StudioPage } from './pages/StudioPage';
import { ExplorePage } from './pages/ExplorePage';
import { ReadingPage } from './pages/ReadingPage';
import { ProfilePage } from './pages/ProfilePage';
import { CollectionsPage } from './pages/CollectionsPage';
import { NotificationsPage } from './pages/NotificationsPage';
import { AdminPage } from './pages/AdminPage';
import { SettingsPage } from './pages/SettingsPage';

export const App: React.FC = () => {
  const { user, isLoading } = useAuth();

  // Simple, rock-solid client-side navigation router
  const [currentPage, setCurrentPage] = useState<string>('landing');
  const [routeParams, setRouteParams] = useState<any>({});

  // Parse initial URL hash or path if any
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '');
      const [route, param] = hash.split('?');
      if (route) {
        setCurrentPage(route);
        if (param) {
          const parsed = Object.fromEntries(new URLSearchParams(param));
          setRouteParams(parsed);
        }
      }
    };

    if (window.location.hash) {
      handleHashChange();
    }
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const navigate = (page: string, params?: any) => {
    // Protected route check
    const protectedPages = ['dashboard', 'studio', 'collections', 'notifications', 'settings', 'admin'];
    if (protectedPages.includes(page) && !user) {
      setCurrentPage('auth');
      setRouteParams({ mode: 'login', intendedPage: page, ...params });
      window.location.hash = `#/auth?mode=login`;
      return;
    }

    setCurrentPage(page);
    setRouteParams(params || {});
    window.scrollTo({ top: 0, behavior: 'smooth' });

    let hash = `#/${page}`;
    if (params && Object.keys(params).length > 0) {
      const search = new URLSearchParams(params).toString();
      hash += `?${search}`;
    }
    window.location.hash = hash;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-charcoal-950 flex items-center justify-center text-ivory-300 text-sm font-serif">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-verse-violet to-verse-rose animate-spin" />
          <p className="tracking-wide">Opening Verseora...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-charcoal-950 text-ivory-50">
      <Navbar onNavigate={navigate} currentPage={currentPage} />

      <main className="flex-1">
        {currentPage === 'landing' && <LandingPage onNavigate={navigate} />}
        {currentPage === 'auth' && (
          <AuthPage
            initialMode={routeParams.mode || 'login'}
            onSuccess={() => navigate(routeParams.intendedPage || 'dashboard')}
            onNavigate={navigate}
          />
        )}
        {currentPage === 'dashboard' && <DashboardPage onNavigate={navigate} />}
        {currentPage === 'studio' && <StudioPage postId={routeParams.postId} onNavigate={navigate} />}
        {currentPage === 'explore' && <ExplorePage onNavigate={navigate} />}
        {currentPage === 'reading' && <ReadingPage slug={routeParams.slug} onNavigate={navigate} />}
        {currentPage === 'profile' && <ProfilePage username={routeParams.username || user?.username || ''} onNavigate={navigate} />}
        {currentPage === 'collections' && <CollectionsPage onNavigate={navigate} />}
        {currentPage === 'notifications' && <NotificationsPage onNavigate={navigate} />}
        {currentPage === 'admin' && <AdminPage onNavigate={navigate} />}
        {currentPage === 'settings' && <SettingsPage onNavigate={navigate} />}
      </main>

      <Footer onNavigate={navigate} />
    </div>
  );
};
export default App;

