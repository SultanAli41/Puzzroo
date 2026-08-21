document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     Nonogram State & Variables
     ========================================================================== */
  let solvedBoard = Array.from({ length: 5 }, () => Array(5).fill(0)); // 1 = filled, 0 = empty
  let currentBoard = Array.from({ length: 5 }, () => Array(5).fill(0)); // 0 = empty, 1 = filled, 2 = X
  
  let rowHints = [];
  let colHints = [];
  
  let score = 0;
  let mistakes = 0;
  const maxMistakes = 3;
  let hintsRemaining = 3;
  let undoStack = [];
  
  let timerInterval = null;
  let secondsElapsed = 0;
  let difficulty = 'easy';

  // DOM Elements
  const boardEl = document.getElementById('nonogram-board');
  const boardWrapperEl = document.getElementById('board-wrapper');
  const scoreValEl = document.getElementById('score-val');
  const mistakesValEl = document.getElementById('mistakes-val');
  const timerValEl = document.getElementById('timer-val');
  const hintBadgeEl = document.getElementById('hint-badge');

  const toolUndoBtn = document.getElementById('tool-undo');
  const toolRestartBtn = document.getElementById('tool-restart');
  const toolZoomBtn = document.getElementById('tool-zoom');
  const toolHintBtn = document.getElementById('tool-hint');

  const newGameBtn = document.getElementById('btn-new-game');

  const gameOverOverlay = document.getElementById('game-over-overlay');
  const gameOverRestartBtn = document.getElementById('btn-game-over-restart');
  const victoryOverlay = document.getElementById('victory-overlay');
  const victoryNewGameBtn = document.getElementById('btn-victory-new-game');
  const finalScoreEl = document.getElementById('final-score');

  /* ==========================================================================
     Puzzle Generation
     ========================================================================== */
  function generateRandomPuzzle() {
    // Generate random binary 5x5 board
    // Fill density varies based on difficulty
    let fillProbability = 0.55;
    if (difficulty === 'medium') fillProbability = 0.60;
    if (difficulty === 'hard') fillProbability = 0.65;

    let board = Array.from({ length: 5 }, () =>
      Array.from({ length: 5 }, () => (Math.random() < fillProbability ? 1 : 0))
    );

    // Validate board: must have between 6 and 19 filled cells to be interesting
    const totalFilled = board.flat().reduce((a, b) => a + b, 0);
    if (totalFilled < 6 || totalFilled > 19) {
      return generateRandomPuzzle();
    }

    return board;
  }

  function calculateRowHints(board) {
    let hints = [];
    for (let r = 0; r < 5; r++) {
      let row = board[r];
      let rowHints = [];
      let count = 0;
      for (let c = 0; c < 5; c++) {
        if (row[c] === 1) {
          count++;
        } else {
          if (count > 0) {
            rowHints.push(count);
            count = 0;
          }
        }
      }
      if (count > 0) {
        rowHints.push(count);
      }
      hints.push(rowHints.length > 0 ? rowHints : [0]);
    }
    return hints;
  }

  function calculateColHints(board) {
    let hints = [];
    for (let c = 0; c < 5; c++) {
      let colHints = [];
      let count = 0;
      for (let r = 0; r < 5; r++) {
        if (board[r][c] === 1) {
          count++;
        } else {
          if (count > 0) {
            colHints.push(count);
            count = 0;
          }
        }
      }
      if (count > 0) {
        colHints.push(count);
      }
      hints.push(colHints.length > 0 ? colHints : [0]);
    }
    return hints;
  }

  /* ==========================================================================
     Game Setup and Flow
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
    solvedBoard = generateRandomPuzzle();
    rowHints = calculateRowHints(solvedBoard);
    colHints = calculateColHints(solvedBoard);

    // Reset boards
    currentBoard = Array.from({ length: 5 }, () => Array(5).fill(0));
    undoStack = [];

    // Reset values
    score = 0;
    mistakes = 0;
    hintsRemaining = 3;

    // Update elements
    updateStatsUI();
    renderBoardGrid();
    resetTimer();
    startTimer();

    // Hide overlays
    gameOverOverlay.classList.remove('active');
    victoryOverlay.classList.remove('active');
  }

  function updateStatsUI() {
    if (scoreValEl) scoreValEl.textContent = score;
    if (mistakesValEl) mistakesValEl.textContent = `${mistakes}/${maxMistakes}`;
    if (hintBadgeEl) hintBadgeEl.textContent = hintsRemaining;
  }

  /* ==========================================================================
     Rendering
     ========================================================================== */
  function renderBoardGrid() {
    boardEl.innerHTML = '';

    // 1. Top-Left Corner hint container
    const cornerEl = document.createElement('div');
    cornerEl.classList.add('nonogram-hint-corner');
    boardEl.appendChild(cornerEl);

    // 2. Top column hints (Row 0, Columns 1 to 5)
    for (let c = 0; c < 5; c++) {
      const colHintEl = document.createElement('div');
      colHintEl.classList.add('nonogram-col-hint');

      const hints = colHints[c];
      hints.forEach(hint => {
        if (hint > 0) {
          const numEl = document.createElement('div');
          numEl.classList.add('hint-num');
          numEl.textContent = hint;
          colHintEl.appendChild(numEl);
        }
      });
      boardEl.appendChild(colHintEl);
    }

    // 3. Rows (Left Row Hint + 5 Playable Cells)
    for (let r = 0; r < 5; r++) {
      const rowHintEl = document.createElement('div');
      rowHintEl.classList.add('nonogram-row-hint');

      const hints = rowHints[r];
      hints.forEach(hint => {
        if (hint > 0) {
          const numEl = document.createElement('span');
          numEl.classList.add('hint-num');
          numEl.textContent = hint;
          rowHintEl.appendChild(numEl);
        }
      });
      boardEl.appendChild(rowHintEl);

      for (let c = 0; c < 5; c++) {
        const cellEl = document.createElement('div');
        cellEl.classList.add('nonogram-cell');
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        const cellState = currentBoard[r][c];
        if (cellState === 1) {
          cellEl.classList.add('cell-filled');
        } else if (cellState === 2) {
          cellEl.classList.add('cell-x');
        }

        // Action Handlers
        cellEl.addEventListener('click', () => handleCellClick(r, c));
        cellEl.addEventListener('dblclick', (e) => {
          e.preventDefault();
          handleCellRightClick(r, c);
        });
        cellEl.addEventListener('contextmenu', (e) => {
          e.preventDefault();
          handleCellRightClick(r, c);
        });

        boardEl.appendChild(cellEl);
      }
    }
  }

  /* ==========================================================================
     Cell Interaction Logic
     ========================================================================== */
  function pushToUndoStack() {
    undoStack.push(currentBoard.map(row => [...row]));
  }

  function handleCellClick(r, c) {
    const currentState = currentBoard[r][c];

    pushToUndoStack();

    if (currentState === 1 || currentState === 2) {
      // Toggle back to empty
      currentBoard[r][c] = 0;
    } else {
      // Tapping empty cell attempts to Fill
      if (solvedBoard[r][c] === 1) {
        currentBoard[r][c] = 1;
        score += 10;
      } else {
        currentBoard[r][c] = 2; // Auto-correct to X on mistake
        registerMistake(r, c);
      }
    }

    renderBoardGrid();
    updateStatsUI();
    checkGameProgress();
  }

  function handleCellRightClick(r, c) {
    const currentState = currentBoard[r][c];

    pushToUndoStack();

    if (currentState === 1 || currentState === 2) {
      // Toggle back to empty
      currentBoard[r][c] = 0;
    } else {
      // Right click / double-tap attempts to place X
      if (solvedBoard[r][c] === 0) {
        currentBoard[r][c] = 2;
        score += 10;
      } else {
        currentBoard[r][c] = 1; // Auto-correct to Filled on mistake
        registerMistake(r, c);
      }
    }

    renderBoardGrid();
    updateStatsUI();
    checkGameProgress();
  }

  function registerMistake(r, c) {
    mistakes++;
    
    // Temporarily apply error highlight to mistake cell
    setTimeout(() => {
      const cellEl = document.querySelector(`.nonogram-cell[data-row="${r}"][data-col="${c}"]`);
      if (cellEl) {
        cellEl.classList.add('cell-error');
        setTimeout(() => {
          cellEl.classList.remove('cell-error');
        }, 800);
      }
    }, 50);

    if (mistakes >= maxMistakes) {
      triggerGameOver();
    }
  }

  function checkGameProgress() {
    // Check if victory condition met
    let victory = true;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (solvedBoard[r][c] === 1 && currentBoard[r][c] !== 1) {
          victory = false;
          break;
        }
      }
      if (!victory) break;
    }

    if (victory) {
      triggerVictory();
    }
  }

  /* ==========================================================================
     Controls and Tools Actions
     ========================================================================== */
  // Undo Move
  if (toolUndoBtn) {
    toolUndoBtn.addEventListener('click', () => {
      if (undoStack.length > 0) {
        currentBoard = undoStack.pop();
        renderBoardGrid();
        // Recalculate score based on current board state
        recalculateScore();
        updateStatsUI();
      }
    });
  }

  function recalculateScore() {
    score = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const state = currentBoard[r][c];
        if ((solvedBoard[r][c] === 1 && state === 1) || (solvedBoard[r][c] === 0 && state === 2)) {
          score += 10;
        }
      }
    }
  }

  // Restart Current Puzzle
  if (toolRestartBtn) {
    toolRestartBtn.addEventListener('click', () => {
      pushToUndoStack();
      currentBoard = Array.from({ length: 5 }, () => Array(5).fill(0));
      mistakes = 0;
      score = 0;
      hintsRemaining = 3;
      resetTimer();
      startTimer();
      renderBoardGrid();
      updateStatsUI();
    });
  }

  // Zoom toggler
  if (toolZoomBtn) {
    toolZoomBtn.addEventListener('click', () => {
      boardWrapperEl.classList.toggle('zoomed');
      toolZoomBtn.classList.toggle('active');
    });
  }

  // Hint Solver
  if (toolHintBtn) {
    toolHintBtn.addEventListener('click', () => {
      if (hintsRemaining <= 0) return;

      // Find all unsolved cells
      let unsolvedCells = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const state = currentBoard[r][c];
          const isCorrect = (solvedBoard[r][c] === 1 && state === 1) || 
                            (solvedBoard[r][c] === 0 && state === 2);
          if (!isCorrect) {
            unsolvedCells.push({ r, c });
          }
        }
      }

      if (unsolvedCells.length > 0) {
        pushToUndoStack();
        const randIndex = Math.floor(Math.random() * unsolvedCells.length);
        const { r, c } = unsolvedCells[randIndex];
        
        // Solve correctly
        currentBoard[r][c] = solvedBoard[r][c] === 1 ? 1 : 2;
        score += 10;
        hintsRemaining--;

        renderBoardGrid();
        updateStatsUI();
        checkGameProgress();
      }
    });
  }

  // New Game Button click
  if (newGameBtn) {
    newGameBtn.addEventListener('click', startNewGame);
  }

  /* ==========================================================================
     Game End Conditions
     ========================================================================== */
  function triggerGameOver() {
    stopTimer();
    if (gameOverOverlay) {
      gameOverOverlay.classList.add('active');
    }
  }

  function triggerVictory() {
    stopTimer();

    // Auto-fill remaining empty cells with X
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        if (currentBoard[r][c] === 0) {
          currentBoard[r][c] = 2;
        }
      }
    }
    renderBoardGrid();

    // Completion and speed bonuses
    let difficultyBonus = 50;
    if (difficulty === 'medium') difficultyBonus = 100;
    if (difficulty === 'hard') difficultyBonus = 150;

    let speedBonus = 0;
    if (secondsElapsed < 60) speedBonus = 100;
    else if (secondsElapsed < 120) speedBonus = 50;

    score += (difficultyBonus + speedBonus);
    updateStatsUI();

    if (finalScoreEl) finalScoreEl.textContent = score;
    if (victoryOverlay) {
      victoryOverlay.classList.add('active');
    }
    if (window.puzzrooSaveGameResult) {
      window.puzzrooSaveGameResult(score);
    }
  }

  // Try Again click
  if (gameOverRestartBtn) {
    gameOverRestartBtn.addEventListener('click', startNewGame);
  }

  // Play Another click
  if (victoryNewGameBtn) {
    victoryNewGameBtn.addEventListener('click', startNewGame);
  }

  /* ==========================================================================
     Timer Logic
     ========================================================================== */
  function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      secondsElapsed++;
      updateTimerUI();
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function resetTimer() {
    stopTimer();
    secondsElapsed = 0;
    updateTimerUI();
  }

  function updateTimerUI() {
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    const padMins = String(mins).padStart(2, '0');
    const padSecs = String(secs).padStart(2, '0');
    if (timerValEl) {
      timerValEl.textContent = `${padMins}:${padSecs}`;
    }
  }

  /* ==========================================================================
     Initialize Game
     ========================================================================== */
  startNewGame();
});
