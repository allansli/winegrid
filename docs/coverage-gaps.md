# Gaps: Architect P1 list (docs/coverage-audit.md), adjusted on wine criteria

Decision for each P1 item, with a one-line reason.

## Appellations
| P1 item | Decision | Reason |
|---|---|---|
| Puligny-Montrachet | include (done in lot 1, merged in #22) | A top Côte de Beaune white village. Lot 2 adds UNESCO heritage. |
| Chassagne-Montrachet | include (lot 1, #22) | A major red and white village. Lot 2 adds UNESCO heritage. sandy_soil was dropped as weak. |
| Volnay | include (lot 1, #22) | The archetype of fine Côte de Beaune Pinot. Lot 2 adds UNESCO heritage. |
| Pommard | include (lot 1, #22) | The structured counterpart to Volnay. Lot 2 adds UNESCO heritage. |
| Beaune | include | The historic trade centre with a large red village AOC. The UNESCO listing names Beaune explicitly. |
| Chambolle-Musigny | include | A benchmark Côte de Nuits village, with a BIVB sheet. |
| Vosne-Romanée | include | The most famous Côte de Nuits village. BIVB sheet. |
| Nuits-Saint-Georges | include | A Côte de Nuits village. Its premiers crus run into Premeaux. BIVB sheet. |
| Corton | reclassify: one hill card, "Corton / Corton-Charlemagne Grand Cru" | Corton is the only red Grand Cru in the Côte de Beaune, and Charlemagne is its white counterpart. Aloxe-Corton village is a different, lesser AOC, so it is not an alias. |
| Bourgogne Aligoté | remove | This duplicates the Aligoté grape card, which already carries the "Bourgogne Aligoté" alias. A second card would make the answers ambiguous. |
| Pouilly-Fuissé | include | The leading Mâconnais white, with a BIVB sheet. Its 2020 premiers crus are not tagged. |
| Pouilly-Fumé | include | The Loire Sauvignon benchmark on silex, with INAO and producer-body sources. |
| Rueda | include | Spain's Verdejo DO, with Consejo Regulador sources. |

## Grapes
| P1 item | Decision | Reason |
|---|---|---|
| Aligoté | include (lot 1, #22) | The second white grape of Burgundy. |
| Pinot Gris | include | The Alsace noble grape. It is tagged only botrytis_sweet (SGN), because "dry" is not stated by the source. Continental stays: WSET maps semicontinental to the Continental tag. |
| Pinot Meunier | include as "Meunier" | This is the current official Champagne name. The aliases keep Pinot Meunier. |
| Melon de Bourgogne | include | The Muscadet grape. The CDC states gneiss, schist, ocean breezes and sur lie. |
| Marsanne | include | The northern Rhône white, with a vins-rhone.com grape page. Passito was removed; the straw-wine line is not an appassimento style. |
| Roussanne | include | The northern Rhône white, with a vins-rhone.com grape page. Passito was removed, same reason as Marsanne. |
| Muscat Blanc à Petits Grains | include, reclassified anchor | The card is anchored to Muscat de Beaumes-de-Venise (VDN, Petits Grains only) instead of Alsace, where the Muscat is a blend with Ottonel. |
| Verdejo | include | The Rueda grape. Its card mirrors the Rueda sources. |
| Garganega | include | The Soave grape, sourced from the MASAF disciplinare (ilsoave.com returned 403). Tagged PDO_DO, not DOCG, because Soave DOC is the main AOC. |

All 21 kept P1 items are implemented: 5 in lot 1 and 16 in lot 2. 1 item was removed (Bourgogne Aligoté) and 1 reclassified (Corton).

## Backlog (not in P1; proposed for a later audit)
- Appellations: Condrieu, Cornas, Gigondas, Pessac-Léognan, Vouvray, Beaujolais crus (Fleurie, Moulin-à-Vent), Meursault village check, Gevrey-Chambertin check.
- Grapes: Blaufränkisch, Tannat, Xinomavro, Mencía, Godello, Pinot Blanc, Silvaner, Montepulciano, Dolcetto, Fiano, Vermentino, Cinsault, Carignan.

Vouvray is already in the catalog as `app-vouvray`. The backlog line is a later audit, not a missing card. Meursault and Gevrey-Chambertin are the same kind of check: both cards already exist.
