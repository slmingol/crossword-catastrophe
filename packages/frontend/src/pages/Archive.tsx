import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api, Puzzle, PuzzleListResponse, UserProgress } from '../api/client';
import { format } from 'date-fns';
import { useTheme } from '../components/Layout';

// Source badge colors and abbreviations
const SOURCE_CONFIG: Record<string, { abbr: string; color: string; bg: string; description: string }> = {
  'USA Today': { abbr: 'USA', color: '#0052cc', bg: '#deebff', description: 'Daily puzzles from USA Today' },
  'Universal Crossword': { abbr: 'UNI', color: '#6554c0', bg: '#eae6ff', description: 'Universal syndicated crosswords' },
  'Los Angeles Times': { abbr: 'LAT', color: '#00875a', bg: '#e3fcef', description: 'LA Times daily crosswords' },
  'Newsday': { abbr: 'ND', color: '#ff5630', bg: '#ffebe6', description: 'Newsday crossword puzzles' },
  'Seattle Times Midi': { abbr: 'SEA', color: '#ff8b00', bg: '#fff4e6', description: 'Smaller puzzles for mobile' },
};

function SourceBadge({ source, theme }: { source: string; theme: 'light' | 'dark' }) {
  const config = SOURCE_CONFIG[source] || { abbr: source.slice(0, 3).toUpperCase(), color: '#666', bg: '#f0f0f0' };
  
  // Adjust backgrounds for dark mode
  const badgeBg = theme === 'dark' 
    ? config.color + '33' // Add transparency
    : config.bg;
  
  return (
    <span
      style={{
        display: 'inline-block',
        fontSize: '0.65rem',
        fontWeight: '700',
        padding: '0.2rem 0.4rem',
        borderRadius: '3px',
        backgroundColor: badgeBg,
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
  const { theme } = useTheme();
  const [data, setData] = useState<PuzzleListResponse | null>(null);
  const [progress, setProgress] = useState<Map<number, UserProgress>>(new Map());
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [selectedSources, setSelectedSources] = useState<Set<string>>(
    new Set(Object.keys(SOURCE_CONFIG))
  );

  // Theme colors
  const colors = theme === 'dark' ? {
    filterBg: '#2a2a2a',
    filterText: '#b0b0b0',
    clearButton: '#3a3a3a',
    clearButtonHover: '#4a4a4a',
    clearButtonBorder: '#555',
    sourceButtonBg: '#2a2a2a',
    sourceButtonBorder: '#555',
    cardBg: '#2a2a2a',
    cardBorder: '#444',
    cardHover: '#3a3a3a',
    text: '#e0e0e0',
    secondaryText: '#b0b0b0',
    paginationDisabled: '#444',
  } : {
    filterBg: '#f8f9fa',
    filterText: '#666',
    clearButton: 'white',
    clearButtonHover: '#f5f5f5',
    clearButtonBorder: '#ddd',
    sourceButtonBg: 'white',
    sourceButtonBorder: '#ddd',
    cardBg: 'white',
    cardBorder: '#e0e0e0',
    cardHover: '#f5f5f5',
    text: 'inherit',
    secondaryText: '#666',
    paginationDisabled: '#ccc',
  };

  useEffect(() => {
    // If no sources selected, show empty state immediately
    if (selectedSources.size === 0) {
      setData({ puzzles: [], pagination: { page, limit: 20, total: 0, pages: 0 } });
      setLoading(false);
      return;
    }

    setLoading(true);
    const sourcesArray = Array.from(selectedSources);
    Promise.all([
      api.getPuzzles(page, 20, sourcesArray.length === Object.keys(SOURCE_CONFIG).length ? undefined : sourcesArray),
      api.getUserProgress()
    ])
      .then(([puzzlesData, progressData]) => {
        setData(puzzlesData);
        const progressMap = new Map(progressData.map(p => [p.puzzle_id, p]));
        setProgress(progressMap);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [page, selectedSources]);

  const toggleSource = (source: string) => {
    setSelectedSources(prev => {
      const next = new Set(prev);
      if (next.has(source)) {
        next.delete(source);
      } else {
        next.add(source);
      }
      return next;
    });
    setPage(1); // Reset to first page when filter changes
  };

  if (loading && !data) {
    return <div style={{ textAlign: 'center', padding: '4rem' }}>Loading archive...</div>;
  }

  return (
    <div>
      <h1 style={{ marginBottom: '0.5rem', fontSize: '1.5rem' }}>Puzzle Archive</h1>
      
      {/* Filter */}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '0.75rem 1rem', 
        backgroundColor: colors.filterBg,
        borderRadius: '4px',
        fontSize: '0.85rem',
        display: 'flex',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '0.75rem'
      }}>
        <span style={{ fontWeight: '600', color: colors.filterText, marginRight: '0.5rem' }}>Filter:</span>
        <button
          onClick={() => {
            setSelectedSources(new Set());
            setPage(1);
          }}
          style={{
            padding: '0.3rem 0.6rem',
            border: `1px solid ${colors.clearButtonBorder}`,
            borderRadius: '4px',
            backgroundColor: colors.clearButton,
            cursor: 'pointer',
            fontSize: '0.7rem',
            color: colors.filterText,
            transition: 'all 0.15s'
          }}
        >
          Clear All
        </button>
        {Object.entries(SOURCE_CONFIG).map(([name, config]) => {
          const isSelected = selectedSources.has(name);
          return (
            <button
              key={name}
              onClick={() => toggleSource(name)}
              style={{
                display: 'inline-flex',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '0.4rem 0.6rem',
                border: `2px solid ${isSelected ? config.color : colors.sourceButtonBorder}`,
                borderRadius: '6px',
                backgroundColor: isSelected ? config.bg : colors.sourceButtonBg,
                cursor: 'pointer',
                transition: 'all 0.15s',
                opacity: isSelected ? 1 : 0.5,
                gap: '0.15rem'
              }}
            >
              <span style={{
                fontSize: '0.7rem',
                fontWeight: '700',
                letterSpacing: '0.3px',
                color: config.color
              }}>
                {config.abbr}
              </span>
              <span style={{
                fontSize: '0.65rem',
                color: colors.secondaryText,
                textAlign: 'center',
                lineHeight: '1.2'
              }}>
                {config.description}
              </span>
            </button>
          );
        })}
        <span style={{ marginLeft: 'auto', color: colors.filterText, fontSize: '0.8rem' }}>
          {data?.pagination.total || 0} puzzles
        </span>
      </div>

      {/* Legend */}
      <div style={{
        marginBottom: '1.5rem',
        padding: '0.5rem 1rem',
        backgroundColor: colors.filterBg,
        borderRadius: '4px',
        fontSize: '0.8rem',
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem',
        color: colors.filterText
      }}>
        <span style={{ fontWeight: '600' }}>Progress indicators:</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: '#28a745', fontSize: '1rem' }}>✓</span>
          <span>Completed</span>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ color: '#ffc107', fontSize: '0.8rem' }}>●</span>
          <span>In progress</span>
        </span>
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
                    backgroundColor: colors.cardBg,
                    padding: '0.5rem 0.75rem',
                    borderRadius: '4px',
                    border: `1px solid ${colors.cardBorder}`,
                    textDecoration: 'none',
                    color: colors.text,
                    fontSize: '0.9rem',
                    transition: 'background-color 0.15s'
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.backgroundColor = colors.cardHover;
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.backgroundColor = colors.cardBg;
                  }}
                >
                  <span style={{ fontWeight: '600', marginRight: '1rem', minWidth: '80px' }}>
                    {puzzle.date.replace(/(\d{4})-(\d{2})-(\d{2})/, '$2/$3/$1').replace(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, (_, m, d, y) => `${parseInt(m)}/${parseInt(d)}/${y.slice(2)}`)}
                  </span>
                  <SourceBadge source={puzzle.source} theme={theme} />
                  {isCompleted && <span style={{ marginRight: '0.5rem', color: '#28a745', fontSize: '1rem' }}>✓</span>}
                  {inProgress && <span style={{ marginRight: '0.5rem', color: '#ffc107', fontSize: '0.8rem' }}>●</span>}
                  <span style={{ fontWeight: '500', marginRight: '1rem', flex: '0 0 auto' }}>
                    {puzzle.title}
                  </span>
                  <span style={{ color: colors.secondaryText, fontSize: '0.85rem' }}>
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
                backgroundColor: page === 1 ? colors.paginationDisabled : '#0066cc',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: page === 1 ? 'not-allowed' : 'pointer'
              }}
            >
              Previous
            </button>
            <span style={{ color: colors.filterText }}>
              Page {page} of {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= data.pagination.pages}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: page >= data.pagination.pages ? colors.paginationDisabled : '#0066cc',
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
        <div style={{ textAlign: 'center', padding: '4rem', color: colors.secondaryText }}>
          {selectedSources.size === 0 
            ? 'Select at least one source to view puzzles.' 
            : 'No puzzles found. Try selecting different sources or check back later.'}
        </div>
      )}
    </div>
  );
}
