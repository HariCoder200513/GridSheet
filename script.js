"use strict";
const ROWS = 100;
const COLS = 26;
const grid = document.querySelector(".grid");

const map = new Map();

grid.style.display = "grid";
grid.style.gridTemplateColumns = `repeat(${COLS + 1}, 105px)`;

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
    next = grid.querySelector(
      `.cell[data-row="${row + 1}"][data-col="${col}"]`,
    );
  } else if (e.key === "ArrowUp") {
    next = grid.querySelector(
      `.cell[data-row="${row - 1}"][data-col="${col}"]`,
    );
  } else if (e.key === "ArrowLeft" || (e.key === "Tab" && e.shiftKey)) {
    e.preventDefault();
    next = grid.querySelector(
      `.cell[data-row="${row}"][data-col="${col - 1}"]`,
    );
  } else if (e.key === "Enter") {
    e.preventDefault();
    next = grid.querySelector(
      `.cell[data-row="${row + 1}"][data-col="${col}"]`,
    );
  } else if (e.key === "ArrowRight" || e.key === "Tab") {
    e.preventDefault();
    next = grid.querySelector(
      `.cell[data-row="${row}"][data-col="${col + 1}"]`,
    );
  }

  if (next && next.hasAttribute("contenteditable")) next.focus();
});

grid.addEventListener("focusin", (e) => {
  if (
    e.target.classList.contains("cell") &&
    e.target.hasAttribute("contenteditable")
  ) {
    e.target.classList.add("active-cell");
    const row = e.target.getAttribute("data-row");
    const col = e.target.getAttribute("data-col");
    const rowHeader = grid.querySelector(
      `.cell[data-row="${row}"][data-col="0"]`,
    );
    const colHeader = grid.querySelector(
      `.cell[data-row="0"][data-col="${col}"]`,
    );
    if (rowHeader) rowHeader.classList.add("header-highlight");
    if (colHeader) colHeader.classList.add("header-highlight");
  }
});
grid.addEventListener("focusout", (e) => {
  if (
    e.target.classList.contains("cell") &&
    e.target.hasAttribute("contenteditable")
  ) {
    const row = e.target.getAttribute("data-row");
    const col = e.target.getAttribute("data-col");
    const value = e.target.textContent.trim();
    const key = `${row},${col}`;

    if (value) map.set(key, value);
    else map.delete(key);

    e.target.classList.remove("active-cell");
    const rowHeader = grid.querySelector(
      `.cell[data-row="${row}"][data-col="0"]`,
    );
    const colHeader = grid.querySelector(
      `.cell[data-row="0"][data-col="${col}"]`,
    );
    if (rowHeader) rowHeader.classList.remove("header-highlight");
    if (colHeader) colHeader.classList.remove("header-highlight");
  }
});
