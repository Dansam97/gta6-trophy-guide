// Rendering for the Leonida Legend guide: trophy cards for the checklist,
// the selected trophy's full guide panel, the roadmap, the missable list
// and the sources page. Pure DOM building from the trophy data and the
// current tracker state — no network, no framework.

import { ROADMAP_STAGES, SOURCE_CATALOG } from './state.js';

export function kindLabel(trophy) {
  if (trophy.kind === 'story') return 'Story';
  if (trophy.kind === 'collectibles') return 'Collectibles';
  if (trophy.kind === 'activities') return 'Activities';
  if (trophy.kind === 'platinum') return 'Platinum';
  return trophy.kind;
}

export function isSpoilerHidden(trophy, state) {
  return state.spoiler && trophy.kind === 'story' && !state.earned.has(trophy.name);
}

function pill(text, cls) {
  const span = document.createElement('span');
  span.className = `pill ${cls ?? ''}`;
  span.textContent = text;
  return span;
}

export function trophyCard(trophy, state, selectedName, onToggle, onSelect) {
  const hidden = isSpoilerHidden(trophy, state);
  const card = document.createElement('div');
  card.className = `card grade-${trophy.grade}${state.earned.has(trophy.name) ? ' earned' : ''}${hidden ? ' spoiled' : ''}${trophy.name === selectedName ? ' selected' : ''}`;
  card.setAttribute('role', 'button');
  card.tabIndex = 0;

  const box = document.createElement('input');
  box.type = 'checkbox';
  box.checked = state.earned.has(trophy.name);
  box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
  box.addEventListener('click', (event) => event.stopPropagation());
  box.addEventListener('change', () => onToggle(trophy.name, box.checked));
  card.append(box);

  const names = document.createElement('div');
  names.className = 'names';
  const title = document.createElement('div');
  title.className = 'tname';
  title.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  const desc = document.createElement('div');
  desc.className = 'tdesc';
  desc.textContent = hidden ? 'Spoiler shield is on — earn this story trophy to reveal it.' : trophy.description;
  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(pill(trophy.grade, `grade-${trophy.grade}`));
  meta.append(pill(kindLabel(trophy)));
  meta.append(pill(`Stage ${trophy.stage}`, 'stage'));
  if (trophy.target) meta.append(pill(trophy.target));
  if (trophy.missable) meta.append(pill('Missable watch', 'miss'));
  names.append(title, desc, meta);
  card.append(names);

  card.addEventListener('click', () => onSelect(trophy.name));
  card.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') onSelect(trophy.name);
  });
  return card;
}

export function renderDetail(panel, trophy, state, onToggle) {
  panel.replaceChildren();
  const hidden = isSpoilerHidden(trophy, state);

  const heading = document.createElement('h2');
  heading.textContent = hidden ? 'Hidden story trophy' : trophy.name;
  panel.append(heading);

  const official = document.createElement('p');
  official.className = 'official';
  official.textContent = hidden
    ? 'Name and description hidden by the spoiler shield until earned.'
    : `Official description: “${trophy.description}”`;
  panel.append(official);

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.append(pill(trophy.grade, `grade-${trophy.grade}`));
  meta.append(pill(kindLabel(trophy)));
  meta.append(pill(`Roadmap stage ${trophy.stage}`, 'stage'));
  if (trophy.target) meta.append(pill(`Target: ${trophy.target}`));
  panel.append(meta);

  if (trophy.missable) {
    const warn = document.createElement('p');
    warn.className = 'warn';
    warn.textContent = 'MISSABLE WATCH — flagged from the wording of the official description. Keep a manual save before the relevant story beat and take the moment when it appears; do not rely on cleaning this up later.';
    panel.append(warn);
  }

  const guide = document.createElement('p');
  guide.className = 'guide-text';
  guide.textContent = trophy.guide;
  panel.append(guide);

  const sources = document.createElement('p');
  sources.className = 'src';
  sources.append(document.createTextNode('Sources: '));
  trophy.sources.forEach((key, index) => {
    const entry = SOURCE_CATALOG[key];
    if (!entry) return;
    if (index > 0) sources.append(document.createTextNode(' · '));
    if (entry.url) {
      const link = document.createElement('a');
      link.href = entry.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = entry.label;
      sources.append(link);
    } else {
      sources.append(document.createTextNode(entry.label));
    }
  });
  panel.append(sources);

  const stepsTitle = document.createElement('h3');
  stepsTitle.textContent = 'What to do';
  const steps = document.createElement('ol');
  for (const step of trophy.steps) {
    const item = document.createElement('li');
    item.textContent = step;
    steps.append(item);
  }
  panel.append(stepsTitle, steps);

  const stage = ROADMAP_STAGES.find((entry) => entry.n === trophy.stage);
  if (stage) {
    const stageNote = document.createElement('p');
    stageNote.textContent = `Roadmap: stage ${stage.n} — ${stage.title}.`;
    panel.append(stageNote);
  }

  const done = document.createElement('button');
  done.type = 'button';
  done.className = 'done-btn';
  const earnedNow = state.earned.has(trophy.name);
  done.textContent = earnedNow ? 'Earned ✓ — tap to undo' : 'Mark as earned';
  done.addEventListener('click', () => onToggle(trophy.name, !earnedNow));
  panel.append(done);
}

export function renderRoadmap(container, trophies, onSelect) {
  container.replaceChildren();
  for (const stage of ROADMAP_STAGES) {
    const block = document.createElement('div');
    block.className = 'stage-block';
    const title = document.createElement('h3');
    title.textContent = `Stage ${stage.n} — ${stage.title}`;
    const text = document.createElement('p');
    text.textContent = stage.text;
    const list = document.createElement('ul');
    for (const trophy of trophies.filter((entry) => entry.stage === stage.n)) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#view=tracker';
      link.textContent = trophy.missable ? `${trophy.name} — MISSABLE WATCH` : trophy.name;
      link.addEventListener('click', (event) => {
        event.preventDefault();
        onSelect(trophy.name);
      });
      item.append(link);
      list.append(item);
    }
    block.append(title, text, list);
    container.append(block);
  }
}

export function renderMissables(container, trophies, onSelect) {
  container.replaceChildren();
  for (const trophy of trophies.filter((entry) => entry.missable)) {
    const block = document.createElement('div');
    block.className = 'miss-card';
    const title = document.createElement('h3');
    title.textContent = `${trophy.name} (${trophy.grade})`;
    const official = document.createElement('p');
    official.className = 'official';
    official.textContent = `Official description: “${trophy.description}”`;
    const guide = document.createElement('p');
    guide.textContent = trophy.guide;
    const srcLine = document.createElement('p');
    srcLine.className = 'src';
    srcLine.textContent = `Sources: ${trophy.sources.map((key) => SOURCE_CATALOG[key]?.label ?? key).join(' · ')}`;
    const open = document.createElement('button');
    open.type = 'button';
    open.className = 'done-btn';
    open.textContent = 'Open full guide';
    open.addEventListener('click', () => onSelect(trophy.name));
    block.append(title, official, guide, srcLine, open);
    container.append(block);
  }
}

export function renderSources(container) {
  container.replaceChildren();
  for (const entry of Object.values(SOURCE_CATALOG)) {
    const block = document.createElement('div');
    block.className = 'src-card';
    if (entry.url) {
      const link = document.createElement('a');
      link.href = entry.url;
      link.target = '_blank';
      link.rel = 'noreferrer';
      link.textContent = entry.label;
      block.append(link);
    } else {
      block.textContent = entry.label;
    }
    container.append(block);
  }
}
