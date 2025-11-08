// credits: https://github.com/ryanechternacht/vet-check
import { debounce } from './utils';

function findPlayerIdFor(selector) {
  const el = document.querySelector(selector);
  return el ? el.id.split('-')[2] : null;
}

function addCard(byPlayer, playerId, cardName) {
  if (!playerId) return;
  if (!byPlayer[playerId]) byPlayer[playerId] = [];
  byPlayer[playerId].push(cardName);
}

function buildPlayerLookup(byPlayer) {
  return Object.keys(byPlayer).reduce((obj, playerId) => {
    const playerDiv = document.querySelector(`#player_name_${playerId} a`);
    if (!playerDiv) return obj;
    obj[playerId] = {
      id: playerId,
      name: playerDiv.innerHTML,
      color: playerDiv.style.color,
    };
    return obj;
  }, {});
}

function formatPlayerCards([id, cards], lookup) {
  const player = lookup[id];
  if (!player) return '';
  const { name, color } = player;
  return `<div><span style="font-weight:600;color:${color};">${name}:</span> ${cards.join(', ')}</div>`;
}

function generateRemindersHTML() {
  const byPlayer = {};

  addCard(byPlayer, findPlayerIdFor('.player-board-inPlay-sponsors:has(#card-S203_Veterinarian)'), 'Veterinarian');
  addCard(byPlayer, findPlayerIdFor('.player-board-inPlay-sponsors:has(#card-S225_QuarantineLab)'), 'Quarantine Lab');
  addCard(byPlayer, findPlayerIdFor('.player-board-inPlay-sponsors:has(#card-S241_Hydrologist)'), 'Hydrologist');
  addCard(byPlayer, findPlayerIdFor('.player-board-inPlay-sponsors:has(#card-S242_Geologist)'), 'Geologist');
  addCard(byPlayer, findPlayerIdFor('.player-board-inPlay-sponsors:has(#card-S228_WazaSmallAnimalProgram)'), 'Waza Small');
  addCard(byPlayer, findPlayerIdFor('.player-board-inPlay-sponsors:has(#card-S263_WazaLargeAnimalProgram)'), 'Waza Large');
  addCard(byPlayer, findPlayerIdFor('.player-board-inPlay-sponsors:has(#card-S227_WazaSpecialAssignment)'), 'Waza Special Assignment');
  addCard(byPlayer, findPlayerIdFor('.player-board-inPlay-sponsors:has(#card-S262_Explorer)'), 'Explorer');
  addCard(byPlayer, findPlayerIdFor('.player-board-inPlay-sponsors:has(#card-S219_DiversityResearcher)'), 'Diversity Researcher');

  const lookup = buildPlayerLookup(byPlayer);
  const rows = Object.entries(byPlayer)
    .map(entry => formatPlayerCards(entry, lookup))
    .filter(Boolean)
    .join('');

  // If nothing to show, return empty string
  if (!rows) {
    return '';
  }

  return `
    <div style="
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      width: 100%;
      gap: 6px;
      text-align: center;
      padding: 4px 0;
    ">
      ${rows}
    </div>
  `;
}

function ensureBox() {
  let box = document.querySelector('#reminder-box');
  if (!box) {
    const mainHeader = document.querySelector('#page-title');
    if (!mainHeader) return null;
    mainHeader.insertAdjacentHTML(
      'afterend',
      `<div id="reminder-box"
            style="margin-top:8px;background-color:#f0f0f0;box-shadow:0 3px 8px rgba(0,0,0,.3);
                   padding:8px 0;display:flex;flex-direction:row;align-items:center;"></div>`
    );
    box = document.querySelector('#reminder-box');
  }
  return box;
}

export function renderReminders() {
  let box = document.querySelector('#reminder-box');

  const html = generateRemindersHTML();

  if (!html) {
    // If no reminders → remove the box if it exists
    if (box) {
      box.remove();
    }
    return;
  }

  // Otherwise ensure the box exists and update its content
  if (!box) {
    const mainHeader = document.querySelector('#page-title');
    if (!mainHeader) return;
    mainHeader.insertAdjacentHTML(
      'afterend',
      `<div id="reminder-box"
            style="margin-top:8px;background-color:#f0f0f0;box-shadow:0 3px 8px rgba(0,0,0,.3);
                   padding:8px 0;display:flex;flex-direction:row;align-items:center;"></div>`
    );
    box = document.querySelector('#reminder-box');
  }

  box.innerHTML = html;
}

// Hook into DOM changes so we update when cards move
export function initReminders() {
  renderReminders(); // initial render

  const refresh = debounce(renderReminders, 300);

  // Observe sponsor areas and player name changes
  const roots = [
    document.querySelector('#page-title'),
    ...document.querySelectorAll('.player-board-inPlay-sponsors'),
    ...document.querySelectorAll('[id^="player_name_"]'),
  ].filter(Boolean);

  const observer = new MutationObserver(() => refresh());
  roots.forEach(root => observer.observe(root, { childList: true, subtree: true, attributes: true }));

  // Fallback: periodic refresh in case parts of the UI re-render elsewhere
  const intervalId = setInterval(refresh, 5000);

  // Optional cleanup API if you ever need it
  return () => {
    observer.disconnect();
    clearInterval(intervalId);
  };
}
