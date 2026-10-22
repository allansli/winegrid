# WineGrid acceptance checklist

This is the release "done" list. Automated rows are enforced by tests. The manual pass is one sitting at the end.

Standard cell floor is 5. A floor of 6 still cannot generate a grapes-only board: the South America clue adds regions and producers, not grapes, and every grapes-only Standard seed threw `Could not generate a valid 3x3 WineGrid matrix`.

## Data

| Check | How |
| --- | --- |
| Every tag on every card has a per-tag source in `tagSources` | Automated. `acceptanceChecklist.test.ts` and `clueAudit.test.ts`. |
| Every source URL is listed | Automated. `alsoCountries` notes, `CLIMATE_SOURCES`, and `docs/new-clues-sources.json` each cite an `https://` URL. Every card that carries `used_neutral_oak`, `sandy_soil`, `gneiss`, or `tropical_double_pruning` has a row in that file. |
| The pt-BR note and labels are present for every card and clue | Automated. `validateCatalog`, plus English and pt-BR clue labels. |
| The region display line is set | Automated. Every card has an origin line in English and pt-BR. `displayRegion`, where set, is the same string in both locales. |
| No duplicate aliases | Automated. Repeated aliases on one card fail `validateCatalog`. |
| Every exception in `EMPTY_REQUIRED_TAG_ALLOWLIST` has a reason | Automated. Each id has a comment of at least 20 characters in `entitySchema.ts`. |

Huet and Raveneau no longer carry `large_neutral_botte_foudre`. Their vinification groups stay filled (`used_neutral_oak`, and Raveneau also `sur_lie_autolysis`), so they are not on the allowlist.

## Clues

| Check | How |
| --- | --- |
| Every clue has EN and pt-BR labels and a tier | Automated. |
| Each clue's card count is reported. Flag counts under 3, and over 20 if the clue is not Standard | Automated. The test fails when a clue has fewer than 3 cards or when this table disagrees with the catalog. `over 20` is a flag, not a failure. |

The five new clues: `geo-south-america-all` 36 (Standard), `vin-used-large-oak` 7 (Master), `soil-sandy` 23 (Sommelier, flag over 20), `soil-granite` 43 (Sommelier, flag over 20; gneiss is included), `clim-tropical-double-pruning` 3 (Sommelier). `geo-south-america` (Andean, 22, Standard) stays beside the four-country clue.

<!-- clue-counts:start -->
| Clue | Tier | Cards | Flag |
| --- | --- | ---: | --- |
| `geo-france` | Standard | 84 |  |
| `geo-italy` | Standard | 25 |  |
| `geo-spain` | Standard | 19 |  |
| `geo-iberia` | Standard | 23 |  |
| `geo-germanic` | Standard | 17 |  |
| `geo-usa` | Standard | 9 |  |
| `geo-oceania` | Standard | 17 |  |
| `geo-south-america` | Standard | 22 |  |
| `geo-south-america-all` | Standard | 36 |  |
| `geo-old-world` | Standard | 149 |  |
| `geo-new-world` | Standard | 62 |  |
| `geo-southern-hemisphere` | Standard | 56 |  |
| `geo-cool-latitude` | Sommelier | 90 | over 20 |
| `geo-coastal-island` | Sommelier | 31 | over 20 |
| `reg-bordeaux` | Standard | 19 |  |
| `reg-burgundy-champagne` | Standard | 29 |  |
| `reg-rhone-provence` | Standard | 18 |  |
| `reg-loire` | Sommelier | 14 |  |
| `reg-piedmont-tuscany` | Standard | 12 |  |
| `cls-aoc` | Sommelier | 58 | over 20 |
| `cls-docg` | Sommelier | 12 |  |
| `cls-grand-cru` | Sommelier | 25 | over 20 |
| `cls-1855` | Sommelier | 9 |  |
| `cls-doca-pdo` | Sommelier | 15 |  |
| `cls-new-world-ava-gi` | Sommelier | 38 | over 20 |
| `soil-limestone-chalk` | Sommelier | 104 | over 20 |
| `soil-kimmeridgian-pure-chalk` | Master | 37 | over 20 |
| `soil-volcanic` | Sommelier | 41 | over 20 |
| `soil-slate-schist` | Sommelier | 40 | over 20 |
| `soil-gravel-galets` | Sommelier | 50 | over 20 |
| `soil-granite` | Sommelier | 43 | over 20 |
| `soil-sand-phylloxera` | Master | 19 |  |
| `soil-sandy` | Sommelier | 23 | over 20 |
| `clim-maritime` | Standard | 54 |  |
| `clim-continental` | Standard | 79 |  |
| `clim-mediterranean` | Standard | 51 |  |
| `clim-high-altitude` | Sommelier | 41 | over 20 |
| `clim-heroic-slopes` | Sommelier | 39 | over 20 |
| `clim-fog-current` | Sommelier | 30 | over 20 |
| `clim-diurnal-rainshadow` | Sommelier | 46 | over 20 |
| `clim-tropical-double-pruning` | Sommelier | 3 |  |
| `hydro-major-river` | Sommelier | 90 | over 20 |
| `hydro-atlantic-gironde` | Sommelier | 28 | over 20 |
| `style-dry-red` | Standard | 128 |  |
| `style-dry-white` | Standard | 98 |  |
| `style-sparkling` | Standard | 22 |  |
| `style-fortified-oxidative` | Sommelier | 17 |  |
| `style-sweet-botrytis-passito` | Sommelier | 35 | over 20 |
| `vin-new-french-oak` | Sommelier | 79 | over 20 |
| `vin-large-botte-foudre` | Sommelier | 62 | over 20 |
| `vin-used-large-oak` | Master | 7 |  |
| `vin-extended-aging-36m` | Sommelier | 40 | over 20 |
| `vin-sur-lie` | Sommelier | 45 | over 20 |
| `vin-whole-cluster-coferment` | Master | 26 | over 20 |
| `vin-no-mlf-unoaked` | Sommelier | 52 | over 20 |
| `vin-flor-solera` | Master | 9 |  |
| `sens-high-tannin-acid` | Sommelier | 48 | over 20 |
| `sens-laser-acid` | Sommelier | 55 | over 20 |
| `sens-delicate-low-tannin` | Sommelier | 27 | over 20 |
| `sens-full-bodied` | Sommelier | 62 | over 20 |
| `sens-violet-floral` | Sommelier | 49 | over 20 |
| `sens-saline-mineral` | Sommelier | 65 | over 20 |
| `sens-truffle-tar-pepper` | Sommelier | 51 | over 20 |
| `sens-petrol-botrytis` | Master | 18 |  |
| `sens-cellar-20yr` | Sommelier | 104 | over 20 |
| `var-bordeaux-family` | Standard | 64 |  |
| `var-burgundy-family` | Standard | 52 |  |
| `var-rhone-family` | Standard | 34 |  |
| `var-indigenous-med` | Sommelier | 44 | over 20 |
| `var-single-varietal` | Sommelier | 112 | over 20 |
| `var-multi-blend` | Standard | 49 |  |
| `var-thick-skin-late` | Master | 26 | over 20 |
| `var-thin-skin-early` | Master | 28 | over 20 |
| `bot-bordeaux` | Sommelier | 85 | over 20 |
| `bot-burgundy` | Sommelier | 102 | over 20 |
| `bot-flute-specialty` | Sommelier | 49 | over 20 |
| `her-ungrafted` | Sommelier | 39 | over 20 |
| `her-bush-vines` | Sommelier | 37 | over 20 |
| `her-unesco-monastic` | Sommelier | 52 | over 20 |
| `her-pre-1855` | Sommelier | 47 | over 20 |
| `type-appellation` | Standard | 85 |  |
| `type-grape` | Standard | 44 |  |
| `type-producer` | Sommelier | 71 | over 20 |
<!-- clue-counts:end -->

## Generation

| Check | How |
| --- | --- |
| 365 dailies plus Infinite across every difficulty × filter: 0 generation failures and 0 dead ends | Automated. `matrixGenerator.test.ts` builds all 365 daily boards for 2026, Infinite seeds `infinite-audit-0` through `infinite-audit-7` for every difficulty × filter, and `rebalance-0` through `rebalance-11` for every difficulty × filter (including grapes). Each board must generate and finish a guarded playthrough. |
| Per-cell minimums are Standard ≥ floor, Sommelier ≥ 3 and Master ≥ 2 | Automated. The floor is 5. `acceptanceChecklist.test.ts` checks the coverage sample (`coverage-0` through `coverage-5` × every filter). |
| Master median ≤ 6, Standard median ≥ Sommelier median | Automated. Same coverage sample (216 cells per tier). |

## Gameplay

| Check | How |
| --- | --- |
| Every card's name and aliases are accepted as answers in EN and pt-BR, including accent-free forms | Automated. The picker searches names and aliases only, in both locales. |
| Codex search matches names and aliases only | Automated. A note fragment that is not part of the name or an alias does not match. `wineDatabase.test.ts` also locks País, Donnhoff, Prum, and Coulee. |
| Codex filters, including resetting to (All) | Automated for the matcher: `(All)` clears the predicate and the list returns to every card. Mediterranean still includes Almaviva and Don Melchor. The dropdown click is manual, below. |
| Picker results show the name, and a type badge only when the cell is already one type | Automated. The rendered picker rows contain no country, region, grapes, notes, tags, or pick rate, and the order does not change when the cell's answers change. |
| An empty cell shows how many answers it has | Confirmed. The label is `{n} possible` and nothing else about those answers. Type pills follow the board filter or a type clue, not which types happen to fit. |
| Escape closes the picker, tooltip and breakdown on the first press | Automated for the decision: one Escape closes the topmost dialog (`ModalFrame` for the picker and the cell breakdown) and closes a clue tooltip only when no dialog is open. The keyboard pass is manual, below. |
| Entity-type suffixes are not in titles | Automated. Titles do not end in `(Grape)`, `(Appellation)`, `(Region)`, `(Producer)`, or `(Estate)`. |

## Manual pass

1. Open the Codex, choose `[Climate] Mediterranean`, then choose `(All)`. Expected: the header count returns to every card, including cards that are not Mediterranean, and a reload is not required.
2. Open a cell whose clues do not force one type. Expected: each result is the name only, with no country, region, grapes, notes, or pick rate. On a grapes-only board, the same row also shows the Grape badge. The "{n} possible" label is only the count.
3. Open the picker and press Escape once. Expected: the picker closes and the board stays. Click a clue so its tooltip stays open, then press Escape once. Expected: the tooltip closes. Open a filled cell's breakdown and press Escape once. Expected: the breakdown closes.
