# P1 coverage gaps

Short list only. Checked against the catalog on `6933bc1` (names and aliases). This is the base gap list for the next batch. P2 is not listed here.

Already present, so not gaps: Meursault, Gevrey-Chambertin, Chablis, Morgon, Chardonnay, Pinot Noir, Gamay, Sauvignon Blanc.

**22 P1 gaps: 13 appellations, 9 grapes. No producers in this slice.**

None of these cards would be Master-only. Two existing Master clues get wider if the Côte d'Or cards are tagged like the cards already in Burgundy:

- `soil-limestone-chalk` on a Burgundy or Loire card also matches `soil-kimmeridgian-pure-chalk` (Master, 25 cards). That is the current predicate, not a new clue.
- A red Pinot village tagged `thin_skin_early_ripening`, as Gevrey-Chambertin is, also matches `var-thin-skin-early` (Master, 28 cards).

Both clues are already over 20. This list does not re-run the Master median.

Clues below are the ones the card would satisfy with the tags in the last column. No new clue is required for any row.

## Appellations (13)

| P1 | Card | Clues it would satisfy | Tags it would need |
| --- | --- | --- | --- |
| Puligny-Montrachet | Côte de Beaune village, Chardonnay | `geo-france`, `geo-old-world`, `geo-cool-latitude`, `reg-burgundy-champagne`, `cls-aoc`, `soil-limestone-chalk`, `soil-kimmeridgian-pure-chalk`, `clim-continental`, `style-dry-white`, `var-burgundy-family`, `var-single-varietal`, `bot-burgundy`, `her-unesco-monastic`, `type-appellation` | France, Burgundy, Old World, `cool_north`, AOC, `limestone_chalk`, continental, `dry_white`, Chardonnay, `burgundy_family`, `single_varietal_strict`, `burgundy_slope`, `unesco_landscape` |
| Chassagne-Montrachet | Côte de Beaune, Chardonnay and Pinot Noir | Same as Puligny, plus `style-dry-red` | Same, plus `dry_red` and Pinot Noir |
| Beaune | Côte de Beaune village, both colors | Same as Chassagne | Same as Chassagne |
| Volnay | Côte de Beaune, Pinot Noir | Puligny set with `style-dry-red` instead of `style-dry-white`, plus `var-thin-skin-early` | `dry_red`, Pinot Noir, `thin_skin_early_ripening` |
| Pommard | Côte de Beaune, Pinot Noir | Same as Volnay | Same as Volnay |
| Chambolle-Musigny | Côte de Nuits, Pinot Noir | Same as Volnay | Same as Volnay |
| Vosne-Romanée | Côte de Nuits, Pinot Noir | Same as Volnay | Same as Volnay |
| Nuits-Saint-Georges | Côte de Nuits, Pinot Noir | Same as Volnay | Same as Volnay |
| Corton | Grand Cru. Red Corton; white is Corton-Charlemagne | Volnay set, plus `style-dry-white` and `cls-grand-cru` | `Grand_Cru`, both styles, both grapes |
| Bourgogne Aligoté | Regional AOC for the grape. Not a Côte d'Or climat | `geo-france`, `geo-old-world`, `geo-cool-latitude`, `reg-burgundy-champagne`, `cls-aoc`, `soil-limestone-chalk`, `soil-kimmeridgian-pure-chalk`, `clim-continental`, `style-dry-white`, `vin-no-mlf-unoaked`, `var-burgundy-family`, `var-single-varietal`, `bot-burgundy`, `type-appellation` | France, Burgundy, AOC, `dry_white`, Aligoté, `no_malolactic`. No UNESCO tag: the Climats site is the Côte d'Or |
| Pouilly-Fuissé | Mâconnais, Chardonnay | Puligny set without `her-unesco-monastic` | Same limestone Burgundy white tags. Mâconnais is outside the Climats UNESCO site |
| Pouilly-Fumé | Central Loire, Sauvignon Blanc. The pair of Sancerre | `geo-france`, `geo-old-world`, `geo-cool-latitude`, `reg-loire`, `cls-aoc`, `soil-limestone-chalk`, `soil-kimmeridgian-pure-chalk`, `clim-continental`, `style-dry-white`, `var-bordeaux-family`, `var-single-varietal`, `type-appellation` | Loire Valley, AOC, Sauvignon Blanc, `bordeaux_family`. Loire plus `limestone_chalk` is what trips the Master chalk clue |
| Rueda | Spain, Verdejo | `geo-spain`, `geo-iberia`, `geo-old-world`, `cls-doca-pdo`, `clim-continental`, `style-dry-white`, `type-appellation` | Spain, `PDO_DO`, continental, `dry_white`, Verdejo |

## Grapes (9)

| P1 | Card | Clues it would satisfy | Tags it would need |
| --- | --- | --- | --- |
| Aligoté | Burgundy white. Pinot Noir × Gouais Blanc, same dynasty as Chardonnay | `geo-france`, `geo-old-world`, `geo-cool-latitude`, `reg-burgundy-champagne`, `soil-limestone-chalk`, `soil-kimmeridgian-pure-chalk`, `clim-continental`, `style-dry-white`, `vin-no-mlf-unoaked`, `sens-laser-acid`, `var-burgundy-family`, `var-single-varietal`, `bot-burgundy`, `type-grape` | `burgundy_family`, `dry_white`, `no_malolactic`, `limestone_chalk` |
| Pinot Gris | Alsace dry white. Alias Pinot Grigio | `geo-france`, `geo-old-world`, `geo-cool-latitude`, `clim-continental`, `style-dry-white`, `var-burgundy-family`, `var-single-varietal`, `bot-flute-specialty`, `type-grape`. Add `geo-italy` only if Italy is an `alsoCountries` entry | Alsace, `cool_north`, `burgundy_family` (Pinot mutation), `flute`. There is no Alsace region clue to join |
| Pinot Meunier | Champagne's third grape | `geo-france`, `geo-old-world`, `geo-cool-latitude`, `reg-burgundy-champagne`, `soil-limestone-chalk`, `soil-kimmeridgian-pure-chalk`, `clim-continental`, `style-sparkling`, `var-burgundy-family`, `bot-burgundy`, `type-grape` | Champagne, `sparkling_traditional`, `limestone_chalk` |
| Melon de Bourgogne | The Muscadet grape. The appellation card already exists | `geo-france`, `geo-old-world`, `reg-loire`, `clim-maritime`, `style-dry-white`, `vin-sur-lie`, `vin-no-mlf-unoaked`, `var-burgundy-family`, `var-single-varietal`, `bot-burgundy`, `type-grape` | Loire, `maritime`, `sur_lie_autolysis`, `no_malolactic`. `var-burgundy-family` already names Melon |
| Marsanne | Northern Rhône white, with Roussanne | `geo-france`, `geo-old-world`, `reg-rhone-provence`, `clim-continental`, `style-dry-white`, `soil-granite`, `var-rhone-family`, `bot-burgundy`, `type-grape` | Rhône Valley, `rhone_family`, `granite`, `dry_white` |
| Roussanne | Northern Rhône white, with Marsanne | Same as Marsanne | Same as Marsanne |
| Muscat Blanc à Petits Grains | One card, not every Muscat. Alias Moscato | `geo-france`, `geo-old-world`, `geo-cool-latitude`, `clim-continental`, `style-dry-white`, `style-sweet-botrytis-passito`, `bot-flute-specialty`, `type-grape` | Anchor it in Alsace. A worldwide Muscat card would be much wider than this row |
| Verdejo | Rueda | `geo-spain`, `geo-iberia`, `geo-old-world`, `clim-continental`, `style-dry-white`, `sens-laser-acid`, `var-indigenous-med`, `var-single-varietal`, `type-grape` | Spain, `iberian_indigenous`, `dry_white` |
| Garganega | Soave. The Soave Classico card already exists | `geo-italy`, `geo-old-world`, `style-dry-white`, `soil-volcanic`, `var-indigenous-med`, `var-single-varietal`, `type-grape` | Italy, `volcanic_basalt`, `italian_indigenous`. No Veneto region clue exists |

## Counts

| | P1 |
| --- | ---: |
| Appellations | 13 |
| Grapes | 9 |
| Producers | 0 |
| Total | 22 |
