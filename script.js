const scoreElement = document.querySelector('#score');
const clickButton = document.querySelector('#click-btn');
const buyAutoButton = document.querySelector('#buy-auto');
const autoCostElement = document.querySelector('#auto-cost');
const statusElement = document.querySelector('#status');

let score = 0;
let autoClickers = 0;
let autoCost = 15;

const render = () => {
  scoreElement.textContent = score;
  autoCostElement.textContent = autoCost;
  buyAutoButton.disabled = score < autoCost;
};

const setStatus = (message) => {
  statusElement.textContent = message;
};

clickButton.addEventListener('click', () => {
  score += 1;
  render();
});

buyAutoButton.addEventListener('click', () => {
  if (score < autoCost) {
    setStatus('Не хватает очков для покупки.');
    return;
  }

  score -= autoCost;
  autoClickers += 1;
  autoCost = Math.ceil(autoCost * 1.8);

  setStatus(`Куплен автокликер #${autoClickers}.`);
  render();
});

setInterval(() => {
  if (autoClickers === 0) {
    return;
  }

  score += autoClickers;
  render();
}, 1000);

render();
