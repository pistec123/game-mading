let playerName = "";
let timerInterval;
let time = 0;
let leaderboard = [];

function startGame() {
  const input = document.getElementById("playerName").value.trim();
  if (input === "") {
    alert("Nama tidak boleh kosong!");
    return;
  }
  playerName = input;
  document.getElementById("splashScreen").style.display = "none";
  document.getElementById("game").style.display = "block";
  document.getElementById("welcome").innerText = "Selamat datang, " + playerName + "!";
  startTimer();
  generateCrossword();
}

function startTimer() {
  time = 0;
  document.getElementById("timer").innerText = `Waktu: ${time}s`;
  timerInterval = setInterval(() => {
    time++;
    document.getElementById("timer").innerText = `Waktu: ${time}s`;
  }, 1000);
}

function generateCrossword() {
  const words = ["ALAM", "BUDAYA", "BANGSA", "POHON", "TARI"];
  const crossword = document.getElementById("crossword");
  crossword.innerHTML = "";
  for (let i = 0; i < 100; i++) {
    let cell = document.createElement("input");
    cell.maxLength = 1;
    cell.className = "cell";
    crossword.appendChild(cell);
  }
}

function checkAnswer() {
  clearInterval(timerInterval);
  alert("Jawaban dicek (dummy). Kamu selesai dalam " + time + " detik!");

  leaderboard.push({ name: playerName, time: time });
  leaderboard.sort((a, b) => a.time - b.time);

  showLeaderboard();
}

function showLeaderboard() {
  document.getElementById("game").style.display = "none";
  document.getElementById("leaderboard").style.display = "block";
  const list = document.getElementById("leaderboardList");
  list.innerHTML = "";
  leaderboard.forEach((entry, index) => {
    let li = document.createElement("li");
    li.textContent = `${entry.name} - ${entry.time}s`;
    list.appendChild(li);
  });
}
