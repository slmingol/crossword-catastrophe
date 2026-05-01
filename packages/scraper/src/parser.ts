// Parser for .puz (Across Lite) crossword format
// Based on: https://code.google.com/archive/p/puz/wikis/FileFormat.wiki

interface PuzzleData {
  title: string;
  author: string;
  copyright?: string;
  difficulty?: string;
  grid: {
    width: number;
    height: number;
    cells: string[][];
    solution: string[][];
  };
  cluesAcross: Record<string, { clue: string; answer: string; length: number }>;
  cluesDown: Record<string, { clue: string; answer: string; length: number }>;
}

export function parsePuzFile(buffer: Buffer): PuzzleData {
  let offset = 0;

  // Read header
  offset += 2; // Skip checksum
  const magic = buffer.toString('ascii', offset, offset + 12);
  offset += 12;

  if (magic !== 'ACROSS&DOWN\0') {
    throw new Error('Invalid .puz file format');
  }

  offset += 2; // CIB checksum
  offset += 8; // Masked checksums

  // Version string (e.g., "1.3\0")
  offset += 4;

  offset += 2; // Reserved
  const scrambledChecksum = buffer.readUInt16LE(offset);
  offset += 2;

  offset += 12; // Reserved

  // Puzzle dimensions
  const width = buffer.readUInt8(offset++);
  const height = buffer.readUInt8(offset++);
  const numClues = buffer.readUInt16LE(offset);
  offset += 2;

  const puzzleType = buffer.readUInt16LE(offset);
  offset += 2;
  const scrambledTag = buffer.readUInt16LE(offset);
  offset += 2;

  // Solution and grid state
  const solution: string[][] = [];
  const grid: string[][] = [];

  for (let row = 0; row < height; row++) {
    solution[row] = [];
    for (let col = 0; col < width; col++) {
      const char = String.fromCharCode(buffer.readUInt8(offset++));
      solution[row][col] = char === '.' ? '.' : char;
    }
  }

  for (let row = 0; row < height; row++) {
    grid[row] = [];
    for (let col = 0; col < width; col++) {
      const char = String.fromCharCode(buffer.readUInt8(offset++));
      grid[row][col] = char === '.' ? '.' : char === '-' ? '' : char;
    }
  }

  // Read null-terminated strings
  const readString = (): string => {
    const start = offset;
    while (buffer[offset] !== 0 && offset < buffer.length) {
      offset++;
    }
    const str = buffer.toString('latin1', start, offset);
    offset++; // Skip null terminator
    return str;
  };

  const title = readString();
  const author = readString();
  const copyright = readString();

  // Read clues
  const clueTexts: string[] = [];
  for (let i = 0; i < numClues; i++) {
    clueTexts.push(readString());
  }

  // Notes (optional)
  let notes = '';
  if (offset < buffer.length) {
    notes = readString();
  }

  // Number the grid and assign clues
  const numbers: number[][] = Array(height).fill(null).map(() => Array(width).fill(0));
  const cluesAcross: Record<string, { clue: string; answer: string; length: number }> = {};
  const cluesDown: Record<string, { clue: string; answer: string; length: number }> = {};
  
  let clueNum = 1;
  let clueIndex = 0;

  for (let row = 0; row < height; row++) {
    for (let col = 0; col < width; col++) {
      if (solution[row][col] === '.') continue;

      let hasAcross = false;
      let hasDown = false;

      // Check if this starts an across clue
      if (col === 0 || solution[row][col - 1] === '.') {
        if (col < width - 1 && solution[row][col + 1] !== '.') {
          hasAcross = true;
        }
      }

      // Check if this starts a down clue
      if (row === 0 || solution[row - 1][col] === '.') {
        if (row < height - 1 && solution[row + 1][col] !== '.') {
          hasDown = true;
        }
      }

      if (hasAcross || hasDown) {
        numbers[row][col] = clueNum;

        if (hasAcross) {
          let answer = '';
          let c = col;
          while (c < width && solution[row][c] !== '.') {
            answer += solution[row][c];
            c++;
          }
          cluesAcross[clueNum.toString()] = {
            clue: clueTexts[clueIndex++] || '',
            answer,
            length: answer.length,
          };
        }

        if (hasDown) {
          let answer = '';
          let r = row;
          while (r < height && solution[r][col] !== '.') {
            answer += solution[r][col];
            r++;
          }
          cluesDown[clueNum.toString()] = {
            clue: clueTexts[clueIndex++] || '',
            answer,
            length: answer.length,
          };
        }

        clueNum++;
      }
    }
  }

  // Extract difficulty from title if present
  let difficulty: string | undefined;
  const difficultyMatch = title.match(/\b(Easy|Medium|Hard|Challenging|Sunday)\b/i);
  if (difficultyMatch) {
    difficulty = difficultyMatch[1];
  }

  return {
    title,
    author,
    copyright,
    difficulty,
    grid: {
      width,
      height,
      cells: grid,
      solution,
    },
    cluesAcross,
    cluesDown,
  };
}
