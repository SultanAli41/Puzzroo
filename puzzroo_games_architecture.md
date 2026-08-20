# Puzzroo Game Suite - Architecture & Function Directory

This document provides a complete, low-level guide to the files, logic, state variables, and functions of all five games in the **Puzzroo** application. It details how they boot, render their game boards, capture inputs, handle moves, and trigger victory or defeat overlays.

---

## 1. Nonogram (Picture Cross Puzzle)

### Files
* **HTML Wrapper:** [game-nonogram.html](file:///C:/Users/User/Desktop/Nevon/Puzzroo/game-nonogram.html)
* **JavaScript Logic:** [nonogram.js](file:///C:/Users/User/Desktop/Nevon/Puzzroo/assets/js/nonogram.js)

### Gameplay Overview
The player must reveal a hidden grid picture on a 5x5 board by filling in cells or marking them with an 'X' (empty space) based on numerical hints provided for each row and column.

### Core State Variables
* `solvedBoard`: A 5x5 binary array indicating the target puzzle solution (1 = filled, 0 = empty).
* `currentBoard`: A 5x5 array representing the player's board (0 = empty, 1 = filled, 2 = 'X' block).
* `rowHints` / `colHints`: Arrays containing the sets of continuous filled cell groups for each row and column.
* `score`: Current game score (starts at 0; +10 points for correct moves, plus bonuses at completion).
* `mistakes`: Number of incorrect moves made (maximum of 3).
* `hintsRemaining`: Count of remaining hints available to reveal a correct cell (starts at 3).
* `undoStack`: Array storing previous copies of `currentBoard` for reverting moves.
* `secondsElapsed`: Total duration of the game in seconds.
* `difficulty`: Game level (`easy`, `medium`, or `hard`), parsed from the URL parameter.

### Function Directory

#### `generateRandomPuzzle()`
Generates a random 5x5 binary board. 
* **Details:** Uses a probability coefficient based on difficulty to determine the ratio of filled cells (`0.55` for easy, `0.60` for medium, `0.65` for hard). It validates the board density, ensuring it has between 6 and 19 filled cells for gameplay balance; otherwise, it recursively generates a new grid.

#### `calculateRowHints(board)`
Computes hints for all rows.
* **Details:** Iterates through each row, counting adjacent filled cells (value `1`). Once a block of `1`s is broken by a `0`, it pushes the count to the row's hint list. Returns a list of arrays (e.g. `[[2, 1], [3], [0]]`).

#### `calculateColHints(board)`
Computes hints for all columns.
* **Details:** Similar to `calculateRowHints` but scans columns vertically to assemble arrays of continuous filled counts.

#### `getDifficultyFromURL()`
Parses the current difficulty from `window.location.search`. Returns `'easy'` by default if not set or invalid.

#### `startNewGame()`
Resets state and prepares the board for a new game.
* **Details:** Invokes `generateRandomPuzzle()`, calculates hints, initializes `currentBoard` to all `0`s, empties overlays, resets stats and timer, and calls `renderBoardGrid()`.

#### `updateStatsUI()`
Updates score, mistakes (`mistakes/maxMistakes`), and hint count labels in the DOM.

#### `renderBoardGrid()`
Builds the visual interface for the 5x5 puzzle and hints.
* **Details:** Clears the main board container. It renders:
  1. A top-left blank corner element.
  2. Column hint divs populated with hint numbers.
  3. Five rows, each containing a row hint div followed by five clickable cells.
  * Adds event listeners for clicks (left click/tap to attempt fill) and right-clicks/double-clicks (to place X).

#### `handleCellClick(r, c)`
Triggered when a cell is clicked.
* **Details:** If the cell was already filled or crossed out, it toggles it back to empty. If it was empty, it compares the coordinate to `solvedBoard[r][c]`. If it is a match (`1`), `currentBoard[r][c]` is set to `1` (+10 score). If it is a mistake, it sets it to `2` ('X') and calls `registerMistake(r, c)`. Finally, updates UI and checks victory.

#### `handleCellRightClick(r, c)`
Triggered on cell right-click or double-tap.
* **Details:** Toggles cell to empty if already marked. If empty, it attempts to place an 'X'. If the cell is indeed empty in `solvedBoard` (`0`), it sets `currentBoard[r][c]` to `2` (+10 score). If a mistake, it fills it with `1` and calls `registerMistake(r, c)`.

#### `registerMistake(r, c)`
Increments the mistake count and triggers a temporary visual red highlight class (`cell-error`) on the cell. If mistakes reach 3, calls `triggerGameOver()`.

#### `checkGameProgress()`
Checks if all cells marked `1` in `solvedBoard` are successfully matched with `1` in `currentBoard`. If true, calls `triggerVictory()`.

#### `recalculateScore()`
Recalculates the user's score from scratch based on the entire grid state, matching correct entries. Used primarily after an undo action.

#### `triggerGameOver()`
Stops the game timer and shows the `#game-over-overlay`.

#### `triggerVictory()`
Stops the timer, fills all remaining empty cells with X, adds completion and speed bonuses (based on difficulty and seconds elapsed), and shows `#victory-overlay`.

---

## 2. Number Ninja (Fast-Paced Word/Math Game)

### Files
* **HTML Wrapper:** [game-ninja.html](file:///C:/Users/User/Desktop/Nevon/Puzzroo/game-ninja.html)
* **JavaScript Logic:** [ninja.js](file:///C:/Users/User/Desktop/Nevon/Puzzroo/assets/js/ninja.js)

### Gameplay Overview
A fast-paced arithmetic game. The user is presented with a math equation (addition, subtraction, multiplication, division) and a 5x5 grid of numbers. The user must find and click the correct answer within a short ticking countdown window while avoiding dynamic bomb cells.

### Core State Variables
* `currentQuestion`: Object holding the formula string (`equation`) and correct integer (`answer`).
* `difficulty`: Game level dictating equation operators and question time limit.
* `solvedCount`: Current count of solved math equations (must reach 15 to win).
* `combo`: Multiplier that increments with consecutive correct answers and resets to 1 on mistakes or time-outs.
* `gridValues`: Array of 25 numbers displayed in the grid (contains 1 correct value and 24 distractors).
* `bombIndexes`: List of cell indices designated as bomb cells (instantly record mistakes).
* `ticksRemaining`: Countdown ticks left for the active question.
* `secondsElapsed`: Total active play duration.

### Function Directory

#### `startNewGame()`
Sets question timeouts based on difficulty (10s for easy, 8s for medium, 5s for hard). Resets statistics, triggers the global elapsed timer, and starts the loop with `nextQuestion()`.

#### `generateQuestion()`
Constructs a random arithmetic problem.
* **Details:** Chooses operators based on difficulty (`+` and `-` for easy; adds `×` for medium; adds `÷` for hard). It generates operands ensuring division matches result in whole numbers and subtraction results are positive. Computes the target answer.

#### `generateGridValues()`
Populates the list of 25 choices.
* **Details:** Adds the correct answer, then generates 24 unique distractor numbers (answer +/- a random offset). It shuffles the array, saves the position of the correct answer, and assigns 0 to 2 bomb positions depending on difficulty.

#### `renderBoard()`
Dynamically clears the grid and appends 25 cell elements.
* **Details:** If a cell index is in `bombIndexes`, it appends a bomb icon (`💣`). Otherwise, it renders the distractor or answer number. Adds click listeners.

#### `handleCellClick(index)`
Processes user selection.
* **Details:** If a bomb is clicked, highlights it red, applies a mistake penalty, resets combo, and transitions to `nextQuestion()`. If the correct answer is selected, colors the cell green, increases score (multiplied by the combo multiplier), increments `solvedCount`, and checks for victory. If a wrong number is selected, reveals the correct one in green, highlights the wrong one in red, penalizes, and advances.

#### `nextQuestion()`
Resets question states, triggers calculation logic, updates DOM elements, and starts the countdown bar via `startCountdownTimer()`.

#### `startCountdownTimer()`
Fires every 100 milliseconds. Shrinks the width of the `#ninja-timer-bar` from `100%` down to `0%`. Changes the bar color to orange (<60%) and red (<30%). If the progress reaches zero, it calls `handleTimeout()`.

#### `handleTimeout()`
Acts as a mistake. Highlights the correct cell in green, plays a screen shake animation, increments mistakes, resets combo, and schedules `nextQuestion()` after a short delay.

---

## 3. Crossword (Grid Word Puzzle)

### Files
* **HTML Wrapper:** [game-crossword.html](file:///C:/Users/User/Desktop/Nevon/Puzzroo/game-crossword.html)
* **JavaScript Logic:** [crossword.js](file:///C:/Users/User/Desktop/Nevon/Puzzroo/assets/js/crossword.js)

### Gameplay Overview
A standard crossword puzzle rendered on a 5x5 board. Black cells act as boundaries. Playable cells contain hidden target letters. The user selects cells or clues from the list, typing responses either using physical or virtual keyboard buttons.

### Core State Variables
* `puzzles`: Static JSON database storing board grids, solutions, row/column word tracking IDs, and text clues for easy/medium/hard layouts.
* `currentPuzzle`: Deep-copied clone of the active puzzle object from the database.
* `selectedCell`: Coordinates of the currently highlighted cell (`{r, c}`).
* `activeDirection`: Input orientation, either `'across'` or `'down'`.
* `undoStack`: History list storing previous values and positions (`{r, c, val}`) for undo support.

### Function Directory

#### `startNewGame()`
Resets game values, makes a deep copy of the puzzle layout for the selected difficulty level, clears overlays, triggers timers, and invokes `renderBoard()` and `populateCluesList()`.

#### `renderBoard()`
Loops through the 5x5 grid.
* **Details:** Builds cells. Block cells get `.block-cell`. Playable cells receive row/column attributes, a top-left number (e.g. clue numbers like `1`, `4`), and any user-entered text (`userVal`). Applies selective styling classes: `.selected` for the active cell, and `.word-highlighted` for neighboring cells belonging to the same word direction.

#### `selectCell(r, c)`
Selects a cell. If clicked on the already-selected cell, it toggles `activeDirection` between `'across'` and `'down'`. Otherwise, sets the coordinate and determines which direction fits the clues.

#### `populateCluesList()`
Fills the left-hand and right-hand side text lists (`#across-clues` and `#down-clues`) with the corresponding number and clue text. Adds click events to select clues from the list.

#### `selectClue(id, dir)`
Focuses the board on a specific clue. Finds the first playable cell associated with the chosen clue ID, sets it as the `selectedCell`, updates the direction, and updates the board view.

#### `updateActiveClueHighlight()`
Highlights the clue item corresponding to the active cell in the sidebar lists, scrolls it into view, and updates the text banner above the grid.

#### `handleLetterInput(letter)`
Handles keyboard inputs.
* **Details:** Sanitizes the key to uppercase. If the value matches the correct solution, it increments the score, checks for overall victory, and advances the cursor using `autoAdvance()`. If the entry is incorrect, it triggers `registerMistake(r, c)`.

#### `autoAdvance()` / `autoMoveBackwards()`
Moves the `selectedCell` cursor forward or backward along the current word line, skipping black blocks.

#### `handleErase()`
Deletes the active cell's value. If the cell was already empty, it moves the cursor backward to the previous cell.

---

## 4. Dots Match (Adjacency Matching Game)

### Files
* **HTML Wrapper:** [game-dotsmatch.html](file:///C:/Users/User/Desktop/Nevon/Puzzroo/game-dotsmatch.html)
* **JavaScript Logic:** [dotsmatch.js](file:///C:/Users/User/Desktop/Nevon/Puzzroo/assets/js/dotsmatch.js)

### Gameplay Overview
The player connects adjacent dots of the same color by dragging lines. Formed paths clear the dots, allowing gravity to drop down replacement dots from the top of the grid. Connecting a path that loops back onto itself clears all dots of that color from the board.

### Core State Variables
* `grid`: 5x5 array storing the color string of each cell (`'purple'`, `'orange'`, `'mint'`, `'pink'`, `'blue'`, or `null`).
* `selectedPath`: Array of objects (`{r, c, color}`) representing the current drag selection path.
* `isDragging`: Boolean flag indicating whether mouse/touch drag is active.
* `isLoop`: Boolean flag indicating if the path loops back on itself.

### Function Directory

#### `generateBoard()`
Initializes the grid with random colors. It checks if there is at least one valid starting move (two adjacent dots of the same color) using `hasValidMoves()`. If not, it regenerates the board recursively.

#### `hasValidMoves()`
Scans the grid and checks if any cell has a matching neighbor to its right or bottom. Returns `true` if a match exists.

#### `renderBoard()`
Populates the board with dot elements matching their color name classes. If the cell is in `selectedPath`, applies a `.selected` class. Refreshes the SVG overlay coordinates.

#### `handleStart(r, c, e)`
Initializes drag operations on mouse-down or touch-start. Adds the starting coordinate to `selectedPath`.

#### `handleEnter(r, c)`
Fires when the drag cursor moves over a cell.
* **Details:** Verifies color consistency. If the user moves over a different color, triggers a mistake, shakes the board, and cancels the drag. Checks if the coordinate is adjacent (diagonal connections are disallowed and trigger mistakes). Handles backtracking to the second-to-last cell to shrink the path. If dragging onto the starting node, it sets `isLoop = true`.

#### `handleRelease()`
Triggered on mouse-up or touch-end.
* **Details:** If the path has at least 2 dots, the move is submitted. If `isLoop` is true, clears all occurrences of that color from the board (generating $+15$ score per cell). If it's a simple path, clears only path cells ($+10$ points each). Calls `applyGravity()` to update the board, validates moves, and clears temporary lines.

#### `applyGravity()`
Pulls remaining dots down to empty spots.
* **Details:** Scans each column from bottom to top. It shifts non-empty cells down to fill empty spaces (`null`). Then, refills the top empty spots with new random dots.

#### `drawPathLines()`
Draws SVG connection lines on `#dots-svg-overlay`.
* **Details:** Translates cell grid indices (`r`, `c`) into pixel coordinates relative to cell dimensions. Draws lines between each consecutive step in `selectedPath`. If `isLoop` is true, connects the last step back to the first.

---

## 5. Kakuro (Cross-Addition Grid Puzzle)

### Files
* **HTML Wrapper:** [game-kakuro.html](file:///C:/Users/User/Desktop/Nevon/Puzzroo/game-kakuro.html)
* **JavaScript Logic:** [kakuro.js](file:///C:/Users/User/Desktop/Nevon/Puzzroo/assets/js/kakuro.js)

### Gameplay Overview
A cross-sum grid math puzzle. The board consists of block cells, clue cells (which show target sums for their corresponding rows and/or columns), and playable white cells. The player selects white cells and inputs digits from 1 to 9 to satisfy all sum constraints without repeating digits within a run.

### Core State Variables
* `puzzles`: Layout database containing coordinates, target values, clue numbers, and block layouts for each difficulty level.
* `currentPuzzle`: Current active puzzle clone.
* `selectedCell`: Selected white cell coordinates (`{r, c}`).

### Function Directory

#### `startNewGame()`
Resets score and mistakes. Clones the selected Kakuro database puzzle layout, clears overlays, resets timers, and calls `renderBoard()`.

#### `renderBoard()`
Populates the board container:
* **Block cells:** Receives the `.block-cell` class.
* **Clue cells:** Receives the `.clue-cell` class. Renders a diagonal slash SVG. Appends row clues (top-right text) and column clues (bottom-left text) when applicable.
* **White cells:** Receives the `.white-cell` class. Renders user-entered numbers. If a cell is active, adds the `.selected` class. Adds click listeners.

#### `handleInput(val)`
Processes inputs from the physical or on-screen keypad.
* **Details:** If `val` is `'clear'`, empties the cell. Otherwise, parses the input as an integer ($1-9$). If it matches the correct solution, adds $+100$ to the score and checks for victory. If incorrect, triggers `registerMistake(r, c)`.

#### `registerMistake(r, c)`
Increments the mistake count and triggers a temporary visual red highlight class (`cell-error`) on the cell. If mistakes reach 3, calls `triggerGameOver()`.

#### `checkVictory()`
Verifies if all white cells have values matching their target solutions. If true, calls `triggerVictory()`.

#### `handleArrowNavigation(key)`
Moves the `selectedCell` coordinate around using the arrow keys, wrapping at boundaries and skipping block/clue cells.

---

## 6. Shared Architecture Patterns

### 1. Theme Synced Headers
All game templates contain an inline script block in their headers:
```javascript
(function() {
  const savedTheme = localStorage.getItem('puzzroo-theme');
  const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  const theme = savedTheme ? savedTheme : systemTheme;
  document.documentElement.setAttribute('data-theme', theme);
  document.body.classList.add(theme === 'dark' ? 'dark-mode' : 'light-mode');
})();
```
This reads the active theme preference directly from browser storage prior to rendering body content, preventing theme flashing.

### 2. Difficulty Parameter Parsing
Games extract their starting configuration from the URL query parameters (e.g., `lobby-nonogram.html?difficulty=hard` loads `game-nonogram.html?difficulty=hard`):
```javascript
const params = new URLSearchParams(window.location.search);
const diff = params.get('difficulty'); // 'easy', 'medium', or 'hard'
```

### 3. Undo Stack Implementation
Moves are logged using deep-copied grid snapshots:
```javascript
let undoStack = [];
function pushToUndoStack() {
  undoStack.push(currentBoard.map(row => [...row])); // deep clones array
}
```
When clicking the undo button, the last state is popped and loaded, and the score is recalculated.
