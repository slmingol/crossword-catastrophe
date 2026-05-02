import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api/client';

export default function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Auto-navigate to current puzzle (in progress or latest)
    api.getCurrentPuzzle()
      .then(puzzle => {
        navigate(`/puzzle/${puzzle.id}`, { replace: true });
      })
      .catch((err) => {
        console.error('Error loading current puzzle:', err);
        setLoading(false);
      });
  }, [navigate]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading puzzle...</div>;
  }

  return (
    <div style={{ textAlign: 'center', padding: '4rem' }}>
      <h2>No Puzzle Available</h2>
      <p style={{ color: '#666', margin: '1rem 0' }}>Check back later!</p>
    </div>
  );
}
