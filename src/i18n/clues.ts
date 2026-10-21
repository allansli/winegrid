import { ClueDefinition } from "@/types/wine";
import { Locale } from "./locale";

type ClueCopy = {
  shortLabel: string;
  label: string;
  tooltip: string;
};

/**
 * Display copy only. Predicates stay on the original clue.
 * Appellation and producer proper names stay as written on the label.
 * Country and region names in the chrome use Brazilian Portuguese.
 */
export const PT_CLUE_COPY: Record<string, ClueCopy> = {
  "geo-france": {
    shortLabel: "França",
    label: "Origem: França",
    tooltip: "Denominações, uvas ou produtores enraizados na França.",
  },
  "geo-italy": {
    shortLabel: "Itália",
    label: "Origem: Itália",
    tooltip: "Denominações, uvas ou produtores enraizados na Itália.",
  },
  "geo-spain": {
    shortLabel: "Espanha",
    label: "Origem: Espanha",
    tooltip: "Denominações, uvas ou produtores enraizados na Espanha.",
  },
  "geo-iberia": {
    shortLabel: "Península Ibérica",
    label: "Península Ibérica (Espanha ou Portugal)",
    tooltip: "Fica na Espanha ou em Portugal, ou é nativo de lá (incluindo as ilhas portuguesas).",
  },
  "geo-germanic": {
    shortLabel: "Europa Central",
    label: "Europa germânica e alpina (Alemanha, Áustria, Hungria)",
    tooltip: "Enraizado na Alemanha, na Áustria ou na Hungria.",
  },
  "geo-usa": {
    shortLabel: "Estados Unidos",
    label: "Origem: Estados Unidos (Califórnia e Oregon)",
    tooltip: "AVAs americanas, produtores de referência ou uvas emblemáticas.",
  },
  "geo-oceania": {
    shortLabel: "Austrália / NZ",
    label: "Oceania (Austrália ou Nova Zelândia)",
    tooltip: "Fica na Austrália ou na Nova Zelândia.",
  },
  "geo-south-america": {
    shortLabel: "Argentina / Chile",
    label: "América do Sul andina (Argentina ou Chile)",
    tooltip: "Fica na Argentina ou no Chile, ou é típico desses países.",
  },
  "geo-old-world": {
    shortLabel: "Velho Mundo",
    label: "Tradição do Velho Mundo",
    tooltip: "Origem vitícola clássica europeia ou do Oriente Próximo.",
  },
  "geo-new-world": {
    shortLabel: "Novo Mundo",
    label: "Tradição do Novo Mundo",
    tooltip: "Américas, África do Sul, Austrália ou Nova Zelândia.",
  },
  "geo-southern-hemisphere": {
    shortLabel: "Hemisfério Sul",
    label: "Hemisfério Sul",
    tooltip: "Ao sul do Equador (Argentina, Chile, África do Sul, Austrália, Nova Zelândia).",
  },
  "geo-cool-latitude": {
    shortLabel: ">45° de latitude",
    label: "Alta latitude (>45° N ou S) / margem fria",
    tooltip:
      "Regiões marginais de alta latitude, como Champagne, Chablis, Mosel, Loire, Alsácia, Willamette ou Central Otago.",
  },
  "geo-coastal-island": {
    shortLabel: "Costa / ilha",
    label: "Terroir costeiro ou de ilha",
    tooltip: "Beira oceano ou mar, ou fica em uma ilha vulcânica ou marítima.",
  },
  "reg-bordeaux": {
    shortLabel: "Bordeaux",
    label: "Esfera de Bordeaux e do sudoeste da França",
    tooltip: "Margem Esquerda, Margem Direita, Graves/Sauternes, ou uva ou château importante em Bordeaux.",
  },
  "reg-burgundy-champagne": {
    shortLabel: "Borgonha / Champagne",
    label: "Esfera da Borgonha e de Champagne",
    tooltip: "Côte d'Or, Chablis, Beaujolais ou Champagne.",
  },
  "reg-rhone-provence": {
    shortLabel: "Rhône / Provença",
    label: "Vale do Rhône e França mediterrânea",
    tooltip: "Rhône Norte, Rhône Sul, Provença ou Roussillon.",
  },
  "reg-loire": {
    shortLabel: "Vale do Loire",
    label: "Vale do Loire (o jardim da França)",
    tooltip: "Pays Nantais, Anjou-Saumur, Touraine ou Vinhedos Centrais.",
  },
  "reg-piedmont-tuscany": {
    shortLabel: "Piemonte / Toscana",
    label: "Referência do Piemonte ou da Toscana",
    tooltip: "As duas regiões italianas de vinho fino mais celebradas.",
  },
  "cls-aoc": {
    shortLabel: "AOC francesa",
    label: "Classificação AOC / AOP francesa",
    tooltip: "Regulada pelo sistema francês Appellation d'Origine Contrôlée.",
  },
  "cls-docg": {
    shortLabel: "DOCG italiana",
    label: "DOCG italiana (Denominazione di Origine Controllata e Garantita)",
    tooltip: "O nível legal mais alto da Itália, com degustação ministerial e selo numerado no gargalo.",
  },
  "cls-grand-cru": {
    shortLabel: "Grand Cru / 1er Cru",
    label: "Grand Cru / First Growth / topo de cru",
    tooltip: "Tem status oficial de Grand Cru, 1855 First Growth ou Gran Vinya Classificada.",
  },
  "cls-1855": {
    shortLabel: "Classificação de 1855",
    label: "Herança da classificação de Bordeaux de 1855",
    tooltip:
      "Um cru classificado de 1855, ou uma denominação do Médoc ou de Sauternes que contém um (Margaux, Saint-Julien, Pauillac, Saint-Estèphe, Sauternes), da época de Napoleão III.",
  },
  "cls-doca-pdo": {
    shortLabel: "DOCa / DO / DOC",
    label: "DOCa / DO espanhola ou DOC portuguesa",
    tooltip: "DOCa ou DO espanhola, ou DOC portuguesa. A lei de PDO de outros países não conta.",
  },
  "cls-new-world-ava-gi": {
    shortLabel: "AVA / GI / WO",
    label: "AVA americana ou GI / WO do Novo Mundo",
    tooltip: "American Viticultural Area (AVA) ou indicação geográfica (GI / Wine of Origin) do Novo Mundo.",
  },
  "soil-limestone-chalk": {
    shortLabel: "Calcário / giz",
    label: "Solo de calcário, giz ou marga calcária",
    tooltip:
      "Solos de carbonato de cálcio com pH alto (giz Belemnite, marga Kimmeridgian, Tuffeau, Albariza, Galestro, marga Tortonian).",
  },
  "soil-kimmeridgian-pure-chalk": {
    shortLabel: "Giz marinho / marga",
    label: "Giz puro, marga de ostra Kimmeridgian, Tuffeau ou Albariza",
    tooltip: "Giz ou marga marinha fossilizada (Champagne, Chablis, Sancerre, Vouvray, Chinon, Jerez, Jura).",
  },
  "soil-volcanic": {
    shortLabel: "Solo vulcânico",
    label: "Terroir vulcânico (basalto, lava, pedra-pomes ou tufo riolítico)",
    tooltip:
      "Solos ígneos vulcânicos, como Mount Etna, Santorini, Soave, Taurasi, Tokaj, Madeira, Willamette Jory ou Napa.",
  },
  "soil-slate-schist": {
    shortLabel: "Ardósia / xisto",
    label: "Ardósia ou xisto cristalino ('Schiefer' / 'Llicorella')",
    tooltip:
      "Rocha metamórfica que retém calor, no Mosel, Priorat, Côte-Rôtie, Douro, Savennières, Ahr e Central Otago.",
  },
  "soil-gravel-galets": {
    shortLabel: "Cascalho / Galets",
    label: "Cascalho aluvial ou seixos de quartzo ('Galets Roulés')",
    tooltip:
      "Leitos drenantes de cascalho ou blocos de rio (Margem Esquerda de Bordeaux, Châteauneuf-du-Pape, Marlborough, Mendoza, Napa).",
  },
  "soil-granite": {
    shortLabel: "Terroir de granito",
    label: "Rocha-mãe de granito decomposto",
    tooltip:
      "Rocha ígnea cristalina e ácida (Rhône Norte, Beaujolais Crus, Rías Baixas, Vinho Verde, Alsácia, Stellenbosch).",
  },
  "soil-sand-phylloxera": {
    shortLabel: "Solo arenoso / pé franco",
    label: "Solo arenoso / terroir resistente à filoxera",
    tooltip:
      "Solos muito arenosos onde a filoxera não escava túneis (por exemplo Château Rayas, Santorini, Barossa, Colares/Etna).",
  },
  "clim-maritime": {
    shortLabel: "Clima marítimo",
    label: "Influência de clima marítimo",
    tooltip: "Moderado por oceanos ou estuários, com invernos amenos e chuva ao longo do ano.",
  },
  "clim-continental": {
    shortLabel: "Clima continental",
    label: "Clima continental",
    tooltip: "Clima interior, com estações marcadas, invernos frios e outono que esfria rápido.",
  },
  "clim-mediterranean": {
    shortLabel: "Clima mediterrâneo",
    label: "Clima mediterrâneo",
    tooltip:
      "Verões quentes, secos e ensolarados e invernos amenos (Rhône Sul, Toscana, Priorat, Napa, Barossa, Stellenbosch).",
  },
  "clim-high-altitude": {
    shortLabel: "Alta altitude",
    label: "Viticultura de altitude (≥ 450 m–3.000 m)",
    tooltip:
      "Vinhedos de montanha ou planalto, a partir de 450 m, com UV intenso e noites frias (Mendoza, Salta, Ribera del Duero, Etna, Priorat). Contrafortes alpinos não contam.",
  },
  "clim-heroic-slopes": {
    shortLabel: "Encostas heroicas",
    label: "Viticultura heroica / terraços íngremes (>30°)",
    tooltip:
      "Encostas verticais ou terraços de pedra colhidos à mão (Mosel, Côte-Rôtie, Hermitage, Douro, Priorat, Wachau, Etna).",
  },
  "clim-fog-current": {
    shortLabel: "Neblina / corrente fria",
    label: "Moderado por névoa, neblina de outono ou corrente oceânica fria",
    tooltip:
      "Neblina decisiva para Nebbiolo ('nebbia'), Botrytis (Sauternes/Tokaj) ou o resfriamento do Pacífico, Benguela ou Humboldt.",
  },
  "clim-diurnal-rainshadow": {
    shortLabel: "Amplitude / sombra de chuva",
    label: "Grande amplitude térmica ou sombra de chuva",
    tooltip:
      "Protegido por uma barreira de montanha, ou com queda forte de temperatura da noite para o dia, o que preserva o ácido málico.",
  },
  "hydro-major-river": {
    shortLabel: "Grande vale fluvial",
    label: "Moldado por um grande rio ou estuário vitícola",
    tooltip: "À beira de rios vitícolas: Gironde, Rhône, Loire, Mosel, Reno, Douro, Ebro, Danúbio e outros.",
  },
  "hydro-atlantic-gironde": {
    shortLabel: "Atlântico / Gironde",
    label: "Influência do Atlântico ou do estuário da Gironde",
    tooltip: "Influenciado pelo Atlântico ou pelas bacias atlânticas da Gironde, do Loire ou do Douro.",
  },
  "style-dry-red": {
    shortLabel: "Vinho tinto seco",
    label: "Produz tinto seco de referência",
    tooltip: "Conhecido por tintos secos de classe mundial.",
  },
  "style-dry-white": {
    shortLabel: "Vinho branco seco",
    label: "Produz branco seco de referência",
    tooltip: "Conhecido por brancos secos de classe mundial.",
  },
  "style-sparkling": {
    shortLabel: "Espumante",
    label: "Espumante de método tradicional ('Méthode Traditionnelle')",
    tooltip: "Segunda fermentação na garrafa (Champagne, Franciacorta, Cava, Vouvray e uvas clássicas).",
  },
  "style-fortified-oxidative": {
    shortLabel: "Fortificado / oxidativo",
    label: "Vinho fortificado ou envelhecido de forma biológica/oxidativa",
    tooltip: "Porto, Jerez, Madeira, Vin Doux Naturel (Banyuls) ou Jura Vin Jaune ('sous voile').",
  },
  "style-sweet-botrytis-passito": {
    shortLabel: "Botrytis / Passito",
    label: "Podridão nobre (Botrytis) ou uva passificada (Appassimento)",
    tooltip:
      "Feito de bagos botritizados (Sauternes, Tokaj, Mosel, Alsácia) ou uvas secas (Amarone, Recioto, Vinsanto).",
  },
  "vin-new-french-oak": {
    shortLabel: "Carvalho francês novo",
    label: "Amadurecimento em barricas novas de carvalho francês (225 L / Pièce)",
    tooltip: "Maturação clássica em barrica pequena, com tostado, cedro, baunilha e micro-oxigenação.",
  },
  "vin-large-botte-foudre": {
    shortLabel: "Botte / Foudre grande",
    label: "Amadurecimento em botti grandes de carvalho da Eslavônia ou foudres neutros",
    tooltip:
      "Tonéis grandes (1.000 L–10.000 L) que permitem evolução oxidativa suave, sem lactonas pesadas de carvalho.",
  },
  "vin-extended-aging-36m": {
    shortLabel: "36+ meses de amadurecimento",
    label: "Maturação longa na adega (≥ 36 meses antes do lançamento)",
    tooltip:
      "Exige ou pratica de 3 a mais de 10 anos em tonel ou garrafa antes do lançamento (Barolo, Brunello, Rioja Gran Reserva, Vintage Champagne, Vega Sicilia).",
  },
  "vin-sur-lie": {
    shortLabel: "Sur Lie / borras",
    label: "Amadurecimento longo sobre borras ('Sur Lie' / manoproteínas e autólise)",
    tooltip:
      "Amadurecimento sobre leveduras mortas, com brioche, cremosidade e proteção antioxidante (Champagne, Muscadet, Chablis, Meursault, Albariño).",
  },
  "vin-whole-cluster-coferment": {
    shortLabel: "Cacho inteiro / cofermentação",
    label: "Cacho inteiro, maceração carbônica ou cofermentação tinto-branco",
    tooltip:
      "Usa cachos inteiros (Beaujolais, Borgonha, Rhône) ou cofermenta uvas tintas e brancas (Côte-Rôtie, Hermitage).",
  },
  "vin-no-mlf-unoaked": {
    shortLabel: "Sem carvalho / sem MLF",
    label: "Malolática evitada, ou só inox / concreto / ânfora",
    tooltip: "Preserva a acidez málica primária ou a tensão mineral, sem o carvalho mascarar.",
  },
  "vin-flor-solera": {
    shortLabel: "Solera / levedura de flor",
    label: "Corte fracionado em Solera ou levedura biológica de 'Flor' / 'Voile'",
    tooltip:
      "Sob um véu vivo de levedura (Jerez, Château-Chalon) ou em um sistema de solera de vários níveis (Jerez, Selosse).",
  },
  "sens-high-tannin-acid": {
    shortLabel: "Tanino e acidez altos",
    label: "Estrutura de tanino alto e acidez alta",
    tooltip:
      "Assinatura clássica de degustação às cegas de Nebbiolo, Sangiovese, Aglianico, Xinomavro, Cabernet da Margem Esquerda e Syrah do Rhône Norte.",
  },
  "sens-laser-acid": {
    shortLabel: "Acidez cortante",
    label: "Acidez natural cortante (referência de pH baixo)",
    tooltip:
      "Acidez elétrica, que faz salivar (Riesling, Chenin Blanc, Assyrtiko, Champagne, Chablis, Sauvignon Blanc, Barbera).",
  },
  "sens-delicate-low-tannin": {
    shortLabel: "Delicado / pouco tanino",
    label: "Tinto delicado ou translúcido, ou finesse de baixo álcool",
    tooltip:
      "Tintos pálidos e de pouco tanino (Pinot Noir, Gamay, Grenache de Rayas) ou brancos delicados de baixo teor (Mosel Kabinett, Muscadet, Vinho Verde).",
  },
  "sens-full-bodied": {
    shortLabel: "Encorpado (≥14%)",
    label: "Encorpado e generoso em álcool (≥ 14% vol. típico)",
    tooltip: "Extrato rico e álcool elevado (Amarone, Châteauneuf-du-Pape, Priorat, Barossa, Napa e fortificados).",
  },
  "sens-violet-floral": {
    shortLabel: "Floral de violeta / rosa",
    label: "Nariz floral típico (violeta, pétala de rosa ou lichia/flor)",
    tooltip:
      "Aromas florais de terpenos ou norisoprenoides (Nebbiolo, Syrah/Viognier, Pinot Noir, Malbec, Touriga Nacional, Gewürztraminer).",
  },
  "sens-saline-mineral": {
    shortLabel: "Salino / mineral",
    label: "Mineralidade salina, de concha ou de pedra molhada",
    tooltip: "Final salgado, gredoso ou de sal marinho, vindo de calcário, ardósia, cinza vulcânica ou borrifo atlântico.",
  },
  "sens-truffle-tar-pepper": {
    shortLabel: "Trufa / alcatrão / pimenta",
    label: "Terciário evoluído: trufa, alcatrão, sous-bois ou pimenta-preta (rotundona)",
    tooltip: "Notas de húmus, alcatrão, couro ou pimenta da rotundona.",
  },
  "sens-petrol-botrytis": {
    shortLabel: "Petróleo ou mel de açafrão",
    label: "TDN típico (petróleo/querosene) ou mel de açafrão da Botrytis",
    tooltip: "Nota clássica de querosene do Riesling envelhecido, ou buquê de marmelada, açafrão e cera da podridão nobre.",
  },
  "sens-cellar-20yr": {
    shortLabel: "Longevidade de 20+ anos",
    label: "Referência de guarda de 20–50+ anos",
    tooltip: "Famoso em leilão e em grandes adegas pelo potencial de guarda de várias décadas.",
  },
  "var-bordeaux-family": {
    shortLabel: "Uvas de Bordeaux",
    label: "Família de Bordeaux (Cabernet, Merlot, Sauvignon, Sémillon, Malbec)",
    tooltip: "Usa ou pertence à família genética de Cabernet Franc, Sauvignon Blanc, Merlot, Malbec e Carménère.",
  },
  "var-burgundy-family": {
    shortLabel: "Uvas da Borgonha",
    label: "Família da Borgonha (Pinot, Chardonnay, Gamay, Melon)",
    tooltip: "Usa ou pertence à dinastia genética de Pinot Noir × Gouais Blanc.",
  },
  "var-rhone-family": {
    shortLabel: "Uvas do Rhône",
    label: "Família do Rhône / Mediterrâneo (Syrah, Grenache, Mourvèdre, Viognier)",
    tooltip: "Traz Syrah/Shiraz, Grenache/Garnacha, Mourvèdre/Monastrell, Viognier, Marsanne ou Roussanne.",
  },
  "var-indigenous-med": {
    shortLabel: "Nativa italiana / ibérica",
    label: "Tradição de uva autóctone italiana ou ibérica",
    tooltip:
      "Enraizada em uvas italianas (Nebbiolo, Sangiovese, Corvina, Nerello, Aglianico) ou ibéricas (Tempranillo, Albariño, Touriga, Palomino).",
  },
  "var-single-varietal": {
    shortLabel: "Monovarietal",
    label: "Tradição purista de 100% uma só uva",
    tooltip:
      "A lei exige, ou a garrafa clássica é, um vinho 100% monovarietal (por exemplo Barolo, Brunello, Chablis, Sancerre, Mosel).",
  },
  "var-multi-blend": {
    shortLabel: "Corte clássico",
    label: "Tradição de corte de várias uvas",
    tooltip:
      "Denominação ou produtor celebrado por cortes (Bordeaux, Champagne, Châteauneuf-du-Pape, Rioja, Amarone, Porto). Uma só uva não conta.",
  },
  "var-thick-skin-late": {
    shortLabel: "Casca grossa, madura tarde",
    label: "Arquitetura de uva de casca grossa e maturação tardia",
    tooltip:
      "Muita casca por suco e estação longa (Cabernet Sauvignon, Nebbiolo, Syrah, Mourvèdre, Aglianico, Touriga).",
  },
  "var-thin-skin-early": {
    shortLabel: "Uva de casca fina",
    label: "Arquitetura de uva de casca fina",
    tooltip:
      "Cutícula delicada, sensível a podridão ou Botrytis (Pinot Noir, Gamay, Merlot, Sémillon, Chenin Blanc, Furmint, Grenache).",
  },
  "bot-bordeaux": {
    shortLabel: "Garrafa Bordeaux",
    label: "Tradição da garrafa Bordeaux de ombro alto",
    tooltip: "Garrafa de lados retos e ombro alto, feita para reter o depósito na decantação.",
  },
  "bot-burgundy": {
    shortLabel: "Garrafa Borgonha / Rhône",
    label: "Tradição da garrafa de ombro inclinado da Borgonha / Rhône",
    tooltip:
      "Ombros suaves, clássicos da Borgonha, do Rhône, do Loire, do Piemonte (Albeisa) e de Pinot, Chardonnay e Syrah do Novo Mundo.",
  },
  "bot-flute-specialty": {
    shortLabel: "Flûte / Champagne / especial",
    label: "Flûte d'Alsace / Schlegel, Champagne de vidro reforçado ou garrafa histórica",
    tooltip:
      "Flûte alta de Riesling/Alsácia, garrafa espumante de vidro grosso, Clavelin do Jura, Tokaji de 500 ml ou garrafa em relevo de Châteauneuf.",
  },
  "her-ungrafted": {
    shortLabel: "Videiras de pé franco",
    label: "Herança de pé franco / pré-filoxera ('Franc de Pied')",
    tooltip:
      "Famosas por videiras de raiz própria que sobreviveram à filoxera em cinza vulcânica, areia, ardósia ou continentes isolados (Santorini, Barossa, Chile, Mosel, Etna).",
  },
  "her-bush-vines": {
    shortLabel: "Arbusto (gobelet)",
    label: "Vinha em arbusto, sem arame ('Gobelet' / 'Alberello' / 'En Vaso' / 'Kouloura')",
    tooltip:
      "Cepas antigas conduzidas em cabeça, sem arame (Châteauneuf-du-Pape, Priorat, Etna, Santorini, Barossa, Rioja, Swartland, Beaujolais).",
  },
  "her-unesco-monastic": {
    shortLabel: "UNESCO / monástico",
    label: "Paisagem UNESCO ou origem monástica cisterciense/beneditina",
    tooltip:
      "Paisagem UNESCO (Climats da Côte d'Or, Champagne, Saint-Émilion, Langhe, Douro, Tokaj, Wachau — não inclui Chablis) ou origem monástica cisterciense/beneditina.",
  },
  "her-pre-1855": {
    shortLabel: "Herança pré-1855",
    label: "Codificado ou fundado em 1855 ou antes",
    tooltip: "Demarcado por lei (Chianti 1716, Tokaj 1737, Douro 1756, Bordeaux 1855) ou fundado antes de 1855.",
  },
  "type-appellation": {
    shortLabel: "Denominação",
    label: "Categoria: denominação / região vinícola",
    tooltip: "Precisa ser uma região geográfica de vinho (AOC, DOCG, DO, AVA, GI, PDO).",
  },
  "type-grape": {
    shortLabel: "Variedade de uva",
    label: "Categoria: variedade de uva (cultivar)",
    tooltip: "Precisa ser uma uva de Vitis vinifera.",
  },
  "type-producer": {
    shortLabel: "Produtor icônico",
    label: "Categoria: produtor icônico / propriedade de referência",
    tooltip: "Precisa ser uma vinícola, château, domaine ou bodega lendária.",
  },
};

export function localizedClue(clue: ClueDefinition, locale: Locale): ClueDefinition {
  if (locale !== "pt-BR") return clue;
  const copy = PT_CLUE_COPY[clue.id];
  if (!copy) return clue;
  return { ...clue, ...copy };
}
