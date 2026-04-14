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

const diffs = [50, 40, 32, 25, 19, 14, 10, 6.5, 3.5, 1.5];

function startRound() {
    const gridSize = currentRound <= 3 ? 2 : currentRound <= 7 ? 3 : 4; 
    const timeLimit = Math.max(4, 12 - currentRound); 
    
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
        if (memTime > 0) {
            targetBox.innerText = memTime;
        } else {
            clearInterval(memInterval);
            targetBox.innerText = "";
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
    
    const diff = diffs[currentRound - 1] || 1.5;
    
    let wrongIndex = 0; 
    
    for (let i = 0; i < totalTiles; i++) {
        const tile = document.createElement('div');
        tile.className = "color-tile";
        
        if (i === correctIdx) {
            tile.style.backgroundColor = `hsl(${targetColor.h}, ${targetColor.s}%, ${targetColor.l}%)`;
            tile.onclick = () => selectTile(true);
        } else {
            wrongIndex++;
            

            let sign = wrongIndex % 2 === 0 ? -1 : 1; 
            
            let step = Math.ceil(wrongIndex / 2); 
            
            let stepAmount = Math.max(2.5, diff * 0.2); 
            
            let offsetH = sign * (diff + (step - 1) * stepAmount);

            let offsetS = sign * step;
            let offsetL = -sign * step;

            tile.style.backgroundColor = `hsl(${targetColor.h + offsetH}, ${targetColor.s + offsetS}%, ${targetColor.l + offsetL}%)`;
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
    
    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        let db = JSON.parse(localStorage.getItem('arcadeDB_v2')) || { users: {} };
        if (!db.users[currentUser] || typeof db.users[currentUser].speed === 'number') {
            db.users[currentUser] = {
                speed: { best: 0, sum: 0, count: 0 }, memory: { best: 0, sum: 0, count: 0 }, paint: { best: 0, sum: 0, count: 0 }, grid: { best: 0, sum: 0, count: 0 }, odd: { best: 0, sum: 0, count: 0 }
            };
        }
        
        const gameData = db.users[currentUser].grid; 
        if (avg > gameData.best) gameData.best = avg;
        gameData.sum += avg;
        gameData.count += 1;
        
        localStorage.setItem('arcadeDB_v2', JSON.stringify(db));
    }

    gradeText.innerText = "";
    finalScoreText.innerText = "0.0%";
    finalScoreText.style.color = "hsl(0, 80%, 50%)";

    if (avg === 0) {
        gradeText.innerText = "Keep trying...";
        return;
    }

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