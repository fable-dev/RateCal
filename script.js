const xInput = document.getElementById('xValue');
const pInput = document.getElementById('pValue');
const calcBtn = document.getElementById('calcBtn');
const resultBox = document.getElementById('resultBox');
const resultValue = document.getElementById('resultValue');
const resultNote = document.getElementById('resultNote');
const stepsEl = document.getElementById('steps');
const showStepsBtn = document.getElementById('showStepsBtn');
const copyLinkBtn = document.getElementById('copyLinkBtn');

function compute(x, p) {
  const xNum = Number(x);
  const pNum = Number(p);
  const part1 = xNum * 2;
  const part2 = (pNum / 100) * xNum * 2;  // percentage-based
  const diff = part1 - part2;
  const final = diff * 2;
  return { x: xNum, p: pNum, part1, part2, diff, final };
}

function formatNumber(n) {
  return Number.isInteger(n) ? n.toString() : n.toFixed(2);
}

calcBtn.addEventListener('click', () => {
  const xVal = xInput.value.trim();
  const pVal = pInput.value.trim();

  if (xVal === '' || pVal === '') {
    alert('Please enter both X value and percentage.');
    return;
  }

  const parsedX = Number(xVal);
  const parsedP = Number(pVal);

  if (!isFinite(parsedX) || !isFinite(parsedP)) {
    alert('Please enter valid numbers.');
    return;
  }

  const r = compute(parsedX, parsedP);

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
});

document.querySelectorAll('[data-preset-x]').forEach(btn => {
  btn.addEventListener('click', () => {
    xInput.value = btn.getAttribute('data-preset-x');
    pInput.value = btn.getAttribute('data-preset-p');
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

[xInput, pInput].forEach(input => {
  input.addEventListener('keypress', e => {
    if (e.key === 'Enter') calcBtn.click();
  });
});