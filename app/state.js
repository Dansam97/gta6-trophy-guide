// Progress state for the Leonida Legend tracker: what is earned, what is
// selected, and the spoiler setting. Everything is stored only in this
// browser under one localStorage key; export and import move that same
// earned list between devices as a small JSON file. This module never
// touches the network.

export const STORAGE_KEY = 'leonida-legend-progress-v1';

export const SOURCE_CATALOG = {
  official: {
    label: 'Official PS5 trophy list (PlayStation), mirrored by Exophase — names, descriptions, grades and counts',
    url: 'https://www.exophase.com',
  },
  psn: {
    label: 'PSNProfiles — GTA VI trophy list, tracked counts and completion totals',
    url: 'https://psnprofiles.com',
  },
  wiki: {
    label: 'GTA Wiki — Leonida, VCIA and series terminology background',
    url: 'https://gta.fandom.com',
  },
  craft: {
    label: "Author's strategy notes, written for this guide and cross-checked against the official description",
    url: '',
  },
};

export const ROADMAP_STAGES = [
  {
    n: 1,
    title: 'Arrival — opening mission and Chapters 1–2',
    text: 'Play Gone Fishing and the first two chapters. Start two habits now: a manual save before every story mission, and trying each new activity once as it appears. Begin stranger strands the moment their markers show.',
  },
  {
    n: 2,
    title: 'The middle chapters — Chapters 3–4 and the named missions',
    text: 'Finish Chapters 3 and 4 and the named missions (Child\'s Play, Headliners, VCIA Takedown, Operation Savage Glory, The Cartel Heist). Save before every VCIA beat: Catch Me If You Can is a missable-watch trophy tied to the airport.',
  },
  {
    n: 3,
    title: 'Finale and the stranger strands',
    text: 'Keep a pre-finale save, complete the final mission, then close out the strands: Andy, Kenton, Billy, Randy, Tyrone and Bret\'s hunt. Five named-contact trophies plus any three more strands also earn the Strangers & Freaks silver.',
  },
  {
    n: 4,
    title: 'Collectibles and the full map',
    text: 'Sweep Leonida district by district: 3 card sets, 18 meditation spots, 100 vehicle discoveries, WAiNK It in 100 places, and all 52 areas explored. Log each item in the tracker as you go — none of these sets shows a trustworthy in-game checklist.',
  },
  {
    n: 5,
    title: 'Activity mastery',
    text: 'The skill stage: gold in all 42 Shooting Range challenges, 250 stunts, a drone-race win at all 14 Top Fun locations, 20 different race wins, Cal\'s fishing challenge, an arcade completion and 50 challenges. Chip at the range golds across the whole run, not in one sitting.',
  },
  {
    n: 6,
    title: 'Crime, cash and property',
    text: 'The money stage: 5 bank vaults, an armored truck, one illegal operation per gang (9), 3 shops back-to-back with your partner, a 4-star escape together, $250,000 laundered, $100,000 spent, all 8 garages bought and 10 vehicles registered on Scooter Bros.',
  },
  {
    n: 7,
    title: 'Cleanup — 100%, the cryptic one-offs, platinum',
    text: 'Close A Long Road (100% completion) by comparing the in-game completion screen with this tracker, then hunt the deliberately vague one-offs (Challenging Tank, The Truth Is Out There, Ten Pin, the showroom and partnership moments on the missable watch). The platinum, Vice Got a Price!, is automatic when the other 54 are earned.',
  },
];

export function loadProgress() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return {
      earned: new Set(Array.isArray(raw.earned) ? raw.earned : []),
      spoiler: Boolean(raw.spoiler),
    };
  } catch {
    return { earned: new Set(), spoiler: false };
  }
}

export function saveProgress(state) {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ earned: [...state.earned], spoiler: state.spoiler }),
  );
}

export function exportProgress(state) {
  const payload = JSON.stringify(
    { app: 'leonida-legend', version: 1, earned: [...state.earned].sort() },
    null,
    2,
  );
  const link = document.createElement('a');
  link.href = URL.createObjectURL(new Blob([payload], { type: 'application/json' }));
  link.download = 'leonida-legend-progress.json';
  link.click();
  URL.revokeObjectURL(link.href);
}

export async function importProgress(file) {
  const parsed = JSON.parse(await file.text());
  const names = Array.isArray(parsed) ? parsed : parsed.earned;
  if (!Array.isArray(names)) throw new Error('no earned list in that file');
  return new Set(names.filter((name) => typeof name === 'string'));
}
