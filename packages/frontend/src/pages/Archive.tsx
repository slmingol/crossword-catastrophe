import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Puzzle, PuzzleListResponse, UserProgress } from '../api/client';
import { format } from 'date-fns';

// Source badge colors and abbreviations
const SOURCE_CONFIG: Record<string, { abbr: string; color: string; bg: string }> = {
  'USA Today': { abbr: 'USA', color: '#0052cc', bg: '#deebff' },
  'Universal Crossword': { abbr: 'UNI', color: '#6554c0', bg: '#eae6ff' },
  'Los Angeles Times': { abbr: 'LAT', color: '#00875a', bg: '#e3fcef' },
  'Newsday': { abbr: 'ND', color: '#ff5630', bg: '#ffebe6' },
};

function SourceBadge({ source }: { source: string }) {
  const config = SOURCE_CONFIG[source] || { abbr: source.slice(0, 3).toUpperCase(), color: '#666', bg: '#f0f0f0' };
  
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.65rem',
        fontWeight: '700',
        padding: '0.2rem 0.4rem',
        borderRadius: '3px',
        backgroundColor: config.bg,
        color: config.color,
        marginRight: '0.75rem',
        minWidth: '36px',
        textAlign: 'center',
        letterSpacing: '0.3px'
      }}
    >
      {config.abbr}
    </span>
  );
}

export default function Archive() {
  const [data, setData] = useState<PuzzleListResponse | null>(null);
  const [progress, setProgress] = useState<Map<number, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      api.getPuzzles(page),
      api.getUserProgress()
    ])
      .then(([puzzlesData, progressData]) => {
        setData(puzzlesData);
        const progressMap = new Map(progressData.map(p => [p.puzzle_id, p]));
        setProgress(progressMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && !data) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading archive...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Puzzle Archive</h1>
      
      {/* Legend */}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '0.75rem 1rem', 
        backgroundColor: '#f8f9fa',
        borderRadius: '4px',
        fontSize: '0.85rem'
      }}>
        <span style={{ fontWeight: '600', marginRight: '1rem', color: '#666' }}>Sources:</span>
        {Object.entries(SOURCE_CONFIG).map(([name, config]) => (
          <span key={name} style={{ display: 'inline-flex', alignItems: 'center', marginRight: '1.5rem' }}>
            <span
              style={{
                display: 'inline-block',
                fontSize: '0.65rem',
                fontWeight: '700',
                padding: '0.2rem 0.4rem',
                borderRadius: '3px',
                backgroundColor: config.bg,
                color: config.color,
                marginRight: '0.4rem',
                minWidth: '36px',
                textAlign: 'center',
                letterSpacing: '0.3px'
              }}
            >
              {config.abbr}
            </span>
            <span style={{ color: '#666' }}>{name}</span>
          </span>
        ))}
      </div>
      
      {data && data.puzzles.length > 0 ? (
        <>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            {data.puzzles.map((puzzle: Puzzle) => {
              const puzzleProgress = progress.get(puzzle.id);
              const isCompleted = puzzleProgress?.completed || false;
              const inProgress = puzzleProgress && !puzzleProgress.completed;
              
              return (
                <Link
                  key={puzzle.id}
                  to={`/puzzle/${puzzle.id}`}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: 'white',
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    border: '1px solid #e0e0e0',
                    textDecoration: 'none',
                    color: 'inherit',
                    fontSize: '0.9rem',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = '#f5f5f5';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = 'white';
                  }}
                >
                  <span style={{ fontWeight: '600', marginRight: '1rem', minWidth: '80px' }}>
                    {format(new Date(puzzle.date), 'M/d/yy')}
                  </span>
                  <SourceBadge source={puzzle.source} />
                  {isCompleted && <span style={{ marginRight: '0.5rem', color: '#28a745', fontSize: '1rem' }}>✓</span>}
                  {inProgress && <span style={{ marginRight: '0.5rem', color: '#ffc107', fontSize: '0.8rem' }}>●</span>}
                  <span style={{ fontWeight: '500', marginRight: '1rem', flex: '0 0 auto' }}>
                    {puzzle.title}
                  </span>
                  <span style={{ color: '#666', fontSize: '0.85rem' }}>
                    {puzzle.author.replace('By ', '')}
                    {puzzle.difficulty && ` • ${puzzle.difficulty}`}
                  </span>
                </Link>
              );
            })}
          </div>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '1rem',
            marginTop: '2rem',
            alignItems: 'center'
          }}>
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: page === 1 ? '#ccc' : '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ color: '#666' }}>
              Page {page} of {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.pagination.pages}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: page >= data.pagination.pages ? '#ccc' : '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page >= data.pagination.pages ? 'not-allowed' : 'pointer'
              }}
            >
              Next
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
          No puzzles in archive yet. The scraper will download puzzles daily.
        </div>
      )}
    </div>
  );
}
