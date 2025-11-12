// Element selectors
const xInput = document.getElementById('xValue');
const pInput = document.getElementById('pValue');
const changeInput = document.getElementById('changeValue');
const modeSelect = document.getElementById('changeMode');
const calcBtn = document.getElementById('calcBtn');
const clearBtn = document.getElementById('clearBtn');
const resultBox = document.getElementById('resultBox');
const resultValue = document.getElementById('resultValue');
const resultNote = document.getElementById('resultNote');
const stepsEl = document.getElementById('steps');
const showStepsBtn = document.getElementById('showStepsBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');

// --- core logic ---
function compute(x, p, change, mode) {
  let xNum = parseFloat(x);
  const pNum = parseFloat(p);
  const changeNum = parseFloat(change) || 0;

  if (!isFinite(xNum) || !isFinite(pNum)) return null;

  // Adjust X based on change and mode
  if (mode === 'increase') xNum += changeNum;
  else if (mode === 'decrease') xNum -= changeNum;

  const part1 = xNum * 2;
  const part2 = (pNum / 100) * xNum * 2;
  const diff = part1 - part2;
  const final = diff * 2;

  return { x: xNum, p: pNum, change: changeNum, mode, part1, part2, diff, final };
}

function formatNumber(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

// --- calculate ---
function calculateAction() {
  const xVal = xInput.value.trim();
  const pVal = pInput.value.trim() || '30';
  const changeVal = changeInput.value.trim() || '0';
  const mode = modeSelect.value;

  const r = compute(xVal, pVal, changeVal, mode);

  if (!r) {
    alert('Please enter valid numbers for X and percentage.');
    return;
  }

  resultValue.textContent = 'Result: ' + formatNumber(r.final);

  let note = `Base X = ${xVal}`;
  if (r.change !== 0 && r.mode)
    note += ` → New X = ${formatNumber(r.x)} (${r.mode} by ${r.change})`;

  resultNote.textContent = `${note}, P = ${formatNumber(r.p)}%`;

  stepsEl.innerHTML = `
    <strong>Steps:</strong><br>
    1) Adjust X: ${xVal} ${r.mode ? (r.mode === 'increase' ? '+' : '−') + r.change : ''} = ${formatNumber(r.x)}<br>
    2) X × 2 = ${formatNumber(r.part1)}<br>
    3) ${formatNumber(r.p)}% of X × 2 = ${formatNumber(r.part2)}<br>
    4) ${formatNumber(r.part1)} − ${formatNumber(r.part2)} = ${formatNumber(r.diff)}<br>
    5) ${formatNumber(r.diff)} × 2 = <strong>${formatNumber(r.final)}</strong>
  `;

  resultBox.hidden = false;
  stepsEl.hidden = true;
  showStepsBtn.textContent = 'Show steps';
}

// --- event listeners ---
calcBtn.addEventListener('click', calculateAction);

clearBtn.addEventListener('click', () => {
  [xInput, pInput, changeInput].forEach(i => (i.value = ''));
  modeSelect.value = '';
  resultBox.hidden = true;
  stepsEl.hidden = true;
});

document.querySelectorAll('[data-preset-x]').forEach(btn => {
  btn.addEventListener('click', () => {
    xInput.value = btn.getAttribute('data-preset-x');
    pInput.value = btn.getAttribute('data-preset-p');
    calculateAction();
  });
});

showStepsBtn.addEventListener('click', () => {
  const hidden = stepsEl.hidden;
  stepsEl.hidden = !hidden;
  showStepsBtn.textContent = hidden ? 'Hide steps' : 'Show steps';
});

copyLinkBtn.addEventListener('click', async () => {
  const url = 'https://fable-dev.github.io/RateCal/';
  try {
    await navigator.clipboard.writeText(url);
    copyLinkBtn.textContent = 'Copied!';
    setTimeout(() => (copyLinkBtn.textContent = 'Copy link'), 1500);
  } catch {
    prompt('Copy this link:', url);
  }
});

[xInput, pInput, changeInput, modeSelect].forEach(input => {
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') calculateAction();
  });
});
