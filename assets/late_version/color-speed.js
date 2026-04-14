const targetBox = document.getElementById('targetBox');
const userBox = document.getElementById('userBox');
const roundDisplay = document.getElementById('roundDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerBar = document.getElementById('timerBar');
const matchBtn = document.getElementById('matchBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScoreText');
const gradeText = document.getElementById('gradeText');
const instructionText = document.getElementById('instructionText');

const hSlider = document.getElementById('hSlider');
const sSlider = document.getElementById('sSlider');
const lSlider = document.getElementById('lSlider');

const MAX_ROUNDS = 5;
const TIME_LIMIT = 10; 

let currentRound = 1;
let totalScore = 0;
let timeLeft = TIME_LIMIT;
let timerInterval;
let targetH, targetS, targetL;
let isProcessing = false; 

function updatePreview() {
    userBox.style.backgroundColor = `hsl(${hSlider.value}, ${sSlider.value}%, ${lSlider.value}%)`;
}
hSlider.addEventListener('input', updatePreview);
sSlider.addEventListener('input', updatePreview);
lSlider.addEventListener('input', updatePreview);

function startRound() {
    isProcessing = false; 
    
    targetH = Math.floor(Math.random() * 361);
    targetS = Math.floor(Math.random() * 101);
    targetL = Math.floor(Math.random() * 101);
    targetBox.style.backgroundColor = `hsl(${targetH}, ${targetS}%, ${targetL}%)`;

    hSlider.value = 180; sSlider.value = 50; lSlider.value = 50;
    updatePreview();

    roundDisplay.innerText = `Round: ${currentRound} / ${MAX_ROUNDS}`;
    instructionText.innerText = "Match the color as fast as you can!"; 
    
    timeLeft = TIME_LIMIT;
    timerBar.style.width = "100%";

    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft -= 0.1; 
        const percentage = (timeLeft / TIME_LIMIT) * 100;
        timerBar.style.width = `${percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            calculateScoreAndNext(); 
        }
    }, 100);
}

function calculateScoreAndNext() {
    if (isProcessing) return;
    isProcessing = true;

    clearInterval(timerInterval);

    const uH = parseInt(hSlider.value);
    const uS = parseInt(sSlider.value);
    const uL = parseInt(lSlider.value);

    let hDiff = Math.abs(targetH - uH);
    if (hDiff > 180) hDiff = 360 - hDiff; 
    const hScore = 100 - (hDiff / 180 * 100); 
    const sScore = 100 - Math.abs(targetS - uS);
    const lScore = 100 - Math.abs(targetL - uL);

    const roundScore = (hScore + sScore + lScore) / 3;
    totalScore += roundScore;
    
    scoreDisplay.innerText = `Score: ${Math.round(totalScore)}`;

    currentRound++;
    
    if (currentRound > MAX_ROUNDS) {
        endGame();
    } else {
        startRound(); 
    }
}

matchBtn.addEventListener('click', calculateScoreAndNext);

function endGame() {
    gameOverScreen.style.display = "flex";
    const averageScore = totalScore / MAX_ROUNDS;

    const currentUser = localStorage.getItem('currentUser');
    if (currentUser) {
        let db = JSON.parse(localStorage.getItem('arcadeDB_v2')) || { users: {} };
        if (!db.users[currentUser] || typeof db.users[currentUser].speed === 'number') {
            db.users[currentUser] = {
                speed: { best: 0, sum: 0, count: 0 }, memory: { best: 0, sum: 0, count: 0 }, paint: { best: 0, sum: 0, count: 0 }, grid: { best: 0, sum: 0, count: 0 }, odd: { best: 0, sum: 0, count: 0 }
            };
        }
        
        const gameData = db.users[currentUser].speed; // 🌟 스피드런 데이터
        if (averageScore > gameData.best) gameData.best = averageScore;
        gameData.sum += averageScore;
        gameData.count += 1;
        
        localStorage.setItem('arcadeDB_v2', JSON.stringify(db));
    }
    // ... 이 아래로는 기존 점수 애니메이션 코드 유지 (gradeText.innerText = "" 부터 끝까지)
    gradeText.innerText = "";
    finalScoreText.innerText = "0.0%"; 
    finalScoreText.style.color = "hsl(0, 80%, 50%)"; 

    let displayScore = 0;
    const animationSpeed = 20; 
    const step = averageScore / 50; 

    const scoreInterval = setInterval(() => {
        displayScore += step;
        
        if (displayScore >= averageScore) {
            displayScore = averageScore;
            clearInterval(scoreInterval);
            
            // 🌟🌟 에러 원인 수정 (avg -> averageScore)
            if (averageScore >= 90) gradeText.innerText = "Nearly perfect!";
            else if (averageScore >= 70) gradeText.innerText = "Good job!";
            else if (averageScore >= 40) gradeText.innerText = "Meh, not bad.";
            else gradeText.innerText = "Keep trying...";
        }
        
        finalScoreText.innerText = `${displayScore.toFixed(1)}%`;
        const hue = (displayScore / 100) * 120; 
        finalScoreText.style.color = `hsl(${hue}, 80%, 50%)`;
        
    }, animationSpeed);
}

restartBtn.addEventListener('click', () => {
    currentRound = 1;
    totalScore = 0;
    scoreDisplay.innerText = `Score: 0`;
    gameOverScreen.style.display = "none";
    startRound();
});

startRound();