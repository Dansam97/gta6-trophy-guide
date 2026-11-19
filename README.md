# gta6-trophy-guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Dansam97/gta6-trophy-guide/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Dansam97/gta6-trophy-guide/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

Leonida Legend is a complete offline trophy guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI — every trophy with its official name, description and grade, plus an original guide in our own words that cites its sources. It is a working checklist too: progress is saved in the browser (localStorage) and can be exported to a file and imported back, with filters by kind, grade and status, and a spoiler shield that hides story trophies until they are earned. A seven-stage roadmap lays out the order to earn everything on the way to the platinum, and five missable-watch trophies are flagged with the reasoning taken from their official descriptions.

## Run it

```sh
node serve.ts
# then open http://localhost:8080 — the guide in app/ works fully offline

mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
# builds the submission dossier in out/ (copies app/ and screenshots/, writes dossier.json)
```

---

<sub>Entered on [make.fun](https://make.fun/?ref=p62m1pd8&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
