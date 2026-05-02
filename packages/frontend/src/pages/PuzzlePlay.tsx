import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Puzzle } from '../api/client';

// Temporary simple crossword display
function SimpleCrossword({ puzzle }: { puzzle: Puzzle }) {
  const solution = puzzle.grid_data?.solution || [];
  const width = puzzle.grid_data?.width || 15;
  const height = puzzle.grid_data?.height || 15;

  return (
    <div>
      <div style={{ 
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${width}, 40px)`,
        gap: 0,
        border: '2px solid #000',
        marginBottom: '2rem'
      }}>
        {solution.map((row: string[], rowIdx: number) => 
          row.map((cell: string, colIdx: number) => (
            <div
              key={`${rowIdx}-${colIdx}`}
              style={{
                width: '40px',
                height: '40px',
                border: '1px solid #999',
                backgroundColor: cell === '.' ? '#000' : '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '20px',
                fontWeight: 'bold',
                cursor: cell !== '.' ? 'pointer' : 'default'
              }}
            >
              {cell !== '.' && cell !== '' ? cell : ''}
            </div>
          ))
        )}
      </div>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        <div>
          <h3>Across</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {Object.entries(puzzle.clues_across || {}).map(([num, clue]: [string, any]) => (
              <div key={num} style={{ marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <strong>{num}.</strong> {typeof clue === 'string' ? clue : clue.clue}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3>Down</h3>
          <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
            {Object.entries(puzzle.clues_down || {}).map(([num, clue]: [string, any]) => (
              <div key={num} style={{ marginBottom: '0.75rem', padding: '0.5rem', backgroundColor: '#f5f5f5', borderRadius: '4px' }}>
                <strong>{num}.</strong> {typeof clue === 'string' ? clue : clue.clue}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PuzzlePlay() {
  const { id } = useParams<{ id: string }>();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      api.getPuzzle(parseInt(id))
        .then(setPuzzle)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading puzzle...</div>;
  }

  if (!puzzle) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Puzzle not found</div>;
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ color: '#0066cc', textDecoration: 'none' }}>← Back</Link>
      </div>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        marginBottom: '2rem'
      }}>
        <h1 style={{ marginBottom: '0.5rem' }}>{puzzle.title}</h1>
        <p style={{ color: '#666' }}>
          By {puzzle.author} • {puzzle.source}
          {puzzle.difficulty && ` • ${puzzle.difficulty}`}
        </p>
        <p style={{ color: '#888', fontSize: '0.9rem' }}>
          {new Date(puzzle.date).toLocaleDateString()}
        </p>
        <p style={{ color: '#f60', fontSize: '0.9rem', fontStyle: 'italic', marginTop: '1rem' }}>
          Note: Interactive puzzle coming soon - currently showing solution
        </p>
      </div>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <SimpleCrossword puzzle={puzzle} />
      </div>
    </div>
  );
}
