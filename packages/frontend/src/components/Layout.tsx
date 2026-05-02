import { ReactNode, useEffect, useState, createContext, useContext } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { api } from '../api/client';

interface LayoutProps {
  children: ReactNode;
}

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
    <PuzzleActionsContext.Provider value={{ setActions, setNavigation }}>
      <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        <header style={{
          backgroundColor: '#1a1a1a',
          color: 'white',
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
              borderBottom: puzzleInfo ? '1px solid #333' : 'none'
            }}>
              <Link to="/" style={{ 
                color: 'white', 
                textDecoration: 'none', 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.75rem'
              }}>
                <img src="/logo.png" alt="Crossword Catastrophe Logo" style={{ height: '2.5rem', width: 'auto' }} />
                <span style={{ fontSize: '1.5rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>Crossword Catastrophe</span>
              </Link>
              <Link to="/archive" style={{ 
                color: '#ccc', 
                textDecoration: 'none', 
                fontSize: '0.95rem',
                padding: '0.4rem 0.8rem',
                borderRadius: '4px',
                backgroundColor: '#2a2a2a',
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
                        color: navigation.hasPrevious ? 'white' : '#666',
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
                        color: navigation.hasNext ? 'white' : '#666',
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
                  <span style={{ color: '#ccc', fontSize: '0.85rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
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
          backgroundColor: '#f0f0f0',
          padding: '1rem',
          textAlign: 'center',
          color: '#666'
        }}>
          <p>Self-hosted Crossword Archive</p>
        </footer>
      </div>
    </PuzzleActionsContext.Provider>
  );
}
