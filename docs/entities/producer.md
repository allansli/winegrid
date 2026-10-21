# Producer template

Copy this when adding a producer. `entityType` is `producer` and `id` starts with `prod-`. Do not invent facts. The English `sommelierNote` is the source of truth, and the `pt-BR note` is the overlay in `src/i18n/notesPt.ts`. Country and region names are the English keys in `src/i18n/places.ts`, which must already have both `en` and `pt-BR` labels. `npm test` runs `validateCatalog` and rejects a card that skips a field below.

## Identity

| Field | Required | Notes |
| --- | --- | --- |
| `id` | yes | `prod-` plus a stable slug. Unique. |
| `name` | yes | Display name, including the estate's accents. |
| `canonicalName` | yes | The estate name without a type suffix. |
| `aliases` | yes | At least one. Include a short name and any unaccented spelling. An exact, case-insensitive repeat is a duplicate alias. |

## Places

Add the country and the parent region to `places.ts` before the entity. Both locales are required. The parent region link is `macroRegion`: it has to be a `REGION_LABELS` key, and `world` / `hemisphere` have to match `COUNTRY_REGION_GROUP` for `country`. `subRegion` names the appellation or vineyard inside that parent.

| Field | Required | Notes |
| --- | --- | --- |
| `country` | yes | `COUNTRY_LABELS` key. |
| `countryCode` | yes | ISO-2. |
| `macroRegion` | yes | Parent region. `REGION_LABELS` key. |
| `subRegion` | yes | The appellation or site, such as `Pauillac AOC (Left Bank)`. |
| `alsoCountries` | when the estate is defining outside its country | Each country needs a sentence in `ALSO_COUNTRY_SOURCES`. An entry with no note is unsourced and does not count. |
| `alsoRegions` | optional | Other macro-regions. Each one is a `REGION_LABELS` key. |
| `originCountries` | optional | Each one is a `COUNTRY_LABELS` key. |
| `world` | yes | `Old World` or `New World`, matching the country. |
| `hemisphere` | yes | `Northern` or `Southern`, matching the country. |
| `latitudeBand` | yes | `cool_north`, `temperate_mid`, or `warm_subtropical`. |
| `coastalOrIsland` | yes | `true` or `false`. |

## Clue tags

Use only the values listed in `src/data/entitySchema.ts`. Empty required groups fail as missing tags. `classifications`, `waterBodies`, and `heritage` may be empty. Tag the estate for the clues it should answer, using the same vocabulary as the region it sits in.

| Field | Required | Notes |
| --- | --- | --- |
| `classifications` | optional | Law and cru tags the estate actually holds. |
| `soils` | yes | At least one soil tag. |
| `climates` | yes | At least one climate tag. |
| `waterBodies` | optional | |
| `styles` | yes | At least one style tag. |
| `vinification` | yes | At least one vinification tag. |
| `sensory` | yes | At least one sensory tag. |
| `varietalTraits` | yes | At least one varietal tag. |
| `primaryGrapes` | yes | Canonical grape names, most important first. |
| `bottleShapes` | yes | At least one bottle tag. |
| `heritage` | optional | |

## Rarity and notes

`baseRarity` is the rarity input: `1` is the most famous, `100` is an obscure sommelier gem. The percent a player sees is computed later from that weight and the other legal answers in the cell.

| Field | Required | Notes |
| --- | --- | --- |
| `baseRarity` | yes | Integer from 1 to 100. |
| `sommelierNote` | yes | English. At least a few sentences. This is the source of truth. |
| `pt-BR note` | yes | `PT_NOTES[id]` in `src/i18n/notesPt.ts`. Not a copy of the English. Use produtor, uva, and degustação. |

```ts
{
  id: "prod-example",
  name: "Example Estate",
  canonicalName: "Example Estate",
  entityType: "producer",
  country: "France",
  countryCode: "FR",
  macroRegion: "Bordeaux",
  subRegion: "Pauillac AOC (Left Bank)",
  world: "Old World",
  hemisphere: "Northern",
  latitudeBand: "cool_north",
  coastalOrIsland: false,
  aliases: ["Example Estate"],
  classifications: ["AOC"],
  soils: ["gravel_alluvial"],
  climates: ["maritime"],
  waterBodies: ["gironde_estuary"],
  styles: ["dry_red"],
  vinification: ["new_french_oak"],
  sensory: ["high_tannin_high_acid"],
  varietalTraits: ["bordeaux_family"],
  primaryGrapes: ["Cabernet Sauvignon", "Merlot"],
  bottleShapes: ["bordeaux_shoulder"],
  heritage: [],
  baseRarity: 40,
  sommelierNote: "English source of truth. Replace this with a sourced note before the card ships.",
}
```

This object is a shape, not a card to insert. `alsoCountries`, `alsoRegions`, and `originCountries` are omitted until you have them. The `pt-BR note` lives in `notesPt.ts`, not on the object.
