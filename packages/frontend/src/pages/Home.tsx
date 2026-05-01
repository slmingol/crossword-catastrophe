import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Puzzle } from '../api/client';

export default function Home() {
  const [todaysPuzzle, setTodaysPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    api.getTodaysPuzzle()
      .then(setTodaysPuzzle)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading today's puzzle...</div>;
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem' }}>
        <h2>No Puzzle Available</h2>
        <p style={{ color: '#666', margin: '1rem 0' }}>{error}</p>
        <Link to="/archive" style={{ color: '#0066cc', textDecoration: 'none' }}>
          Browse the archive →
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 style={{ marginBottom: '2rem' }}>Today's Puzzle</h1>
      {todaysPuzzle && (
        <div style={{
          backgroundColor: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h2>{todaysPuzzle.title}</h2>
          <p style={{ color: '#666', margin: '0.5rem 0' }}>
            By {todaysPuzzle.author} • {todaysPuzzle.source}
            {todaysPuzzle.difficulty && ` • ${todaysPuzzle.difficulty}`}
          </p>
          <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '1.5rem' }}>
            {new Date(todaysPuzzle.date).toLocaleDateString()}
          </p>
          <Link
            to={`/puzzle/${todaysPuzzle.id}`}
            style={{
              display: 'inline-block',
              backgroundColor: '#0066cc',
              color: 'white',
              padding: '0.75rem 1.5rem',
              borderRadius: '4px',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
          >
            Play Now
          </Link>
        </div>
      )}
    </div>
  );
}
