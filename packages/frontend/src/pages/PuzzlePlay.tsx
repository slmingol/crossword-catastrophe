import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Puzzle } from '../api/client';
import { usePuzzleActions } from '../components/Layout';

// Interactive crossword display - v7 buttons in top nav
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
    if (solution[rowIdx][colIdx] === '.') return;

    if (e.key.length === 1 && /[a-zA-Z]/.test(e.key)) {
      e.preventDefault();
      const newGrid = userGrid.map(row => [...row]);
      newGrid[rowIdx][colIdx] = e.key.toUpperCase();
      setUserGrid(newGrid);
      
      // Move to next cell
      let nextCol = colIdx + 1;
      while (nextCol < width && solution[rowIdx][nextCol] === '.') nextCol++;
      if (nextCol < width) {
        setTimeout(() => {
          const nextKey = `${rowIdx}-${nextCol}`;
          cellRefs.current[nextKey]?.focus();
        }, 0);
      }
    } else if (e.key === 'Backspace') {
      e.preventDefault();
      const newGrid = userGrid.map(row => [...row]);
      
      // Delete current cell
      newGrid[rowIdx][colIdx] = '';
      setUserGrid(newGrid);
      
      // Move to previous cell
      let prevCol = colIdx - 1;
      while (prevCol >= 0 && solution[rowIdx][prevCol] === '.') prevCol--;
      if (prevCol >= 0) {
        setTimeout(() => {
          const prevKey = `${rowIdx}-${prevCol}`;
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
      <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${width}, 34px)`,
          gridTemplateRows: `repeat(${height}, 34px)`,
          gap: 0,
          border: '2px solid #000',
          width: `${width * 34 + 4}px`, // Explicit width: cells + border
          height: `${height * 34 + 4}px`, // Explicit height: cells + border
          flexShrink: 0
        }}>
        {solution.map((row: string[], rowIdx: number) => 
          row.map((cell: string, colIdx: number) => {
            const isFocused = focusedCell?.row === rowIdx && focusedCell?.col === colIdx;
            const userValue = userGrid[rowIdx]?.[colIdx] || '';
            const displayValue = showSolution ? cell : (userValue === '.' ? '' : userValue);
            const isCorrect = userValue && userValue !== '.' && userValue === cell;
            const isWrong = userValue && userValue !== '.' && userValue !== cell && userValue !== '';
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
        <div style={{ marginBottom: '1.5rem', border: '2px solid #0052cc', borderRadius: '6px', overflow: 'hidden' }}>
          <h3 style={{ 
            margin: 0, 
            padding: '0.75rem 1rem', 
            fontSize: '1.1rem', 
            fontWeight: '700',
            backgroundColor: '#0052cc', 
            color: 'white',
            letterSpacing: '0.5px'
          }}>ACROSS</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
            {Object.entries(puzzle.clues_across || {}).map(([num, clue]: [string, any]) => (
              <div 
                key={num} 
                style={{ 
                  marginBottom: '0.5rem', 
                  padding: '0.6rem 0.75rem', 
                  backgroundColor: 'white',
                  border: '1px solid #deebff',
                  borderLeft: '3px solid #0052cc',
                  borderRadius: '4px', 
                  fontSize: '0.9rem',
                  transition: 'all 0.15s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#deebff';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <strong style={{ color: '#0052cc', marginRight: '0.5rem' }}>{num}.</strong> 
                <span>{typeof clue === 'string' ? clue : clue.clue}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border: '2px solid #00875a', borderRadius: '6px', overflow: 'hidden' }}>
          <h3 style={{ 
            margin: 0, 
            padding: '0.75rem 1rem', 
            fontSize: '1.1rem', 
            fontWeight: '700',
            backgroundColor: '#00875a', 
            color: 'white',
            letterSpacing: '0.5px'
          }}>DOWN</h3>
          <div style={{ maxHeight: '400px', overflowY: 'auto', padding: '0.5rem' }}>
            {Object.entries(puzzle.clues_down || {}).map(([num, clue]: [string, any]) => (
              <div 
                key={num} 
                style={{ 
                  marginBottom: '0.5rem', 
                  padding: '0.6rem 0.75rem', 
                  backgroundColor: 'white',
                  border: '1px solid #e3fcef',
                  borderLeft: '3px solid #00875a',
                  borderRadius: '4px', 
                  fontSize: '0.9rem',
                  transition: 'all 0.15s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = '#e3fcef';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = 'white';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <strong style={{ color: '#00875a', marginRight: '0.5rem' }}>{num}.</strong> 
                <span>{typeof clue === 'string' ? clue : clue.clue}</span>
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
  const navigate = useNavigate();
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [userGrid, setUserGrid] = useState<string[][]>([]);
  const [startTime] = useState(Date.now());
  const [timeSpent, setTimeSpent] = useState(0);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' } | null>(null);
  const [hasPrevious, setHasPrevious] = useState(false);
  const [hasNext, setHasNext] = useState(false);
  const { setActions, setNavigation } = usePuzzleActions();
  
  // Use refs to avoid recreating callbacks on every keystroke
  const userGridRef = useRef<string[][]>([]);
  const timeSpentRef = useRef(0);
  
  useEffect(() => {
    userGridRef.current = userGrid;
  }, [userGrid]);
  
  useEffect(() => {
    timeSpentRef.current = timeSpent;
  }, [timeSpent]);

  // Load puzzle and saved progress
  useEffect(() => {
    if (id) {
      Promise.all([
        api.getPuzzle(parseInt(id)),
        api.getPuzzleProgress(parseInt(id)),
        api.getPreviousPuzzle(parseInt(id)),
        api.getNextPuzzle(parseInt(id))
      ])
        .then(([puzzleData, progress, prev, next]) => {
          setPuzzle(puzzleData);
          setHasPrevious(!!prev);
          setHasNext(!!next);
          
          // Initialize user grid from saved progress or empty
          const solution = puzzleData.grid_data?.solution || [];
          if (progress && progress.progress_data) {
            setUserGrid(progress.progress_data);
            setTimeSpent(progress.time_spent || 0);
          } else {
            setUserGrid(solution.map(row => row.map(() => '')));
          }
        })
        .catch(err => {
          console.error('Error fetching puzzle:', err);
          setError(err.message);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  // Auto-save progress every 30 seconds
  useEffect(() => {
    if (!puzzle || !id) return;

    const interval = setInterval(() => {
      const currentTimeSpent = timeSpentRef.current + Math.floor((Date.now() - startTime) / 1000);
      setTimeSpent(currentTimeSpent);
      
      // Check if complete using current ref value
      const solution = puzzle.grid_data?.solution || [];
      let allCorrect = true;
      solution.forEach((row, r) => {
        row.forEach((cell, c) => {
          if (cell !== '.' && userGridRef.current[r]?.[c] !== cell) {
            allCorrect = false;
          }
        });
      });
      
      api.saveProgress(parseInt(id), userGridRef.current, allCorrect, currentTimeSpent)
        .catch(err => console.error('Failed to save progress:', err));
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [puzzle, id, startTime]);

  const checkAnswers = useCallback(() => {
    if (!puzzle || !id) return;
    const solution = puzzle.grid_data?.solution || [];
    let correct = 0, total = 0;
    const currentGrid = userGridRef.current;
    solution.forEach((row, r) => {
      row.forEach((cell, c) => {
        if (cell !== '.') {
          total++;
          if (currentGrid[r]?.[c] === cell) correct++;
        }
      });
    });
    
    const isComplete = correct === total;
    const currentTimeSpent = timeSpentRef.current + Math.floor((Date.now() - startTime) / 1000);
    
    // Save progress with completion status
    api.saveProgress(parseInt(id), currentGrid, isComplete, currentTimeSpent)
      .catch(err => console.error('Failed to save progress:', err));
    
    if (isComplete) {
      setNotification({
        message: `🎉 Congratulations! You completed the puzzle! ${correct} out of ${total} correct in ${Math.floor(currentTimeSpent / 60)} minutes!`,
        type: 'success'
      });
    } else {
      setNotification({
        message: `${correct} correct out of ${total}`,
        type: 'info'
      });
    }
    
    // Auto-hide notification after 5 seconds
    setTimeout(() => setNotification(null), 5000);
  }, [puzzle, id, startTime]);

  const handlePrevious = useCallback(async () => {
    if (!id) return;
    const prev = await api.getPreviousPuzzle(parseInt(id));
    if (prev) {
      navigate(`/puzzle/${prev.id}`);
    }
  }, [id, navigate]);

  const handleNext = useCallback(async () => {
    if (!id) return;
    const next = await api.getNextPuzzle(parseInt(id));
    if (next) {
      navigate(`/puzzle/${next.id}`);
    }
  }, [id, navigate]);

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
  }, [puzzle, showSolution, setActions, checkAnswers]);

  // Set navigation in nav bar
  useEffect(() => {
    if (puzzle) {
      setNavigation({
        onPrevious: handlePrevious,
        onNext: handleNext,
        hasPrevious,
        hasNext
      });
    }
    return () => setNavigation(null);
  }, [puzzle, hasPrevious, hasNext, handlePrevious, handleNext, setNavigation]);

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
    <div style={{ position: 'relative' }}>
      {notification && (
        <div style={{
          position: 'fixed',
          top: '80px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: notification.type === 'success' ? '#d4edda' : '#d1ecf1',
          color: notification.type === 'success' ? '#155724' : '#0c5460',
          padding: '1rem 2rem',
          borderRadius: '6px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          zIndex: 1000,
          border: `1px solid ${notification.type === 'success' ? '#c3e6cb' : '#bee5eb'}`,
          fontSize: '1rem',
          fontWeight: '500',
          maxWidth: '90%',
          animation: 'slideDown 0.3s ease-out'
        }}>
          {notification.message}
        </div>
      )}
      <SimpleCrossword 
        puzzle={puzzle} 
        showSolution={showSolution}
        userGrid={userGrid}
        setUserGrid={setUserGrid}
      />
    </div>
  );
}
