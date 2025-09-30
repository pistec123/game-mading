// =================== KONFIGURASI ==================
const API_URL = "https://script.google.com/macros/s/AKfycbx1opSTjHcfs6D1YNoRCpsFyRxEg2HVLU4Tqk0qT-cfsPrt0MzwF_9CKiFoXTTnnZzekQ/exec"; // ganti dengan Web App kamu
const words = ["ALAM", "BUDAYA", "BANGSA", "POHON", "TARI"];
const size = 10;

// ================== VARIABEL ==================
let grid = Array(size).fill(null).map(() => Array(size).fill(""));
let foundWords = [];
let selectedCells = [];
let playerName = "";
let time = 0;
let timerInterval = null;

// ================== DIRECTIONS (hanya horizontal & vertikal) ==================
const directions = [
  [1, 0],   // bawah
  [-1, 0],  // atas
  [0, 1],   // kanan
  [0, -1],  // kiri
];

// ================== SPLASH SCREEN ==================
document.getElementById("startBtn").addEventListener("click", () => {
  const input = document.getElementById("playerName");
  if (input.value.trim() === "") {
    alert("Masukkan nama dulu!");
    return;
  }
  playerName = input.value.trim();
  document.getElementById("splash").style.display = "none";
  document.getElementById("game").style.display = "block";
  initGame();
});

// ================== TIMER ==================
function startTimer() {
  timerInterval = setInterval(() => {
    time++;
    document.getElementById("timer").innerText = "⏱️ Waktu: " + time + " detik";
  }, 1000);
}

function stopTimer() {
  clearInterval(timerInterval);
}

// ================== FUNGSI GRID ==================
function placeWord(word) {
  let placed = false;
  while (!placed) {
    const dir = directions[Math.floor(Math.random() * directions.length)];
    const row = Math.floor(Math.random() * size);
    const col = Math.floor(Math.random() * size);
    let r = row, c = col;
    let fits = true;

    for (let i = 0; i < word.length; i++) {
      if (
        r < 0 || r >= size || c < 0 || c >= size ||
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
  words.forEach(word => placeWord(word));
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (grid[r][c] === "") {
        grid[r][c] = String.fromCharCode(65 + Math.floor(Math.random() * 26));
      }
    }
  }
}

// ================== RENDER ==================
function renderGrid() {
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

  // render daftar kata
  const wordsEl = document.getElementById("words");
  wordsEl.innerHTML = "";
  words.forEach(word => {
    const span = document.createElement("span");
    span.textContent = word;
    span.id = "word-" + word;
    wordsEl.appendChild(span);
  });
}

// ================== PILIH HURUF ==================
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
        alert("🎉 Semua kata ditemukan! Waktu: " + time + " detik");
        simpanLeaderboard(playerName, time).then(() => {
          tampilkanLeaderboard();
        });
      }
      break;
    }
  }
}

// ================== GOOGLE SHEETS API ==================
async function simpanLeaderboard(nama, waktu) {
  try {
    await fetch(API_URL, {
      method: "POST",
      body: JSON.stringify({ nama, waktu }),
    });
  } catch (err) {
    console.error("Gagal simpan:", err);
  }
}

async function ambilLeaderboard() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();
    return data.slice(0, 10); // ambil 10 tercepat
  } catch (err) {
    console.error("Gagal ambil leaderboard:", err);
    return [];
  }
}

async function tampilkanLeaderboard() {
  const leaderboard = await ambilLeaderboard();
  const container = document.getElementById("leaderboard");
  container.innerHTML = "<h2>🏆 Leaderboard</h2>";

  leaderboard.forEach((item, index) => {
    container.innerHTML += `<p>${index + 1}. ${item.nama} - ${item.waktu}s</p>`;
  });
}

// ================== INIT GAME ==================
function initGame() {
  generateGrid();
  renderGrid();
  startTimer();
  tampilkanLeaderboard();
}
