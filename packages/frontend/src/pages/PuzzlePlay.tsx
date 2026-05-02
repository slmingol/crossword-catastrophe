import { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { api, Puzzle } from '../api/client';
import { usePuzzleActions } from '../components/Layout';

// Interactive crossword display - v6 nav integration
function SimpleCrossword({ puzzle, showSolution, userGrid, setUserGrid }: { 
  puzzle: Puzzle, 
  showSolution: boolean,
  userGrid: string[][],
  setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>
}) {
  const solution = puzzle.grid_data?.solution || [];
  const width = puzzle.grid_data?.width || 15;
  const height = puzzle.grid_data?.height || 15;

  const [focusedCell, setFocusedCell] = useState<{row: number, col: number} | null>(null);
  const cellRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

  // Auto-focus cell when focusedCell changes
  useEffect(() => {
    if (focusedCell) {
      const key = `${focusedCell.row}-${focusedCell.col}`;
      cellRefs.current[key]?.focus();
    }
  }, [focusedCell]);

  // Calculate clue numbers for grid
  const clueNumbers: (number | null)[][] = solution.map(() => Array(width).fill(null));
  let clueNum = 1;
  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (solution[row][col] === '.') continue;
      
      const hasAcross = (col === 0 || solution[row][col - 1] === '.') && 
                       col < width - 1 && solution[row][col + 1] !== '.';
      const hasDown = (row === 0 || !solution[row - 1] || solution[row - 1][col] === '.') && 
                     row < height - 1 && solution[row + 1] && solution[row + 1][col] !== '.';
      
      if (hasAcross || hasDown) {
        clueNumbers[row][col] = clueNum++;
      }
    }
  }

  const handleCellClick = (rowIdx: number, colIdx: number) => {
    if (solution[rowIdx][colIdx] !== '.') {
      setFocusedCell({ row: rowIdx, col: colIdx });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, rowIdx: number, colIdx: number) => {
    console.log('handleKeyDown called:', { key: e.key, row: rowIdx, col: colIdx });
    if (solution[rowIdx][colIdx] === '.') return;

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
      const newGrid = userGrid.map(row => [...row]);
      newGrid[rowIdx][colIdx] = e.key.toUpperCase();
      setUserGrid(newGrid);
      
      // Move to next cell
      let nextCol = colIdx + 1;
      while (nextCol < width && solution[rowIdx][nextCol] === '.') nextCol++;
      console.log('Moving to next cell:', { nextCol, width });
      if (nextCol < width) {
        setTimeout(() => {
          const nextKey = `${rowIdx}-${nextCol}`;
          console.log('Focusing cell:', nextKey, 'ref exists:', !!cellRefs.current[nextKey]);
          cellRefs.current[nextKey]?.focus();
        }, 0);
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      console.log('Backspace pressed at', rowIdx, colIdx);
      const newGrid = userGrid.map(row => [...row]);
      
      // Delete current cell
      newGrid[rowIdx][colIdx] = '';
      setUserGrid(newGrid);
      
      // Move to previous cell
      let prevCol = colIdx - 1;
      while (prevCol >= 0 && solution[rowIdx][prevCol] === '.') prevCol--;
      console.log('Moving to previous cell:', prevCol);
      if (prevCol >= 0) {
        setTimeout(() => {
          const prevKey = `${rowIdx}-${prevCol}`;
          console.log('Focusing prev cell:', prevKey, 'ref exists:', !!cellRefs.current[prevKey]);
          cellRefs.current[prevKey]?.focus();
        }, 0);
      }
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      let nextCol = colIdx + 1;
      while (nextCol < width && solution[rowIdx][nextCol] === '.') nextCol++;
      if (nextCol < width) {
        const nextKey = `${rowIdx}-${nextCol}`;
        cellRefs.current[nextKey]?.focus();
      }
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      let prevCol = colIdx - 1;
      while (prevCol >= 0 && solution[rowIdx][prevCol] === '.') prevCol--;
      if (prevCol >= 0) {
        const prevKey = `${rowIdx}-${prevCol}`;
        cellRefs.current[prevKey]?.focus();
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      let nextRow = rowIdx + 1;
      while (nextRow < height && solution[nextRow][colIdx] === '.') nextRow++;
      if (nextRow < height) {
        const nextKey = `${nextRow}-${colIdx}`;
        cellRefs.current[nextKey]?.focus();
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      let prevRow = rowIdx - 1;
      while (prevRow >= 0 && solution[prevRow][colIdx] === '.') prevRow--;
      if (prevRow >= 0) {
        const prevKey = `${prevRow}-${colIdx}`;
        cellRefs.current[prevKey]?.focus();
      }
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start' }}>
        <div style={{ 
          display: 'inline-grid',
          gridTemplateColumns: `repeat(${width}, 34px)`,
          gap: 0,
          border: '2px solid #000'
        }}>
        {solution.map((row: string[], rowIdx: number) => 
          row.map((cell: string, colIdx: number) => {
            const isFocused = focusedCell?.row === rowIdx && focusedCell?.col === colIdx;
            const userValue = userGrid[rowIdx]?.[colIdx] || '';
            const displayValue = showSolution ? cell : userValue;
            const isCorrect = userValue && userValue === cell;
            const isWrong = userValue && userValue !== cell && userValue !== '';
            const clueNum = clueNumbers[rowIdx][colIdx];
            
            return (
              <div
                key={`${rowIdx}-${colIdx}`}
                ref={(el) => cellRefs.current[`${rowIdx}-${colIdx}`] = el}
                tabIndex={cell !== '.' ? 0 : -1}
                onClick={() => handleCellClick(rowIdx, colIdx)}
                onKeyDown={(e) => handleKeyDown(e, rowIdx, colIdx)}
                onFocus={() => cell !== '.' && setFocusedCell({ row: rowIdx, col: colIdx })}
                style={{
                  width: '34px',
                  height: '34px',
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
                  fontSize: '17px',
                  fontWeight: 'bold',
                  cursor: cell !== '.' ? 'pointer' : 'default',
                  outline: isFocused ? '2px solid #0066cc' : 'none',
                  position: 'relative'
                }}
              >
                {clueNum && (
                  <span style={{
                    position: 'absolute',
                    top: '1px',
                    left: '2px',
                    fontSize: '8px',
                    fontWeight: 'normal',
                    color: '#333'
                  }}>
                    {clueNum}
                  </span>
                )}
                {cell !== '.' ? displayValue : ''}
              </div>
            );
          })
        )}
      </div>
      
      <div style={{ flex: 1, minWidth: '300px' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Across</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {Object.entries(puzzle.clues_across || {}).map(([num, clue]: [string, any]) => (
              <div key={num} style={{ marginBottom: '0.5rem', padding: '0.4rem', backgroundColor: '#f5f5f5', borderRadius: '3px', fontSize: '0.9rem' }}>
                <strong>{num}.</strong> {typeof clue === 'string' ? clue : clue.clue}
              </div>
            ))}
          </div>
        </div>
        <div>
          <h3 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Down</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {Object.entries(puzzle.clues_down || {}).map(([num, clue]: [string, any]) => (
              <div key={num} style={{ marginBottom: '0.5rem', padding: '0.4rem', backgroundColor: '#f5f5f5', borderRadius: '3px', fontSize: '0.9rem' }}>
                <strong>{num}.</strong> {typeof clue === 'string' ? clue : clue.clue}
              </div>
            ))}
          </div>
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
  const [showSolution, setShowSolution] = useState(false);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const { setActions } = usePuzzleActions();

  console.log('PuzzlePlay render:', { id, loading, hasPuzzle: !!puzzle });

  useEffect(() => {
    console.log('PuzzlePlay useEffect triggered, id:', id);
    if (id) {
      console.log('Fetching puzzle', id);
      api.getPuzzle(parseInt(id))
        .then(data => {
          console.log('Puzzle fetched successfully:', data);
          setPuzzle(data);
          // Initialize user grid
          const solution = data.grid_data?.solution || [];
          setUserGrid(solution.map(row => row.map(cell => cell === '.' ? '.' : '')));
        })
        .catch(err => {
          console.error('Error fetching puzzle:', err);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  const checkAnswers = () => {
    if (!puzzle) return;
    const solution = puzzle.grid_data?.solution || [];
    let correct = 0, total = 0;
    solution.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== '.') {
          total++;
          if (userGrid[r]?.[c] === cell) correct++;
        }
      });
    });
    alert(`${correct} correct out of ${total}`);
  };

  // Set actions in nav bar
  useEffect(() => {
    if (puzzle) {
      setActions(
        <>
          <button onClick={checkAnswers} style={{
            padding: '0.3rem 0.6rem',
            backgroundColor: '#0066cc',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}>
            Check
          </button>
          <button onClick={() => setShowSolution(!showSolution)} style={{
            padding: '0.3rem 0.6rem',
            backgroundColor: '#555',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer',
            fontSize: '0.8rem'
          }}>
            {showSolution ? 'Hide' : 'Show'}
          </button>
        </>
      );
    }
    return () => setActions(null);
  }, [puzzle, showSolution, setActions]);

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
    <SimpleCrossword 
      puzzle={puzzle} 
      showSolution={showSolution}
      userGrid={userGrid}
      setUserGrid={setUserGrid}
    />
  );
}
        backgroundColor: 'white',
        padding: '0.75rem',
        borderRadius: '4px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)'
      }}>
        <SimpleCrossword 
          puzzle={puzzle} 
          showSolution={showSolution}
          userGrid={userGrid}
          setUserGrid={setUserGrid}
        />
      </div>
    </div>
  );
}
