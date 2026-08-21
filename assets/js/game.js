document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     Sudoku Engine & Board State
     ========================================================================== */
  let solvedBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
  let initialBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
  let currentBoard = Array.from({ length: 9 }, () => Array(9).fill(0));
  let notesBoard = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));

  let selectedCell = null; // { row, col }
  let pencilMode = false;
  let score = 0;
  let mistakes = 0;
  const maxMistakes = 3;
  let hintsRemaining = 3;
  let undoStack = [];

  let timerInterval = null;
  let secondsElapsed = 0;
  let difficulty = 'easy';

  // DOM Elements
  const boardEl = document.getElementById('sudoku-board');
  const scoreValEl = document.getElementById('score-val');
  const scoreValMobileEl = document.getElementById('score-val-mobile');
  const mistakesValEl = document.getElementById('mistakes-val');
  const timerValEl = document.getElementById('timer-val');
  const hintBadgeEl = document.getElementById('hint-badge');

  const toolUndoBtn = document.getElementById('tool-undo');
  const toolEraseBtn = document.getElementById('tool-erase');
  const toolPencilBtn = document.getElementById('tool-pencil');
  const toolHintBtn = document.getElementById('tool-hint');

  const newGameBtn = document.getElementById('btn-new-game');
  const keypadButtons = document.querySelectorAll('.keypad-btn');

  const gameOverOverlay = document.getElementById('game-over-overlay');
  const gameOverRestartBtn = document.getElementById('btn-game-over-restart');
  const victoryOverlay = document.getElementById('victory-overlay');
  const victoryNewGameBtn = document.getElementById('btn-victory-new-game');
  const finalScoreEl = document.getElementById('final-score');

  /* ==========================================================================
     Sudoku Puzzle Generation (Backtracking Algorithm)
     ========================================================================== */
  function isSafe(board, row, col, num) {
    // Check row
    for (let x = 0; x < 9; x++) {
      if (board[row][x] === num) return false;
    }
    // Check column
    for (let x = 0; x < 9; x++) {
      if (board[x][col] === num) return false;
    }
    // Check 3x3 grid
    const startRow = row - (row % 3);
    const startCol = col - (col % 3);
    for (let i = 0; i < 3; i++) {
      for (let j = 0; j < 3; j++) {
        if (board[i + startRow][j + startCol] === num) return false;
      }
    }
    return true;
  }

  function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  }

  function solveSudokuRandom(board) {
    let row = -1;
    let col = -1;
    let isEmpty = false;

    for (let i = 0; i < 9; i++) {
      for (let j = 0; j < 9; j++) {
        if (board[i][j] === 0) {
          row = i;
          col = j;
          isEmpty = true;
          break;
        }
      }
      if (isEmpty) break;
    }

    if (!isEmpty) return true; // Solved!

    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);

    for (let idx = 0; idx < 9; idx++) {
      const num = nums[idx];
      if (isSafe(board, row, col, num)) {
        board[row][col] = num;
        if (solveSudokuRandom(board)) {
          return true;
        }
        board[row][col] = 0; // Backtrack
      }
    }
    return false;
  }

  function generateFullSudoku() {
    const board = Array.from({ length: 9 }, () => Array(9).fill(0));
    solveSudokuRandom(board);
    return board;
  }

  function removeCellsForDifficulty(board, diff) {
    let cellsToRemove = 40; // Default: easy
    if (diff === 'medium') cellsToRemove = 47;
    if (diff === 'hard') cellsToRemove = 54;

    const puzzle = board.map(row => [...row]);
    let removed = 0;

    while (removed < cellsToRemove) {
      const idx = Math.floor(Math.random() * 81);
      const r = Math.floor(idx / 9);
      const c = idx % 9;

      if (puzzle[r][c] !== 0) {
        puzzle[r][c] = 0;
        removed++;
      }
    }
    return puzzle;
  }

  /* ==========================================================================
     Game Setup and Navigation
     ========================================================================== */
  function getDifficultyFromURL() {
    const params = new URLSearchParams(window.location.search);
    const diff = params.get('difficulty');
    if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
      return diff;
    }
    return 'easy';
  }

  function startNewGame() {
    difficulty = getDifficultyFromURL();

    // 1. Generate full board
    solvedBoard = generateFullSudoku();

    // 2. Remove clues based on difficulty
    initialBoard = removeCellsForDifficulty(solvedBoard, difficulty);

    // 3. Initialize current board state
    currentBoard = initialBoard.map(row => [...row]);

    // 4. Clear notes board
    notesBoard = Array.from({ length: 9 }, () => Array.from({ length: 9 }, () => new Set()));

    // 5. Reset UI Stats & Flags
    score = 0;
    mistakes = 0;
    hintsRemaining = 3;
    selectedCell = null;
    undoStack = [];
    updateStatsUI();

    // 6. Draw Grid
    renderBoardGrid();

    // 7. Reset & Start Timer
    resetTimer();
    startTimer();

    // 8. Hide overlays
    gameOverOverlay.classList.remove('active');
    victoryOverlay.classList.remove('active');
  }

  /* ==========================================================================
     Rendering and Visual Updates
     ========================================================================== */
  function renderBoardGrid() {
    boardEl.innerHTML = '';

    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        const cellEl = document.createElement('div');
        cellEl.classList.add('sudoku-cell');
        cellEl.classList.add(`row-${r}`);
        cellEl.classList.add(`col-${c}`);
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        // Apply alternating 3x3 block backgrounds
        const blockRow = Math.floor(r / 3);
        const blockCol = Math.floor(c / 3);
        if ((blockRow + blockCol) % 2 === 0) {
          cellEl.classList.add('cell-block-accent');
        }

        const val = currentBoard[r][c];

        if (initialBoard[r][c] !== 0) {
          // Original puzzle cells
          cellEl.classList.add('cell-original');
          cellEl.textContent = val;
        } else if (val !== 0) {
          // User input cells
          cellEl.classList.add('cell-user');
          if (val === solvedBoard[r][c]) {
            cellEl.textContent = val;
          } else {
            cellEl.classList.add('cell-error');
            cellEl.textContent = val;
          }
        } else {
          // Empty cell - Render notes if any exist
          const cellNotes = notesBoard[r][c];
          if (cellNotes.size > 0) {
            const notesGrid = document.createElement('div');
            notesGrid.classList.add('notes-grid');

            for (let digit = 1; digit <= 9; digit++) {
              const noteDigitEl = document.createElement('div');
              noteDigitEl.classList.add('note-digit');
              if (cellNotes.has(digit)) {
                noteDigitEl.textContent = digit;
              }
              notesGrid.appendChild(noteDigitEl);
            }
            cellEl.appendChild(notesGrid);
          }
        }

        // Add Click Listener
        cellEl.addEventListener('click', () => handleCellSelection(r, c));

        boardEl.appendChild(cellEl);
      }
    }
  }

  function handleCellSelection(row, col) {
    selectedCell = { row, col };

    // Select grid cells
    const cells = document.querySelectorAll('.sudoku-cell');
    cells.forEach(cell => {
      cell.classList.remove('cell-selected', 'cell-highlighted', 'cell-same-number');

      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);

      // Check if it is the selected cell
      if (r === row && c === col) {
        cell.classList.add('cell-selected');
        return;
      }

      // Check if cell shares row, col or 3x3 block
      const inSameRow = (r === row);
      const inSameCol = (c === col);
      const inSameBox = (Math.floor(r / 3) === Math.floor(row / 3) && Math.floor(c / 3) === Math.floor(col / 3));

      if (inSameRow || inSameCol || inSameBox) {
        cell.classList.add('cell-highlighted');
      }

      // Check if cell shares same value as selected cell
      const selectedVal = currentBoard[row][col];
      if (selectedVal !== 0 && currentBoard[r][c] === selectedVal) {
        cell.classList.add('cell-same-number');
      }
    });
  }

  function updateStatsUI() {
    if (scoreValEl) scoreValEl.textContent = score;
    if (scoreValMobileEl) scoreValMobileEl.textContent = score;
    mistakesValEl.textContent = `${mistakes}/${maxMistakes}`;
    hintBadgeEl.textContent = hintsRemaining;
  }

  /* ==========================================================================
     Game Interactions (Number entry, Erase, Pencil, Undo, Hint)
     ========================================================================== */
  function handleInputNumber(num) {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    // Check if cell is part of original puzzle clues
    if (initialBoard[row][col] !== 0) return;

    // Save previous state for Undo
    const prevVal = currentBoard[row][col];
    const prevNotes = new Set(notesBoard[row][col]);

    if (pencilMode) {
      // Toggle note in cell
      currentBoard[row][col] = 0; // Clear cell digit if any
      const cellNotes = notesBoard[row][col];
      if (cellNotes.has(num)) {
        cellNotes.delete(num);
      } else {
        cellNotes.add(num);
      }

      // Push history
      pushToUndoStack({
        row,
        col,
        type: 'notes',
        oldNotes: prevNotes,
        newNotes: new Set(cellNotes),
        oldVal: prevVal
      });

      renderCell(row, col);
      // Re-trigger highlighting for matching digits if cell value changed to 0
      handleCellSelection(row, col);
    } else {
      // Direct placement mode
      if (currentBoard[row][col] === num) return; // Already matches, do nothing

      // Clear pencil marks
      notesBoard[row][col].clear();
      currentBoard[row][col] = num;

      // Validate move
      const isCorrect = (num === solvedBoard[row][col]);

      pushToUndoStack({
        row,
        col,
        type: 'digit',
        oldVal: prevVal,
        newVal: num,
        oldNotes: prevNotes
      });

      if (isCorrect) {
        score += 100;
        updateStatsUI();
        checkVictory();
      } else {
        mistakes++;
        updateStatsUI();
        if (mistakes >= maxMistakes) {
          triggerGameOver();
        }
      }

      renderCell(row, col);
      handleCellSelection(row, col);
    }
  }

  function pushToUndoStack(action) {
    undoStack.push(action);
  }

  function handleUndo() {
    if (undoStack.length === 0) return;

    const action = undoStack.pop();
    const { row, col, type, oldVal, oldNotes } = action;

    if (type === 'digit') {
      currentBoard[row][col] = oldVal;
      notesBoard[row][col] = new Set(oldNotes);
    } else if (type === 'notes') {
      currentBoard[row][col] = oldVal;
      notesBoard[row][col] = new Set(oldNotes);
    }

    renderCell(row, col);
    if (selectedCell && selectedCell.row === row && selectedCell.col === col) {
      handleCellSelection(row, col);
    } else {
      selectedCell = { row, col };
      handleCellSelection(row, col);
    }
  }

  function handleErase() {
    if (!selectedCell) return;
    const { row, col } = selectedCell;

    if (initialBoard[row][col] !== 0) return; // Original clue, cannot erase
    if (currentBoard[row][col] === 0 && notesBoard[row][col].size === 0) return; // Already empty

    const prevVal = currentBoard[row][col];
    const prevNotes = new Set(notesBoard[row][col]);

    currentBoard[row][col] = 0;
    notesBoard[row][col].clear();

    pushToUndoStack({
      row,
      col,
      type: 'digit',
      oldVal: prevVal,
      newVal: 0,
      oldNotes: prevNotes
    });

    renderCell(row, col);
    handleCellSelection(row, col);
  }

  function togglePencilMode() {
    pencilMode = !pencilMode;
    toolPencilBtn.classList.toggle('active', pencilMode);
  }

  function handleHint() {
    if (hintsRemaining <= 0 || !selectedCell) return;
    const { row, col } = selectedCell;

    // Can't give hint on original puzzle cell
    if (initialBoard[row][col] !== 0) return;

    // If cell is already correctly solved, no hint needed
    if (currentBoard[row][col] === solvedBoard[row][col]) return;

    const prevVal = currentBoard[row][col];
    const prevNotes = new Set(notesBoard[row][col]);

    const correctVal = solvedBoard[row][col];

    currentBoard[row][col] = correctVal;
    notesBoard[row][col].clear();

    pushToUndoStack({
      row,
      col,
      type: 'digit',
      oldVal: prevVal,
      newVal: correctVal,
      oldNotes: prevNotes
    });

    hintsRemaining--;
    score += 50; // Smaller score increment for using hint
    updateStatsUI();

    renderCell(row, col);
    handleCellSelection(row, col);

    checkVictory();
  }

  function renderCell(row, col) {
    const cellEl = document.querySelector(`.sudoku-cell[data-row="${row}"][data-col="${col}"]`);
    if (!cellEl) return;

    // Reset cell elements and classes
    cellEl.innerHTML = '';
    cellEl.className = `sudoku-cell row-${row} col-${col}`;

    // Apply alternating 3x3 block backgrounds
    const blockRow = Math.floor(row / 3);
    const blockCol = Math.floor(col / 3);
    if ((blockRow + blockCol) % 2 === 0) {
      cellEl.classList.add('cell-block-accent');
    }

    const val = currentBoard[row][col];

    if (initialBoard[row][col] !== 0) {
      cellEl.classList.add('cell-original');
      cellEl.textContent = val;
    } else if (val !== 0) {
      cellEl.classList.add('cell-user');
      if (val === solvedBoard[row][col]) {
        // Correct entry
      } else {
        cellEl.classList.add('cell-error');
      }
      cellEl.textContent = val;
    } else {
      // Notes mode
      const cellNotes = notesBoard[row][col];
      if (cellNotes.size > 0) {
        const notesGrid = document.createElement('div');
        notesGrid.classList.add('notes-grid');

        for (let digit = 1; digit <= 9; digit++) {
          const noteDigitEl = document.createElement('div');
          noteDigitEl.classList.add('note-digit');
          if (cellNotes.has(digit)) {
            noteDigitEl.textContent = digit;
          }
          notesGrid.appendChild(noteDigitEl);
        }
        cellEl.appendChild(notesGrid);
      }
    }
  }

  /* ==========================================================================
     Game State Checks (GameOver, Victory, Stopwatch Timer)
     ========================================================================== */
  function checkVictory() {
    // Board is correct if currentBoard matches solvedBoard
    for (let r = 0; r < 9; r++) {
      for (let c = 0; c < 9; c++) {
        if (currentBoard[r][c] !== solvedBoard[r][c]) {
          return; // Still incomplete or has errors
        }
      }
    }

    // Success!
    clearInterval(timerInterval);
    finalScoreEl.textContent = score;
    victoryOverlay.classList.add('active');
    if (window.puzzrooSaveGameResult) {
      window.puzzrooSaveGameResult(score);
    }
  }

  function triggerGameOver() {
    clearInterval(timerInterval);
    gameOverOverlay.classList.add('active');
  }

  function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      secondsElapsed++;
      const mins = Math.floor(secondsElapsed / 60).toString().padStart(2, '0');
      const secs = (secondsElapsed % 60).toString().padStart(2, '0');
      timerValEl.textContent = `${mins}:${secs}`;
    }, 1000);
  }

  function resetTimer() {
    clearInterval(timerInterval);
    secondsElapsed = 0;
    timerValEl.textContent = '00:00';
  }

  /* ==========================================================================
     Keyboard Listeners & UI Binding Events
     ========================================================================== */
  document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault(); // Prevent page scroll
      let r = selectedCell ? selectedCell.row : 0;
      let c = selectedCell ? selectedCell.col : 0;

      if (!selectedCell) {
        handleCellSelection(0, 0);
        return;
      }

      if (e.key === 'ArrowUp') r = (r - 1 + 9) % 9;
      if (e.key === 'ArrowDown') r = (r + 1) % 9;
      if (e.key === 'ArrowLeft') c = (c - 1 + 9) % 9;
      if (e.key === 'ArrowRight') c = (c + 1) % 9;

      handleCellSelection(r, c);
      return;
    }

    // If selected cell is active and user clicks 1-9
    if (selectedCell) {
      if (e.key >= '1' && e.key <= '9') {
        handleInputNumber(parseInt(e.key));
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        handleErase();
      }
    }
  });

  // Keypad clicks
  keypadButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = parseInt(btn.dataset.val);
      handleInputNumber(val);
    });
  });

  // Action tools click events
  toolUndoBtn.addEventListener('click', handleUndo);
  toolEraseBtn.addEventListener('click', handleErase);
  toolPencilBtn.addEventListener('click', togglePencilMode);
  toolHintBtn.addEventListener('click', handleHint);

  // New game click listeners
  newGameBtn.addEventListener('click', startNewGame);
  gameOverRestartBtn.addEventListener('click', startNewGame);
  victoryNewGameBtn.addEventListener('click', () => {
    // Go back to lobby to select difficulty
    window.location.href = 'lobby.html';
  });

  /* ==========================================================================
     Initialize Game
     ========================================================================== */
  startNewGame();
});
