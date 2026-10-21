# Region template

Copy this when adding a region. In the data a region is an appellation: `entityType` is `appellation` and `id` starts with `app-`. Do not invent facts. The English `sommelierNote` is the source of truth, and the `pt-BR note` is the overlay in `src/i18n/notesPt.ts`. Country and region names are the English keys in `src/i18n/places.ts`, which must already have both `en` and `pt-BR` labels. `npm test` runs `validateCatalog` and rejects a card that skips a field below.

## Identity

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | `app-` plus a stable slug. Unique. |
| `name` | yes | Display name, usually with the law suffix (`Pauillac AOC`). |
| `canonicalName` | yes | The name without the law suffix. |
| `aliases` | yes | At least one. Include the canonical name and any unaccented spelling. An exact, case-insensitive repeat is a duplicate alias. |

## Places

Add the country and the parent region to `places.ts` before the entity. Both locales are required. The parent region link is `macroRegion`: it has to be a `REGION_LABELS` key, and `world` / `hemisphere` have to match `COUNTRY_REGION_GROUP` for `country`. Wine appellation names keep their accents. Administrative regions use the exonym already chosen in `places.ts`.

| Field | Required | Notes |
| --- | --- | --- |
| `country` | yes | `COUNTRY_LABELS` key. |
| `countryCode` | yes | ISO-2. |
| `macroRegion` | yes | Parent region. `REGION_LABELS` key, such as `Bordeaux` or `Burgundy`. |
| `subRegion` | yes | The smaller place inside that parent, such as `Haut-Médoc (Left Bank)`. |
| `alsoCountries` | rare for a region | Each country needs a sentence in `ALSO_COUNTRY_SOURCES`. An entry with no note is unsourced and does not count. |
| `alsoRegions` | optional | Other macro-regions where this place satisfies a region clue. Each one is a `REGION_LABELS` key. |
| `originCountries` | optional | Each one is a `COUNTRY_LABELS` key. |
| `world` | yes | `Old World` or `New World`, matching the country. |
| `hemisphere` | yes | `Northern` or `Southern`, matching the country. |
| `latitudeBand` | yes | `cool_north`, `temperate_mid`, or `warm_subtropical`. |
| `coastalOrIsland` | yes | `true` or `false`. |

## Clue tags

Use only the values listed in `src/data/entitySchema.ts`. Empty required groups fail as missing tags. `classifications`, `waterBodies`, and `heritage` may be empty. A region with no appellation law, such as Bekaa, keeps `classifications` empty rather than borrowing another country's tag.

| Field | Required | Notes |
| --- | --- | --- |
| `classifications` | optional | The law and cru tags that apply to this place. |
| `soils` | yes | At least one soil tag. |
| `climates` | yes | At least one climate tag. |
| `waterBodies` | optional | |
| `styles` | yes | At least one style tag. |
| `vinification` | yes | At least one vinification tag. |
| `sensory` | yes | At least one sensory tag. |
| `varietalTraits` | yes | At least one varietal tag. |
| `primaryGrapes` | yes | Canonical grape names, most important first. Order is not a reason to add an `alsoCountries` entry. |
| `bottleShapes` | yes | At least one bottle tag. |
| `heritage` | optional | |

## Rarity and notes

`baseRarity` is the rarity input: `1` is the most famous, `100` is an obscure sommelier gem. The percent a player sees is computed later from that weight and the other legal answers in the cell.

| Field | Required | Notes |
| --- | --- | --- |
| `baseRarity` | yes | Integer from 1 to 100. |
| `sommelierNote` | yes | English. At least a few sentences. This is the source of truth. |
| `pt-BR note` | yes | `PT_NOTES[id]` in `src/i18n/notesPt.ts`. Not a copy of the English. Use uva, not casta, and degustação, not prova. |

```ts
{
  id: "app-example",
  name: "Example AOC",
  canonicalName: "Example",
  entityType: "appellation",
  country: "France",
  countryCode: "FR",
  macroRegion: "Loire Valley",
  subRegion: "A real commune",
  world: "Old World",
  hemisphere: "Northern",
  latitudeBand: "cool_north",
  coastalOrIsland: false,
  aliases: ["Example", "Example AOC"],
  classifications: ["AOC"],
  soils: ["limestone_chalk"],
  climates: ["maritime"],
  waterBodies: ["loire_river"],
  styles: ["dry_white"],
  vinification: ["no_malolactic"],
  sensory: ["laser_high_acid"],
  varietalTraits: ["aromatic_white"],
  primaryGrapes: ["Chenin Blanc"],
  bottleShapes: ["burgundy_slope"],
  heritage: [],
  baseRarity: 40,
  sommelierNote: "English source of truth. Replace this with a sourced note before the card ships.",
}
```

This object is a shape, not a card to insert. `alsoCountries`, `alsoRegions`, and `originCountries` are omitted until you have them. The `pt-BR note` lives in `notesPt.ts`, not on the object.
