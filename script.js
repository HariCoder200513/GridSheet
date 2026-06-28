const ROW = 101;
const COLUMN = 27;
const grid = document.querySelector(".grid");

const horizontal = document.querySelector(".horizontal");
const vertical = document.querySelector(".vertical");



for (let i = 0; i < ROW; i++) {
  for (let j = 0; j < COLUMN; j++) {
    const cell = document.createElement("div");
    cell.addEventListener("click", () => {
      cell.style.border = "2px solid #089949";
    });

    if (i == 0&&j>0) {
      cell.textContent = String.fromCharCode(65 + j-1);
      cell.style.textAlign = "center";
    }

    if (j == 0&&i>0) {
      cell.textContent = i;
      cell.style.textAlign = "center";
    }

    cell.classList.add("cell");
    grid.appendChild(cell);
  }
}
