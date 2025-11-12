const xInput = document.getElementById('xValue');
const calcBtn = document.getElementById('calcBtn');
const clearBtn = document.getElementById('clearBtn');
const resultBox = document.getElementById('resultBox');
const resultValue = document.getElementById('resultValue');
const resultNote = document.getElementById('resultNote');
const stepsEl = document.getElementById('steps');
const showStepsBtn = document.getElementById('showStepsBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');

function compute(x) {
  const xNum = Number(x);
  const part1 = xNum * 2;
  const part2 = 0.3 * xNum * 2;
  const diff = part1 - part2;
  const final = diff * 2;
  return { x: xNum, part1, part2, diff, final };
}

function formatNumber(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

calcBtn.addEventListener('click', () => {
  const val = xInput.value.trim();
  if (val === '') {
    alert('Please enter a value for X.');
    xInput.focus();
    return;
  }
  const parsed = Number(val);
  if (!isFinite(parsed)) {
    alert('Please enter a valid number.');
    xInput.focus();
    return;
  }
  const r = compute(parsed);
  resultValue.textContent = 'Result: ' + formatNumber(r.final);
  resultNote.textContent = `Computed from X = ${formatNumber(r.x)}`;
  stepsEl.innerHTML = `
    <strong>Steps:</strong><br>
    1) X × 2 = ${formatNumber(r.part1)}<br>
    2) 0.3 × X × 2 = ${formatNumber(r.part2)}<br>
    3) ${formatNumber(r.part1)} − ${formatNumber(r.part2)} = ${formatNumber(r.diff)}<br>
    4) ${formatNumber(r.diff)} × 2 = <strong>${formatNumber(r.final)}</strong>
  `;
  resultBox.hidden = false;
  stepsEl.hidden = true;
  showStepsBtn.textContent = 'Show steps';
});

clearBtn.addEventListener('click', () => {
  xInput.value = '';
  resultBox.hidden = true;
  stepsEl.hidden = true;
  xInput.focus();
});

document.querySelectorAll('[data-preset]').forEach(btn => {
  btn.addEventListener('click', () => {
    xInput.value = btn.getAttribute('data-preset');
    calcBtn.click();
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
  } catch (e) {
    prompt('Copy this link:', url);
  }
});

xInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') calcBtn.click();
});
