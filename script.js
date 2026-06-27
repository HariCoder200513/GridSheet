const ROW = 100;
const COLUMN = 26;
const grid = document.querySelector(".grid");



for (let i = 0; i < ROW; i++) {
  for (let j = 0; j < COLUMN; j++) {
    const cell = document.createElement("div");
    cell.addEventListener("click", () => {
      cell.style.border = "1px solid #089949";
    });

    cell.classList.add("cell");
    grid.appendChild(cell);
  }
}
