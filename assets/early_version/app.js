const canvas = document.getElementById('drawCanvas');
const ctx = canvas.getContext('2d');
const originalImg = document.getElementById('originalImg');
const resultDiv = document.getElementById('result');
const imageSelect = document.getElementById('imageSelect');
const clearBtn = document.getElementById('clearBtn');
const compareBtn = document.getElementById('compareBtn');
const lineWidthInput = document.getElementById('lineWidth');
const lineWidthVal = document.getElementById('lineWidthVal');

let drawing = false;

lineWidthInput.addEventListener('input', (e) => {
    lineWidthVal.innerText = e.target.value;
});

function initCanvas() {
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

initCanvas();

imageSelect.addEventListener('change', (e) => {
    originalImg.src = e.target.value;
    initCanvas(); 
    resultDiv.innerText = "Draw the new shape!";
});

canvas.addEventListener('mousedown', () => drawing = true);
canvas.addEventListener('mouseup', () => { drawing = false; ctx.beginPath(); });
canvas.addEventListener('mousemove', draw);

function draw(e) {
    if (!drawing) return;
    ctx.lineWidth = lineWidthInput.value; 
    ctx.lineCap = 'round';
    ctx.strokeStyle = 'black';

    const rect = canvas.getBoundingClientRect();
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
}

clearBtn.addEventListener('click', () => {
    initCanvas();
    resultDiv.innerText = "Try drawing again!";
});

compareBtn.addEventListener('click', () => {
    const hiddenCanvas = document.getElementById('hiddenCanvas');
    const hCtx = hiddenCanvas.getContext('2d');

    hCtx.fillStyle = "white";
    hCtx.fillRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
    hCtx.drawImage(originalImg, 0, 0, 300, 300);
    
    const originalData = hCtx.getImageData(0, 0, 300, 300).data;
    const drawData = ctx.getImageData(0, 0, 300, 300).data;

    let intersection = 0; 
    let union = 0;  
    let hasDrawn = false; 

    for (let i = 0; i < originalData.length; i += 4) {
        const isOriginalBlack = originalData[i] < 128; 
        const isDrawBlack = drawData[i] < 128;

        if (isDrawBlack) hasDrawn = true;

        if (isOriginalBlack && isDrawBlack) {
            intersection++;
            union++;
        } else if (isOriginalBlack || isDrawBlack) {
            union++;
        }
    }


    if (!hasDrawn) {
        resultDiv.innerText = "You haven't drawn anything!";
        return;
    }

    if (union === 0) {
        resultDiv.innerText = "Original image has no outlines!";
        return;
    }


    const similarity = (intersection / union) * 100;
    

    const finalScore = Math.min(100, similarity * 1.5); 

    resultDiv.innerText = `Similarity: ${finalScore.toFixed(2)}%`;
});