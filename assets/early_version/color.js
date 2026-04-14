const targetBox = document.getElementById('targetBox');
const userBox = document.getElementById('userBox');
const resultDiv = document.getElementById('result');

const hSlider = document.getElementById('hSlider');
const sSlider = document.getElementById('sSlider');
const lSlider = document.getElementById('lSlider');

const hVal = document.getElementById('hVal');
const sVal = document.getElementById('sVal');
const lVal = document.getElementById('lVal');

const checkBtn = document.getElementById('checkColorBtn');
const newColorBtn = document.getElementById('newColorBtn');

let targetH, targetS, targetL;

function generateNewColor() {
    targetH = Math.floor(Math.random() * 361);
    targetS = Math.floor(Math.random() * 101);
    targetL = Math.floor(Math.random() * 101);
    targetBox.style.backgroundColor = `hsl(${targetH}, ${targetS}%, ${targetL}%)`;
    resultDiv.innerText = "Mix the colors to match!";
}

generateNewColor();

newColorBtn.addEventListener('click', generateNewColor);

function updatePreview() {
    const h = hSlider.value;
    const s = sSlider.value;
    const l = lSlider.value;
    
    hVal.innerText = `${h}°`;
    sVal.innerText = `${s}%`;
    lVal.innerText = `${l}%`;
    
    userBox.style.backgroundColor = `hsl(${h}, ${s}%, ${l}%)`;
}

hSlider.addEventListener('input', updatePreview);
sSlider.addEventListener('input', updatePreview);
lSlider.addEventListener('input', updatePreview);

checkBtn.addEventListener('click', () => {
    const uH = parseInt(hSlider.value);
    const uS = parseInt(sSlider.value);
    const uL = parseInt(lSlider.value);

    let hDiff = Math.abs(targetH - uH);
    if (hDiff > 180) {
        hDiff = 360 - hDiff; 
    }
    const hScore = 100 - (hDiff / 180 * 100); 

    const sScore = 100 - Math.abs(targetS - uS);
    const lScore = 100 - Math.abs(targetL - uL);

    const similarity = (hScore + sScore + lScore) / 3;

    resultDiv.innerText = `Similarity: ${similarity.toFixed(2)}%`;
});