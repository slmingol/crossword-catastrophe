import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Crossword } from '@guardian/react-crossword';
import { api, Puzzle } from '../api/client';

export default function PuzzlePlay() {
  const { id } = useParams<{ id: string }>();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [startTime] = useState(Date.now());

  useEffect(() => {
    if (id) {
      api.getPuzzle(parseInt(id))
        .then(setPuzzle)
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  const handleSave = (data: any) => {
    if (puzzle) {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      api.saveProgress(puzzle.id, data, false, timeSpent).catch(console.error);
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading puzzle...</div>;
  }

  if (!puzzle) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Puzzle not found</div>;
  }

  // Transform puzzle data to Guardian crossword format
  const crosswordData = {
    id: puzzle.id.toString(),
    number: puzzle.id,
    name: puzzle.title,
    creator: { name: puzzle.author },
    date: new Date(puzzle.date).getTime(),
    entries: [
      ...Object.entries(puzzle.clues_across || {}).map(([num, clue]: [string, any]) => ({
        id: `${num}-across`,
        number: parseInt(num),
        humanNumber: num,
        clue: typeof clue === 'string' ? clue : clue.clue,
        direction: 'across' as const,
        length: typeof clue === 'string' ? 0 : clue.length || 0,
        group: [`${num}-across`],
        position: { x: 0, y: 0 }, // Will be calculated from grid
        separatorLocations: {},
        solution: typeof clue === 'string' ? '' : clue.answer || '',
      })),
      ...Object.entries(puzzle.clues_down || {}).map(([num, clue]: [string, any]) => ({
        id: `${num}-down`,
        number: parseInt(num),
        humanNumber: num,
        clue: typeof clue === 'string' ? clue : clue.clue,
        direction: 'down' as const,
        length: typeof clue === 'string' ? 0 : clue.length || 0,
        group: [`${num}-down`],
        position: { x: 0, y: 0 }, // Will be calculated from grid
        separatorLocations: {},
        solution: typeof clue === 'string' ? '' : clue.answer || '',
      })),
    ],
    solutionAvailable: false,
    dateSolutionAvailable: 0,
    dimensions: {
      cols: puzzle.grid_data?.width || 15,
      rows: puzzle.grid_data?.height || 15,
    },
    crosswordType: 'quick' as const,
  };

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
      </div>
      <div style={{
        backgroundColor: 'white',
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <Crossword
          data={crosswordData}
          onCellChange={handleSave}
        />
      </div>
    </div>
  );
}
