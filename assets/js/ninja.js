document.addEventListener('DOMContentLoaded', () => {
  /* ==========================================================================
     Number Ninja State & Variables
     ========================================================================== */
  let score = 0;
  let mistakes = 0;
  const maxMistakes = 3;
  let hintsRemaining = 3;
  let combo = 1;
  let solvedCount = 0;
  const targetSolveCount = 15; // Solve 15 questions to win

  let currentQuestion = {
    equation: '',
    answer: 0
  };
  let difficulty = 'easy';
  let answered = false;

  // Timers
  let gameTimerInterval = null;
  let secondsElapsed = 0;

  let countdownInterval = null;
  let secondsPerQuestion = 8;
  let ticksRemaining = 0;
  let totalTicks = 0;

  // Grid Data
  let correctIndex = -1;
  let bombIndexes = [];
  let gridValues = [];

  // DOM Elements
  const boardEl = document.getElementById('ninja-board');
  const boardWrapperEl = document.getElementById('board-wrapper');
  const scoreValEl = document.getElementById('score-val');
  const mistakesValEl = document.getElementById('mistakes-val');
  const timerValEl = document.getElementById('timer-val');
  const hintBadgeEl = document.getElementById('hint-badge');
  const comboBadgeEl = document.getElementById('combo-badge');
  const equationEl = document.getElementById('ninja-equation');
  const timerBarEl = document.getElementById('ninja-timer-bar');

  const toolUndoBtn = document.getElementById('tool-undo'); // skipping
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
    
    // Set timer settings based on difficulty
    if (difficulty === 'easy') {
      secondsPerQuestion = 10;
    } else if (difficulty === 'medium') {
      secondsPerQuestion = 8;
    } else {
      secondsPerQuestion = 5;
    }

    // Reset values
    score = 0;
    mistakes = 0;
    hintsRemaining = 3;
    combo = 1;
    solvedCount = 0;
    secondsElapsed = 0;
    answered = false;

    // Update UI Elements
    updateStatsUI();
    resetGameTimer();
    startGameTimer();

    // Generate first question & board
    nextQuestion();

    // Hide overlays
    gameOverOverlay.classList.remove('active');
    victoryOverlay.classList.remove('active');
  }

  function updateStatsUI() {
    if (scoreValEl) scoreValEl.textContent = score;
    if (mistakesValEl) mistakesValEl.textContent = `${mistakes}/${maxMistakes}`;
    if (hintBadgeEl) hintBadgeEl.textContent = hintsRemaining;
    
    if (comboBadgeEl) {
      comboBadgeEl.textContent = `Combo x${combo}`;
      // Highlight/pop combo when combo is > 1
      if (combo > 1) {
        comboBadgeEl.style.display = 'inline-block';
        comboBadgeEl.classList.add('pop');
        setTimeout(() => comboBadgeEl.classList.remove('pop'), 200);
      } else {
        comboBadgeEl.style.display = 'none';
      }
    }
  }

  /* ==========================================================================
     Equation and Grid Generation
     ========================================================================== */
  function generateQuestion() {
    let op = '+';
    let val1 = 0, val2 = 0, ans = 0;

    // Define operators based on difficulty
    const ops = ['+', '-'];
    if (difficulty === 'medium') {
      ops.push('×');
    } else if (difficulty === 'hard') {
      ops.push('×', '÷');
    }

    op = ops[Math.floor(Math.random() * ops.length)];

    if (op === '+') {
      val1 = Math.floor(Math.random() * 12) + 2; // 2..13
      val2 = Math.floor(Math.random() * 12) + 2; // 2..13
      ans = val1 + val2;
    } else if (op === '-') {
      ans = Math.floor(Math.random() * 10) + 2; // 2..11
      val2 = Math.floor(Math.random() * 10) + 1; // 1..10
      val1 = ans + val2; // Ensures positive result
    } else if (op === '×') {
      val1 = Math.floor(Math.random() * 8) + 2; // 2..9
      val2 = Math.floor(Math.random() * 7) + 2; // 2..8
      ans = val1 * val2;
    } else if (op === '÷') {
      val2 = Math.floor(Math.random() * 7) + 2; // 2..8 (divisor)
      ans = Math.floor(Math.random() * 8) + 2; // 2..9 (result)
      val1 = val2 * ans; // Ensures perfect divisibility
    }

    currentQuestion = {
      equation: `${val1} ${op} ${val2}`,
      answer: ans
    };

    if (equationEl) {
      equationEl.textContent = currentQuestion.equation;
    }
  }

  function generateGridValues() {
    const ans = currentQuestion.answer;
    const values = new Set();
    values.add(ans);

    // Generate 24 other unique distractors
    while (values.size < 25) {
      let offset = Math.floor(Math.random() * 20) - 10; // offset between -10 and 10
      let distractor = ans + offset;
      if (distractor > 0 && distractor !== ans && !values.has(distractor)) {
        values.add(distractor);
      }
    }

    // Convert to array and shuffle
    gridValues = Array.from(values);
    shuffleArray(gridValues);

    // Find correct answer index in the shuffled array
    correctIndex = gridValues.indexOf(ans);

    // Place bombs based on difficulty
    bombIndexes = [];
    let numBombs = 0;
    if (difficulty === 'medium') numBombs = 1;
    if (difficulty === 'hard') numBombs = 2;

    while (bombIndexes.length < numBombs) {
      let randIdx = Math.floor(Math.random() * 25);
      // Don't place a bomb on the correct cell, or duplicate indexes
      if (randIdx !== correctIndex && !bombIndexes.includes(randIdx)) {
        bombIndexes.push(randIdx);
      }
    }
  }

  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  /* ==========================================================================
     Board Rendering
     ========================================================================== */
  function renderBoard() {
    boardEl.innerHTML = '';
    answered = false;

    for (let i = 0; i < 25; i++) {
      const cellEl = document.createElement('div');
      cellEl.classList.add('ninja-cell');
      cellEl.dataset.index = i;

      if (bombIndexes.includes(i)) {
        // Render bomb/obstacle shuriken in bomb cells
        cellEl.innerHTML = '<span class="ninja-cell-icon">💣</span>';
      } else {
        // Render number
        cellEl.textContent = gridValues[i];
      }

      // Add event listener
      cellEl.addEventListener('click', () => handleCellClick(i));

      boardEl.appendChild(cellEl);
    }
  }

  /* ==========================================================================
     Cell Actions and Interactions
     ========================================================================== */
  function handleCellClick(index) {
    if (answered) return;

    // Check if clicked bomb
    if (bombIndexes.includes(index)) {
      answered = true;
      stopCountdownTimer();
      
      const cellEl = boardEl.querySelector(`.ninja-cell[data-index="${index}"]`);
      if (cellEl) cellEl.classList.add('cell-wrong');

      registerMistake();
      combo = 1;
      updateStatsUI();

      if (mistakes < maxMistakes) {
        setTimeout(nextQuestion, 1000);
      }
      return;
    }

    // Check if clicked correct answer
    if (index === correctIndex) {
      answered = true;
      stopCountdownTimer();

      const cellEl = boardEl.querySelector(`.ninja-cell[data-index="${index}"]`);
      if (cellEl) cellEl.classList.add('cell-correct');

      // Update score and combos
      score += 10 * combo;
      combo += 1;
      solvedCount += 1;
      updateStatsUI();

      // Check win condition
      if (solvedCount >= targetSolveCount) {
        triggerVictory();
      } else {
        setTimeout(nextQuestion, 600);
      }
    } else {
      // Clicked incorrect number
      answered = true;
      stopCountdownTimer();

      // Highlight clicked cell red
      const cellEl = boardEl.querySelector(`.ninja-cell[data-index="${index}"]`);
      if (cellEl) cellEl.classList.add('cell-wrong');

      // Reveal correct cell in green
      const correctCellEl = boardEl.querySelector(`.ninja-cell[data-index="${correctIndex}"]`);
      if (correctCellEl) correctCellEl.classList.add('cell-correct');

      registerMistake();
      combo = 1;
      updateStatsUI();

      if (mistakes < maxMistakes) {
        setTimeout(nextQuestion, 1200);
      }
    }
  }

  function nextQuestion() {
    generateQuestion();
    generateGridValues();
    renderBoard();
    startCountdownTimer();
  }

  function registerMistake() {
    mistakes++;
    updateStatsUI();

    if (mistakes >= maxMistakes) {
      triggerGameOver();
    }
  }

  /* ==========================================================================
     Timer Systems
     ========================================================================== */
  // 1. General Game Timer (Time elapsed)
  function startGameTimer() {
    gameTimerInterval = setInterval(() => {
      secondsElapsed++;
      updateTimerUI();
    }, 1000);
  }

  function stopGameTimer() {
    if (gameTimerInterval) {
      clearInterval(gameTimerInterval);
      gameTimerInterval = null;
    }
  }

  function resetGameTimer() {
    stopGameTimer();
    secondsElapsed = 0;
    updateTimerUI();
  }

  function updateTimerUI() {
    const mins = Math.floor(secondsElapsed / 60);
    const secs = secondsElapsed % 60;
    const formatted = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    if (timerValEl) timerValEl.textContent = formatted;
  }

  // 2. Linear Countdown Timer per Question
  function startCountdownTimer() {
    stopCountdownTimer();
    
    totalTicks = secondsPerQuestion * 10; // 10 ticks per second
    ticksRemaining = totalTicks;
    
    if (timerBarEl) {
      timerBarEl.style.width = '100%';
      timerBarEl.style.backgroundColor = 'var(--primary-purple)';
    }

    countdownInterval = setInterval(() => {
      ticksRemaining--;
      const percent = (ticksRemaining / totalTicks) * 100;
      
      if (timerBarEl) {
        timerBarEl.style.width = `${percent}%`;
        // Turn bar red/orange when low on time
        if (percent < 30) {
          timerBarEl.style.backgroundColor = '#F44336';
        } else if (percent < 60) {
          timerBarEl.style.backgroundColor = '#FF9800';
        }
      }

      if (ticksRemaining <= 0) {
        handleTimeout();
      }
    }, 100);
  }

  function stopCountdownTimer() {
    if (countdownInterval) {
      clearInterval(countdownInterval);
      countdownInterval = null;
    }
  }

  function handleTimeout() {
    answered = true;
    stopCountdownTimer();

    // Reveal correct answer in green
    const correctCellEl = boardEl.querySelector(`.ninja-cell[data-index="${correctIndex}"]`);
    if (correctCellEl) {
      correctCellEl.classList.add('cell-correct');
    }

    // Flash board wrapper red slightly
    boardWrapperEl.style.animation = 'shake-effect 0.4s ease';
    setTimeout(() => {
      boardWrapperEl.style.animation = '';
    }, 400);

    registerMistake();
    combo = 1;
    updateStatsUI();

    if (mistakes < maxMistakes) {
      setTimeout(nextQuestion, 1200);
    }
  }

  /* ==========================================================================
     Overlay Controls
     ========================================================================== */
  function triggerGameOver() {
    stopGameTimer();
    stopCountdownTimer();
    if (gameOverOverlay) gameOverOverlay.classList.add('active');
  }

  function triggerVictory() {
    stopGameTimer();
    stopCountdownTimer();
    if (finalScoreEl) finalScoreEl.textContent = score;
    if (victoryOverlay) victoryOverlay.classList.add('active');
    if (window.puzzrooSaveGameResult) {
      window.puzzrooSaveGameResult(score);
    }
  }

  /* ==========================================================================
     Tool Buttons Actions
     ========================================================================== */
  // Hint: highlights the correct answer cell and disables 4 wrong choices
  if (toolHintBtn) {
    toolHintBtn.addEventListener('click', () => {
      if (hintsRemaining <= 0 || answered) return;

      hintsRemaining--;
      updateStatsUI();

      // Highlight correct answer cell briefly
      const correctCellEl = boardEl.querySelector(`.ninja-cell[data-index="${correctIndex}"]`);
      if (correctCellEl) {
        correctCellEl.style.transform = 'scale(1.1)';
        correctCellEl.style.boxShadow = '0 0 15px var(--primary-purple)';
        setTimeout(() => {
          correctCellEl.style.transform = '';
          correctCellEl.style.boxShadow = '';
        }, 1500);
      }

      // Disable 5 wrong cells that are not bombs and not already disabled
      let disabledCount = 0;
      const cells = boardEl.querySelectorAll('.ninja-cell');
      for (let i = 0; i < cells.length; i++) {
        if (i !== correctIndex && !bombIndexes.includes(i) && !cells[i].classList.contains('cell-disabled')) {
          cells[i].classList.add('cell-disabled');
          disabledCount++;
          if (disabledCount >= 5) break;
        }
      }
    });
  }

  // Skip Button: Skips to next question, resets combo, no penalty
  if (toolUndoBtn) {
    toolUndoBtn.addEventListener('click', () => {
      if (answered) return;
      combo = 1;
      updateStatsUI();
      nextQuestion();
    });
  }

  // Restart Button
  if (toolRestartBtn) {
    toolRestartBtn.addEventListener('click', () => {
      startNewGame();
    });
  }

  // Zoom Button
  if (toolZoomBtn) {
    toolZoomBtn.addEventListener('click', () => {
      if (boardWrapperEl) {
        boardWrapperEl.classList.toggle('zoomed');
      }
    });
  }

  // New Game Buttons
  if (newGameBtn) {
    newGameBtn.addEventListener('click', startNewGame);
  }
  if (gameOverRestartBtn) {
    gameOverRestartBtn.addEventListener('click', startNewGame);
  }
  if (victoryNewGameBtn) {
    victoryNewGameBtn.addEventListener('click', startNewGame);
  }

  /* ==========================================================================
     Start the game!
     ========================================================================== */
  startNewGame();
});
