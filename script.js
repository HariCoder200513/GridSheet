const ROW = 101;
const COLUMN = 27;
const grid = document.querySelector(".grid");

for (let i = 0; i < ROW; i++) {
  for (let j = 0; j < COLUMN; j++) {
    const cell = document.createElement("div");
    cell.setAttribute("data-row", i);
    cell.setAttribute("data-column", j);
    if (i == 0 && j > 0) {
      cell.textContent = String.fromCharCode(65 + j - 1);
      cell.style.textAlign = "center";
    }

    if (i == 0) {
      cell.style.position = "sticky";
      cell.style.top = "0";
      cell.style.backgroundColor = "#f1f1f1";
    }

    if (j == 0) {
      cell.style.position = "sticky";
      cell.style.left = "0";
      cell.style.backgroundColor = "#f1f1f1";
    }

    if (j == 0 && i > 0) {
      cell.textContent = i;
      cell.style.textAlign = "center";
    }

    if (i > 0 && j > 0) {
      cell.setAttribute("contenteditable", "true");
    }

    cell.classList.add("cell");
    grid.appendChild(cell);
  }
}

grid.addEventListener("keydown", (e) => {
  if (e.key == "ArrowDown") {
    let current = e.target;
    current.style.border = "1px solid #ccc";
    let row = parseInt(current.getAttribute("data-row"));
    let column = parseInt(current.getAttribute("data-column"));
    let nextRow = row + 1;
    let nextCell = document.querySelector(
      `.cell[data-row="${nextRow}"][data-column="${column}"]`,
    );
    if (nextCell) {
      nextCell.focus();
    }
  }
  if (e.key == "ArrowUp") {
    let current = e.target;
    current.style.border = "1px solid #ccc";
    let row = parseInt(current.getAttribute("data-row"));
    let column = parseInt(current.getAttribute("data-column"));
    let nextRow = row - 1;
    let nextCell = document.querySelector(
      `.cell[data-row="${nextRow}"][data-column="${column}"]`,
    );
    if (nextCell) {
      nextCell.focus();
    }
  }
  if (e.key == "ArrowLeft") {
    let current = e.target;
    current.style.border = "1px solid #ccc";
    let row = parseInt(current.getAttribute("data-row"));
    let col = parseInt(current.getAttribute("data-column"));
    const prev = document.querySelector(
      `.cell[data-row="${row}"][data-column="${col-1}"]`,
    );
    // console.log(prev)
    if (prev) {
      prev.focus();
    }
    // console.log(typeof(row))
  }
  if (e.key == "ArrowRight") {
    let current = e.target;
    current.style.border = "1px solid #ccc";
    let row = parseInt(current.getAttribute("data-row"));
    let col = parseInt(current.getAttribute("data-column"));
    const prev = document.querySelector(
      `.cell[data-row="${row}"][data-column="${col+1}"]`,
    );
    // console.log(prev)
    if (prev) {
      prev.focus();
    }
    // console.log(typeof(row))
  }
});

let previous = null;
grid.addEventListener("click", (e) => {
  const current = e.target;
  if (previous) {
    previous.style.border = "1px solid #ccc";
  }
  current.style.border = "2px solid #089949";
  previous = current;
});
