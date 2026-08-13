document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     Kakuro Puzzles Database & State
     ========================================================================== */
  const puzzles = {
    easy: [
      {
        grid: [
          [
            { type: 'block' },
            { type: 'clue', dClue: 4 },
            { type: 'clue', dClue: 16 },
            { type: 'block' },
            { type: 'block' }
          ],
          [
            { type: 'clue', rClue: 7 },
            { type: 'white', val: 3, userVal: '' },
            { type: 'white', val: 4, userVal: '' },
            { type: 'clue', dClue: 12 },
            { type: 'clue', dClue: 14 }
          ],
          [
            { type: 'clue', rClue: 16 },
            { type: 'white', val: 1, userVal: '' },
            { type: 'white', val: 7, userVal: '' },
            { type: 'white', val: 2, userVal: '' },
            { type: 'white', val: 6, userVal: '' }
          ],
          [
            { type: 'block' },
            { type: 'clue', rClue: 14 },
            { type: 'white', val: 5, userVal: '' },
            { type: 'white', val: 6, userVal: '' },
            { type: 'white', val: 3, userVal: '' }
          ],
          [
            { type: 'block' },
            { type: 'block' },
            { type: 'clue', rClue: 9 },
            { type: 'white', val: 4, userVal: '' },
            { type: 'white', val: 5, userVal: '' }
          ]
        ]
      }
    ],
    medium: [
      {
        grid: [
          [
            { type: 'block' },
            { type: 'clue', dClue: 3 },
            { type: 'clue', dClue: 17 },
            { type: 'block' },
            { type: 'block' }
          ],
          [
            { type: 'clue', rClue: 7 },
            { type: 'white', val: 2, userVal: '' },
            { type: 'white', val: 5, userVal: '' },
            { type: 'clue', dClue: 14 },
            { type: 'clue', dClue: 7 }
          ],
          [
            { type: 'clue', rClue: 16 },
            { type: 'white', val: 1, userVal: '' },
            { type: 'white', val: 8, userVal: '' },
            { type: 'white', val: 3, userVal: '' },
            { type: 'white', val: 4, userVal: '' }
          ],
          [
            { type: 'block' },
            { type: 'clue', rClue: 10 },
            { type: 'white', val: 4, userVal: '' },
            { type: 'white', val: 5, userVal: '' },
            { type: 'white', val: 1, userVal: '' }
          ],
          [
            { type: 'block' },
            { type: 'block' },
            { type: 'clue', rClue: 8 },
            { type: 'white', val: 6, userVal: '' },
            { type: 'white', val: 2, userVal: '' }
          ]
        ]
      }
    ],
    hard: [
      {
        grid: [
          [
            { type: 'block' },
            { type: 'clue', dClue: 3 },
            { type: 'clue', dClue: 21 },
            { type: 'block' },
            { type: 'block' }
          ],
          [
            { type: 'clue', rClue: 9 },
            { type: 'white', val: 1, userVal: '' },
            { type: 'white', val: 8, userVal: '' },
            { type: 'clue', dClue: 18 },
            { type: 'clue', dClue: 6 }
          ],
          [
            { type: 'clue', rClue: 19 },
            { type: 'white', val: 2, userVal: '' },
            { type: 'white', val: 9, userVal: '' },
            { type: 'white', val: 5, userVal: '' },
            { type: 'white', val: 3, userVal: '' }
          ],
          [
            { type: 'block' },
            { type: 'clue', rClue: 11 },
            { type: 'white', val: 4, userVal: '' },
            { type: 'white', val: 6, userVal: '' },
            { type: 'white', val: 1, userVal: '' }
          ],
          [
            { type: 'block' },
            { type: 'block' },
            { type: 'clue', rClue: 9 },
            { type: 'white', val: 7, userVal: '' },
            { type: 'white', val: 2, userVal: '' }
          ]
        ]
      }
    ]
  };

  let currentPuzzle = null;
  let score = 0;
  let mistakes = 0;
  const maxMistakes = 3;
  let hintsRemaining = 3;
  let selectedCell = null; // {r, c}
  let undoStack = []; // Array of previous grid cell values states
  
  let timerInterval = null;
  let secondsElapsed = 0;
  let difficulty = 'easy';

  // DOM Elements
  const boardEl = document.getElementById('kakuro-board');
  const boardWrapperEl = document.getElementById('board-wrapper');
  const scoreValEl = document.getElementById('score-val');
  const mistakesValEl = document.getElementById('mistakes-val');
  const timerValEl = document.getElementById('timer-val');
  const hintBadgeEl = document.getElementById('hint-badge');

  const toolUndoBtn = document.getElementById('tool-undo');
  const toolEraseBtn = document.getElementById('tool-erase');
  const toolZoomBtn = document.getElementById('tool-zoom');
  const toolHintBtn = document.getElementById('tool-hint');

  const newGameBtn = document.getElementById('btn-new-game');

  const gameOverOverlay = document.getElementById('game-over-overlay');
  const gameOverRestartBtn = document.getElementById('btn-game-over-restart');
  const victoryOverlay = document.getElementById('victory-overlay');
  const victoryNewGameBtn = document.getElementById('btn-victory-new-game');
  const finalScoreEl = document.getElementById('final-score');

  const keypadBtns = document.querySelectorAll('.keypad-btn');

  /* ==========================================================================
     Game Setup and Flow
     ========================================================================== */
  function startNewGame() {
    difficulty = getDifficultyFromURL();
    
    // Pick the predefined puzzle layout and deep copy it
    const puzzleDb = puzzles[difficulty];
    currentPuzzle = JSON.parse(JSON.stringify(puzzleDb[0])); // Single pre-defined puzzle layout
    
    score = 0;
    mistakes = 0;
    hintsRemaining = 3;
    selectedCell = null;
    undoStack = [];

    updateStatsUI();
    renderBoard();
    resetTimer();
    startTimer();

    // Hide overlays
    if (gameOverOverlay) gameOverOverlay.classList.remove('active');
    if (victoryOverlay) victoryOverlay.classList.remove('active');
  }

  function getDifficultyFromURL() {
    const params = new URLSearchParams(window.location.search);
    const diff = params.get('difficulty');
    if (diff === 'easy' || diff === 'medium' || diff === 'hard') {
      return diff;
    }
    return 'easy';
  }

  function updateStatsUI() {
    if (scoreValEl) scoreValEl.textContent = score;
    if (mistakesValEl) mistakesValEl.textContent = `${mistakes}/${maxMistakes}`;
    if (hintBadgeEl) hintBadgeEl.textContent = hintsRemaining;
  }

  /* ==========================================================================
     Rendering Board
     ========================================================================== */
  function renderBoard() {
    if (!boardEl || !currentPuzzle) return;
    boardEl.innerHTML = '';

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cellData = currentPuzzle.grid[r][c];
        const cellEl = document.createElement('div');
        cellEl.classList.add('kakuro-cell');

        if (cellData.type === 'block') {
          cellEl.classList.add('block-cell');
        } else if (cellData.type === 'clue') {
          cellEl.classList.add('clue-cell');

          // Draw diagonal slash SVG
          const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', '0');
          line.setAttribute('y1', '0');
          line.setAttribute('x2', '100%');
          line.setAttribute('y2', '100%');
          svg.appendChild(line);
          cellEl.appendChild(svg);

          // Add clue values
          if (cellData.rClue !== undefined && cellData.rClue !== null) {
            const rClueEl = document.createElement('span');
            rClueEl.classList.add('clue-val', 'clue-right');
            rClueEl.textContent = cellData.rClue;
            cellEl.appendChild(rClueEl);
          }
          if (cellData.dClue !== undefined && cellData.dClue !== null) {
            const dClueEl = document.createElement('span');
            dClueEl.classList.add('clue-val', 'clue-down');
            dClueEl.textContent = cellData.dClue;
            cellEl.appendChild(dClueEl);
          }
        } else if (cellData.type === 'white') {
          cellEl.classList.add('white-cell');
          cellEl.dataset.row = r;
          cellEl.dataset.col = c;
          
          if (cellData.userVal) {
            cellEl.textContent = cellData.userVal;
          }

          if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
            cellEl.classList.add('selected');
          }

          // Handle click to select
          cellEl.addEventListener('click', () => selectCell(r, c));
        }

        boardEl.appendChild(cellEl);
      }
    }
  }

  function selectCell(r, c) {
    if (currentPuzzle.grid[r][c].type !== 'white') return;
    selectedCell = { r, c };
    renderBoard();
  }

  /* ==========================================================================
     Keypad & Keyboard Actions
     ========================================================================== */
  function pushToUndoStack(r, c, oldVal) {
    undoStack.push({ r, c, val: oldVal });
  }

  function handleInput(val) {
    if (!selectedCell || !currentPuzzle) return;
    const { r, c } = selectedCell;
    const cell = currentPuzzle.grid[r][c];

    if (val === 'clear') {
      if (cell.userVal !== '') {
        pushToUndoStack(r, c, cell.userVal);
        cell.userVal = '';
        renderBoard();
      }
      return;
    }

    const digit = parseInt(val);
    if (isNaN(digit) || digit < 1 || digit > 9) return;

    if (cell.userVal === digit) return; // No change

    pushToUndoStack(r, c, cell.userVal);
    cell.userVal = digit;

    if (digit === cell.val) {
      score += 100;
      updateStatsUI();
      checkVictory();
    } else {
      registerMistake(r, c);
    }

    renderBoard();
  }

  function registerMistake(r, c) {
    mistakes++;
    updateStatsUI();

    // Flash error styling on cell
    setTimeout(() => {
      const cellEl = document.querySelector(`.kakuro-cell[data-row="${r}"][data-col="${c}"]`);
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

  function checkVictory() {
    let victory = true;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = currentPuzzle.grid[r][c];
        if (cell.type === 'white' && cell.userVal !== cell.val) {
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

  // Keypad clicks
  keypadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const val = btn.getAttribute('data-val');
      handleInput(val);
    });
  });

  // Physical Keyboard listener
  window.addEventListener('keydown', (e) => {
    if (!selectedCell) return;
    
    if (e.key >= '1' && e.key <= '9') {
      handleInput(e.key);
    } else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') {
      handleInput('clear');
    } else if (e.key.startsWith('Arrow')) {
      handleArrowNavigation(e.key);
    }
  });

  function handleArrowNavigation(key) {
    if (!selectedCell) return;
    let { r, c } = selectedCell;

    if (key === 'ArrowUp') r--;
    else if (key === 'ArrowDown') r++;
    else if (key === 'ArrowLeft') c--;
    else if (key === 'ArrowRight') c++;

    // Wrap around boundaries and check if cell is white-cell
    if (r >= 0 && r < 5 && c >= 0 && c < 5) {
      if (currentPuzzle.grid[r][c].type === 'white') {
        selectedCell = { r, c };
        renderBoard();
      }
    }
  }

  /* ==========================================================================
     Controls Actions
     ========================================================================== */
  if (toolUndoBtn) {
    toolUndoBtn.addEventListener('click', () => {
      if (undoStack.length > 0) {
        const action = undoStack.pop();
        currentPuzzle.grid[action.r][action.c].userVal = action.val;
        renderBoard();
        recalculateScore();
        updateStatsUI();
      }
    });
  }

  function recalculateScore() {
    score = 0;
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = currentPuzzle.grid[r][c];
        if (cell.type === 'white' && cell.userVal === cell.val) {
          score += 100;
        }
      }
    }
  }

  if (toolEraseBtn) {
    toolEraseBtn.addEventListener('click', () => {
      handleInput('clear');
    });
  }

  if (toolZoomBtn) {
    toolZoomBtn.addEventListener('click', () => {
      boardWrapperEl.classList.toggle('zoomed');
      toolZoomBtn.classList.toggle('active');
    });
  }

  if (toolHintBtn) {
    toolHintBtn.addEventListener('click', () => {
      if (hintsRemaining <= 0) return;

      // Identify unsolved cells
      let unsolved = [];
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const cell = currentPuzzle.grid[r][c];
          if (cell.type === 'white' && cell.userVal !== cell.val) {
            unsolved.push({ r, c });
          }
        }
      }

      if (unsolved.length > 0) {
        // Pick currently selected cell if unsolved, or a random unsolved cell
        let target = selectedCell;
        if (!target || currentPuzzle.grid[target.r][target.c].userVal === currentPuzzle.grid[target.r][target.c].val) {
          const randIdx = Math.floor(Math.random() * unsolved.length);
          target = unsolved[randIdx];
        }

        const cell = currentPuzzle.grid[target.r][target.c];
        pushToUndoStack(target.r, target.c, cell.userVal);
        cell.userVal = cell.val;
        
        hintsRemaining--;
        score += 100;
        
        selectedCell = target;
        renderBoard();
        updateStatsUI();
        checkVictory();
      }
    });
  }

  if (newGameBtn) {
    newGameBtn.addEventListener('click', startNewGame);
  }

  /* ==========================================================================
     Game End Conditions
     ========================================================================== */
  function triggerGameOver() {
    stopTimer();
    if (gameOverOverlay) gameOverOverlay.classList.add('active');
  }

  function triggerVictory() {
    stopTimer();
    
    // Add completion bonuses
    let difficultyBonus = 50;
    if (difficulty === 'medium') difficultyBonus = 100;
    if (difficulty === 'hard') difficultyBonus = 150;

    let speedBonus = 0;
    if (secondsElapsed < 60) speedBonus = 100;
    else if (secondsElapsed < 120) speedBonus = 50;

    score += (difficultyBonus + speedBonus);
    updateStatsUI();

    if (finalScoreEl) finalScoreEl.textContent = score;
    if (victoryOverlay) victoryOverlay.classList.add('active');
  }

  if (gameOverRestartBtn) {
    gameOverRestartBtn.addEventListener('click', startNewGame);
  }

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
    if (timerValEl) timerValEl.textContent = `${padMins}:${padSecs}`;
  }

  /* ==========================================================================
     Initialize Game
     ========================================================================== */
  startNewGame();
});
