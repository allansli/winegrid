# Grape template

Copy this when adding a grape. Do not invent facts. The English `sommelierNote` is the source of truth, and the `pt-BR note` is the overlay in `src/i18n/notesPt.ts`. Country and region names are the English keys in `src/i18n/places.ts`, which must already have both `en` and `pt-BR` labels. `npm test` runs `validateCatalog` and rejects a card that skips a field below.

`entityType` is `grape`. `id` starts with `grape-`.

## Identity

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | `grape-` plus a stable slug. Unique. |
| `name` | yes | Display name. The `(Grape)` suffix is fine. |
| `canonicalName` | yes | The name without the type suffix. |
| `aliases` | yes | At least one. Include accented and unaccented spellings players type. An exact, case-insensitive repeat is a duplicate alias. Accent variants are not duplicates. |

## Places

Add the country and the parent region to `places.ts` before the entity. Both locales are required. The parent region link is `macroRegion`: it has to be a `REGION_LABELS` key, and `world` / `hemisphere` have to match `COUNTRY_REGION_GROUP` for `country`.

| Field | Required | Notes |
| --- | --- | --- |
| `country` | yes | Flagship country. `COUNTRY_LABELS` key. |
| `countryCode` | yes | ISO-2. |
| `macroRegion` | yes | Parent region. `REGION_LABELS` key. |
| `subRegion` | yes | Appellations or sites, separated with ` / `. |
| `alsoCountries` | when the grape is defining outside the flagship country | Each country needs a sentence in `ALSO_COUNTRY_SOURCES`. A local synonym sits on that source as `{ note, synonym }` and must be one of `aliases`. An entry with no note is unsourced and does not count. |
| `alsoRegions` | optional | Other macro-regions. Each one is a `REGION_LABELS` key. |
| `originCountries` | optional | Historical home when it is not the flagship country. Each one is a `COUNTRY_LABELS` key. |
| `world` | yes | `Old World` or `New World`, matching the flagship country. |
| `hemisphere` | yes | `Northern` or `Southern`, matching the flagship country. |
| `latitudeBand` | yes | `cool_north`, `temperate_mid`, or `warm_subtropical`. Use the flagship appellation, not an average. |
| `coastalOrIsland` | yes | `true` or `false`. |

## Clue tags

Use only the values listed in `src/data/entitySchema.ts`. Empty required groups fail as missing tags. `classifications`, `waterBodies`, and `heritage` may be empty. Grapes do not satisfy classification clues or Classic Blend. Those exclusions are by design.

| Field | Required | Notes |
| --- | --- | --- |
| `classifications` | optional | `Noble_Grape`, `Autochthonous_Grape`, and any law tags that really apply. |
| `soils` | yes | At least one soil tag. |
| `climates` | yes | At least one climate tag. |
| `waterBodies` | optional | |
| `styles` | yes | At least one style tag. |
| `vinification` | yes | At least one vinification tag. |
| `sensory` | yes | At least one sensory tag. |
| `varietalTraits` | yes | At least one varietal tag. |
| `primaryGrapes` | yes | This grape's own canonical name, plus parents only when the card is about a crossing. |
| `bottleShapes` | yes | At least one bottle tag. |
| `heritage` | optional | |

## Rarity and notes

`baseRarity` is the rarity input: `1` is the most famous, `100` is an obscure sommelier gem. The percent a player sees is computed later from that weight and the other legal answers in the cell. Do not store a percent on the entity.

| Field | Required | Notes |
| --- | --- | --- |
| `baseRarity` | yes | Integer from 1 to 100. |
| `sommelierNote` | yes | English. At least a few sentences. This is the source of truth. |
| `pt-BR note` | yes | `PT_NOTES[id]` in `src/i18n/notesPt.ts`. Not a copy of the English. Use uva, not casta, and degustação, not prova. |

```ts
{
  id: "grape-example",
  name: "Example (Grape)",
  canonicalName: "Example",
  entityType: "grape",
  country: "France",
  countryCode: "FR",
  macroRegion: "Loire Valley",
  alsoCountries: [],
  subRegion: "A real appellation",
  world: "Old World",
  hemisphere: "Northern",
  latitudeBand: "cool_north",
  coastalOrIsland: false,
  aliases: ["Example"],
  classifications: ["AOC"],
  soils: ["limestone_chalk"],
  climates: ["maritime"],
  waterBodies: ["loire_river"],
  styles: ["dry_white"],
  vinification: ["no_malolactic"],
  sensory: ["laser_high_acid"],
  varietalTraits: ["aromatic_white"],
  primaryGrapes: ["Example"],
  bottleShapes: ["burgundy_slope"],
  heritage: [],
  baseRarity: 40,
  sommelierNote: "English source of truth. Replace this with a sourced note before the card ships.",
}
```

This object is a shape, not a card to insert. `originCountries` and `alsoRegions` are omitted until you have them. The `pt-BR note` lives in `notesPt.ts`, not on the object.
