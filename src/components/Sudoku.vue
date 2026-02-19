<script setup>
import { ref, computed, reactive, onMounted, onUnmounted } from 'vue';

// =============================================
//  Sudoku puzzle logic
// =============================================

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function isValid(board, idx, num) {
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    if (board[row * 9 + i] === num) return false;
    if (board[i * 9 + col] === num) return false;
    const br = boxRow + Math.floor(i / 3);
    const bc = boxCol + (i % 3);
    if (board[br * 9 + bc] === num) return false;
  }
  return true;
}

function generateSolution() {
  const board = Array(81).fill(0);

  function bt(pos) {
    if (pos === 81) return true;
    const nums = shuffle([1, 2, 3, 4, 5, 6, 7, 8, 9]);
    for (const n of nums) {
      if (isValid(board, pos, n)) {
        board[pos] = n;
        if (bt(pos + 1)) return true;
        board[pos] = 0;
      }
    }
    return false;
  }

  bt(0);
  return board;
}

function countSolutions(board, limit = 2) {
  const b = [...board];
  let count = 0;

  function bt() {
    if (count >= limit) return;
    const empty = b.indexOf(0);
    if (empty === -1) { count++; return; }
    for (let n = 1; n <= 9; n++) {
      if (isValid(b, empty, n)) {
        b[empty] = n;
        bt();
        b[empty] = 0;
      }
    }
  }

  bt();
  return count;
}

function generatePuzzle(difficulty) {
  const solution = generateSolution();
  const puzzle = [...solution];

  const initialCluesByDifficulty = { easy: 38, medium: 30, hard: 24 };
  const target = initialCluesByDifficulty[difficulty] ?? 30;
  const toRemove = 81 - target;

  const indices = shuffle([...Array(81).keys()]);
  let removed = 0;

  for (const idx of indices) {
    if (removed >= toRemove) break;
    const backup = puzzle[idx];
    puzzle[idx] = 0;
    if (countSolutions(puzzle) === 1) {
      removed++;
    } else {
      puzzle[idx] = backup;
    }
  }

  return { puzzle, solution };
}

function computeCandidates(board, idx) {
  const cands = new Set([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  const boxRow = Math.floor(row / 3) * 3;
  const boxCol = Math.floor(col / 3) * 3;

  for (let i = 0; i < 9; i++) {
    cands.delete(board[row * 9 + i]);
    cands.delete(board[i * 9 + col]);
    const br = boxRow + Math.floor(i / 3);
    const bc = boxCol + (i % 3);
    cands.delete(board[br * 9 + bc]);
  }
  return cands;
}

// =============================================
//  Component state
// =============================================

const MAX_HISTORY_SIZE = 200;

const HIGHLIGHT_COLORS = [
  { label: 'None',   value: '' },
  { label: 'Red',    value: '#d98282' },
  { label: 'Yellow', value: '#d6c178' },
  { label: 'Green',  value: '#7da889' },
  { label: 'Blue',   value: '#7f9fbe' },
  { label: 'Purple', value: '#9e89b7' },
  { label: 'Orange', value: '#c99571' },
];

function makeCell(value = null, given = false) {
  return {
    value,
    given,
    cornerCandidates: new Set(),
    middleCandidates: new Set(),
    antiCandidates: new Set(),
    highlight: '',
    isError: false,
  };
}

const cells = reactive(Array.from({ length: 81 }, () => makeCell()));
const solution = ref([]);
const selectedCells = ref(new Set());
const inputMode = ref('normal'); // 'normal' | 'corner' | 'middle' | 'anti' | 'color'
const selectedColor = ref('');
const history = ref([]);
const difficulty = ref('medium');
const generating = ref(false);
const gameWon = ref(false);

let isDragging = false;

// =============================================
//  Puzzle management
// =============================================

async function newGame(diff = difficulty.value) {
  difficulty.value = diff;
  generating.value = true;
  gameWon.value = false;
  selectedCells.value = new Set();

  // Defer to next tick so the UI updates with the spinner
  await new Promise(resolve => setTimeout(resolve, 20));

  const result = generatePuzzle(diff);
  solution.value = result.solution;
  history.value = [];

  for (let i = 0; i < 81; i++) {
    const v = result.puzzle[i];
    cells[i].value = v || null;
    cells[i].given = v !== 0;
    cells[i].cornerCandidates = new Set();
    cells[i].middleCandidates = new Set();
    cells[i].antiCandidates = new Set();
    cells[i].highlight = '';
    cells[i].isError = false;
  }

  generating.value = false;
  checkErrors();
}

function checkErrors() {
  for (let i = 0; i < 81; i++) cells[i].isError = false;

  for (let i = 0; i < 81; i++) {
    if (!cells[i].value) continue;
    const rowI = Math.floor(i / 9);
    const colI = i % 9;
    const boxI = Math.floor(rowI / 3) * 3 + Math.floor(colI / 3);

    for (let j = i + 1; j < 81; j++) {
      if (!cells[j].value) continue;
      if (cells[i].value !== cells[j].value) continue;
      const rowJ = Math.floor(j / 9);
      const colJ = j % 9;
      const boxJ = Math.floor(rowJ / 3) * 3 + Math.floor(colJ / 3);

      if (rowI === rowJ || colI === colJ || boxI === boxJ) {
        cells[i].isError = true;
        cells[j].isError = true;
      }
    }
  }

  if (cells.every(c => c.value !== null) && cells.every(c => !c.isError)) {
    gameWon.value = true;
  }
}

// =============================================
//  History / undo
// =============================================

function saveHistory() {
  const snap = cells.map(c => ({
    value: c.value,
    given: c.given,
    cornerCandidates: new Set(c.cornerCandidates),
    middleCandidates: new Set(c.middleCandidates),
    antiCandidates: new Set(c.antiCandidates),
    highlight: c.highlight,
    isError: c.isError,
  }));
  history.value.push(snap);
  if (history.value.length > MAX_HISTORY_SIZE) history.value.shift();
}

function undo() {
  if (history.value.length === 0) return;
  const snap = history.value.pop();
  snap.forEach((s, i) => {
    cells[i].value = s.value;
    cells[i].given = s.given;
    cells[i].cornerCandidates = new Set(s.cornerCandidates);
    cells[i].middleCandidates = new Set(s.middleCandidates);
    cells[i].antiCandidates = new Set(s.antiCandidates);
    cells[i].highlight = s.highlight;
    cells[i].isError = s.isError;
  });
  gameWon.value = false;
}

// =============================================
//  Input handling
// =============================================

function applyInput(idx, num) {
  if (cells[idx].given) return;

  if (inputMode.value === 'normal') {
    cells[idx].value = cells[idx].value === num ? null : num;
  } else if (inputMode.value === 'corner') {
    if (cells[idx].value) return;
    cells[idx].cornerCandidates.has(num)
      ? cells[idx].cornerCandidates.delete(num)
      : cells[idx].cornerCandidates.add(num);
  } else if (inputMode.value === 'middle') {
    if (cells[idx].value) return;
    cells[idx].middleCandidates.has(num)
      ? cells[idx].middleCandidates.delete(num)
      : cells[idx].middleCandidates.add(num);
  } else if (inputMode.value === 'anti') {
    if (cells[idx].value) return;
    cells[idx].antiCandidates.has(num)
      ? cells[idx].antiCandidates.delete(num)
      : cells[idx].antiCandidates.add(num);
  }
}

function applyErase(idx) {
  if (cells[idx].given) return;
  if (inputMode.value === 'normal') {
    cells[idx].value = null;
  } else if (inputMode.value === 'corner') {
    cells[idx].cornerCandidates.clear();
  } else if (inputMode.value === 'middle') {
    cells[idx].middleCandidates.clear();
  } else if (inputMode.value === 'anti') {
    cells[idx].antiCandidates.clear();
  }
}

function inputNumber(num) {
  if (selectedCells.value.size === 0) return;
  saveHistory();
  for (const idx of selectedCells.value) applyInput(idx, num);
  checkErrors();
}

function erase() {
  if (selectedCells.value.size === 0) return;
  saveHistory();
  for (const idx of selectedCells.value) applyErase(idx);
  checkErrors();
}

// =============================================
//  Mouse interaction
// =============================================

function handleCellMouseDown(idx, event) {
  event.preventDefault();
  isDragging = true;

  if (event.shiftKey || event.ctrlKey || event.metaKey) {
    if (selectedCells.value.has(idx)) {
      const next = new Set(selectedCells.value);
      next.delete(idx);
      selectedCells.value = next;
    } else {
      selectedCells.value = new Set([...selectedCells.value, idx]);
    }
  } else {
    selectedCells.value = new Set([idx]);
  }
}

function handleCellMouseEnter(idx) {
  if (isDragging) {
    selectedCells.value = new Set([...selectedCells.value, idx]);
  }
}

function handleMouseUp() {
  isDragging = false;
}

// =============================================
//  Keyboard interaction
// =============================================

function handleKeyDown(event) {
  if (selectedCells.value.size === 0) return;

  const key = event.key;

  if (/^[1-9]$/.test(key)) {
    inputNumber(parseInt(key));
    return;
  }

  if (key === 'Delete' || key === 'Backspace') {
    erase();
    return;
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
    event.preventDefault();
    const last = [...selectedCells.value][selectedCells.value.size - 1];
    if (last === undefined) return;
    const row = Math.floor(last / 9);
    const col = last % 9;
    let newIdx = last;

    if (key === 'ArrowUp' && row > 0) newIdx = (row - 1) * 9 + col;
    if (key === 'ArrowDown' && row < 8) newIdx = (row + 1) * 9 + col;
    if (key === 'ArrowLeft' && col > 0) newIdx = row * 9 + (col - 1);
    if (key === 'ArrowRight' && col < 8) newIdx = row * 9 + (col + 1);

    if (event.shiftKey) {
      selectedCells.value = new Set([...selectedCells.value, newIdx]);
    } else {
      selectedCells.value = new Set([newIdx]);
    }
  }

  if (key === 'z' && (event.ctrlKey || event.metaKey)) {
    event.preventDefault();
    undo();
  }
}

// =============================================
//  Auto-candidates
// =============================================

function autoFillCandidates() {
  saveHistory();
  const board = cells.map(c => c.value ?? 0);
  for (let i = 0; i < 81; i++) {
    if (!cells[i].value) {
      cells[i].cornerCandidates = computeCandidates(board, i);
    }
  }
}

// =============================================
//  Hint
// =============================================

function giveHint() {
  if (solution.value.length === 0) return;

  // Prefer a selected empty non-given cell, then any empty non-given cell
  const pool = [...selectedCells.value].filter(i => !cells[i].given && !cells[i].value);
  const idx = pool.length > 0
    ? pool[0]
    : cells.findIndex(c => !c.given && !c.value);

  if (idx === -1) return;
  saveHistory();
  cells[idx].value = solution.value[idx];
  cells[idx].cornerCandidates.clear();
  cells[idx].middleCandidates.clear();
  cells[idx].antiCandidates.clear();
  checkErrors();
}

// =============================================
//  Color highlighting
// =============================================

function applyColor(color) {
  if (selectedCells.value.size === 0) return;
  saveHistory();
  for (const idx of selectedCells.value) {
    cells[idx].highlight = color;
  }
}

// =============================================
//  Cell class helpers
// =============================================

function cellClass(idx) {
  const row = Math.floor(idx / 9);
  const col = idx % 9;
  return {
    'cell-selected': selectedCells.value.has(idx),
    'cell-given': cells[idx].given,
    'cell-error': cells[idx].isError,
    'box-right': col === 2 || col === 5,
    'box-bottom': row === 2 || row === 5,
    'box-left': col === 0,
    'box-top': row === 0,
  };
}

function cellStyle(idx) {
  return cells[idx].highlight ? { backgroundColor: cells[idx].highlight } : {};
}

// =============================================
//  Computed
// =============================================

const canUndo = computed(() => history.value.length > 0);

// =============================================
//  Lifecycle
// =============================================

onMounted(() => {
  window.addEventListener('mouseup', handleMouseUp);
  window.addEventListener('keydown', handleKeyDown);
  newGame('medium');
});

onUnmounted(() => {
  window.removeEventListener('mouseup', handleMouseUp);
  window.removeEventListener('keydown', handleKeyDown);
});
</script>

<template>
  <div class="sudoku-app" @mousedown.self="selectedCells = new Set()">
    <!-- Header / nav -->
    <nav class="sudoku-nav">
      <a href="/" class="nav-back">← Cookie Clicker</a>
      <span class="nav-title">Sudoku</span>
    </nav>

    <!-- Generating overlay -->
    <div v-if="generating" class="generating-overlay">
      <div class="spinner"></div>
      <p>Generating puzzle…</p>
    </div>

    <!-- Win banner -->
    <Transition name="win-fade">
      <div v-if="gameWon" class="win-banner">
        🎉 Puzzle Solved! 🎉
        <button class="btn btn-primary" @click="newGame(difficulty)">New Game</button>
      </div>
    </Transition>

    <div class="sudoku-layout">
      <!-- ========== Grid ========== -->
      <div class="grid-wrapper">
        <div
          class="sudoku-grid"
          @mousedown.prevent
        >
          <div
            v-for="idx in 81"
            :key="idx - 1"
            class="cell"
            :class="cellClass(idx - 1)"
            :style="cellStyle(idx - 1)"
            @mousedown="handleCellMouseDown(idx - 1, $event)"
            @mouseenter="handleCellMouseEnter(idx - 1)"
          >
            <!-- Given / player value -->
            <span
              v-if="cells[idx - 1].value"
              class="cell-value"
              :class="{ 'cell-value-given': cells[idx - 1].given }"
            >{{ cells[idx - 1].value }}</span>

            <!-- Candidates (only shown when cell has no value) -->
            <template v-else>
              <!-- Corner candidates: 3x3 positional grid -->
              <div class="corner-grid">
                <span
                  v-for="n in 9"
                  :key="n"
                  class="corner-num"
                  :class="{ 'corner-visible': cells[idx - 1].cornerCandidates.has(n) }"
                >{{ cells[idx - 1].cornerCandidates.has(n) ? n : '' }}</span>
              </div>

              <!-- Middle candidates: centered compact list -->
              <div
                v-if="cells[idx - 1].middleCandidates.size > 0"
                class="middle-cands"
              >
                {{ [...cells[idx - 1].middleCandidates].sort((a, b) => a - b).join('') }}
              </div>

              <!-- Anti-candidates: red strikethrough at bottom -->
              <div
                v-if="cells[idx - 1].antiCandidates.size > 0"
                class="anti-cands"
              >
                <span
                  v-for="n in [...cells[idx - 1].antiCandidates].sort((a, b) => a - b)"
                  :key="n"
                  class="anti-num"
                >{{ n }}</span>
              </div>
            </template>
          </div>
        </div>
      </div>

      <!-- ========== Controls ========== -->
      <div class="controls">
        <!-- New game -->
        <div class="control-section">
          <h3 class="section-label">New Game</h3>
          <div class="btn-group">
            <button
              v-for="d in ['easy', 'medium', 'hard']"
              :key="d"
              class="btn"
              :class="{ 'btn-active': difficulty === d }"
              @click="newGame(d)"
            >{{ d.charAt(0).toUpperCase() + d.slice(1) }}</button>
          </div>
        </div>

        <!-- Input mode -->
        <div class="control-section">
          <h3 class="section-label">Input Mode</h3>
          <div class="mode-btns">
            <button
              v-for="m in [
                { id: 'normal', label: 'Normal', icon: '✏️' },
                { id: 'corner', label: 'Corner', icon: '↗' },
                { id: 'middle', label: 'Center', icon: '⊙' },
                { id: 'anti',   label: 'Anti',   icon: '✕' },
                { id: 'color',  label: 'Color',  icon: '🎨' },
              ]"
              :key="m.id"
              class="btn mode-btn"
              :class="{ 'btn-active': inputMode === m.id }"
              @click="inputMode = m.id"
              :title="m.label"
            >
              <span class="mode-icon">{{ m.icon }}</span>
              <span class="mode-label">{{ m.label }}</span>
            </button>
          </div>
        </div>

        <!-- Color picker (shown in color mode) -->
        <div v-if="inputMode === 'color'" class="control-section">
          <h3 class="section-label">Highlight Color</h3>
          <div class="color-picker">
            <button
              v-for="c in HIGHLIGHT_COLORS"
              :key="c.value"
              class="color-swatch"
              :class="{ 'swatch-active': selectedColor === c.value }"
              :style="c.value ? { backgroundColor: c.value } : {}"
              :title="c.label"
              @click="selectedColor = c.value; applyColor(c.value)"
            >
              <span v-if="!c.value" class="swatch-none">✕</span>
            </button>
          </div>
        </div>

        <!-- Number pad -->
        <div class="control-section">
          <h3 class="section-label">Numbers</h3>
          <div class="numpad">
            <button
              v-for="n in 9"
              :key="n"
              class="btn num-btn"
              @click="inputNumber(n)"
            >{{ n }}</button>
            <button class="btn erase-btn" @click="erase">⌫ Erase</button>
          </div>
        </div>

        <!-- Actions -->
        <div class="control-section">
          <h3 class="section-label">Actions</h3>
          <div class="action-btns">
            <button class="btn" @click="autoFillCandidates" title="Fill corner candidates with all possible numbers">
              🔍 Auto Candidates
            </button>
            <button class="btn" @click="giveHint" title="Reveal a cell">
              💡 Hint
            </button>
            <button class="btn" :disabled="!canUndo" @click="undo" title="Undo last action (Ctrl+Z)">
              ↩ Undo
            </button>
          </div>
        </div>

        <!-- Legend -->
        <div class="control-section legend">
          <h3 class="section-label">Legend</h3>
          <ul class="legend-list">
            <li><span class="leg-icon">↗</span> Corner — possible numbers</li>
            <li><span class="leg-icon">⊙</span> Center — possible numbers</li>
            <li><span class="leg-icon leg-anti">✕</span> Anti — impossible numbers</li>
            <li><span class="leg-icon">🎨</span> Color — highlight cells</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* =============================================
   Layout
   ============================================= */

.sudoku-app {
  --sudoku-grid-border: var(--color-text-secondary, #999);
  --sudoku-cell-border: var(--color-border, #333);
  --sudoku-selection: rgba(90, 168, 126, 0.28);
  --sudoku-error: rgba(160, 64, 64, 0.26);
  --sudoku-hover: rgba(255, 255, 255, 0.04);
  --sudoku-control-hover: var(--color-surface, #1e1e1e);
  --sudoku-accent-bg: rgba(90, 168, 126, 0.2);
  --sudoku-accent-bg-hover: rgba(90, 168, 126, 0.28);

  min-height: 100vh;
  background: var(--color-bg, #141414);
  color: var(--color-text-primary, #e8e8e8);
  display: flex;
  flex-direction: column;
  user-select: none;
}

.sudoku-nav {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: var(--color-surface, #16213e);
  border-bottom: 1px solid var(--color-border, #333);
}

.nav-back {
  color: var(--color-text-secondary, #aaa);
  text-decoration: none;
  font-size: 0.9rem;
}

.nav-back:hover { color: var(--color-text-primary, #e0e0e0); }

.nav-title {
  font-weight: 700;
  font-size: 1.2rem;
  letter-spacing: 0.05em;
}

.sudoku-layout {
  display: flex;
  flex-wrap: wrap;
  gap: 2rem;
  justify-content: center;
  align-items: flex-start;
  padding: 2rem 1.5rem;
  flex: 1;
}

/* =============================================
   Grid
   ============================================= */

.grid-wrapper {
  position: relative;
}

.sudoku-grid {
  display: grid;
  grid-template-columns: repeat(9, 1fr);
  border: 2px solid var(--sudoku-grid-border);
  border-radius: 4px;
  overflow: hidden;
  width: min(504px, 90vw);
  height: min(504px, 90vw);
}

/* Cell base */
.cell {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--sudoku-cell-border);
  cursor: pointer;
  transition: background-color 0.08s ease;
  aspect-ratio: 1;
  overflow: hidden;
}

.cell:hover { background-color: var(--sudoku-hover); }
.cell-selected { background-color: var(--sudoku-selection) !important; }
.cell-error { background-color: var(--sudoku-error) !important; }

/* Box borders — thick borders between 3×3 boxes */
.box-right  { border-right:  2px solid var(--sudoku-grid-border); }
.box-bottom { border-bottom: 2px solid var(--sudoku-grid-border); }

/* Cell value */
.cell-value {
  font-size: clamp(16px, 3.5vw, 26px);
  font-weight: 500;
  color: var(--color-accent, #5aa87e);
  line-height: 1;
  z-index: 1;
}

.cell-value-given {
  color: var(--color-text-primary, #e8e8e8);
  font-weight: 700;
}

.cell-error .cell-value { color: var(--color-danger, #a04040); }

/* =============================================
   Corner candidates (3×3 positional grid)
   ============================================= */

.corner-grid {
  position: absolute;
  inset: 0;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  grid-template-rows: repeat(3, 1fr);
  pointer-events: none;
}

.corner-num {
  font-size: clamp(6px, 1.2vw, 9px);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-text-secondary, #999);
  line-height: 1;
  opacity: 0;
}

.corner-visible { opacity: 1; }

/* =============================================
   Middle candidates
   ============================================= */

.middle-cands {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: clamp(7px, 1.5vw, 11px);
  font-weight: 600;
  color: var(--color-accent, #5aa87e);
  pointer-events: none;
  text-align: center;
  padding: 1px;
  z-index: 2;
}

/* =============================================
   Anti-candidates
   ============================================= */

.anti-cands {
  position: absolute;
  bottom: 1px;
  left: 0;
  right: 0;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 0;
  pointer-events: none;
  z-index: 3;
}

.anti-num {
  font-size: clamp(5px, 1vw, 8px);
  color: var(--color-danger, #a04040);
  text-decoration: line-through;
  line-height: 1;
}

/* =============================================
   Generating overlay
   ============================================= */

.generating-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 100;
  gap: 1rem;
  font-size: 1.1rem;
}

.spinner {
  width: 48px;
  height: 48px;
  border: 4px solid rgba(255, 255, 255, 0.15);
  border-top-color: var(--color-accent, #5aa87e);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin { to { transform: rotate(360deg); } }

/* =============================================
   Win banner
   ============================================= */

.win-banner {
  position: fixed;
  top: 80px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  background: var(--color-surface-alt, #282828);
  color: var(--color-text-primary, #e8e8e8);
  border: 1px solid var(--color-accent, #5aa87e);
  padding: 1rem 2rem;
  border-radius: 12px;
  font-size: 1.25rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);
}

.win-fade-enter-active,
.win-fade-leave-active { transition: opacity 0.4s ease, transform 0.4s ease; }
.win-fade-enter-from  { opacity: 0; transform: translateX(-50%) translateY(-20px); }
.win-fade-leave-to    { opacity: 0; transform: translateX(-50%) translateY(-20px); }

/* =============================================
   Controls panel
   ============================================= */

.controls {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  min-width: 220px;
  max-width: 280px;
}

.control-section { display: flex; flex-direction: column; gap: 0.5rem; }

.section-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: var(--color-text-muted, #888);
  margin: 0;
}

/* Generic button */
.btn {
  padding: 0.45rem 0.75rem;
  border: 1px solid var(--color-border, #333);
  border-radius: 6px;
  background: var(--color-surface-alt, #282828);
  color: var(--color-text-primary, #e8e8e8);
  font-size: 0.85rem;
  cursor: pointer;
  transition: background 0.1s ease, border-color 0.1s ease;
}

.btn:hover:not(:disabled) { background: var(--sudoku-control-hover); border-color: var(--color-text-secondary, #999); }
.btn:disabled { opacity: 0.4; cursor: default; }
.btn-active { background: var(--sudoku-accent-bg); border-color: var(--color-accent, #5aa87e); color: var(--color-accent, #5aa87e); }
.btn-primary { background: var(--sudoku-accent-bg); border-color: var(--color-accent, #5aa87e); color: var(--color-text-primary, #e8e8e8); font-weight: 700; }
.btn-primary:hover { background: var(--sudoku-accent-bg-hover); }

.btn-group { display: flex; gap: 0.4rem; }
.btn-group .btn { flex: 1; text-align: center; text-transform: capitalize; }

/* Mode buttons */
.mode-btns {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.3rem;
}

.mode-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 0.4rem 0.2rem;
  font-size: 0.7rem;
}

.mode-icon { font-size: 1rem; }
.mode-label { font-size: 0.65rem; }

/* Color picker */
.color-picker { display: flex; gap: 0.4rem; flex-wrap: wrap; }

.color-swatch {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 2px solid var(--color-border, #333);
  cursor: pointer;
  background: var(--color-surface-alt, #282828);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: border-color 0.1s ease, transform 0.1s ease;
}

.color-swatch:hover { transform: scale(1.15); }
.swatch-active { border-color: var(--color-text-primary, #e8e8e8); transform: scale(1.15); }
.swatch-none { font-size: 0.7rem; color: #888; }

/* Number pad */
.numpad {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.35rem;
}

.num-btn { font-size: 1rem; font-weight: 600; padding: 0.5rem; }
.erase-btn { grid-column: span 3; }

/* Action buttons */
.action-btns { display: flex; flex-direction: column; gap: 0.4rem; }
.action-btns .btn { text-align: left; }

/* Legend */
.legend-list {
  list-style: none;
  margin: 0;
  padding: 0;
  font-size: 0.78rem;
  color: var(--color-text-secondary, #aaa);
  display: flex;
  flex-direction: column;
  gap: 0.3rem;
}

.leg-icon {
  display: inline-block;
  width: 1.4em;
  font-style: normal;
  color: var(--color-accent, #5aa87e);
}

.leg-anti { color: var(--color-danger, #a04040); }

/* =============================================
   Responsive
   ============================================= */

@media (max-width: 600px) {
  .sudoku-layout { padding: 1rem 0.5rem; gap: 1rem; }
  .controls { min-width: unset; max-width: unset; width: 100%; }
  .mode-btns { grid-template-columns: repeat(5, 1fr); }
}
</style>
