const ROW = 101;
const COLUMN = 27;
const grid = document.querySelector(".grid");

for (let i = 0; i < ROW; i++) {
  for (let j = 0; j < COLUMN; j++) {
    const cell = document.createElement("div");
    if (i == 0 && j > 0) {
      cell.textContent = String.fromCharCode(65 + j - 1);
      cell.style.textAlign = "center";
    }

    if(i==0)
    {
      cell.style.position="sticky";
      cell.style.top="0";
      cell.style.backgroundColor="#f1f1f1";
    }

    if(j==0)
    {
      cell.style.position="sticky";
      cell.style.left="0";
      cell.style.backgroundColor="#f1f1f1";
    }

    if (j == 0 && i > 0) {
      cell.textContent = i;
      cell.style.textAlign = "center";
    }

    if(i>0&&j>0)
    {
      cell.setAttribute("contenteditable", "true");
    }

    cell.classList.add("cell");
    grid.appendChild(cell);
  }
}




let previous=null;
grid.addEventListener("click",(e)=>{
  const current=e.target;
  if(previous) {
    previous.style.border="1px solid #ccc";
  }
  current.style.border="2px solid #089949";
  previous=current;
})
