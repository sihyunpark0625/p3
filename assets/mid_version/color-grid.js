const targetBox = document.getElementById('targetBox');
const targetDisplay = document.getElementById('targetDisplay');
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
let targetColor, timerInterval, timeLeft;

function startRound() {
    const gridSize = currentRound <= 2 ? 2 : currentRound <= 5 ? 3 : currentRound <= 8 ? 4 : 5;
    const timeLimit = 13 - currentRound; 
    
    tileGrid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    tileGrid.style.display = "none";
    targetDisplay.style.display = "block";
    instructionText.innerText = "Memorize the color!";
    roundDisplay.innerText = `Round: ${currentRound} / ${MAX_ROUNDS}`;

    const h = Math.floor(Math.random() * 361);
    const s = Math.floor(Math.random() * 101);
    const l = Math.floor(30 + Math.random() * 40); 
    targetColor = { h, s, l };
    targetBox.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;

    let memTime = 3;
    targetBox.innerText = memTime;
    const memInterval = setInterval(() => {
        memTime--;
        targetBox.innerText = memTime;
        if (memTime <= 0) {
            clearInterval(memInterval);
            showGrid(gridSize, timeLimit);
        }
    }, 1000);
}

function showGrid(size, time) {
    targetDisplay.style.display = "none";
    tileGrid.style.display = "grid";
    tileGrid.innerHTML = "";
    instructionText.innerText = "Find the original color!";
    
    const totalTiles = size * size;
    const correctIdx = Math.floor(Math.random() * totalTiles);
    
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = "color-tile";
        
        if (i === correctIdx) {
            tile.style.backgroundColor = `hsl(${targetColor.h}, ${targetColor.s}%, ${targetColor.l}%)`;
            tile.onclick = () => selectTile(true);
        } else {
            const diff = 20 - (currentRound * 1.5); 
            const offsetH = (Math.random() - 0.5) * diff * 2;
            tile.style.backgroundColor = `hsl(${targetColor.h + offsetH}, ${targetColor.s}%, ${targetColor.l}%)`;
            tile.onclick = () => selectTile(false);
        }
        tileGrid.appendChild(tile);
    }

    timeLeft = time;
    timerBar.style.width = "100%";
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft -= 0.1;
        timerBar.style.width = `${(timeLeft / time) * 100}%`;
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
        finalScoreText.style.color = `hsl(${(displayScore / 100) * 120}, 80%, 50%)`;
    }, 20);
}

restartBtn.onclick = () => location.reload();
startRound();