const targetBox = document.getElementById('targetBox');
const userBox = document.getElementById('userBox');
const roundDisplay = document.getElementById('roundDisplay');
const scoreDisplay = document.getElementById('scoreDisplay');
const timerBar = document.getElementById('timerBar');
const dropCountSpan = document.getElementById('dropCount');
const matchBtn = document.getElementById('matchBtn');
const resetMixBtn = document.getElementById('resetMixBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverScreen = document.getElementById('gameOverScreen');
const finalScoreText = document.getElementById('finalScoreText');
const gradeText = document.getElementById('gradeText');

const MAX_ROUNDS = 5;
const TIME_LIMIT = 10;

let currentRound = 1;
let totalScore = 0;
let timeLeft = TIME_LIMIT;
let timerInterval;
let targetR, targetG, targetB;
let myMix = []; 

function resetMix() {
    myMix = [];
    dropCountSpan.innerText = "0";
    userBox.style.backgroundColor = "#ffffff"; 
}

function addDrop(r, g, b) {
    myMix.push({ r, g, b });
    dropCountSpan.innerText = myMix.length;
    updateUserColor();
}

function updateUserColor() {
    if (myMix.length === 0) return;
    let totalR = 0, totalG = 0, totalB = 0;
    
    for (let drop of myMix) {
        totalR += drop.r;
        totalG += drop.g;
        totalB += drop.b;
    }
    const finalR = Math.round(totalR / myMix.length);
    const finalG = Math.round(totalG / myMix.length);
    const finalB = Math.round(totalB / myMix.length);

    userBox.style.backgroundColor = `rgb(${finalR}, ${finalG}, ${finalB})`;
}

function startRound() {
    targetR = Math.floor(Math.random() * 256);
    targetG = Math.floor(Math.random() * 256);
    targetB = Math.floor(Math.random() * 256);
    targetBox.style.backgroundColor = `rgb(${targetR}, ${targetG}, ${targetB})`;

    resetMix();

    roundDisplay.innerText = `Round: ${currentRound} / ${MAX_ROUNDS}`;
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
    clearInterval(timerInterval);

    let uR = 255, uG = 255, uB = 255; 
    
    if (myMix.length > 0) {
        let totalR = 0, totalG = 0, totalB = 0;
        for (let drop of myMix) { totalR += drop.r; totalG += drop.g; totalB += drop.b; }
        uR = Math.round(totalR / myMix.length);
        uG = Math.round(totalG / myMix.length);
        uB = Math.round(totalB / myMix.length);
    }

    const distance = Math.sqrt(Math.pow(targetR - uR, 2) + Math.pow(targetG - uG, 2) + Math.pow(targetB - uB, 2));
    const maxDistance = 441.67; 
    
    const roundScore = Math.max(0, 100 - (distance / maxDistance * 100));
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
resetMixBtn.addEventListener('click', resetMix);

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
        
        // 🌟🌟 바로 이 부분이 문제였습니다! memory가 아니라 paint로 수정완료! 🌟🌟
        const gameData = db.users[currentUser].paint; 
        
        if (averageScore > gameData.best) gameData.best = averageScore;
        gameData.sum += averageScore;
        gameData.count += 1;
        
        localStorage.setItem('arcadeDB_v2', JSON.stringify(db));
    }

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