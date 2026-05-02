import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api, Puzzle } from '../api/client';

// Interactive crossword display
function SimpleCrossword({ puzzle }: { puzzle: Puzzle }) {
  const solution = puzzle.grid_data?.solution || [];
  const width = puzzle.grid_data?.width || 15;
  const height = puzzle.grid_data?.height || 15;

  // Initialize empty grid for user input
  const [userGrid, setUserGrid] = useState<string[][]>(() => 
    solution.map(row => row.map(cell => cell === '.' ? '.' : ''))
  );
  const [focusedCell, setFocusedCell] = useState<{row: number, col: number} | null>(null);
  const [showSolution, setShowSolution] = useState(false);

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    if (solution[rowIdx][colIdx] !== '.') {
      setFocusedCell({ row: rowIdx, col: colIdx });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    if (solution[rowIdx][colIdx] === '.') return;

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      const newGrid = userGrid.map(row => [...row]);
      newGrid[rowIdx][colIdx] = e.key.toUpperCase();
      setUserGrid(newGrid);
      
      // Move to next cell
      let nextCol = colIdx + 1;
      while (nextCol < width && solution[rowIdx][nextCol] === '.') nextCol++;
      if (nextCol < width) {
        setFocusedCell({ row: rowIdx, col: nextCol });
      }
    } else if (e.key === 'Backspace') {
      const newGrid = userGrid.map(row => [...row]);
      newGrid[rowIdx][colIdx] = '';
      setUserGrid(newGrid);
    } else if (e.key === 'ArrowRight') {
      let nextCol = colIdx + 1;
      while (nextCol < width && solution[rowIdx][nextCol] === '.') nextCol++;
      if (nextCol < width) setFocusedCell({ row: rowIdx, col: nextCol });
    } else if (e.key === 'ArrowLeft') {
      let prevCol = colIdx - 1;
      while (prevCol >= 0 && solution[rowIdx][prevCol] === '.') prevCol--;
      if (prevCol >= 0) setFocusedCell({ row: rowIdx, col: prevCol });
    } else if (e.key === 'ArrowDown') {
      let nextRow = rowIdx + 1;
      while (nextRow < height && solution[nextRow][colIdx] === '.') nextRow++;
      if (nextRow < height) setFocusedCell({ row: nextRow, col: colIdx });
    } else if (e.key === 'ArrowUp') {
      let prevRow = rowIdx - 1;
      while (prevRow >= 0 && solution[prevRow][colIdx] === '.') prevRow--;
      if (prevRow >= 0) setFocusedCell({ row: prevRow, col: colIdx });
    }
  };

  const checkAnswers = () => {
    let correct = 0, total = 0;
    solution.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== '.') {
          total++;
          if (userGrid[r][c] === cell) correct++;
        }
      });
    });
    alert(`${correct} correct out of ${total}`);
  };

  return (
    <div>
      <div style={{ marginBottom: '1rem', display: 'flex', gap: '1rem' }}>
        <button onClick={checkAnswers} style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#0066cc',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          Check Answers
        </button>
        <button onClick={() => setShowSolution(!showSolution)} style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#666',
          color: 'white',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}>
          {showSolution ? 'Hide' : 'Reveal'} Solution
        </button>
      </div>
      <div style={{ 
        display: 'inline-grid',
        gridTemplateColumns: `repeat(${width}, 40px)`,
        gap: 0,
        border: '2px solid #000',
        marginBottom: '2rem'
      }}>
        {solution.map((row: string[], rowIdx: number) => 
          row.map((cell: string, colIdx: number) => {
            const isFocused = focusedCell?.row === rowIdx && focusedCell?.col === colIdx;
            const userValue = userGrid[rowIdx]?.[colIdx] || '';
            const displayValue = showSolution ? cell : userValue;
            const isCorrect = userValue && userValue === cell;
            const isWrong = userValue && userValue !== cell && userValue !== '';
            
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                tabIndex={cell !== '.' ? 0 : -1}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                onFocus={() => cell !== '.' && setFocusedCell({ row: rowIdx, col: colIdx })}
                style={{
                  width: '40px',
                  height: '40px',
                  border: '1px solid #999',
                  backgroundColor: cell === '.' ? '#000' : 
                                   isFocused ? '#ffffcc' : 
                                   showSolution ? '#e6f7ff' :
                                   isCorrect ? '#d4edda' :
                                   isWrong ? '#f8d7da' :
                                   '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  fontWeight: 'bold',
                  cursor: cell !== '.' ? 'pointer' : 'default',
                  outline: isFocused ? '2px solid #0066cc' : 'none'
                }}
              >
                {cell !== '.' ? displayValue : ''}
              </div>
            );
          })
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
  const [error, setError] = useState<string | null>(null);

  console.log('PuzzlePlay render:', { id, loading, hasPuzzle: !!puzzle });

  useEffect(() => {
    console.log('PuzzlePlay useEffect triggered, id:', id);
    if (id) {
      console.log('Fetching puzzle', id);
      api.getPuzzle(parseInt(id))
        .then(data => {
          console.log('Puzzle fetched successfully:', data);
          setPuzzle(data);
        })
        .catch(err => {
          console.error('Error fetching puzzle:', err);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading puzzle...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '4rem', color: 'red' }}>Error: {error}</div>;
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
