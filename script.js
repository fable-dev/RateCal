// Elements
const xInput = document.getElementById('xValue');
const pInput = document.getElementById('pValue');
const calcBtn = document.getElementById('calcBtn');
const resultBox = document.getElementById('resultBox');
const resultValue = document.getElementById('resultValue');
const resultNote = document.getElementById('resultNote');
const stepsEl = document.getElementById('steps');
const showStepsBtn = document.getElementById('showStepsBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');

// compute function using dynamic percentage:
// (((X * 2) - ((P/100) * X * 2)) * 2)
function compute(x, p) {
  const xNum = parseFloat(x);
  const pNum = parseFloat(p);

  // guards: if x or p are not numbers, return null to indicate error
  if (!isFinite(xNum) || !isFinite(pNum)) return null;

  const part1 = xNum * 2;
  const part2 = (pNum / 100) * xNum * 2;
  const diff = part1 - part2;
  const final = diff * 2;
  return { x: xNum, p: pNum, part1, part2, diff, final };
}

function formatNumber(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

function showResult(r) {
  if (!r) {
    resultBox.hidden = true;
    return;
  }
  resultValue.textContent = 'Result: ' + formatNumber(r.final);
  resultNote.textContent = `From X = ${formatNumber(r.x)}, P = ${formatNumber(r.p)}%`;
  stepsEl.innerHTML = `
    <strong>Steps:</strong><br>
    1) X × 2 = ${formatNumber(r.part1)}<br>
    2) ${formatNumber(r.p)}% of X × 2 = ${formatNumber(r.part2)}<br>
    3) ${formatNumber(r.part1)} − ${formatNumber(r.part2)} = ${formatNumber(r.diff)}<br>
    4) ${formatNumber(r.diff)} × 2 = <strong>${formatNumber(r.final)}</strong>
  `;
  resultBox.hidden = false;
  stepsEl.hidden = true;
  showStepsBtn.textContent = 'Show steps';
}

// main calculate action (used by button or by live updates)
function calculateAction() {
  const xVal = xInput.value;
  const pVal = pInput.value;

  // if inputs empty, fallback: if p is empty default to 30
  const pToUse = (pVal === '' || pVal === null) ? '30' : pVal;

  const r = compute(xVal, pToUse);
  if (!r) {
    // If invalid, show a small inline message instead of alert
    resultBox.hidden = true;
    // optional friendly inline notice (you can replace with UI element)
    console.warn('Invalid input for X or P. X:', xVal, 'P:', pToUse);
    return;
  }
  showResult(r);
}

// button click
calcBtn.addEventListener('click', calculateAction);

// live update when user changes X or P (optional: this recalculates as you type)
[xInput, pInput].forEach(el => {
  el.addEventListener('input', () => {
    // only run live calc if there is at least something in X
    if (xInput.value.trim() !== '') {
      calculateAction();
    }
  });
});

// presets
document.querySelectorAll('[data-preset-x]').forEach(btn => {
  btn.addEventListener('click', () => {
    xInput.value = btn.getAttribute('data-preset-x');
    pInput.value = btn.getAttribute('data-preset-p') || '30';
    calculateAction();
  });
});

// show/hide steps
showStepsBtn.addEventListener('click', () => {
  const hidden = stepsEl.hidden;
  stepsEl.hidden = !hidden;
  showStepsBtn.textContent = hidden ? 'Hide steps' : 'Show steps';
});

// copy site link
copyLinkBtn.addEventListener('click', async () => {
  const url = 'https://fable-dev.github.io/RateCal/';
  try {
    await navigator.clipboard.writeText(url);
    copyLinkBtn.textContent = 'Copied!';
    setTimeout(() => (copyLinkBtn.textContent = 'Copy link'), 1400);
  } catch (e) {
    prompt('Copy this link:', url);
  }
});

// Enter to calculate
[xInput, pInput].forEach(input => {
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') calculateAction();
  });
});