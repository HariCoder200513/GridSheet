"use strict";
const ROWS = 100;
const COLS = 26;
const grid = document.querySelector(".grid");
const formulaInput = document.getElementById("formulaInput");
const cellRefDisplay = document.getElementById("cellRef");

const map = new Map();

grid.style.display = "grid";
grid.style.gridTemplateColumns = `repeat(${COLS + 1}, 105px)`;

function colToIndex(col) {
  return col.toUpperCase().charCodeAt(0) - 64;
}

function indexToCol(col) {
  return String.fromCharCode(64 + col);
}

function getCellRef(row, col) {
  return `${indexToCol(col)}${row}`;
}

const tokenizer = new Tokenizer();
const parser = new Parser();
const evaluator = new Evaluator(map);
const depGraph = new DependencyGraph();

function evaluateFormula(expr) {
  if (!expr.startsWith("=")) return expr;
  const formula = expr.slice(1).trim().toUpperCase();
  try {
    const tokens = tokenizer.tokenize(formula);
    const ast = parser.parse(tokens);
    const result = evaluator.evaluate(ast);
    if (typeof result === "string") return result;
    return String(Math.round(result * 1e10) / 1e10);
  } catch {
    return "#ERR!";
  }
}

function getComputedValue(key) {
  const raw = map.get(key);
  if (!raw) return "";
  if (raw.startsWith("=")) return evaluateFormula(raw);
  return raw;
}

function showCellContent(cell, row, col) {
  const key = `${row},${col}`;
  const raw = map.get(key);
  if (raw && raw.startsWith("=")) {
    cell.textContent = getComputedValue(key);
  }
}

function setCellDisplay(cell, row, col) {
  const key = `${row},${col}`;
  cell.textContent = getComputedValue(key);
}

for (let i = 0; i <= ROWS; i++) {
  for (let j = 0; j <= COLS; j++) {
    const cell = document.createElement("div");
    cell.classList.add("cell");
    cell.setAttribute("data-row", i);
    cell.setAttribute("data-col", j);

    if (i === 0 && j === 0) {
      cell.classList.add("header-cell");
    } else if (i === 0) {
      cell.textContent = String.fromCharCode(64 + j);
      cell.classList.add("header-cell");
      cell.style.position = "sticky";
      cell.style.top = "0";
      cell.style.background = "#f1f1f1";
      cell.style.zIndex = "2";
      cell.style.textAlign = "center";
    } else if (j === 0) {
      cell.textContent = i;
      cell.classList.add("header-cell");
      cell.style.position = "sticky";
      cell.style.left = "0";
      cell.style.background = "#f1f1f1";
      cell.style.zIndex = "2";
      cell.style.textAlign = "center";
    } else {
      cell.setAttribute("contenteditable", "true");
      cell.setAttribute("spellcheck", "false");
    }

    grid.appendChild(cell);
  }
}

function findCell(row, col) {
  return grid.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
}

function recalcAffected(changedKey) {
  const affected = depGraph.getAffectedCells(changedKey);

  for (const key of affected) {
    const raw = map.get(key);
    if (raw && raw.startsWith("=")) {
      const [r, c] = key.split(",");
      const cell = findCell(r, c);
      if (cell) setCellDisplay(cell, r, c);
    }
  }
}

grid.addEventListener("keydown", (e) => {
  if (
    !e.target.classList.contains("cell") ||
    !e.target.hasAttribute("contenteditable")
  )
    return;
  const row = +e.target.getAttribute("data-row");
  const col = +e.target.getAttribute("data-col");
  let next;
  if (e.key === "ArrowDown") {
    next = findCell(row + 1, col);
  } else if (e.key === "ArrowUp") {
    next = findCell(row - 1, col);
  } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
    e.preventDefault();
    next = findCell(row, col - 1);
  } else if (e.key === "Enter") {
    e.preventDefault();
    next = findCell(row + 1, col);
  } else if (e.key === "ArrowRight" || e.key === "Tab") {
    e.preventDefault();
    next = findCell(row, col + 1);
  }

  if (next && next.hasAttribute("contenteditable")) next.focus();
});

let activeCell = null;
let selectedCell = null;

grid.addEventListener("focusin", (e) => {
  if (
    e.target.classList.contains("cell") &&
    e.target.hasAttribute("contenteditable")
  ) {
    activeCell = e.target;
    selectedCell=e.target;
    e.target.classList.add("active-cell");
    const row = +e.target.getAttribute("data-row");
    const col = +e.target.getAttribute("data-col");
    const rowHeader = findCell(row, 0);
    const colHeader = findCell(0, col);
    if (rowHeader) rowHeader.classList.add("header-highlight");
    if (colHeader) colHeader.classList.add("header-highlight");

    cellRefDisplay.textContent = getCellRef(row, col);
    const key = `${row},${col}`;
    const raw = map.get(key) || "";
    e.target.textContent = raw;
    formulaInput.value = raw;
  }
});

grid.addEventListener("focusout", (e) => {
  if (
    e.target.classList.contains("cell") &&
    e.target.hasAttribute("contenteditable")
  ) {
    const row = +e.target.getAttribute("data-row");
    const col = +e.target.getAttribute("data-col");
    const value = e.target.textContent.trim();
    const key = `${row},${col}`;

    const oldValue = map.get(key) || "";

    if (value) map.set(key, value);
    else map.delete(key);

    const success = depGraph.update(key, value || null, tokenizer, parser);
    if (!success) {
      if (oldValue) map.set(key, oldValue);
      else map.delete(key);
      depGraph.update(key, oldValue || null, tokenizer, parser);
      e.target.textContent = "#CYCLE!";
      e.target.classList.remove("active-cell");
      const rowHeader = findCell(row, 0);
      const colHeader = findCell(0, col);
      if (rowHeader) rowHeader.classList.remove("header-highlight");
      if (colHeader) colHeader.classList.remove("header-highlight");
      activeCell = null;
      return;
    }

    setCellDisplay(e.target, row, col);
    recalcAffected(key);

    e.target.classList.remove("active-cell");
    const rowHeader = findCell(row, 0);
    const colHeader = findCell(0, col);
    if (rowHeader) rowHeader.classList.remove("header-highlight");
    if (colHeader) colHeader.classList.remove("header-highlight");

    activeCell = null;
  }
});

formulaInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();

    if (!selectedCell) return;

    const row = +selectedCell.getAttribute("data-row");
    const col = +selectedCell.getAttribute("data-col");

    const value = formulaInput.value.trim();
    const key = `${row},${col}`;

    const oldValue = map.get(key) || "";

    if (value) {
      map.set(key, value);
    } else {
      map.delete(key);
    }

    const success = depGraph.update(key, value || null, tokenizer, parser);
    if (!success) {
      if (oldValue) map.set(key, oldValue);
      else map.delete(key);
      depGraph.update(key, oldValue || null, tokenizer, parser);
      setCellDisplay(selectedCell, row, col);
      selectedCell.focus();
      return;
    }

    setCellDisplay(selectedCell, row, col);
    recalcAffected(key);

    selectedCell.focus();
  }
});

formulaInput.addEventListener("focusin", () => {
  if (!selectedCell) return;

  const row = +selectedCell.getAttribute("data-row");
  const col = +selectedCell.getAttribute("data-col");

  const key = `${row},${col}`;
  formulaInput.value = map.get(key) || "";
});

function saveSheet() {
  const data = Object.fromEntries(map);
  localStorage.setItem("gridsheet-data", JSON.stringify(data));
  const btn = document.getElementById("saveSheet");
  btn.textContent = "Saved!";
  setTimeout(() => (btn.textContent = "Save"), 1000);
}

function loadSheet() {
  const raw = localStorage.getItem("gridsheet-data");
  if (!raw) {
    alert("No saved data found.");
    return;
  }
  map.clear();
  const data = JSON.parse(raw);
  for (const [key, val] of Object.entries(data)) {
    map.set(key, val);
  }

  depGraph.rebuildAll(map, tokenizer, parser);

  const allFormulaKeys = [];
  for (const [key, val] of map) {
    if (val && val.startsWith("=")) allFormulaKeys.push(key);
  }
  const sorted = depGraph._topologicalSort(new Set(allFormulaKeys));
  for (const key of sorted) {
    const [r, c] = key.split(",");
    const cell = findCell(r, c);
    if (cell) setCellDisplay(cell, r, c);
  }

  for (let r = 1; r <= ROWS; r++) {
    for (let c = 1; c <= COLS; c++) {
      const key = `${r},${c}`;
      if (!map.get(key)?.startsWith("=")) {
        const cell = findCell(r, c);
        if (cell) setCellDisplay(cell, r, c);
      }
    }
  }
}

document.getElementById("saveSheet").addEventListener("click", saveSheet);
document.getElementById("loadSheet").addEventListener("click", loadSheet);
