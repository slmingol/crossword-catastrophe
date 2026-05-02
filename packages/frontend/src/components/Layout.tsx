import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { api } from '../api/client';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const location = useLocation();
  const [puzzleInfo, setPuzzleInfo] = useState<any>(null);
  
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
    }
  }, [puzzleId]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{
        backgroundColor: '#1a1a1a',
        color: 'white',
        padding: '0.75rem 2rem',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <nav style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', gap: '2rem', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
            <Link to="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.3rem', fontWeight: 'bold' }}>
              🧩 Crossword
            </Link>
            <Link to="/archive" style={{ color: 'white', textDecoration: 'none', fontSize: '0.9rem' }}>
              Archive
            </Link>
            {puzzleInfo && (
              <>
                <span style={{ color: '#666' }}>|</span>
                <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{puzzleInfo.title}</span>
                <span style={{ color: '#ccc', fontSize: '0.8rem' }}>
                  {puzzleInfo.author.replace('By ', '')} • {puzzleInfo.source} • {new Date(puzzleInfo.date).toLocaleDateString('en-US', { month: 'numeric', day: 'numeric', year: '2-digit' })}
                </span>
              </>
            )}
          </div>
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
  );
}
