import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Puzzle, PuzzleListResponse } from '../api/client';
import { format } from 'date-fns';

export default function Archive() {
  const [data, setData] = useState<PuzzleListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.getPuzzles(page)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page]);

  if (loading && !data) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading archive...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Puzzle Archive</h1>
      {data && data.puzzles.length > 0 ? (
        <>
          <div style={{ display: 'grid', gap: '1rem' }}>
            {data.puzzles.map((puzzle: Puzzle) => (
              <Link
                key={puzzle.id}
                to={`/puzzle/${puzzle.id}`}
                style={{
                  display: 'block',
                  backgroundColor: 'white',
                  padding: '1.5rem',
                  borderRadius: '8px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  textDecoration: 'none',
                  color: 'inherit',
                  transition: 'transform 0.2s, box-shadow 0.2s'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <h3 style={{ marginBottom: '0.5rem' }}>{puzzle.title}</h3>
                <p style={{ color: '#666', fontSize: '0.9rem' }}>
                  {format(new Date(puzzle.date), 'MMMM d, yyyy')} • {puzzle.author} • {puzzle.source}
                  {puzzle.difficulty && ` • ${puzzle.difficulty}`}
                </p>
              </Link>
            ))}
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
