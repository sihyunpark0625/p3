const tileGrid = document.getElementById('tileGrid');
const roundDisplay = document.getElementById('roundDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerBar = document.getElementById('timerBar');
const instructionText = document.getElementById('instructionText');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScoreText');
const gradeText = document.getElementById('gradeText');
const restartBtn = document.getElementById('restartBtn');

const MAX_ROUNDS = 10;
let currentRound = 1;
let totalScore = 0;
let timerInterval, timeLeft;

function startRound() {
    const gridSize = currentRound <= 2 ? 2 : currentRound <= 4 ? 3 : currentRound <= 6 ? 4 : currentRound <= 8 ? 6 : 8;
    const timeLimit = Math.max(2, 11 - currentRound); 

    roundDisplay.innerText = `Round: ${currentRound} / ${MAX_ROUNDS}`;
    tileGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    tileGrid.innerHTML = "";

    const baseH = Math.floor(Math.random() * 361);
    const baseS = Math.floor(20 + Math.random() * 60);
    const baseL = Math.floor(40 + Math.random() * 20);

    const diff = 15 - (currentRound * 1.2); 
    const correctIdx = Math.floor(Math.random() * (gridSize * gridSize));

    for (let i = 0; i < gridSize * gridSize; i++) {
        const tile = document.createElement('div');
        tile.className = "color-tile";
        
        if (i === correctIdx) {
            tile.style.backgroundColor = `hsl(${baseH}, ${baseS}%, ${baseL + diff}%)`;
            tile.onclick = () => selectTile(true);
        } else {
            tile.style.backgroundColor = `hsl(${baseH}, ${baseS}%, ${baseL}%)`;
            tile.onclick = () => selectTile(false);
        }
        tileGrid.appendChild(tile);
    }

    timeLeft = timeLimit;
    timerBar.style.width = "100%";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        timerBar.style.width = `${(timeLeft / timeLimit) * 100}%`;
        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            selectTile(false);
        }
    }, 100);
}

function selectTile(isCorrect) {
    clearInterval(timerInterval);
    if (isCorrect) totalScore += 100;

    currentRound++;
    scoreDisplay.innerText = `Score: ${Math.round(totalScore / 10)}`;

    if (currentRound > MAX_ROUNDS) endGame();
    else startRound();
}

function endGame() {
    gameOverScreen.style.display = "flex";
    const avg = totalScore / MAX_ROUNDS;
    
    let displayScore = 0;
    const scoreInterval = setInterval(() => {
        displayScore += avg / 50;
        if (displayScore >= avg) {
            displayScore = avg;
            clearInterval(scoreInterval);
            if (avg >= 90) gradeText.innerText = "Nearly perfect!";
            else if (avg >= 70) gradeText.innerText = "Good job!";
            else if (avg >= 40) gradeText.innerText = "Meh, not bad.";
            else gradeText.innerText = "Keep trying...";
        }
        finalScoreText.innerText = `${displayScore.toFixed(1)}%`;
        const hue = (displayScore / 100) * 120;
        finalScoreText.style.color = `hsl(${hue}, 80%, 50%)`;
    }, 20);
}

restartBtn.onclick = () => location.reload();
startRound();