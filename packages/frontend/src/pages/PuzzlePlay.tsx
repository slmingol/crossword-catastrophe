import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api, Puzzle } from '../api/client';
import { usePuzzleActions, useTheme } from '../components/Layout';

// Interactive crossword display - v7 buttons in top nav
function SimpleCrossword({ puzzle, showSolution, userGrid, setUserGrid, theme }: { 
  puzzle: Puzzle, 
  showSolution: boolean,
  userGrid: string[][],
  setUserGrid: React.Dispatch<React.SetStateAction<string[][]>>,
  theme: 'light' | 'dark'
}) {
  const solution = puzzle.grid_data?.solution || [];
  const width = puzzle.grid_data?.width || 15;
  const height = puzzle.grid_data?.height || 15;

  const [focusedCell, setFocusedCell] = useState<{row: number, col: number} | null>(null);
  const cellRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 1024);

  // Handle window resize for responsive grid
  useEffect(() => {
    const handleResize = () => setWindowWidth(window.innerWidth);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Theme colors
  const colors = theme === 'dark' ? {
    cellBg: '#2a2a2a',
    cellText: '#e0e0e0',
    cellBorder: '#444',
    cellBlack: '#000',
    cellFocused: '#4a4a00',
    cellSolution: '#1a3a4a',
    cellCorrect: '#1a3a1a',
    cellWrong: '#3a1a1a',
    clueNumColor: '#999',
    gridBorder: '#444',
    acrossBorder: '#0052cc',
    acrossBg: '#0052cc',
    acrossClue: '#2a2a2a',
    acrossClueHover: '#3a3a3a',
    acrossClueText: '#e0e0e0',
    acrossClueNum: '#4a9eff',
    downBorder: '#00875a',
    downBg: '#00875a',
    downClue: '#2a2a2a',
    downClueHover: '#3a3a3a',
    downClueText: '#e0e0e0',
    downClueNum: '#2adf9a',
  } : {
    cellBg: '#fff',
    cellText: '#000',
    cellBorder: '#999',
    cellBlack: '#000',
    cellFocused: '#ffffcc',
    cellSolution: '#e6f7ff',
    cellCorrect: '#d4edda',
    cellWrong: '#f8d7da',
    clueNumColor: '#333',
    gridBorder: '#000',
    acrossBorder: '#0052cc',
    acrossBg: '#0052cc',
    acrossClue: 'white',
    acrossClueHover: '#deebff',
    acrossClueText: '#000',
    acrossClueNum: '#0052cc',
    downBorder: '#00875a',
    downBg: '#00875a',
    downClue: 'white',
    downClueHover: '#e3fcef',
    downClueText: '#000',
    downClueNum: '#00875a',
  };

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

  // Calculate responsive cell size
  const isMobile = windowWidth < 768;
  // Account for: main padding (8px), grid border (2px), minimal margin (6px)
  const paddingOverhead = isMobile ? 16 : 0;
  const availableWidth = windowWidth - paddingOverhead;
  const maxCellSize = isMobile ? 40 : 34; // Allow larger cells on mobile to fill width
  const calculatedSize = Math.floor(availableWidth / width);
  const cellSize = Math.min(Math.max(calculatedSize, 10), maxCellSize); // Min 10px, max 40/34px

  return (
    <div>
      <div style={{ display: 'flex', gap: isMobile ? '0.5rem' : '2rem', alignItems: 'flex-start', flexWrap: 'wrap', padding: '0' }}>
        <div style={{ 
          display: 'grid',
          gridTemplateColumns: `repeat(${width}, ${cellSize}px)`,
          gridTemplateRows: `repeat(${height}, ${cellSize}px)`,
          gap: 0,
          border: `1px solid ${colors.gridBorder}`,
          maxWidth: '100%',
          flexShrink: 0,
          margin: isMobile ? '0 auto' : '0',
          touchAction: 'manipulation',
          overflow: 'visible'
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
                  width: `${cellSize}px`,
                  height: `${cellSize}px`,
                  border: `1px solid ${colors.cellBorder}`,
                  backgroundColor: cell === '.' ? colors.cellBlack : 
                                   isFocused ? colors.cellFocused : 
                                   showSolution ? colors.cellSolution :
                                   isCorrect ? colors.cellCorrect :
                                   isWrong ? colors.cellWrong :
                                   colors.cellBg,
                  color: colors.cellText,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: `${Math.max(12, cellSize * 0.5)}px`,
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
                    fontSize: `${Math.max(7, cellSize * 0.24)}px`,
                    fontWeight: 'normal',
                    color: colors.clueNumColor
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
      
      <div style={{ flex: 1, minWidth: isMobile ? '100%' : '300px' }}>
        <div style={{ marginBottom: '1.5rem', border: `2px solid ${colors.acrossBorder}`, borderRadius: '6px', overflow: 'hidden' }}>
          <h3 style={{ 
            margin: 0, 
            padding: '0.75rem 1rem', 
            fontSize: '1.1rem', 
            fontWeight: '700',
            backgroundColor: colors.acrossBg, 
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
                  backgroundColor: colors.acrossClue,
                  color: colors.acrossClueText,
                  border: `1px solid ${colors.acrossClueHover}`,
                  borderLeft: `3px solid ${colors.acrossBorder}`,
                  borderRadius: '4px', 
                  fontSize: '0.9rem',
                  transition: 'all 0.15s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = colors.acrossClueHover;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = colors.acrossClue;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <strong style={{ color: colors.acrossClueNum, marginRight: '0.5rem' }}>{num}.</strong> 
                <span>{typeof clue === 'string' ? clue : clue.clue}</span>
              </div>
            ))}
          </div>
        </div>
        <div style={{ border: `2px solid ${colors.downBorder}`, borderRadius: '6px', overflow: 'hidden' }}>
          <h3 style={{ 
            margin: 0, 
            padding: '0.75rem 1rem', 
            fontSize: '1.1rem', 
            fontWeight: '700',
            backgroundColor: colors.downBg, 
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
                  backgroundColor: colors.downClue,
                  color: colors.downClueText,
                  border: `1px solid ${colors.downClueHover}`,
                  borderLeft: `3px solid ${colors.downBorder}`,
                  borderRadius: '4px', 
                  fontSize: '0.9rem',
                  transition: 'all 0.15s',
                  cursor: 'pointer'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.backgroundColor = colors.downClueHover;
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.backgroundColor = colors.downClue;
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <strong style={{ color: colors.downClueNum, marginRight: '0.5rem' }}>{num}.</strong> 
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
  const { theme } = useTheme();
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
            setUserGrid(solution.map((row: string[]) => row.map(() => '')));
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
      solution.forEach((row: string[], r: number) => {
        row.forEach((cell: string, c: number) => {
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
    solution.forEach((row: string[], r: number) => {
      row.forEach((cell: string, c: number) => {
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

  const handleShowSolution = useCallback(() => {
    if (!showSolution && puzzle?.grid_data?.solution) {
      // When showing solution, copy it to userGrid so Check will work correctly
      const solution = puzzle.grid_data.solution;
      setUserGrid(solution.map((row: string[]) => [...row]));
    }
    setShowSolution(!showSolution);
  }, [showSolution, puzzle]);

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
          <button onClick={handleShowSolution} style={{
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
  }, [puzzle, showSolution, setActions, checkAnswers, handleShowSolution]);

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
        theme={theme}
      />
    </div>
  );
}
