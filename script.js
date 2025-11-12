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

  const part1 = xNum * 2;  // X × 2
  const part2 = (pNum / 100) * part1;  // P% of (X × 2)
  const diff = part1 - part2;  // (X × 2) − (P% of (X × 2))
  const final = diff * 2;  // [ (X × 2) − (P% of (X × 2)) ] × 2

  return { x: xNum, p: pNum, change: changeNum, mode, part1, part2, diff, final };
}

function formatNumber(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

// --- Calculate recommended rate ---
function calculateRecommendedRate(rate) {
  // Round to nearest 10 where nett rate (rate/2) is divisible by 10
  let recommendedRate = Math.round(rate / 10) * 10;
  let nettRate = recommendedRate / 2;
  
  // If nett rate is not divisible by 10, adjust to next multiple of 20
  if (nettRate % 10 !== 0) {
    recommendedRate = Math.round(rate / 20) * 20;
  }
  
  return {
    rate: recommendedRate,
    nett: recommendedRate / 2
  };
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

  const recommended = calculateRecommendedRate(r.final);
  
  resultValue.innerHTML = `
    <strong>Rate: ${formatNumber(r.final)}</strong><br>
    <div style="font-size: 14px; margin-top: 4px;">
      Nett Rate: ${formatNumber(r.final / 2)}<br>
      <strong>Recommended Rate: ${recommended.rate}</strong><br>
      <strong>Recommended Nett Rate: ${recommended.nett}</strong>
    </div>
  `;

  let note = `Base X = ${xVal}`;
  if (r.change !== 0 && r.mode)
    note += ` → New X = ${formatNumber(r.x)} (${r.mode} by ${r.change})`;

  resultNote.textContent = `${note}, P = ${formatNumber(r.p)}%`;

  stepsEl.innerHTML = `
    <strong>Steps:</strong><br>
    ${r.change !== 0 && r.mode ? `1) Adjust X: ${xVal} ${r.mode === 'increase' ? '+' : '−'} ${r.change} = ${formatNumber(r.x)}<br>` : ''}
    ${r.change !== 0 && r.mode ? '2' : '1'}) X × 2 = ${formatNumber(r.x)} × 2 = ${formatNumber(r.part1)}<br>
    ${r.change !== 0 && r.mode ? '3' : '2'}) ${formatNumber(r.p)}% of (X × 2) = ${formatNumber(r.p/100)} × ${formatNumber(r.part1)} = ${formatNumber(r.part2)}<br>
    ${r.change !== 0 && r.mode ? '4' : '3'}) (X × 2) − (P% of X × 2) = ${formatNumber(r.part1)} − ${formatNumber(r.part2)} = ${formatNumber(r.diff)}<br>
    ${r.change !== 0 && r.mode ? '5' : '4'}) Difference × 2 = ${formatNumber(r.diff)} × 2 = <strong>${formatNumber(r.final)}</strong>
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
