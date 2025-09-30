// === DATA ===
const words = ["ALAM", "BUDAYA", "BANGSA", "POHON", "TARI"];
const size = 10;
let grid = Array(size).fill(null).map(() => Array(size).fill(""));
let foundWords = [];
let selectedCells = [];
let player = "";
let time = 0;
let timerInterval = null;

// === SPLASH SCREEN ===
function startGame() {
  player = document.getElementById("playerName").value.trim();
  if (!player) {
    alert("Masukkan nama dulu!");
    return;
  }
  document.getElementById("splashScreen").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("welcome").innerText = `Selamat datang, ${player}!`;

  generateGrid();
  renderGrid();
  renderWords();
  startTimer();
}

// === TIMER ===
function startTimer() {
  timerInterval = setInterval(() => {
    time++;
    document.getElementById("timer").innerText = "Waktu: " + time + "s";
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// === GENERATE GRID ===
function placeWord(word) {
  let placed = false;
  while (!placed) {
    const dir = Math.random() > 0.5 ? [1, 0] : [0, 1]; // horizontal/vertikal
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    let r = row, c = col;
    let fits = true;

    for (let i = 0; i < word.length; i++) {
      if (
        r >= size || c >= size ||
        (grid[r][c] !== "" && grid[r][c] !== word[i])
      ) {
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

function generateGrid() {
  words.forEach(placeWord);

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }
}

// === RENDER GRID ===
function renderGrid() {
  const board = document.getElementById("crossword");
  board.innerHTML = "";
  board.style.gridTemplateColumns = `repeat(${size}, 30px)`;

  grid.flat().forEach((letter, idx) => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = letter;
    cell.dataset.index = idx;

    cell.addEventListener("click", () => selectCell(cell));
    board.appendChild(cell);
  });
}

// === RENDER WORDS ===
function renderWords() {
  const wordsEl = document.getElementById("words");
  wordsEl.innerHTML = "";
  words.forEach(word => {
    const span = document.createElement("span");
    span.textContent = word;
    span.id = "word-" + word;
    wordsEl.appendChild(span);
  });
}

// === PILIH HURUF ===
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

// === CEK KATA ===
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
        saveToLeaderboard(player, time);
        alert(`🎉 Semua kata ditemukan!\nWaktu: ${time} detik`);
      }
      break;
    }
  }
}

// === LEADERBOARD (localStorage) ===
function saveToLeaderboard(name, score) {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  leaderboard.push({ name, score });
  leaderboard.sort((a, b) => a.score - b.score);
  leaderboard = leaderboard.slice(0, 5);
  localStorage.setItem("leaderboard", JSON.stringify(leaderboard));
  renderLeaderboard();
}

function renderLeaderboard() {
  let leaderboard = JSON.parse(localStorage.getItem("leaderboard")) || [];
  const lb = document.getElementById("leaderboard");
  lb.innerHTML = "";
  leaderboard.forEach((entry, i) => {
    const li = document.createElement("li");
    li.textContent = `${i + 1}. ${entry.name} - ${entry.score}s`;
    lb.appendChild(li);
  });
}
