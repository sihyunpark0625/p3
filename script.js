document.addEventListener("DOMContentLoaded", () => {
    const links = document.querySelectorAll('nav a');
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const targetId = href.substring(1);
                const targetSection = document.getElementById(targetId);
                if(targetSection) {
                    window.scrollTo({ top: targetSection.offsetTop, behavior: 'smooth' });
                }
            }
        });
    });

    const videoPlayer = document.getElementById('p1-video-player');
    if (videoPlayer) {
        const videoList = ['assets/brainrot_1.mov', 'assets/brainrot_2.mov', 'assets/brainrot_3.mov','assets/brainrot_4.mov', 'assets/brainrot_5.mov'];
        let currentVideoIndex = 0;
        videoPlayer.addEventListener('ended', () => {
            currentVideoIndex = (currentVideoIndex + 1) % videoList.length;
            videoPlayer.src = videoList[currentVideoIndex];
            videoPlayer.play();
        });
    }

    const hueSlider = document.getElementById('hue-slider');
    const userBoxScoring = document.getElementById('user-color-box');
    const scoreVal = document.getElementById('sandbox-score-val');
    const targetH = 200; 

    if (hueSlider && userBoxScoring && scoreVal) {
        hueSlider.addEventListener('input', (e) => {
            let uH = parseInt(e.target.value);
            userBoxScoring.style.backgroundColor = `hsl(${uH}, 70%, 50%)`;
            
            let hDiff = Math.abs(targetH - uH);
            if (hDiff > 180) hDiff = 360 - hDiff;
            let hScore = 100 - (hDiff / 180 * 100);
            
            scoreVal.textContent = hScore.toFixed(1) + '%';
            scoreVal.style.color = hScore > 90 ? 'var(--accent)' : 'var(--text-main)';
        });
    }

    const btnNextRound = document.getElementById('btn-next-round');
    const grid = document.getElementById('sandbox-grid');
    const roundText = document.getElementById('sandbox-round-text');
    
    if (btnNextRound && grid && roundText) {
        let currentRound = 1;
        const diffs = [50, 40, 32, 25, 19, 14, 10, 6.5, 3.5, 1.5];

        function renderGrid() {
            roundText.textContent = `Round: ${currentRound}`;
            let gridSize = currentRound <= 3 ? 2 : currentRound <= 7 ? 3 : 4;
            let currentDiff = diffs[currentRound - 1] || 1.5;

            grid.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
            grid.innerHTML = '';
            
            let baseH = Math.floor(Math.random() * 360);
            let answerIndex = Math.floor(Math.random() * (gridSize * gridSize));

            for (let i = 0; i < gridSize * gridSize; i++) {
                let tile = document.createElement('div');
                tile.className = 'diff-tile';
                let lightness = 50; 
                if (i === answerIndex) lightness += currentDiff; 
                tile.style.backgroundColor = `hsl(${baseH}, 70%, ${lightness}%)`;
                grid.appendChild(tile);
            }
        }
        
        renderGrid();
        btnNextRound.addEventListener('click', () => {
            currentRound = currentRound >= 10 ? 1 : currentRound + 1;
            renderGrid();
        });
    }

    const btnCombined = document.getElementById('btn-simulate-combined');
    if (btnCombined) {
        let personalScores = [];
        let personalBest = 0;
        let globalCompetitors = [
            { id: 'User_A', score: 92 },
            { id: 'User_B', score: 85 },
            { id: 'User_C', score: 78 },
            { id: 'User_D', score: 72 }
        ];

        btnCombined.addEventListener('click', () => {
            let newScore = Math.floor(Math.random() * 41) + 60; 
            personalScores.push(newScore);

            let avg = (personalScores.reduce((a, b) => a + b, 0) / personalScores.length).toFixed(1);
            if (newScore > personalBest) personalBest = newScore;

            document.getElementById('stat-avg').textContent = avg;
            document.getElementById('stat-best').textContent = personalBest;

            let allPlayers = [...globalCompetitors, { id: 'YOU (User)', score: personalBest }];
            allPlayers.sort((a, b) => b.score - a.score);

            const rankingList = document.getElementById('ranking-list');
            rankingList.innerHTML = '';

            allPlayers.forEach((player, index) => {
                const isYou = player.id === 'YOU (User)';
                const item = document.createElement('div');
                item.className = `ranking-item ${isYou ? 'top-rank' : ''}`;
                item.innerHTML = `<span>#${index + 1}</span><span>${player.id}</span><span>${player.score} pts</span>`;
                rankingList.appendChild(item);
            });

            document.getElementById('stat-log').textContent = `History: ` + personalScores.join(', ');
            
            const avgEl = document.getElementById('stat-avg');
            avgEl.classList.remove('pop'); void avgEl.offsetWidth; avgEl.classList.add('pop');
            btnCombined.textContent = 'Play Again (Add Score)';
        });
    }

    const btnDoomscroll = document.getElementById('btn-doomscroll');
    if (btnDoomscroll) {
        let scrolls = 0;
        let timeWasted = 0;
        let brainCells = 100;
        let totalCost = 0;

        const elScrolls = document.getElementById('br-scrolls');
        const elTime = document.getElementById('br-time');
        const elCells = document.getElementById('br-cells');
        const elCost = document.getElementById('br-cost');

        btnDoomscroll.addEventListener('click', () => {
            scrolls += 1;
            timeWasted += Math.floor(Math.random() * 15) + 5; 
            brainCells = Math.max(0, brainCells - (Math.random() * 2 + 0.5)); 
            totalCost += Math.random() * 0.5 + 0.1; 

            elScrolls.textContent = scrolls;
            elTime.textContent = timeWasted + 's';
            elCells.textContent = brainCells.toFixed(1) + '%';
            elCost.textContent = '$' + totalCost.toFixed(2);

            if (brainCells < 80) {
                const shake = Math.random() * 4 - 2; 
                btnDoomscroll.style.transform = `translate(${shake}px, ${shake}px)`;
                setTimeout(() => { btnDoomscroll.style.transform = 'translate(0, 0)'; }, 50);
            }
            
            if (brainCells < 30) elCells.style.color = '#c0392b';
        });
    }

    const paintUserBox = document.getElementById('paint-user-box');
    const paintScoreText = document.getElementById('paint-score-text');
    const redCountEl = document.getElementById('red-count');
    const blueCountEl = document.getElementById('blue-count');
    const simplePaintBtns = document.querySelectorAll('.simple-paint-btn');
    const btnWashBrush = document.getElementById('btn-wash-brush');

    if (redCountEl && blueCountEl) {
        let redDrops = 0;
        let blueDrops = 0;
        const targetHue = 280;

        function updateSimpleMix() {
            const total = redDrops + blueDrops;
            
            if (total === 0) {
                if(paintUserBox) paintUserBox.style.backgroundColor = "#ffffff";
                paintScoreText.textContent = "0.0%";
                redCountEl.textContent = "0 Red";
                blueCountEl.textContent = "0 Blue";
                return;
            }

            const ratio = redDrops / total;
            const currentHue = 240 + (120 * ratio);
            
            if(paintUserBox) paintUserBox.style.backgroundColor = `hsl(${currentHue}, 70%, 50%)`;
            redCountEl.textContent = `${redDrops} Red`;
            blueCountEl.textContent = `${blueDrops} Blue`;

            let diff = Math.abs(targetHue - currentHue);
            const score = Math.max(0, 100 - (diff / 1.2)); 

            paintScoreText.textContent = score.toFixed(1) + "%";
            paintScoreText.style.color = score > 90 ? 'var(--accent)' : 'var(--text-main)';
        }

        simplePaintBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.getAttribute('data-color');
                if (type === 'red') redDrops++;
                else blueDrops++;
                
                btn.style.transform = 'translate(4px, 4px)';
                btn.style.boxShadow = '0px 0px 0px #000';
                setTimeout(() => {
                    btn.style.transform = 'translate(0, 0)';
                    btn.style.boxShadow = '6px 6px 0px #000';
                }, 100);

                updateSimpleMix();
            });
        });

        btnWashBrush.addEventListener('click', () => {
            redDrops = 0; blueDrops = 0;
            updateSimpleMix();
        });
    }
});