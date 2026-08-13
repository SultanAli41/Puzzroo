document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     Cross Word Puzzles Database & State
     ========================================================================== */
  const puzzles = {
    easy: {
      grid: [
        [
          { type: 'block' },
          { type: 'playable', val: 'A', userVal: '', num: 1, acrossWordId: '1A', downWordId: '1D' },
          { type: 'playable', val: 'C', userVal: '', num: 2, acrossWordId: '1A', downWordId: '2D' },
          { type: 'playable', val: 'E', userVal: '', num: 3, acrossWordId: '1A', downWordId: '3D' },
          { type: 'block' }
        ],
        [
          { type: 'playable', val: 'G', userVal: '', num: 4, acrossWordId: '4A', downWordId: '4D' },
          { type: 'playable', val: 'L', userVal: '', acrossWordId: '4A', downWordId: '1D' },
          { type: 'playable', val: 'O', userVal: '', acrossWordId: '4A', downWordId: '2D' },
          { type: 'playable', val: 'V', userVal: '', acrossWordId: '4A', downWordId: '3D' },
          { type: 'playable', val: 'E', userVal: '', num: 5, acrossWordId: '4A', downWordId: '5D' }
        ],
        [
          { type: 'playable', val: 'A', userVal: '', num: 6, acrossWordId: '6A', downWordId: '4D' },
          { type: 'playable', val: 'P', userVal: '', acrossWordId: '6A', downWordId: '1D' },
          { type: 'playable', val: 'R', userVal: '', acrossWordId: '6A', downWordId: '2D' },
          { type: 'playable', val: 'I', userVal: '', acrossWordId: '6A', downWordId: '3D' },
          { type: 'playable', val: 'L', userVal: '', acrossWordId: '6A', downWordId: '5D' }
        ],
        [
          { type: 'playable', val: 'S', userVal: '', num: 7, acrossWordId: '7A', downWordId: '4D' },
          { type: 'playable', val: 'H', userVal: '', acrossWordId: '7A', downWordId: '1D' },
          { type: 'playable', val: 'A', userVal: '', acrossWordId: '7A', downWordId: '2D' },
          { type: 'playable', val: 'C', userVal: '', acrossWordId: '7A', downWordId: '3D' },
          { type: 'playable', val: 'K', userVal: '', acrossWordId: '7A', downWordId: '5D' }
        ],
        [
          { type: 'block' },
          { type: 'playable', val: 'A', userVal: '', num: 8, acrossWordId: '8A', downWordId: '1D' },
          { type: 'playable', val: 'L', userVal: '', acrossWordId: '8A', downWordId: '2D' },
          { type: 'playable', val: 'T', userVal: '', acrossWordId: '8A', downWordId: '3D' },
          { type: 'block' }
        ]
      ],
      clues: {
        across: {
          '1A': { num: 1, text: 'Score 100% on' },
          '4A': { num: 4, text: 'Word that, in German, translates directly to "hand shoe"' },
          '6A': { num: 6, text: 'Its showers bring "May flowers"' },
          '7A': { num: 7, text: 'Hut' },
          '8A': { num: 8, text: 'Not mainstream, in genre names' }
        },
        down: {
          '1D': { num: 1, text: 'First letter of the Greek alphabet' },
          '2D': { num: 2, text: 'Reef builder' },
          '3D': { num: 3, text: 'Kick out' },
          '4D': { num: 4, text: 'Bad thing to run out of in the middle of nowhere' },
          '5D': { num: 5, text: 'Antlered mammal in the Rockies' }
        }
      }
    },
    medium: {
      grid: [
        [
          { type: 'block' },
          { type: 'playable', val: 'B', userVal: '', num: 1, acrossWordId: '1A', downWordId: '1D' },
          { type: 'playable', val: 'E', userVal: '', num: 2, acrossWordId: '1A', downWordId: '2D' },
          { type: 'playable', val: 'L', userVal: '', num: 3, acrossWordId: '1A', downWordId: '3D' },
          { type: 'playable', val: 'T', userVal: '', num: 4, acrossWordId: '1A', downWordId: '4D' }
        ],
        [
          { type: 'playable', val: 'S', userVal: '', num: 5, acrossWordId: '5A', downWordId: '5D' },
          { type: 'playable', val: 'E', userVal: '', acrossWordId: '5A', downWordId: '1D' },
          { type: 'playable', val: 'X', userVal: '', acrossWordId: '5A', downWordId: '2D' },
          { type: 'playable', val: 'E', userVal: '', acrossWordId: '5A', downWordId: '3D' },
          { type: 'playable', val: 'S', userVal: '', acrossWordId: '5A', downWordId: '4D' }
        ],
        [
          { type: 'playable', val: 'P', userVal: '', num: 6, acrossWordId: '6A', downWordId: '5D' },
          { type: 'playable', val: 'L', userVal: '', acrossWordId: '6A', downWordId: '1D' },
          { type: 'playable', val: 'A', userVal: '', acrossWordId: '6A', downWordId: '2D' },
          { type: 'playable', val: 'N', userVal: '', acrossWordId: '6A', downWordId: '3D' },
          { type: 'playable', val: 'K', userVal: '', acrossWordId: '6A', downWordId: '4D' }
        ],
        [
          { type: 'playable', val: 'A', userVal: '', num: 7, acrossWordId: '7A', downWordId: '5D' },
          { type: 'playable', val: 'L', userVal: '', acrossWordId: '7A', downWordId: '1D' },
          { type: 'playable', val: 'L', userVal: '', acrossWordId: '7A', downWordId: '2D' },
          { type: 'playable', val: 'S', userVal: '', acrossWordId: '7A', downWordId: '3D' },
          { type: 'block' }
        ],
        [
          { type: 'playable', val: 'N', userVal: '', num: 8, acrossWordId: '8A', downWordId: '5D' },
          { type: 'playable', val: 'Y', userVal: '', acrossWordId: '8A', downWordId: '1D' },
          { type: 'playable', val: 'T', userVal: '', acrossWordId: '8A', downWordId: '2D' },
          { type: 'block' },
          { type: 'block' }
        ]
      ],
      clues: {
        across: {
          '1A': { num: 1, text: "Orion's ___ (giant waist of space?)" },
          '5A': { num: 5, text: "Sides in a historic tennis 'battle'" },
          '6A': { num: 6, text: 'You might really feel this in your core' },
          '7A': { num: 7, text: '"___ well that ends well!"' },
          '8A': { num: 8, text: 'W.S.J. or WaPo competitor' }
        },
        down: {
          '1D': { num: 1, text: "What's visible when wearing a crop top" },
          '2D': { num: 2, text: 'Glorify' },
          '3D': { num: 3, text: "Monocle's middle" },
          '4D': { num: 4, text: '"Shame, shame!" clicking sound' },
          '5D': { num: 5, text: 'Reach across' }
        }
      }
    },
    hard: {
      grid: [
        [
          { type: 'playable', val: 'S', userVal: '', num: 1, acrossWordId: '1A', downWordId: '1D' },
          { type: 'playable', val: 'P', userVal: '', num: 2, acrossWordId: '1A', downWordId: '2D' },
          { type: 'playable', val: 'A', userVal: '', num: 3, acrossWordId: '1A', downWordId: '3D' },
          { type: 'playable', val: 'R', userVal: '', num: 4, acrossWordId: '1A', downWordId: '4D' },
          { type: 'playable', val: 'K', userVal: '', num: 5, acrossWordId: '1A', downWordId: '5D' }
        ],
        [
          { type: 'playable', val: 'H', userVal: '', num: 6, acrossWordId: '6A', downWordId: '1D' },
          { type: 'playable', val: 'U', userVal: '', acrossWordId: '6A', downWordId: '2D' },
          { type: 'playable', val: 'M', userVal: '', acrossWordId: '6A', downWordId: '3D' },
          { type: 'playable', val: 'A', userVal: '', acrossWordId: '6A', downWordId: '4D' },
          { type: 'playable', val: 'N', userVal: '', acrossWordId: '6A', downWordId: '5D' }
        ],
        [
          { type: 'playable', val: 'A', userVal: '', num: 7, acrossWordId: '7A', downWordId: '1D' },
          { type: 'playable', val: 'M', userVal: '', acrossWordId: '7A', downWordId: '2D' },
          { type: 'playable', val: 'I', userVal: '', acrossWordId: '7A', downWordId: '3D' },
          { type: 'playable', val: 'N', userVal: '', acrossWordId: '7A', downWordId: '4D' },
          { type: 'playable', val: 'O', userVal: '', acrossWordId: '7A', downWordId: '5D' }
        ],
        [
          { type: 'playable', val: 'M', userVal: '', num: 8, acrossWordId: '8A', downWordId: '1D' },
          { type: 'playable', val: 'A', userVal: '', acrossWordId: '8A', downWordId: '2D' },
          { type: 'playable', val: 'G', userVal: '', acrossWordId: '8A', downWordId: '3D' },
          { type: 'playable', val: 'I', userVal: '', acrossWordId: '8A', downWordId: '4D' },
          { type: 'playable', val: 'C', userVal: '', acrossWordId: '8A', downWordId: '5D' }
        ],
        [
          { type: 'block' },
          { type: 'playable', val: 'S', userVal: '', num: 9, acrossWordId: '9A', downWordId: '2D' },
          { type: 'playable', val: 'A', userVal: '', acrossWordId: '9A', downWordId: '3D' },
          { type: 'playable', val: 'N', userVal: '', acrossWordId: '9A', downWordId: '4D' },
          { type: 'playable', val: 'K', userVal: '', acrossWordId: '9A', downWordId: '5D' }
        ]
      ],
      clues: {
        across: {
          '1A': { num: 1, text: 'Bit of romantic potential' },
          '6A': { num: 6, text: 'One able to pass a Captcha test' },
          '7A': { num: 7, text: 'Protein-building acid type' },
          '8A': { num: 8, text: 'Card tricks, disappearing acts, etc.' },
          '9A': { num: 9, text: 'Failed to float' }
        },
        down: {
          '1D': { num: 1, text: 'Decorative pillow cover' },
          '2D': { num: 2, text: 'Mountain lions' },
          '3D': { num: 3, text: 'Female friend, in Spanish' },
          '4D': { num: 4, text: 'Rushed through the door' },
          '5D': { num: 5, text: 'When repeated, classic kind of joke' }
        }
      }
    }
  };

  let currentPuzzle = null;
  let score = 0;
  let mistakes = 0;
  const maxMistakes = 3;
  let hintsRemaining = 3;
  let selectedCell = null; // {r, c}
  let activeDirection = 'across'; // 'across' or 'down'
  let undoStack = []; // Stack of {r, c, val}

  let timerInterval = null;
  let secondsElapsed = 0;
  let difficulty = 'easy';

  // DOM Elements
  const boardEl = document.getElementById('cw-board');
  const boardWrapperEl = document.getElementById('board-wrapper');
  const activeClueBannerEl = document.getElementById('active-clue-banner');
  const acrossCluesEl = document.getElementById('across-clues');
  const downCluesEl = document.getElementById('down-clues');

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

  const keyboardBtns = document.querySelectorAll('.kb-btn');

  /* ==========================================================================
     Game Setup and Flow
     ========================================================================== */
  function startNewGame() {
    difficulty = getDifficultyFromURL();
    
    // Select and copy predefined puzzle layout
    currentPuzzle = JSON.parse(JSON.stringify(puzzles[difficulty]));
    
    score = 0;
    mistakes = 0;
    hintsRemaining = 3;
    selectedCell = null;
    activeDirection = 'across';
    undoStack = [];

    updateStatsUI();
    renderBoard();
    populateCluesList();
    resetActiveClueBanner();
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

  function resetActiveClueBanner() {
    if (activeClueBannerEl) {
      activeClueBannerEl.textContent = 'Select a grid square to reveal clues.';
    }
  }

  /* ==========================================================================
     Rendering Board & Clues
     ========================================================================== */
  function renderBoard() {
    if (!boardEl || !currentPuzzle) return;
    boardEl.innerHTML = '';

    const selectedWordId = getActiveWordId();

    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cellData = currentPuzzle.grid[r][c];
        const cellEl = document.createElement('div');
        cellEl.classList.add('cw-cell');

        if (cellData.type === 'block') {
          cellEl.classList.add('block-cell');
        } else if (cellData.type === 'playable') {
          cellEl.classList.add('playable-cell');
          cellEl.dataset.row = r;
          cellEl.dataset.col = c;

          // Number indicator in corner
          if (cellData.num) {
            const numEl = document.createElement('span');
            numEl.classList.add('cw-cell-num');
            numEl.textContent = cellData.num;
            cellEl.appendChild(numEl);
          }

          // User value
          if (cellData.userVal) {
            const letterText = document.createTextNode(cellData.userVal);
            cellEl.appendChild(letterText);
          }

          // Highlights
          if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
            cellEl.classList.add('selected');
          } else if (selectedWordId) {
            const cellWordId = activeDirection === 'across' ? cellData.acrossWordId : cellData.downWordId;
            if (cellWordId === selectedWordId) {
              cellEl.classList.add('word-highlighted');
            }
          }

          // Click handler
          cellEl.addEventListener('click', () => selectCell(r, c));
        }

        boardEl.appendChild(cellEl);
      }
    }
  }

  function getActiveWordId() {
    if (!selectedCell || !currentPuzzle) return null;
    const cell = currentPuzzle.grid[selectedCell.r][selectedCell.c];
    return activeDirection === 'across' ? cell.acrossWordId : cell.downWordId;
  }

  function selectCell(r, c) {
    if (currentPuzzle.grid[r][c].type !== 'playable') return;

    if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
      // Toggle direction if clicked same cell
      const cell = currentPuzzle.grid[r][c];
      if (cell.acrossWordId && cell.downWordId) {
        activeDirection = activeDirection === 'across' ? 'down' : 'across';
      }
    } else {
      selectedCell = { r, c };
      const cell = currentPuzzle.grid[r][c];
      if (activeDirection === 'across' && !cell.acrossWordId) {
        activeDirection = 'down';
      } else if (activeDirection === 'down' && !cell.downWordId) {
        activeDirection = 'across';
      }
    }

    renderBoard();
    updateActiveClueHighlight();
  }

  function populateCluesList() {
    if (!acrossCluesEl || !downCluesEl || !currentPuzzle) return;
    acrossCluesEl.innerHTML = '';
    downCluesEl.innerHTML = '';

    // Across Clues
    for (const [id, clue] of Object.entries(currentPuzzle.clues.across)) {
      const li = document.createElement('li');
      li.classList.add('cw-clue-item');
      li.dataset.clueId = id;
      li.textContent = `${clue.num}. ${clue.text}`;
      li.addEventListener('click', () => selectClue(id, 'across'));
      acrossCluesEl.appendChild(li);
    }

    // Down Clues
    for (const [id, clue] of Object.entries(currentPuzzle.clues.down)) {
      const li = document.createElement('li');
      li.classList.add('cw-clue-item');
      li.dataset.clueId = id;
      li.textContent = `${clue.num}. ${clue.text}`;
      li.addEventListener('click', () => selectClue(id, 'down'));
      downCluesEl.appendChild(li);
    }
  }

  function selectClue(id, dir) {
    activeDirection = dir;
    // Find the first cell of this word and select it
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const cell = currentPuzzle.grid[r][c];
        if (cell.type === 'playable') {
          const cellWordId = dir === 'across' ? cell.acrossWordId : cell.downWordId;
          if (cellWordId === id) {
            selectedCell = { r, c };
            renderBoard();
            updateActiveClueHighlight();
            return;
          }
        }
      }
    }
  }

  function updateActiveClueHighlight() {
    // Clear active classes from clue elements
    document.querySelectorAll('.cw-clue-item').forEach(el => {
      el.classList.remove('active-clue');
    });

    const activeWordId = getActiveWordId();
    if (!activeWordId || !currentPuzzle) {
      resetActiveClueBanner();
      return;
    }

    // Find and highlight active clue element
    const clueEl = document.querySelector(`.cw-clue-item[data-clue-id="${activeWordId}"]`);
    if (clueEl) {
      clueEl.classList.add('active-clue');
      clueEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Update banner
    const clueData = activeDirection === 'across' 
      ? currentPuzzle.clues.across[activeWordId] 
      : currentPuzzle.clues.down[activeWordId];

    if (clueData && activeClueBannerEl) {
      const label = activeDirection === 'across' ? 'Across' : 'Down';
      activeClueBannerEl.textContent = `(${clueData.num} ${label}) - ${clueData.text}`;
    }
  }

  /* ==========================================================================
     Keyboard and Input Actions
     ========================================================================== */
  function pushToUndoStack(r, c, oldVal) {
    undoStack.push({ r, c, val: oldVal });
  }

  function handleLetterInput(letter) {
    if (!selectedCell || !currentPuzzle) return;
    const { r, c } = selectedCell;
    const cell = currentPuzzle.grid[r][c];

    const cleanLetter = letter.toUpperCase();
    if (cleanLetter < 'A' || cleanLetter > 'Z') return;

    if (cell.userVal === cleanLetter) {
      autoAdvance();
      return;
    }

    pushToUndoStack(r, c, cell.userVal);
    cell.userVal = cleanLetter;

    if (cleanLetter === cell.val.toUpperCase()) {
      score += 100;
      updateStatsUI();
      renderBoard();
      checkVictory();
      autoAdvance();
    } else {
      registerMistake(r, c);
      renderBoard();
    }
  }

  function autoAdvance() {
    if (!selectedCell || !currentPuzzle) return;
    const { r, c } = selectedCell;
    const currentWordId = getActiveWordId();
    if (!currentWordId) return;

    // Move to next cell in the active word run
    if (activeDirection === 'across') {
      let nextCol = c + 1;
      while (nextCol < 5) {
        const nextCell = currentPuzzle.grid[r][nextCol];
        if (nextCell.type === 'playable' && nextCell.acrossWordId === currentWordId) {
          selectedCell = { r, c: nextCol };
          renderBoard();
          updateActiveClueHighlight();
          return;
        }
        nextCol++;
      }
    } else {
      let nextRow = r + 1;
      while (nextRow < 5) {
        const nextCell = currentPuzzle.grid[nextRow][c];
        if (nextCell.type === 'playable' && nextCell.downWordId === currentWordId) {
          selectedCell = { r: nextRow, c };
          renderBoard();
          updateActiveClueHighlight();
          return;
        }
        nextRow++;
      }
    }
  }

  function autoMoveBackwards() {
    if (!selectedCell || !currentPuzzle) return;
    const { r, c } = selectedCell;
    const currentWordId = getActiveWordId();
    if (!currentWordId) return;

    // Move to previous cell in the active word run
    if (activeDirection === 'across') {
      let prevCol = c - 1;
      while (prevCol >= 0) {
        const prevCell = currentPuzzle.grid[r][prevCol];
        if (prevCell.type === 'playable' && prevCell.acrossWordId === currentWordId) {
          selectedCell = { r, c: prevCol };
          renderBoard();
          updateActiveClueHighlight();
          return;
        }
        prevCol--;
      }
    } else {
      let prevRow = r - 1;
      while (prevRow >= 0) {
        const prevCell = currentPuzzle.grid[prevRow][c];
        if (prevCell.type === 'playable' && prevCell.downWordId === currentWordId) {
          selectedCell = { r: prevRow, c };
          renderBoard();
          updateActiveClueHighlight();
          return;
        }
        prevRow--;
      }
    }
  }

  function handleErase() {
    if (!selectedCell || !currentPuzzle) return;
    const { r, c } = selectedCell;
    const cell = currentPuzzle.grid[r][c];

    if (cell.userVal !== '') {
      pushToUndoStack(r, c, cell.userVal);
      cell.userVal = '';
      renderBoard();
    } else {
      autoMoveBackwards();
    }
  }

  function registerMistake(r, c) {
    mistakes++;
    updateStatsUI();

    // Flash error styling on cell
    setTimeout(() => {
      const cellEl = document.querySelector(`.cw-cell[data-row="${r}"][data-col="${c}"]`);
      if (cellEl) {
        cellEl.classList.add('cell-error');
        setTimeout(() => {
          cellEl.classList.remove('cell-error');
        }, 850);
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
        if (cell.type === 'playable' && cell.userVal !== cell.val) {
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

  // Virtual Keyboard clicks
  keyboardBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-key');
      if (key === 'backspace') {
        handleErase();
      } else {
        handleLetterInput(key);
      }
    });
  });

  // Physical Keyboard listener
  window.addEventListener('keydown', (e) => {
    if (!selectedCell) return;
    
    if (e.key >= 'a' && e.key <= 'z') {
      handleLetterInput(e.key);
    } else if (e.key >= 'A' && e.key <= 'Z') {
      handleLetterInput(e.key);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      handleErase();
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

    if (r >= 0 && r < 5 && c >= 0 && c < 5) {
      if (currentPuzzle.grid[r][c].type === 'playable') {
        selectedCell = { r, c };
        renderBoard();
        updateActiveClueHighlight();
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
        selectedCell = { r: action.r, c: action.c };
        renderBoard();
        updateActiveClueHighlight();
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
        if (cell.type === 'playable' && cell.userVal === cell.val) {
          score += 100;
        }
      }
    }
  }

  if (toolEraseBtn) {
    toolEraseBtn.addEventListener('click', () => {
      handleErase();
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
          if (cell.type === 'playable' && cell.userVal !== cell.val) {
            unsolved.push({ r, c });
          }
        }
      }

      if (unsolved.length > 0) {
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
        updateActiveClueHighlight();
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
