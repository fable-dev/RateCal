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
const infoBtn = document.getElementById('infoBtn');
const formulaModal = document.getElementById('formulaModal');
const closeModal = document.getElementById('closeModal');

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

// --- Calculate recommended rate with ceiling 10 logic ---
function calculateRecommendedRate(rate) {
  // Use ceiling 10 and ensure nett rate is divisible by 10
  let recommendedRate = Math.ceil(rate / 10) * 10;
  let nettRate = recommendedRate / 2;
  
  // If nett rate is not divisible by 10, adjust to next multiple of 20
  if (nettRate % 10 !== 0) {
    recommendedRate = Math.ceil(rate / 20) * 20;
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
    alert('Please enter valid numbers for Product Cost and Percentage.');
    return;
  }

  const recommended = calculateRecommendedRate(r.final);
  
  resultValue.innerHTML = `
    <div style="margin-bottom: 8px;">
      <span style="opacity: 0.8;">MRP: </span><strong>₹${formatNumber(r.final)}</strong>
    </div>
    <div style="margin-bottom: 8px;">
      <span style="opacity: 0.8;">Nett Rate: </span>₹${formatNumber(r.final / 2)}
    </div>
    <div style="margin-bottom: 8px; padding-top: 8px; border-top: 1px solid rgba(255,255,255,0.2);">
      <span style="opacity: 0.8;">Recommended MRP: </span><strong>₹${recommended.rate}</strong>
    </div>
    <div>
      <span style="opacity: 0.8;">Recommended Nett: </span><strong>₹${recommended.nett}</strong>
    </div>
  `;

  let note = `Base Cost = ₹${xVal}`;
  if (r.change !== 0 && r.mode)
    note += ` → New Cost = ₹${formatNumber(r.x)} (${r.mode === 'increase' ? 'increased' : 'decreased'} by ₹${r.change})`;

  resultNote.textContent = `${note}, Margin = ${formatNumber(r.p)}%`;

  stepsEl.innerHTML = `
    <strong>Calculation Steps:</strong><br>
    ${r.change !== 0 && r.mode ? `1) Adjust Cost: ₹${xVal} ${r.mode === 'increase' ? '+' : '−'} ₹${r.change} = ₹${formatNumber(r.x)}<br>` : ''}
    ${r.change !== 0 && r.mode ? '2' : '1'}) Cost × 2 = ₹${formatNumber(r.x)} × 2 = ₹${formatNumber(r.part1)}<br>
    ${r.change !== 0 && r.mode ? '3' : '2'}) ${formatNumber(r.p)}% of (Cost × 2) = ${formatNumber(r.p/100)} × ₹${formatNumber(r.part1)} = ₹${formatNumber(r.part2)}<br>
    ${r.change !== 0 && r.mode ? '4' : '3'}) (Cost × 2) − (Margin% of Cost × 2) = ₹${formatNumber(r.part1)} − ₹${formatNumber(r.part2)} = ₹${formatNumber(r.diff)}<br>
    ${r.change !== 0 && r.mode ? '5' : '4'}) Difference × 2 = ₹${formatNumber(r.diff)} × 2 = <strong>₹${formatNumber(r.final)}</strong>
  `;

  resultBox.hidden = false;
  stepsEl.hidden = true;
  showStepsBtn.textContent = 'Show Calculation';
}

// --- Modal Functions ---
function showModal() {
  formulaModal.hidden = false;
  document.body.style.overflow = 'hidden';
}

function hideModal() {
  formulaModal.hidden = true;
  document.body.style.overflow = 'auto';
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
  showStepsBtn.textContent = hidden ? 'Hide Calculation' : 'Show Calculation';
});

copyLinkBtn.addEventListener('click', async () => {
  const url = 'https://fable-dev.github.io/RateCal/';
  try {
    await navigator.clipboard.writeText(url);
    copyLinkBtn.textContent = 'Copied!';
    setTimeout(() => (copyLinkBtn.textContent = 'Share Calculator'), 1500);
  } catch {
    prompt('Copy this link:', url);
  }
});

// Modal event listeners
infoBtn.addEventListener('click', showModal);
closeModal.addEventListener('click', hideModal);

// Close modal when clicking outside
formulaModal.addEventListener('click', (e) => {
  if (e.target === formulaModal) {
    hideModal();
  }
});

// Close modal with Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !formulaModal.hidden) {
    hideModal();
  }
});

[xInput, pInput, changeInput, modeSelect].forEach(input => {
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') calculateAction();
  });
});
