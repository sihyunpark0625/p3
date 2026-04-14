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
const MIX_TIME_LIMIT = 10; 

let currentRound = 1;
let totalScore = 0;
let targetH, targetS, targetL;
let memorizeTimer;
let mixTimerInterval;
let timeLeft;

function updatePreview() {
    userBox.style.backgroundColor = `hsl(${hSlider.value}, ${sSlider.value}%, ${lSlider.value}%)`;
}
hSlider.addEventListener('input', updatePreview);
sSlider.addEventListener('input', updatePreview);
lSlider.addEventListener('input', updatePreview);

function setSlidersDisabled(isDisabled) {
    hSlider.disabled = isDisabled;
    sSlider.disabled = isDisabled;
    lSlider.disabled = isDisabled;
    matchBtn.disabled = isDisabled;
}

function startRound() {
    roundDisplay.innerText = `Round: ${currentRound} / ${MAX_ROUNDS}`;
    timerBar.style.width = "100%";
    instructionText.innerText = "Memorize the Target! It hides in 3 seconds.";
    
    setSlidersDisabled(true);

    targetH = Math.floor(Math.random() * 361);
    targetS = Math.floor(Math.random() * 101);
    targetL = Math.floor(Math.random() * 101);
    targetBox.style.backgroundColor = `hsl(${targetH}, ${targetS}%, ${targetL}%)`;
    
    hSlider.value = 180; sSlider.value = 50; lSlider.value = 50;
    updatePreview();
    
    clearInterval(memorizeTimer);
    clearInterval(mixTimerInterval);
    let memTime = 3;
    targetBox.innerText = memTime;
    
    memorizeTimer = setInterval(() => {
        memTime--;
        if (memTime > 0) {
            targetBox.innerText = memTime;
        } else {
            clearInterval(memorizeTimer);
            
            targetBox.style.backgroundColor = "#7f8c8d";
            targetBox.innerText = "?";
            targetBox.style.fontSize = "2.5rem"; // CSS와 동일하게 슬림한 크기로 제한
            instructionText.innerText = "Quick! Mix from your memory!";
            
            setSlidersDisabled(false);
            
            startMixTimer();
        }
    }, 1000);
}

function startMixTimer() {
    timeLeft = MIX_TIME_LIMIT;
    
    mixTimerInterval = setInterval(() => {
        timeLeft -= 0.1;
        const percentage = (timeLeft / MIX_TIME_LIMIT) * 100;
        timerBar.style.width = `${percentage}%`;

        if (timeLeft <= 0) {
            clearInterval(mixTimerInterval);
            calculateScoreAndNext(); 
        }
    }, 100);
}

function calculateScoreAndNext() {
    clearInterval(mixTimerInterval); 
    
    setSlidersDisabled(true);

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

    targetBox.style.backgroundColor = `hsl(${targetH}, ${targetS}%, ${targetL}%)`;
    targetBox.innerText = "";

    currentRound++;
    
    if (currentRound > MAX_ROUNDS) {
        setTimeout(endGame, 1500); 
    } else {
        setTimeout(startRound, 2000); 
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
        
        const gameData = db.users[currentUser].memory; // 🌟 메모리 데이터
        if (averageScore > gameData.best) gameData.best = averageScore;
        gameData.sum += averageScore;
        gameData.count += 1;
        
        localStorage.setItem('arcadeDB_v2', JSON.stringify(db));
    }
    // ... 이 아래로는 기존 점수 애니메이션 코드 유지

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