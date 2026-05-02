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
          <nav style={{ 
            maxWidth: '1400px', 
            margin: '0 auto', 
            display: 'flex', 
            gap: '1rem', 
            alignItems: 'center', 
            justifyContent: 'space-between',
            flexWrap: 'nowrap',
            minHeight: '2rem'
          }}>
            <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', flexWrap: 'nowrap', minWidth: 0 }}>
              <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.3rem', fontWeight: 'bold', whiteSpace: 'nowrap' }}>
                🧩 Crossword
              </Link>
              <Link to="/archive" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
                Archive
              </Link>
              {puzzleInfo && (
                <>
                  <span style={{ color: '#666', margin: '0 0.25rem' }}>|</span>
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
                  <span style={{ fontSize: '0.9rem', fontWeight: '600', whiteSpace: 'nowrap', margin: '0 0.25rem' }}>{puzzleInfo.title}</span>
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
                  <span style={{ color: '#ccc', fontSize: '0.8rem', whiteSpace: 'nowrap', marginLeft: '0.5rem' }}>
                    {puzzleInfo.author.replace('By ', '')} • {puzzleInfo.source} • {new Date(puzzleInfo.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                  </span>
                </>
              )}
            </div>
            {actions && <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>{actions}</div>}
          </nav>
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
