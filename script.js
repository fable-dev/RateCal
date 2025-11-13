// Element selectors
const formulaTypeSelect = document.getElementById('formulaType');
const xInput = document.getElementById('xValue');
const cInput = document.getElementById('cValue');
const cValueGroup = document.getElementById('cValueGroup');
const pInput = document.getElementById('pValue');
const changeInput = document.getElementById('changeValue');
const modeSelect = document.getElementById('changeMode');
const calcBtn = document.getElementById('calcBtn');
const clearBtn = document.getElementById('clearBtn');
const resultBox = document.getElementById('resultBox');
const resultValue = document.getElementById('resultValue');
const resultNote = document.getElementById('resultNote');
const resultActions = document.getElementById('resultActions');
const stepsEl = document.getElementById('steps');
const showStepsBtn = document.getElementById('showStepsBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');
const infoBtn = document.getElementById('infoBtn');
const formulaModal = document.getElementById('formulaModal');
const closeModal = document.getElementById('closeModal');
const basicFormulaSection = document.getElementById('basicFormulaSection');
const compoundFormulaSection = document.getElementById('compoundFormulaSection');

// --- core logic ---
function computeBasic(x, p, change, mode) {
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

  return { 
    formula: 'basic',
    x: xNum, 
    p: pNum, 
    change: changeNum, 
    mode, 
    part1, 
    part2, 
    diff, 
    final 
  };
}

function computeCompound(x, c, p, change, mode) {
  let xNum = parseFloat(x);
  const cNum = parseFloat(c);
  const pNum = parseFloat(p);
  const changeNum = parseFloat(change) || 0;

  if (!isFinite(xNum) || !isFinite(cNum) || !isFinite(pNum)) return null;

  // Adjust X based on change and mode
  if (mode === 'increase') xNum += changeNum;
  else if (mode === 'decrease') xNum -= changeNum;

  // Apply compound percentage C%
  const xAdjusted = xNum - (cNum / 100) * xNum;  // X - (C% of X)
  
  const part1 = xAdjusted * 2;  // Adjusted X × 2
  const part2 = (pNum / 100) * (xNum * 2);  // P% of (Original X × 2)
  const diff = part1 - part2;  // (Adjusted X × 2) − (P% of Original X × 2)
  const final = diff * 2;  // [ (Adjusted X × 2) − (P% of Original X × 2) ] × 2

  return { 
    formula: 'compound',
    x: xNum, 
    c: cNum,
    p: pNum, 
    change: changeNum, 
    mode, 
    xAdjusted,
    part1, 
    part2, 
    diff, 
    final 
  };
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
  const formulaType = formulaTypeSelect.value;
  const xVal = xInput.value.trim();
  const cVal = cInput.value.trim() || '10';
  const pVal = pInput.value.trim() || '30';
  const changeVal = changeInput.value.trim() || '0';
  const mode = modeSelect.value;

  let r;
  if (formulaType === 'basic') {
    r = computeBasic(xVal, pVal, changeVal, mode);
  } else {
    r = computeCompound(xVal, cVal, pVal, changeVal, mode);
  }

  if (!r) {
    alert('Please enter valid numbers for all required fields.');
    return;
  }

  const recommended = calculateRecommendedRate(r.final);
  
  resultValue.innerHTML = `
    <div style="margin-bottom: 12px;">
      <span style="opacity: 0.8;">MRP: </span><strong>₹${formatNumber(r.final)}</strong>
    </div>
    <div style="margin-bottom: 12px;">
      <span style="opacity: 0.8;">Nett Rate: </span>₹${formatNumber(r.final / 2)}
    </div>
    <div style="margin-bottom: 12px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.2);">
      <span style="opacity: 0.8;">Recommended MRP: </span><strong>₹${recommended.rate}</strong>
    </div>
    <div>
      <span style="opacity: 0.8;">Recommended Nett: </span><strong>₹${recommended.nett}</strong>
    </div>
  `;

  let note = `Base Cost = ₹${xVal}`;
  if (r.change !== 0 && r.mode)
    note += ` → New Cost = ₹${formatNumber(r.x)} (${r.mode === 'increase' ? 'increased' : 'decreased'} by ₹${r.change})`;

  if (r.formula === 'compound') {
    note += `, C = ${formatNumber(r.c)}%`;
  }
  
  resultNote.textContent = `${note}, P = ${formatNumber(r.p)}%`;

  // Show result elements and update styling
  document.querySelector('.result-placeholder').style.display = 'none';
  resultValue.style.display = 'block';
  resultNote.style.display = 'block';
  resultActions.style.display = 'flex';
  resultBox.classList.add('has-results');

  // Generate step-by-step explanation based on formula type
  if (r.formula === 'basic') {
    stepsEl.innerHTML = `
      <strong>Calculation Steps (Basic Formula):</strong><br>
      ${r.change !== 0 && r.mode ? `1) Adjust Cost: ₹${xVal} ${r.mode === 'increase' ? '+' : '−'} ₹${r.change} = ₹${formatNumber(r.x)}<br>` : ''}
      ${r.change !== 0 && r.mode ? '2' : '1'}) Cost × 2 = ₹${formatNumber(r.x)} × 2 = ₹${formatNumber(r.part1)}<br>
      ${r.change !== 0 && r.mode ? '3' : '2'}) ${formatNumber(r.p)}% of (Cost × 2) = ${formatNumber(r.p/100)} × ₹${formatNumber(r.part1)} = ₹${formatNumber(r.part2)}<br>
      ${r.change !== 0 && r.mode ? '4' : '3'}) (Cost × 2) − (Margin% of Cost × 2) = ₹${formatNumber(r.part1)} − ₹${formatNumber(r.part2)} = ₹${formatNumber(r.diff)}<br>
      ${r.change !== 0 && r.mode ? '5' : '4'}) Difference × 2 = ₹${formatNumber(r.diff)} × 2 = <strong>₹${formatNumber(r.final)}</strong>
    `;
  } else {
    stepsEl.innerHTML = `
      <strong>Calculation Steps (Compound Formula):</strong><br>
      ${r.change !== 0 && r.mode ? `1) Adjust Cost: ₹${xVal} ${r.mode === 'increase' ? '+' : '−'} ₹${r.change} = ₹${formatNumber(r.x)}<br>` : ''}
      ${r.change !== 0 && r.mode ? '2' : '1'}) Apply C%: ₹${formatNumber(r.x)} − ${formatNumber(r.c)}% of ₹${formatNumber(r.x)} = ₹${formatNumber(r.xAdjusted)}<br>
      ${r.change !== 0 && r.mode ? '3' : '2'}) Adjusted Cost × 2 = ₹${formatNumber(r.xAdjusted)} × 2 = ₹${formatNumber(r.part1)}<br>
      ${r.change !== 0 && r.mode ? '4' : '3'}) ${formatNumber(r.p)}% of (Original Cost × 2) = ${formatNumber(r.p/100)} × ₹${formatNumber(r.x * 2)} = ₹${formatNumber(r.part2)}<br>
      ${r.change !== 0 && r.mode ? '5' : '4'}) (Adjusted Cost × 2) − (Margin% of Original Cost × 2) = ₹${formatNumber(r.part1)} − ₹${formatNumber(r.part2)} = ₹${formatNumber(r.diff)}<br>
      ${r.change !== 0 && r.mode ? '6' : '5'}) Difference × 2 = ₹${formatNumber(r.diff)} × 2 = <strong>₹${formatNumber(r.final)}</strong>
    `;
  }

  stepsEl.style.display = 'none';
  showStepsBtn.textContent = 'Show Calculation';
}

// --- Formula Type Change Handler ---
function handleFormulaTypeChange() {
  const formulaType = formulaTypeSelect.value;
  
  if (formulaType === 'compound') {
    cValueGroup.style.display = 'block';
  } else {
    cValueGroup.style.display = 'none';
  }
}

// --- Clear Function ---
function clearAll() {
  [xInput, pInput, changeInput].forEach(i => (i.value = ''));
  modeSelect.value = '';
  
  // Reset result display
  document.querySelector('.result-placeholder').style.display = 'block';
  resultValue.style.display = 'none';
  resultNote.style.display = 'none';
  resultActions.style.display = 'none';
  resultBox.classList.remove('has-results');
  stepsEl.style.display = 'none';
}

// --- Modal Functions ---
function showModal() {
  formulaModal.classList.add('show');
  document.body.style.overflow = 'hidden';
  
  // Update modal content based on current formula type
  const formulaType = formulaTypeSelect.value;
  if (formulaType === 'basic') {
    basicFormulaSection.style.display = 'block';
    compoundFormulaSection.style.display = 'none';
  } else {
    basicFormulaSection.style.display = 'none';
    compoundFormulaSection.style.display = 'block';
  }
}

function hideModal() {
  formulaModal.classList.remove('show');
  document.body.style.overflow = 'auto';
}

// --- Initialize on page load ---
document.addEventListener('DOMContentLoaded', function() {
  hideModal(); // Ensure modal is hidden when page loads
  handleFormulaTypeChange(); // Set initial state for formula type
});

// --- event listeners ---
formulaTypeSelect.addEventListener('change', handleFormulaTypeChange);
calcBtn.addEventListener('click', calculateAction);

clearBtn.addEventListener('click', clearAll);

document.querySelectorAll('[data-preset-x]').forEach(btn => {
  btn.addEventListener('click', () => {
    xInput.value = btn.getAttribute('data-preset-x');
    pInput.value = btn.getAttribute('data-preset-p');
    calculateAction();
  });
});

showStepsBtn.addEventListener('click', () => {
  const hidden = stepsEl.style.display === 'none';
  stepsEl.style.display = hidden ? 'block' : 'none';
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
  if (e.key === 'Escape' && formulaModal.classList.contains('show')) {
    hideModal();
  }
});

[xInput, pInput, cInput, changeInput, modeSelect].forEach(input => {
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') calculateAction();
  });
});
