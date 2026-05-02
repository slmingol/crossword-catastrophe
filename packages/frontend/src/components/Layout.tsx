import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client';
import SplashScreen from './SplashScreen';

interface LayoutProps {
  children: ReactNode;
}

// Theme context
type Theme = 'light' | 'dark';
const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({ theme: 'light', toggleTheme: () => {} });

export const useTheme = () => useContext(ThemeContext);

// Context for puzzle page actions
const PuzzleActionsContext = createContext<{
  setActions: (actions: ReactNode) => void;
  setNavigation: (navigation: { onPrevious?: () => void; onNext?: () => void; hasPrevious: boolean; hasNext: boolean } | null) => void;
}>({ setActions: () => {}, setNavigation: () => {} });

export const usePuzzleActions = () => useContext(PuzzleActionsContext);

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [puzzleInfo, setPuzzleInfo] = useState<any>(null);
  const [actions, setActions] = useState<ReactNode>(null);
  const [navigation, setNavigation] = useState<{ onPrevious?: () => void; onNext?: () => void; hasPrevious: boolean; hasNext: boolean } | null>(null);
  const [showSplash, setShowSplash] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem('theme');
    return (saved === 'dark' || saved === 'light') ? saved : 'light';
  });

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const colors = theme === 'dark' ? {
    headerBg: '#1a1a1a',
    headerText: '#ffffff',
    headerSecondary: '#cccccc',
    headerBorder: '#333333',
    headerLink: '#2a2a2a',
    headerLinkHover: '#3a3a3a',
    navDisabled: '#666666',
    mainBg: '#121212',
    mainText: '#e0e0e0',
    footerBg: '#1a1a1a',
    footerText: '#999999',
  } : {
    headerBg: '#1a1a1a',
    headerText: '#ffffff',
    headerSecondary: '#cccccc',
    headerBorder: '#333333',
    headerLink: '#2a2a2a',
    headerLinkHover: '#3a3a3a',
    navDisabled: '#666666',
    mainBg: '#ffffff',
    mainText: '#000000',
    footerBg: '#f0f0f0',
    footerText: '#666666',
  };
  
  // Check if splash screen should be shown
  useEffect(() => {
    const lastSplashTime = localStorage.getItem('lastSplashTime');
    const now = Date.now();
    const fourHours = 4 * 60 * 60 * 1000; // 4 hours in milliseconds
    
    // Check for reset parameter in URL
    const urlParams = new URLSearchParams(window.location.search);
    const forceReset = urlParams.has('reset-splash');
    
    if (forceReset) {
      localStorage.removeItem('lastSplashTime');
      setShowSplash(true);
      localStorage.setItem('lastSplashTime', now.toString());
      // Remove the parameter from URL
      window.history.replaceState({}, '', window.location.pathname);
    } else if (!lastSplashTime || now - parseInt(lastSplashTime) > fourHours) {
      setShowSplash(true);
      localStorage.setItem('lastSplashTime', now.toString());
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };
  
  // Extract puzzle ID from URL
  const puzzleMatch = location.pathname.match(/\/puzzle\/(\d+)/);
  const puzzleId = puzzleMatch ? puzzleMatch[1] : null;
  
  useEffect(() => {
    if (puzzleId) {
      api.getPuzzle(parseInt(puzzleId))
        .then(data => setPuzzleInfo(data))
        .catch(() => setPuzzleInfo(null));
    } else {
      setPuzzleInfo(null);
      setActions(null);
      setNavigation(null);
    }
  }, [puzzleId]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <PuzzleActionsContext.Provider value={{ setActions, setNavigation }}>
        {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: colors.mainBg, color: colors.mainText, transition: 'background-color 0.3s, color 0.3s' }}>
          <header style={{
            backgroundColor: colors.headerBg,
            color: colors.headerText,
            padding: '0.75rem 2rem',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
          <div style={{ maxWidth: '1400px', margin: '0 auto' }}>
            {/* Top row: Logo and game name centered */}
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              gap: '1.5rem',
              paddingBottom: puzzleInfo ? '0.75rem' : '0',
              borderBottom: puzzleInfo ? `1px solid ${colors.headerBorder}` : 'none',
              opacity: showSplash ? 0 : 1,
              transition: 'opacity 0.5s ease-in',
              position: 'relative'
            }}>
              <button
                onClick={toggleTheme}
                style={{
                  position: 'absolute',
                  left: 0,
                  background: 'none',
                  border: 'none',
                  color: colors.headerText,
                  fontSize: '1.3rem',
                  cursor: 'pointer',
                  padding: '0.5rem',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
                title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
              >
                {theme === 'light' ? '🌙' : '☀️'}
              </button>
              <Link to="/" style={{ 
                color: 'white', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem'
              }}>
                <img src="/logo.png" alt="Crossword Cat-a-strophe Logo" style={{ height: '3.5rem', width: 'auto' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Crossword Cat-a-strophe</span>
              </Link>
              <Link to="/archive" style={{ 
                color: colors.headerSecondary, 
                textDecoration: 'none', 
                fontSize: '0.95rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                backgroundColor: colors.headerLink,
                transition: 'background-color 0.15s'
              }}>
                Archive
              </Link>
            </div>

            {/* Second row: Puzzle navigation and info */}
            {puzzleInfo && (
              <nav style={{ 
                display: 'flex', 
                gap: '1rem', 
                alignItems: 'center', 
                justifyContent: 'space-between',
                paddingTop: '0.75rem'
              }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flex: 1 }}>
                  {navigation && (
                    <button
                      onClick={navigation.onPrevious}
                      disabled={!navigation.hasPrevious}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: navigation.hasPrevious ? colors.headerText : colors.navDisabled,
                        fontSize: '1.2rem',
                        cursor: navigation.hasPrevious ? 'pointer' : 'not-allowed',
                        padding: '0 0.15rem',
                        opacity: navigation.hasPrevious ? 1 : 0.5
                      }}
                      title="Previous puzzle"
                    >
                      ←
                    </button>
                  )}
                  <span style={{ fontSize: '0.95rem', fontWeight: '600', whiteSpace: 'nowrap' }}>{puzzleInfo.title}</span>
                  {navigation && (
                    <button
                      onClick={navigation.onNext}
                      disabled={!navigation.hasNext}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: navigation.hasNext ? colors.headerText : colors.navDisabled,
                        fontSize: '1.2rem',
                        cursor: navigation.hasNext ? 'pointer' : 'not-allowed',
                        padding: '0 0.15rem',
                        opacity: navigation.hasNext ? 1 : 0.5
                      }}
                      title="Next puzzle"
                    >
                      →
                    </button>
                  )}
                  <span style={{ color: colors.headerSecondary, fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                    {puzzleInfo.author.replace('By ', '')} • {puzzleInfo.source} • {new Date(puzzleInfo.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                  </span>
                </div>
                {actions && <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>{actions}</div>}
              </nav>
            )}
          </div>
        </header>
        <main style={{ flex: 1, padding: '2rem', maxWidth: '1400px', margin: '0 auto', width: '100%' }}>
          {children}
        </main>
        <footer style={{
          backgroundColor: colors.footerBg,
          padding: '1rem',
          textAlign: 'center',
          color: colors.footerText,
          transition: 'background-color 0.3s, color 0.3s'
        }}>
          <p>Self-hosted Crossword Archive</p>
        </footer>
      </div>
    </PuzzleActionsContext.Provider>
    </ThemeContext.Provider>
  );
}
