document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     Dots Match State & Variables
     ========================================================================== */
  const colors = ['purple', 'orange', 'mint', 'pink', 'blue'];
  const colorHex = {
    purple: '#A592FF',
    orange: '#FFB03A',
    mint: '#00D492',
    pink: '#FF6B8B',
    blue: '#4BABFF'
  };

  let grid = Array.from({ length: 5 }, () => Array(5).fill(null)); // 5x5 grid of color names
  let score = 0;
  const targetScore = 300;
  let mistakes = 0;
  const maxMistakes = 3;
  let hintsRemaining = 3;
  
  let selectedPath = []; // Array of {r, c, color}
  let isDragging = false;
  let isLoop = false;
  
  let undoStack = []; // Array of { grid: 2D array, score: number }
  
  let timerInterval = null;
  let secondsElapsed = 0;
  let difficulty = 'easy';

  // DOM Elements
  const boardEl = document.getElementById('dots-board');
  const boardWrapperEl = document.getElementById('board-wrapper');
  const svgOverlayEl = document.getElementById('dots-svg-overlay');
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
     Game Initialization and Logic
     ========================================================================== */
  function startNewGame() {
    difficulty = getDifficultyFromURL();
    
    // Initialize random board
    generateBoard();
    
    score = 0;
    mistakes = 0;
    hintsRemaining = 3;
    selectedPath = [];
    isDragging = false;
    isLoop = false;
    undoStack = [];

    // Clear svg overlay
    if (svgOverlayEl) svgOverlayEl.innerHTML = '';

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

  function generateBoard() {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        grid[r][c] = getRandomColor();
      }
    }
    
    // Ensure at least one valid starting move (at least 2 adjacent same-color dots)
    if (!hasValidMoves()) {
      generateBoard();
    }
  }

  function getRandomColor() {
    const activeColorsCount = difficulty === 'easy' ? 3 : (difficulty === 'medium' ? 4 : 5);
    const idx = Math.floor(Math.random() * activeColorsCount);
    return colors[idx];
  }

  function hasValidMoves() {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const color = grid[r][c];
        // Check right and down neighbors
        if (c < 4 && grid[r][c + 1] === color) return true;
        if (r < 4 && grid[r + 1][c] === color) return true;
      }
    }
    return false;
  }

  function updateStatsUI() {
    if (scoreValEl) scoreValEl.textContent = score;
    if (mistakesValEl) mistakesValEl.textContent = `${mistakes}/${maxMistakes}`;
    if (hintBadgeEl) hintBadgeEl.textContent = hintsRemaining;
  }

  /* ==========================================================================
     Rendering & Cell Setup
     ========================================================================== */
  function renderBoard() {
    if (!boardEl) return;
    boardEl.innerHTML = '';

    // Adjust SVG layout viewbox on resize/theme changes
    updateSvgViewBox();

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cellEl = document.createElement('div');
        cellEl.classList.add('dots-cell');
        cellEl.dataset.row = r;
        cellEl.dataset.col = c;

        const dotEl = document.createElement('div');
        dotEl.classList.add('dot-element');
        dotEl.classList.add(`dot-${grid[r][c]}`);
        cellEl.appendChild(dotEl);

        // Selected state styling
        const isSelected = selectedPath.some(pt => pt.r === r && pt.c === c);
        if (isSelected) {
          cellEl.classList.add('selected');
        }

        // Attach Mouse & Touch Event Handlers
        cellEl.addEventListener('mousedown', (e) => handleStart(r, c, e));
        cellEl.addEventListener('mouseenter', () => handleEnter(r, c));
        
        boardEl.appendChild(cellEl);
      }
    }

    // SVG resize listener
    window.removeEventListener('resize', updateSvgViewBox);
    window.addEventListener('resize', updateSvgViewBox);
  }

  function updateSvgViewBox() {
    if (!boardEl || !svgOverlayEl) return;
    const firstCell = boardEl.querySelector('.dots-cell');
    if (!firstCell) return;
    
    const cellW = firstCell.offsetWidth;
    const cellH = firstCell.offsetHeight;
    
    svgOverlayEl.style.width = `${5 * cellW}px`;
    svgOverlayEl.style.height = `${5 * cellH}px`;
    
    // Draw connections if path exists
    drawPathLines();
  }

  /* ==========================================================================
     Interaction & Draw Logic
     ========================================================================== */
  function saveState() {
    undoStack.push({
      grid: grid.map(row => [...row]),
      score: score
    });
  }

  function handleStart(r, c, e) {
    if (e) e.preventDefault();
    isDragging = true;
    isLoop = false;
    selectedPath = [{ r, c, color: grid[r][c] }];
    renderBoard();
    drawPathLines();
  }

  function handleEnter(r, c) {
    if (!isDragging) return;
    
    const last = selectedPath[selectedPath.length - 1];
    const first = selectedPath[0];
    const color = grid[r][c];

    // Check if dragging onto same color
    if (color !== first.color) {
      // Invalid color drag is treated as incorrect match/mistake if released,
      // but let's count it immediately if they attempt to connect to it.
      registerMistake();
      cancelDrag();
      return;
    }

    // Check adjacency
    const dist = Math.abs(r - last.r) + Math.abs(c - last.c);
    
    // Diagonal attempt check
    if (Math.abs(r - last.r) === 1 && Math.abs(c - last.c) === 1) {
      registerMistake();
      cancelDrag();
      return;
    }

    if (dist !== 1) {
      // Check if they are dragging back onto the second to last cell (backtracking)
      if (selectedPath.length > 1) {
        const secondLast = selectedPath[selectedPath.length - 2];
        if (secondLast.r === r && secondLast.c === c) {
          selectedPath.pop();
          isLoop = false;
          renderBoard();
          drawPathLines();
          return;
        }
      }
      return; // Ignore other non-adjacent moves
    }

    // Check if already in path (Closed Loop check)
    const existingIndex = selectedPath.findIndex(pt => pt.r === r && pt.c === c);
    if (existingIndex !== -1) {
      // If it is the first node and path length >= 4, it forms a loop!
      if (existingIndex === 0 && selectedPath.length >= 4) {
        isLoop = true;
        renderBoard();
        drawPathLines();
      }
      return;
    }

    // Add to path
    selectedPath.push({ r, c, color });
    isLoop = false;
    renderBoard();
    drawPathLines();
  }

  // Handle global mouseup/touchend to release drag
  function handleRelease() {
    if (!isDragging) return;
    isDragging = false;

    if (selectedPath.length >= 2) {
      saveState();

      const colorToClear = selectedPath[0].color;
      let cellsCleared = 0;

      if (isLoop) {
        // Clear all dots of this color on the board
        for (let r = 0; r < 5; r++) {
          for (let c = 0; c < 5; c++) {
            if (grid[r][c] === colorToClear) {
              grid[r][c] = null;
              cellsCleared++;
            }
          }
        }
        score += cellsCleared * 15;
      } else {
        // Clear only dots in the path
        selectedPath.forEach(pt => {
          grid[pt.r][pt.c] = null;
          cellsCleared++;
        });
        score += cellsCleared * 10;
      }

      applyGravity();
      
      // Check win condition
      if (score >= targetScore) {
        triggerVictory();
      } else if (!hasValidMoves()) {
        // Refresh board elements if no moves available
        refillGridWithValidMoves();
      }
    }

    selectedPath = [];
    isLoop = false;
    if (svgOverlayEl) svgOverlayEl.innerHTML = '';
    renderBoard();
    updateStatsUI();
  }

  function cancelDrag() {
    isDragging = false;
    selectedPath = [];
    isLoop = false;
    if (svgOverlayEl) svgOverlayEl.innerHTML = '';
    renderBoard();
  }

  function registerMistake() {
    mistakes++;
    updateStatsUI();

    // Visual red flash on mistake
    boardWrapperEl.classList.add('cell-error');
    setTimeout(() => {
      boardWrapperEl.classList.remove('cell-error');
    }, 500);

    if (mistakes >= maxMistakes) {
      triggerGameOver();
    }
  }

  function applyGravity() {
    // For each column, drop dots down
    for (let c = 0; c < 5; c++) {
      let emptyRow = 4;
      for (let r = 4; r >= 0; r--) {
        if (grid[r][c] !== null) {
          if (r !== emptyRow) {
            grid[emptyRow][c] = grid[r][c];
            grid[r][c] = null;
          }
          emptyRow--;
        }
      }
      // Fill in empty spaces from the top
      for (let r = emptyRow; r >= 0; r--) {
        grid[r][c] = getRandomColor();
      }
    }
  }

  function refillGridWithValidMoves() {
    while (!hasValidMoves()) {
      // Replace top row to seed valid moves
      for (let c = 0; c < 5; c++) {
        grid[0][c] = getRandomColor();
      }
      applyGravity();
    }
  }

  function drawPathLines() {
    if (!svgOverlayEl || !boardEl) return;
    svgOverlayEl.innerHTML = '';

    if (selectedPath.length < 2) return;

    const firstCell = boardEl.querySelector('.dots-cell');
    if (!firstCell) return;
    
    const cellW = firstCell.offsetWidth;
    const cellH = firstCell.offsetHeight;

    const pathColor = colorHex[selectedPath[0].color];

    // Build SVG coordinates and append lines
    for (let i = 0; i < selectedPath.length - 1; i++) {
      const p1 = selectedPath[i];
      const p2 = selectedPath[i + 1];

      const x1 = (p1.c + 0.5) * cellW;
      const y1 = (p1.r + 0.5) * cellH;
      const x2 = (p2.c + 0.5) * cellW;
      const y2 = (p2.r + 0.5) * cellH;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', pathColor);
      line.classList.add('dots-svg-line');
      svgOverlayEl.appendChild(line);
    }

    if (isLoop) {
      const pFirst = selectedPath[0];
      const pLast = selectedPath[selectedPath.length - 1];

      const x1 = (pLast.c + 0.5) * cellW;
      const y1 = (pLast.r + 0.5) * cellH;
      const x2 = (pFirst.c + 0.5) * cellW;
      const y2 = (pFirst.r + 0.5) * cellH;

      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', x1);
      line.setAttribute('y1', y1);
      line.setAttribute('x2', x2);
      line.setAttribute('y2', y2);
      line.setAttribute('stroke', pathColor);
      line.classList.add('dots-svg-line');
      svgOverlayEl.appendChild(line);
    }
  }

  // Handle touch events dynamically on coordinates
  boardWrapperEl.addEventListener('touchstart', (e) => {
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = target ? target.closest('.dots-cell') : null;
    if (cell) {
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      handleStart(r, c, e);
    }
  });

  boardWrapperEl.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    const target = document.elementFromPoint(touch.clientX, touch.clientY);
    const cell = target ? target.closest('.dots-cell') : null;
    if (cell) {
      const r = parseInt(cell.dataset.row);
      const c = parseInt(cell.dataset.col);
      handleEnter(r, c);
    }
  });

  window.addEventListener('mouseup', handleRelease);
  window.addEventListener('touchend', handleRelease);

  /* ==========================================================================
     Controls and Tools Actions
     ========================================================================== */
  if (toolUndoBtn) {
    toolUndoBtn.addEventListener('click', () => {
      if (undoStack.length > 0) {
        const state = undoStack.pop();
        grid = state.grid.map(row => [...row]);
        score = state.score;
        renderBoard();
        updateStatsUI();
      }
    });
  }

  if (toolRestartBtn) {
    toolRestartBtn.addEventListener('click', () => {
      saveState();
      score = 0;
      mistakes = 0;
      hintsRemaining = 3;
      selectedPath = [];
      isDragging = false;
      isLoop = false;
      resetTimer();
      startTimer();
      generateBoard();
      renderBoard();
      updateStatsUI();
    });
  }

  if (toolZoomBtn) {
    toolZoomBtn.addEventListener('click', () => {
      boardWrapperEl.classList.toggle('zoomed');
      toolZoomBtn.classList.toggle('active');
      setTimeout(updateSvgViewBox, 310); // Match CSS transition duration
    });
  }

  if (toolHintBtn) {
    toolHintBtn.addEventListener('click', () => {
      if (hintsRemaining <= 0) return;

      // Find any valid same-color adjacent match
      let matchPath = null;
      for (let r = 0; r < 5; r++) {
        for (let c = 0; c < 5; c++) {
          const color = grid[r][c];
          if (c < 4 && grid[r][c + 1] === color) {
            matchPath = [{ r, c }, { r, c: c + 1 }];
            break;
          }
          if (r < 4 && grid[r + 1][c] === color) {
            matchPath = [{ r, c }, { r: r + 1, c }];
            break;
          }
        }
        if (matchPath) break;
      }

      if (matchPath) {
        hintsRemaining--;
        updateStatsUI();

        // Flash hint cells
        matchPath.forEach(pt => {
          const cellEl = document.querySelector(`.dots-cell[data-row="${pt.r}"][data-col="${pt.c}"]`);
          if (cellEl) {
            cellEl.classList.add('selected');
            setTimeout(() => {
              cellEl.classList.remove('selected');
            }, 1000);
          }
        });
      }
    });
  }

  if (newGameBtn) {
    newGameBtn.addEventListener('click', startNewGame);
  }

  /* ==========================================================================
     Game End Overlays
     ========================================================================== */
  function triggerGameOver() {
    stopTimer();
    if (gameOverOverlay) gameOverOverlay.classList.add('active');
  }

  function triggerVictory() {
    stopTimer();
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
