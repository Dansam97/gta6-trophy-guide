// Leonida Legend — entry point. Loads the official trophy data from
// data/trophies.json (a file inside app/, so the guide works fully
// offline), wires the tracker controls to the saved progress, and renders
// the checklist, the selected trophy's guide, the roadmap, the missable
// watch and the sources. The view can be deep-linked with the hash:
// #view=roadmap, #grade=silver, #kind=missable, #spoiler=1, #open=17.

import {
  exportProgress,
  importProgress,
  loadProgress,
  saveProgress,
} from './state.js';
import {
  renderDetail,
  renderMissables,
  renderRoadmap,
  renderSources,
  trophyCard,
} from './render.js';

const data = await (await fetch('data/trophies.json')).json();
const trophies = data.trophies;
const state = loadProgress();
let selectedName = trophies[0].name;
let currentView = 'tracker';

const listEl = document.getElementById('trophy-list');
const detailEl = document.getElementById('detail');
const searchEl = document.getElementById('search');
const kindEl = document.getElementById('kind-filter');
const gradeEl = document.getElementById('grade-filter');
const statusEl = document.getElementById('status-filter');
const spoilerEl = document.getElementById('spoiler-toggle');
const onlineNoteEl = document.getElementById('online-note');
const progressText = document.getElementById('progress-text');
const gradeText = document.getElementById('grade-text');
const ringEl = document.getElementById('progress-ring');

function gradeCounts(earnedNames) {
  const counts = { platinum: 0, gold: 0, silver: 0, bronze: 0 };
  for (const trophy of trophies) {
    if (earnedNames.has(trophy.name)) counts[trophy.grade] += 1;
  }
  return counts;
}

function renderProgress() {
  const earnedCount = trophies.filter((t) => state.earned.has(t.name)).length;
  const pct = Math.round((earnedCount / trophies.length) * 100);
  ringEl.style.background = `conic-gradient(var(--teal) ${pct * 3.6}deg, #3a2a66 ${pct * 3.6}deg)`;
  ringEl.textContent = `${pct}%`;
  progressText.textContent = `${earnedCount} of ${trophies.length} trophies earned`;
  const counts = gradeCounts(state.earned);
  gradeText.textContent =
    `Platinum ${counts.platinum}/1 · Gold ${counts.gold}/2 · Silver ${counts.silver}/6 · Bronze ${counts.bronze}/46`;
}

function matchesFilters(trophy) {
  const kind = kindEl.value;
  if (kind === 'missable' && !trophy.missable) return false;
  if (kind === 'online') return false;
  if (kind !== 'all' && kind !== 'missable' && trophy.kind !== kind) return false;
  if (gradeEl.value !== 'all' && trophy.grade !== gradeEl.value) return false;
  if (statusEl.value === 'earned' && !state.earned.has(trophy.name)) return false;
  if (statusEl.value === 'open' && state.earned.has(trophy.name)) return false;
  const query = searchEl.value.trim().toLowerCase();
  if (query) {
    const haystack = `${trophy.name} ${trophy.description} ${trophy.target ?? ''} ${trophy.guide}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

function toggleEarned(name, earned) {
  if (earned) state.earned.add(name);
  else state.earned.delete(name);
  saveProgress(state);
  renderAll();
}

function selectTrophy(name, switchView) {
  selectedName = name;
  if (switchView) setView('tracker');
  renderAll();
}

const resultCountEl = document.createElement('p');
resultCountEl.id = 'result-count';
resultCountEl.style.cssText = 'margin:10px 2px 0;color:var(--ink-dim);font-size:13.5px;';
document.getElementById('toolbar').after(resultCountEl);

function renderAll() {
  renderProgress();
  onlineNoteEl.hidden = kindEl.value !== 'online';
  listEl.replaceChildren();
  for (const trophy of trophies) {
    if (matchesFilters(trophy)) {
      listEl.append(trophyCard(trophy, state, selectedName, toggleEarned, (name) => selectTrophy(name, false)));
    }
  }
  if (listEl.children.length === 0) {
    const empty = document.createElement('li');
    empty.textContent = kindEl.value === 'online'
      ? 'No online trophies exist in the official list.'
      : 'No trophies match those filters.';
    listEl.append(empty);
  }
  const shown = trophies.filter(matchesFilters).length;
  const stillOpen = trophies.length - trophies.filter((t) => state.earned.has(t.name)).length;
  resultCountEl.textContent = `Showing ${shown} of ${trophies.length} trophies · ${stillOpen} still to earn for the platinum.`;
  const selected = trophies.find((t) => t.name === selectedName) ?? trophies[0];
  renderDetail(detailEl, selected, state, toggleEarned);
  renderRoadmap(document.getElementById('roadmap-list'), trophies, (name) => selectTrophy(name, true));
  renderMissables(document.getElementById('missable-list'), trophies, (name) => selectTrophy(name, true));
}

function setView(view) {
  currentView = view;
  for (const section of ['tracker', 'roadmap', 'missables', 'sources']) {
    document.getElementById(`view-${section}`).hidden = section !== view;
  }
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === view);
  }
}

for (const tab of document.querySelectorAll('.tab')) {
  tab.addEventListener('click', () => setView(tab.dataset.view));
}
for (const control of [searchEl, kindEl, gradeEl, statusEl]) {
  control.addEventListener('input', renderAll);
  control.addEventListener('change', renderAll);
}
spoilerEl.checked = state.spoiler;
spoilerEl.addEventListener('change', () => {
  state.spoiler = spoilerEl.checked;
  saveProgress(state);
  renderAll();
});
document.getElementById('export-btn').addEventListener('click', () => exportProgress(state));
document.getElementById('reset-btn').addEventListener('click', () => {
  state.earned.clear();
  saveProgress(state);
  renderAll();
});
document.getElementById('import-file').addEventListener('change', async (event) => {
  const file = event.target.files[0];
  if (!file) return;
  try {
    const names = await importProgress(file);
    state.earned = new Set([...names].filter((name) => trophies.some((t) => t.name === name)));
    saveProgress(state);
    renderAll();
  } catch {
    progressText.textContent = 'That import file could not be read — progress unchanged.';
  }
  event.target.value = '';
});

function applyHash() {
  const params = new URLSearchParams(location.hash.replace(/^#/, ''));
  if (params.get('view')) setView(params.get('view'));
  if (params.get('grade')) gradeEl.value = params.get('grade');
  if (params.get('kind')) kindEl.value = params.get('kind');
  if (params.get('spoiler') === '1') {
    state.spoiler = true;
    spoilerEl.checked = true;
  }
  if (params.get('open')) {
    const byId = trophies.find((t) => String(t.id) === params.get('open'));
    const byName = trophies.find((t) => t.name === params.get('open'));
    if (byId || byName) selectedName = (byId ?? byName).name;
  }
}
window.addEventListener('hashchange', () => {
  applyHash();
  renderAll();
});

renderSources(document.getElementById('source-list'));
applyHash();
renderAll();
