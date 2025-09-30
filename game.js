const words = ["ALAM", "BUDAYA", "BANGSA", "POHON", "TARI"];
const size = 10;
let grid = Array(size).fill(null).map(() => Array(size).fill(""));
let foundWords = [];
let selectedCells = [];
let player = "";
let time = 0;
let timerInterval;

// arah horizontal & vertikal
const directions = [
  [1, 0], [-1, 0], [0, 1], [0, -1]
];

// ==== TIMER ====
function startTimer() {
  time = 0;
  timerInterval = setInterval(() => {
    time++;
    document.getElementById("timer").innerText = "⏱️ Waktu: " + time + " detik";
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);

  let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  leaderboard.push({ name: player, time });
  leaderboard.sort((a, b) => a.time - b.time);
  leaderboard = leaderboard.slice(0, 10);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));

  renderLeaderboard();
  alert("🎉 Semua kata ditemukan! Waktu: " + time + " detik");
}

function renderLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard") || "[]");
  const list = document.getElementById("leaderboard");
  list.innerHTML = "";
  leaderboard.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.name} - ${entry.time} detik`;
    list.appendChild(li);
  });
}

// ==== START GAME ====
function startGame() {
  const nameInput = document.getElementById("playerName").value.trim();
  if (!nameInput) {
    alert("Nama harus diisi!");
    return;
  }
  player = nameInput;

  document.getElementById("splashScreen").style.display = "none";
  document.getElementById("gameScreen").style.display = "block";
  document.getElementById("playerDisplay").innerText = "👤 Pemain: " + player;

  generateGrid();
  renderLeaderboard();
  startTimer();
}

// buat grid huruf
function generateGrid() {
  grid = Array(size).fill(null).map(() => Array(size).fill(""));
  foundWords = [];
  selectedCells = [];

  words.forEach(word => placeWord(word));

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }

  const gridEl = document.getElementById("grid");
  gridEl.innerHTML = "";
  gridEl.style.gridTemplateColumns = `repeat(${size}, 1fr)`;

  grid.flat().forEach((letter, idx) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = letter;
    cell.dataset.index = idx;
    cell.addEventListener("click", () => selectCell(cell));
    gridEl.appendChild(cell);
  });

  const wordsEl = document.getElementById("words");
  wordsEl.innerHTML = "";
  words.forEach(word => {
    const span = document.createElement("span");
    span.textContent = word;
    span.id = "word-" + word;
    wordsEl.appendChild(span);
  });
}

// pilih huruf
function selectCell(cell) {
  if (cell.classList.contains("found")) return;
  cell.classList.toggle("selected");

  if (cell.classList.contains("selected")) {
    selectedCells.push(cell);
  } else {
    selectedCells = selectedCells.filter(c => c !== cell);
  }

  checkWord();
}

// cek kata
function checkWord() {
  let str = selectedCells.map(c => c.textContent).join("");
  let reversed = str.split("").reverse().join("");

  for (let w of words) {
    if ((str === w || reversed === w) && !foundWords.includes(w)) {
      foundWords.push(w);
      document.getElementById("word-" + w).classList.add("done");
      selectedCells.forEach(c => {
        c.classList.remove("selected");
        c.classList.add("found");
      });
      selectedCells = [];

      if (foundWords.length === words.length) {
        stopTimer();
      }
      break;
    }
  }
}

// tempatkan kata
function placeWord(word) {
  let placed = false;
  while (!placed) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    let r = row, c = col;
    let fits = true;

    for (let i = 0; i < word.length; i++) {
      if (r < 0 || r >= size || c < 0 || c >= size ||
        (grid[r][c] !== "" && grid[r][c] !== word[i])) {
        fits = false;
        break;
      }
      r += dir[0];
      c += dir[1];
    }

    if (fits) {
      r = row; c = col;
      for (let i = 0; i < word.length; i++) {
        grid[r][c] = word[i];
        r += dir[0];
        c += dir[1];
      }
      placed = true;
    }
  }
}
