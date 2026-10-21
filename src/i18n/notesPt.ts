import { Locale } from "./locale";

/**
 * Brazilian Portuguese overlay for Codex cards and tasting notes.
 * The English sommelierNote stays the source of truth.
 */
export const PT_NOTES: Record<string, string> = {
  "app-pauillac":
    "Abriga três dos cinco Premier Cru de 1855 (Lafite, Latour, Mouton). Montes de cascalho günziano sobre calcário drenam rápido e deixam a Cabernet Sauvignon, de maturação tardia, chegar a cassis, cedro e grafite.",
  "app-pomerol":
    "Famosa pela argila esmectita azul e pelo subsolo ferruginoso 'crasse de fer' no platô alto (casa de Pétrus e Le Pin). Única entre as denominações de elite de Bordeaux, Pomerol não tem hierarquia oficial de crus.",
  "app-saint-emilion":
    "Primeira paisagem do vinho inscrita pela UNESCO (1999). Divide-se entre o platô de calcário asteriado ('côtes') e os terraços aluviais de cascalho perto de Pomerol, onde a Cabernet Franc brilha no Cheval Blanc.",
  "app-sauternes":
    "As névoas de outono, onde o Ciron frio e de nascente encontra o Garonne mais quente, disparam a Botrytis cinerea (podridão nobre) na Sémillon de casca fina, coroada pelo Premier Cru Supérieur Château d'Yquem.",
  "app-margaux":
    "A denominação comunal do sul do Médoc, por volta de 45°N, com o maior conjunto de crus classificados de 1855 e o Premier Cru Château Margaux. O cascalho profundo dá perfume aos cortes de Cabernet; bolsões de argila explicam mais Merlot do que em Pauillac.",
  "app-saint-julien":
    "Comuna de cascalho entre Pauillac e Margaux. A lista de 1855 deu a ela crus classificados, inclusive os Léoville e o Ducru-Beaucaillou, mas nenhum Premier Cru. A Cabernet Sauvignon conduz os cortes.",
  "app-saint-estephe":
    "A mais setentrional das quatro grandes denominações comunais do Médoc, logo acima de 45°N. Argila misturada a cascalho favorece mais Merlot do que em Pauillac. Seus crus de 1855 incluem Cos d'Estournel e Montrose; não há Premier Cru.",
  "app-champagne":
    "A cerca de 49°N, os subsolos de giz Belemnite e Micraster regulam a temperatura e guardam água, dando acidez cortante, ideal para a segunda fermentação na garrafa e para a autólise longa sobre as borras.",
  "app-chablis":
    "Chardonnay 100% em marga Kimmeridgian do Jurássico Superior, rica em conchas fósseis de Exogyra virgula, ao longo do rio Serein. O resultado é salinidade de sílex e ostra, com acidez elétrica.",
  "app-gevrey-chambertin":
    "Tem nove Grand Crus, mais do que qualquer outro vilarejo da Côte d'Or, plantados em calcário com crinoides do Bajociano e marga ferruginosa descida da Combe de Lavaux.",
  "app-meursault":
    "Famoso pelos Premier Crus Perrières, Genevrières e Charmes. Une avelã, brioche e amêndoa tostada da fermentação em barrica e do bâtonnage à tensão do calcário cristalino.",
  "app-morgon":
    "Centrado na Côte du Py, de xisto manganês decomposto ('roche pourrie') e diorito vulcânico azul. Pode 'morgonner': evoluir na garrafa até lembrar um Pinot Noir estruturado da Côte de Nuits.",
  "app-cote-rotie":
    "Literalmente a 'encosta assada': terraços de 60° de xisto e gnaisse, entre a Côte Brune, rica em ferro, e a Côte Blonde, de granito e gnaisse. A lei permite cofermentar até 20% de Viognier aromático com Syrah.",
  "app-hermitage":
    "Uma só colina de granito voltada para o sul, acima de Tain-l'Hermitage, dividida em lieux-dits como Les Bessards (granito puro) e Le Méal (seixos glaciais). Até 15% de Marsanne e Roussanne podem entrar no tinto.",
  "app-chateauneuf-du-pape":
    "O decreto de AOC de 1936, preparado sob o barão Le Roy, definiu a denominação. Famosa pelos seixos de quartzo que guardam calor ('galets roulés'), por lieux-dits arenosos como Rayas, por vinhas em arbusto sem arame e por 13 uvas permitidas (18 se contarmos as mutações de cor).",
  "app-sancerre":
    "Três terroirs distintos sobre o Loire: 'Terres Blanches' (marga Kimmeridgian, a mesma de Chablis), 'Caillottes' (calcário oxfordiano pedregoso) e 'Silex' (sílex que traz fumaça de pederneira).",
  "app-savennieres":
    "Encostas íngremes voltadas para o sul, de xisto armoricano e riolito vulcânico sobre o Loire, dão alguns dos Chenin Blanc secos mais longevos do mundo, inclusive o monopólio Coulée de Serrant.",
  "app-chinon":
    "Referência de Cabernet Franc ao longo do rio Vienne. Os terraços de cascalho aluvial dão tintos macios de framboesa; as encostas de giz 'tuffeau' amarelo do Turoniano dão vinhos de guarda.",
  "app-muscadet":
    "Na foz atlântica do Loire, a Melon de Bourgogne amadurece 'sur lie' (sobre borras finas no inverno, sem trasfega) em gnaisse, ortognaisse e gabro, com salinidade de borrifo do mar.",
  "app-alsace-grand-cru":
    "Protegida pela sombra de chuva dos Vosges, Colmar é uma das cidades mais secas da França. São 51 vinhedos Grand Cru (como o grauvaca vulcânico de Rangen e o granito de Schlossberg), engarrafados só na flûte alta da Alsácia.",
  "app-chateau-chalon":
    "Dedicada só ao Vin Jaune de Savagnin 100%, colhida tarde, em marga liássica azul-acinzentada. Envelhece intocada por 6 anos e 3 meses sob um véu de levedura ('voile'), sem recompletagem, e vai para a Clavelin de 62 cl.",
  "app-bandol":
    "Anfiteatro mediterrâneo de terraços ('restanques'), onde a Mourvèdre de maturação tardia precisa ser pelo menos 50% do corte tinto e o vinho descansa no mínimo 18 meses em grandes foudres de carvalho.",
  "app-barolo":
    "'Rei dos vinhos, vinho dos reis.' Nebbiolo 100%, com no mínimo 38 meses de amadurecimento (62 no Riserva). Divide-se entre a marga calcária tortoniana (La Morra e Barolo, mais perfumados) e o arenito helveciano/serravaliano (Serralunga e Monforte, mais estruturados), na garrafa Albeisa.",
  "app-barbaresco":
    "Mais perto do rio Tanaro e um pouco mais baixo que Barolo. Nebbiolo 100% em marga tortoniana (Asili, Rabajà, Martinenga) amadurece um pouco antes, com 26 meses obrigatórios (50 no Riserva).",
  "app-brunello-di-montalcino":
    "Feito de Sangiovese Grosso 100% ('Brunello'), abrigado pelo Monte Amiata. Uma das exigências de guarda mais longas do mundo: 4 anos no total (5 no Riserva), com pelo menos 2 anos em carvalho.",
  "app-chianti-classico":
    "Delimitado pela primeira vez pelo grão-duque Cosimo III de' Medici em 1716. Mínimo de 80% de Sangiovese em 'galestro' (marga-xisto friável) e calcário 'alberese', com o topo Gran Selezione (no mínimo 30 meses e 90% ou mais de Sangiovese).",
  "app-bolgheri":
    "Berço da revolução 'Super Toscan' na costa do Tirreno, onde o cascalho ('sassi') e a luz do mar espelham a Margem Esquerda de Bordeaux. Bolgheri Sassicaia DOC foi a primeira DOC de uma só propriedade na Itália (2013).",
  "app-amarone":
    "Feito por appassimento: cachos de Corvina, Corvinone e Rondinella secam de 100 a 120 dias em sótãos ventilados ('fruttai'), perdem cerca de 40% do peso e fermentam devagar até secar (acima de 15% vol.).",
  "app-soave-classico":
    "A zona histórica de colina a leste de Verona tem basalto e tufo vulcânicos do Eoceno. No mínimo 70% de Garganega, de maturação tardia e muitas vezes em pérgola veronesa, desenvolve camomila, amêndoa e mineralidade defumada.",
  "app-franciacorta":
    "O principal espumante italiano de método clássico, num anfiteatro de morena glacial ao sul do lago Iseo. O Franciacorta Riserva exige 60 meses sobre as borras.",
  "app-etna":
    "A 'Borgonha do Mediterrâneo'. Muros de pedra seca em terraços até 1.100 m no vulcão ativo mais alto da Europa guardam vinhas de pé franco, centenárias, em arbusto, de Nerello Mascalese e Carricante.",
  "app-taurasi":
    "Apelidado de 'Barolo do Sul'. Vinhedos altos dos Apeninos, cobertos de cinza do Vesúvio, amadurecem a Aglianico até novembro e exigem no mínimo 36 meses (48 no Riserva).",
  "app-rioja":
    "A primeira Denominación de Origen Calificada da Espanha (1991), abrigada pela Sierra de Cantabria. Famosa pela pirâmide de guarda (Crianza, Reserva e Gran Reserva, este com 60 meses no total) e pelo carvalho americano e francês.",
  "app-priorat":
    "Uma das duas únicas DOCa da Espanha. Vinhas centenárias em arbusto, de Garnacha e Cariñena, mandam raízes metros adentro no xisto e no quartzo paleozoicos ('llicorella') dos terraços ('costers'), hoje classificados até Gran Vinya Classificada.",
  "app-ribera-del-duero":
    "Entre 720 e mais de 1.000 m no planalto norte da Espanha, onde o dia chega a 38°C e a noite cai a 12°C. Essa amplitude engrossa a casca do Tinto Fino (Tempranillo) e dá vinhos escuros e monumentais.",
  "app-jerez-sherry":
    "Cresce no giz diatomáceo branco 'albariza', que no verão forma uma crosta e segura a umidade. Envelhece por corte fracionado no sistema de criaderas e solera, ou sob o véu vivo de flor (Fino e Manzanilla), ou de forma oxidativa (Oloroso).",
  "app-rias-baixas":
    "Na Galícia atlântica, fria e chuvosa, a Albariño de casca grossa é conduzida alta, longe do granito úmido, em pérgolas de poste de granito ('parral') para o vento circular.",
  "app-porto":
    "Demarcado pelo marquês de Pombal em 1756, uma das regiões protegidas mais antigas do mundo. Esculpido em terraços verticais de xisto pré-cambriano ('socalcos') ao longo do Douro e fortificado no meio da fermentação com aguardente a 77% vol.",
  "app-madeira":
    "Vinho de ilha vulcânica, tornado quase imortal pelo aquecimento proposital ('canteiro' em sótãos quentes ou 'estufagem') e pelo envelhecimento oxidativo. Caramelo, noz tostada e casca de laranja encontram uma acidez natural cortante.",
  "app-mosel":
    "Abriga o vinhedo mais íngreme do mundo (Bremmer Calmont, 65°). A ardósia devoniana azul e vermelha ('Schiefer') reflete o sol do rio e guarda calor, e o Riesling a 50°N chega à precisão de Kabinett, Spätlese, Auslese e Trockenbeerenauslese em vinhas de pé franco.",
  "app-rheingau":
    "Onde o Reno vira de repente para o oeste por 30 km sob as colinas do Taunus, criando encostas ao sul. Berço da Spätlese (1775, em Schloss Johannisberg) e casa do mosteiro cisterciense de Kloster Eberbach.",
  "app-wachau":
    "Vale do Danúbio, patrimônio da UNESCO, onde o vento frio do Waldviertel encontra o ar quente da Panônia sobre rocha primária ('Urgestein', gnaisse) e terraços de loess. Famoso pelos níveis de branco seco: Steinfeder, Federspiel e Smaragd encorpado.",
  "app-tokaj":
    "O primeiro sistema de vinhedos classificado oficialmente (decreto real de 1737). As névoas de outono na confluência do Tisza e do Bodrog passam a Furmint, de acidez alta, em bagos aszú sobre tufo de riolito. O vinho envelhece em caves forradas de mofo e sai na garrafa Tokaji de 500 ml.",
  "app-santorini":
    "Formada pela erupção vulcânica minoica (cerca de 1600 a.C.). A filoxera não vive na pedra-pomes, na cinza e na areia de lava. Vinhas de Assyrtiko de pé franco, com cerca de 200 anos, são trançadas em cestos rentes ao chão ('kouloura') para prender a névoa do mar e proteger as uvas do vento meltemi.",
  "app-naoussa":
    "Xinomavro 100% ('preto ácido') nas encostas calcárias a leste do monte Vermio. Os sommeliers a reverenciam pela semelhança estrutural e aromática com o Nebbiolo do Barolo: tomate seco, tapenade de azeitona, pétala de rosa e tanino firme.",
  "app-bekaa-valley":
    "A 1.000 m, entre as cordilheiras do Líbano e do Antilíbano, ao lado do templo romano de Baco em Baalbek. A viticultura aqui passa de 5.000 anos.",
  "app-napa-valley":
    "Reúne metade das 12 ordens de solo do mundo em cerca de 50 km, dos leques aluviais do banco de Rutherford à rocha vulcânica das montanhas Vaca e Mayacamas. A névoa marinha da baía de San Pablo refresca o vale, lançado à fama no Julgamento de Paris de 1976.",
  "app-sonoma-coast":
    "A ressurgência fria do Pacífico puxa névoa densa pelo Petaluma Gap sobre o solo arenoso Goldridge, um refúgio fresco para Pinot Noir e Chardonnay.",
  "app-willamette-valley":
    "Latitude parecida com a da Borgonha (cerca de 45°N aqui, cerca de 47°N na Côte d'Or) e no paralelo 45, como Bordeaux. Abrigado pela Coast Range e refrescado à tarde pelo corredor Van Duzer. Dois solos antigos: o basalto vulcânico vermelho 'Jory', rico em ferro, e o sedimentar marinho 'Willakenzie'.",
  "app-barossa-valley":
    "Como a Austrália do Sul impõe quarentena rígida e há solos arenosos, o Barossa Valley tem as vinhas de Shiraz (1843), Grenache e Mourvèdre de pé franco e em arbusto mais antigas ainda em produção contínua.",
  "app-coonawarra":
    "Famosa por uma crista de 15 km em forma de charuto: terra rossa, óxido de ferro, sobre calcário marinho branco e poroso. A ressurgência do oceano Austral refresca a Cabernet Sauvignon, com eucalipto e cassis.",
  "app-clare-eden-valley":
    "Vales altos do sul da Austrália (400 a 550 m). O solo franco vermelho de Watervale sobre calcário e a ardósia de Polish Hill dão Riesling seco, de lima e querosene, que envelhece por décadas sob tampa de rosca.",
  "app-margaret-river":
    "Cercada em três lados pelos oceanos Índico e Austral, com cascalho antigo de ironstone ('forest grove') sobre granito. Produz menos de 3% do volume australiano e mais de 20% do Cabernet e do Chardonnay clone Gin Gin de topo.",
  "app-marlborough":
    "Cascalho de rio de grauvaca, que drena bem, e luz ultravioleta alta, com noites frescas da Ilha do Sul, elevam os precursores de tióis na Sauvignon Blanc: maracujá, groselha e urtiga amassada.",
  "app-central-otago":
    "A 45°S, na sombra de chuva dos Alpes do Sul, Central Otago é a única região realmente continental da Nova Zelândia e uma das mais meridionais do mundo para Pinot Noir comercial, em micaxisto e loess glacial.",
  "app-mendoza":
    "Contrafortes desérticos dos Andes, de 900 m a mais de 1.600 m, irrigados pelo degelo. O ultravioleta de altitude engrossa a casca, rica em resveratrol, e traz violeta ao Malbec sobre seixos aluviais revestidos de carbonato de cálcio.",
  "app-maipo-colchagua":
    "Cercados pelos Andes, pelo Pacífico (corrente de Humboldt), pelo Atacama e pela Antártida, o Chile permaneceu livre de filoxera. Os cascalhos aluviais de Puente Alto (Maipo) e as encostas graníticas em ferradura de Apalta (Colchagua) brilham com Cabernet Sauvignon e Carménère de pé franco.",
  "app-stellenbosch":
    "Plantado em alguns dos granitos decompostos e xistos de Malmesbury mais antigos da Terra (cerca de 600 milhões de anos), refrescado à tarde pelo 'Cape Doctor', o vento da False Bay e da corrente fria de Benguela.",
  "grape-cabernet-sauvignon":
    "O perfil de DNA da UC Davis, em 1997, mostrou que é um cruzamento natural do século XVII entre Cabernet Franc e Sauvignon Blanc. Bagas pequenas e casca escura e grossa dão muitos fenólicos, cassis, cedro e metoxipirazina.",
  "grape-merlot":
    "O nome vem do 'merle' (melro), que gosta das bagas de casca fina e maturação precoce. Filha de Cabernet Franc e Magdeleine Noire des Charentes, vai bem em argila fresca, que segura água, e em calcário.",
  "grape-cabernet-franc":
    "A matriz antiga, basca e pirenaica, da Cabernet Sauvignon, da Merlot e da Carménère. Chama-se Breton no Loire, onde vai bem no giz tuffeau amarelo, e Bouchet em Saint-Émilion, onde estrela no Cheval Blanc e no Ausone.",
  "grape-pinot-noir":
    "A 'uva do coração partido': geneticamente antiga e dada a mutações (Pinot Gris, Pinot Blanc, Pinot Meunier). A casca fina dá rubi pálido, pouco tanino, cereja, pétala de rosa e o chão de floresta ('sous-bois').",
  "grape-chardonnay":
    "Cruzamento medieval natural de Pinot e Gouais Blanc na Borgonha. A tela do enólogo e a tradutora do terroir: ostra e aço em Chablis, avelã tostada em Meursault e finesse de giz no Blanc de Blancs de Champagne.",
  "grape-sauvignon-blanc":
    "Movida por tióis voláteis (maracujá, toranja, buxo) e metoxipirazinas (grama cortada, pimentão verde, jalapeño). Com a Cabernet Franc, é mãe da Cabernet Sauvignon.",
  "grape-riesling":
    "Documentada pela primeira vez em Rüsselsheim, perto do Rheingau, em 13 de março de 1435. Famosa pelo TDN (1,1,6-trimetil-1,2-di-hidronaftaleno), que dá ao Riesling velho a nota de querosene, junto com acidez elétrica.",
  "grape-syrah":
    "Filha de duas uvas obscuras do sudeste da França: Dureza e Mondeuse Blanche. Rica no sesquiterpeno rotundona, que traz pimenta-preta rachada, carne defumada, azeitona preta e violeta.",
  "grape-nebbiolo":
    "O nome vem de 'nebbia', a névoa da manhã de outono nas Langhe. Na taça é um granada pálido, por causa das antocianinas instáveis de peonidina, mas carrega tanino feroz, acidez cortante e aromas de alcatrão, trufa branca e rosa seca.",
  "grape-sangiovese":
    "A uva tinta mais plantada da Itália ('Sanguis Jovis', sangue de Júpiter). Acidez natural alta e tanino firme dão cereja azeda Marasca, orégano seco, couro e terracota.",
  "grape-tempranillo":
    "De 'temprano' (cedo): amadurece duas semanas antes da Garnacha. Precisa de giz ou argila em altitude e de noites frias para guardar acidez, e absorve o carvalho com facilidade: folha de tabaco, endro, figo e couro.",
  "grape-grenache":
    "Trabalhadora mediterrânea, resistente à seca, com madeira ereta, feita para a condução em arbusto. Acumula muito açúcar (muitas vezes 14,5 a 16% vol.), com rubi translúcido, kirsch, pimenta branca e ervas de garrigue.",
  "grape-chenin-blanc":
    "Talvez a uva branca mais versátil do mundo: Savennières seco, espumante de método tradicional (Crémant e Vouvray Pétillant) e o Quarts de Chaume botritizado, com marmelo, lanolina, camomila e maçã assada.",
  "grape-assyrtiko":
    "Rara entre as uvas brancas: mesmo sob o sol mediterrâneo, a 14,5% vol., a Assyrtiko segura pH abaixo de 3,0 e acidez total acima de 7 a 8 g/L, com fumaça de pedra-pomes e sal marinho.",
  "grape-furmint":
    "Filha da Gouais Blanc, meia-irmã da Chardonnay e da Riesling. A casca fina e os cachos soltos convidam a Botrytis do Tokaji Aszú e ainda guardam acidez elétrica de lima e damasco.",
  "grape-gruner-veltliner":
    "A uva branca autóctone de bandeira da Áustria (Savagnin × St. Georgen-Rebe). Única entre as brancas por ter muita rotundona: pimenta branca, lentilha e rabanete.",
  "grape-malbec":
    "Nasceu no sudoeste da França (Cahors), filha de Prunelard e Magdeleine Noire des Charentes, meia-irmã da Merlot. O agrônomo francês Michel Pouget a levou a Mendoza em 1853.",
  "grape-gamay":
    "Expulsa da Côte d'Or em 1395 pelo duque Filipe, o Audaz, como 'desleal', e próspera no granito rosa e no xisto manganês dos 10 crus de Beaujolais, com maceração semicarbônica de cacho inteiro.",
  "grape-albarino":
    "A casca grossa resiste à Botrytis na Galícia atlântica úmida e no Minho. Os terpenos trazem pêssego branco, caroço de damasco, albedo de toranja e salinidade de brisa marinha.",
  "grape-viognier":
    "Por volta de 1965 restavam cerca de 8 ha (cerca de 20 acres) no mundo, em Condrieu e em Château-Grillet, antes do renascimento global. Famosa pelo damasco, pela madressilva e pela violeta, e por cofermentar com Syrah na Côte-Rôtie, estabilizando a cor por copigmentação.",
  "grape-touriga-nacional":
    "A uva tinta de bandeira de Portugal. Bagas minúsculas e de casca grossa dão pouco suco por casca, cor profunda, tanino firme e aromas de bergamota, esteva, mirtilo e violeta selvagem.",
  "grape-nerello-mascalese":
    "O nome vem da planície de Mascali, no Etna, e a genética é filha da Sangiovese. Une o rubi translúcido e o perfume de fruta vermelha do Pinot Noir ao tanino e ao ferro vulcânico do Nebbiolo.",
  "grape-palomino-fino":
    "De propósito, a fruta primária é neutra e a acidez é baixa, para que o terroir de albariza, os acetaldeídos da levedura de flor e a solera apareçam sem máscara no Fino, na Manzanilla, no Amontillado e no Oloroso.",
  "grape-savagnin":
    "Uma das uvas patriarcas mais antigas da Europa: mãe da Sauvignon Blanc, da Chenin Blanc e da Grüner Veltliner, e a forma não aromática da família Traminer, da qual a Gewürztraminer é uma mutação. Sustenta o Vin Jaune do Jura, envelhecido sob véu, e os brancos recompletados ('ouillé').",
  "prod-drc":
    "O topo da Borgonha. Cultiva só Grand Crus, inclusive os monopólios Romanée-Conti (1,81 ha) e La Tâche (6,06 ha), com viticultura biodinâmica e fermentação de cacho inteiro.",
  "prod-chateau-lafite":
    "O primeiro entre os Premier Cru na classificação de 1855 do Médoc. O cascalho profundo, trazido pelo vento, sobre o platô de calcário terciário no norte de Pauillac dá o Premier Cru mais perfumado, de cedro e grafite.",
  "prod-chateau-margaux":
    "O único Premier Cru de 1855 que divide o nome com a AOC da comuna. Une a estrutura de punho de ferro da Cabernet Sauvignon ao perfume sedoso de violeta, em cascalho pirenaico branco, além do Pavillon Blanc, Sauvignon Blanc 100%.",
  "prod-chateau-petrus":
    "11,4 hectares no 'buttonhole' de Pétrus, uma ilha de argila esmectita azul-escura de 40 milhões de anos sobre o 'crasse de fer'. Merlot 100% chega a uma densidade sem igual de trufa negra e amora.",
  "prod-chateau-dyquem":
    "O único Premier Cru Supérieur da classificação de 1855. Os colhedores passam de 6 a 10 vezes ('tries') pelo vinhedo, apanhando bagos botritizados um a um. Sai cerca de uma taça por videira.",
  "prod-krug":
    "Fundada em 1843 por Joseph Krug. Cada parcela fermenta primeiro em barricas de carvalho de Argonne de 205 litros, sem malolática, e depois passa mais de 6 anos sobre as borras na Grande Cuvée e no Clos du Mesnil, de um só vinhedo murado.",
  "prod-guigal":
    "Famosa pelo trio 'La-La-La' de Côte-Rôtie de vinhedo único: La Mouline, na Côte Blonde, com até 11% de Viognier cofermentada; La Landonne, Syrah 100% na Côte Brune; e La Turque. Envelhecem até 42 meses em carvalho novo 100%, feito na tanoaria da própria Guigal.",
  "prod-chateau-rayas":
    "Ao contrário dos galets roulés dos vizinhos de Châteauneuf, Rayas fica numa clareira fresca, cercada de pinheiros, de areia fina pura, e é feito de Grenache velha 100%, envelhecida em demi-muids antigos, com a leveza da Borgonha.",
  "prod-giacomo-conterno":
    "O tradicionalista de referência do Barolo. O Barolo Riserva Monfortino, dos crus Francia e Arione em Serralunga d'Alba, macera com chapéu submerso por até 4 ou 5 semanas e envelhece 7 anos em grandes botti de carvalho austríaco.",
  "prod-gaja":
    "Fundada em 1859 em Barbaresco e transformada por Angelo Gaja, que trouxe os crus de vinhedo único (Sorì San Lorenzo, Sorì Tildìn, Costa Russi), a colheita verde e a combinação de barrica e botte ao Piemonte.",
  "prod-sassicaia":
    "Plantada nos anos 1940 pelo marquês Mario Incisa della Rocchetta, com mudas de Cabernet de Pisa e do Château Lafite, em cascalho ('sassicaia'). O primeiro lançamento comercial foi a safra de 1968 e abriu o movimento Super Toscan.",
  "prod-vega-sicilia":
    "Fundada em 1864 por Eloy Lecanda, com mudas de Bordeaux ao lado do Tinto Fino (Tempranillo). O Único passa pelo menos 10 anos em tonéis, barricas e garrafa, de carvalho americano e francês, antes de sair. O Único Reserva Especial corta várias grandes safras.",
  "prod-lopez-de-heredia":
    "Fundada em 1877 em Haro. Famosa por envelhecer Viña Tondonia blanco, rosado e tinto Reserva e Gran Reserva de 4 a mais de 10 anos em barricas de carvalho americano já usado, tanoadas na própria casa, e depois anos em garrafa.",
  "prod-egon-muller":
    "No Saar frio, afluente do Mosel, sobre ardósia devoniana cinza, Egon Müller faz os Rieslings mais disputados do mundo, de vinhas de pé franco centenárias na colina de estilo monopólio do Scharzhofberg.",
  "prod-penfolds":
    "Fundada em 1844 pelo dr. Christopher Rawson Penfold. O enólogo-chefe Max Schubert criou o Grange em 1951: um Shiraz de vários vinhedos e distritos do sul da Austrália, com um pouco de Cabernet Sauvignon, fermentado e envelhecido em barricas novas de carvalho americano.",
  "prod-catena-zapata":
    "Pioneira da viticultura de altitude extrema em Mendoza, com Nicolás e a dra. Laura Catena. O vinhedo Adrianna fica a quase 1.500 m em Gualtallary, em leitos aluviais calcários.",
  "prod-screaming-eagle":
    "Uma propriedade minúscula de Cabernet na AVA de Oakville, em Napa Valley. As videiras ficam sobre rocha vulcânica e cascalho, e o vinho amadurece em carvalho francês novo.",
  "prod-chateau-musar":
    "Fundado em 1930 por Gaston Hochar e tornado famoso por Serge Hochar, que colheu durante a guerra civil libanesa. Corta Cabernet Sauvignon, Cinsault e Carignan de altitude do vale do Bekaa (e as antigas Obaideh e Merwah de pé franco nos brancos) e só lança os vinhos depois de 7 anos.",
  "app-vouvray":
    "Chenin Blanc 100% (Pineau de la Loire) nos platôs de giz tuffeau do Turoniano, escavados em caves profundas. Faz Sec, Demi-Sec, Moelleux e Liquoreux botritizados, e espumante de método tradicional.",
  "app-condrieu":
    "Viognier 100% em terraços íngremes de granito de biotita decomposto ('arzelle') sobre o Rhône, famosa pelo perfume de damasco, pêssego branco e flor de violeta.",
  "app-banyuls":
    "O grande vinho doce natural tinto da França, em terraços verticais de xisto cambriano que caem no Mediterrâneo. A fermentação é interrompida com álcool neutro de uva e o vinho muitas vezes envelhece ao sol em garrafões de vidro ('bonbonnes').",
  "app-cava":
    "Espumante espanhol de método tradicional, centrado em Penedès desde 1872, conduzido pelo trio local Xarel·lo (estrutura e terra, rica em resveratrol), Macabeo e Parellada de altitude.",
  "app-vinho-verde":
    "A maior DOC de Portugal, no noroeste úmido e chuvoso, entre os rios Minho e Douro. Solos de granito decomposto dão brancos vivos e de baixo álcool, de Alvarinho e de Loureiro floral.",
  "app-ahr":
    "Apesar de ficar acima de 50,5°N, mais de 80% do desfiladeiro íngreme de ardósia devoniana e grauvaca do Ahr é plantado com uvas tintas (Spätburgunder e a mutação precoce Frühburgunder), aquecido pela sombra de chuva do Eifel.",
  "app-burgenland":
    "Na fronteira com a Hungria, em volta do lago raso de Neusiedl, faz tanto Trockenbeerenauslese botritizado de classe mundial ('Ruster Ausbruch') quanto Blaufränkisch apimentado e mineral, em calcário conquífero de Leithakalk e micaxisto.",
  "app-salta-cafayate":
    "Abriga alguns dos vinhedos comerciais mais altos da Terra, de 1.700 m a mais de 3.100 m. A radiação solar intensa e amplitudes de mais de 20°C dão Torrontés Riojano rico em terpenos e Malbec e Tannat de casca grossa e cor de tinta.",
  "app-swartland-constantia":
    "O Chenin Blanc e a Syrah de vinhas velhas, em arbusto e sem irrigação, no granito de Paardeberg e no xisto de Malmesbury, lideram a nova onda da África do Sul. Perto dali, Constantia, fundada em 1685, fez o Vin de Constance doce que Napoleão amava.",
  "grape-mourvedre":
    "Precisa da 'cabeça no sol quente e dos pés na água'. É a última a brotar e a última a amadurecer no Mediterrâneo, e traz caça, ameixa preta, tomilho de garrigue e uma espinha de tanino ao Bandol e aos cortes GSM.",
  "grape-barbera":
    "O oposto estrutural da vizinha Nebbiolo no Piemonte: a Barbera tem rubi-púrpura profundo, acidez natural elétrica e quase nenhum tanino adstringente.",
  "grape-corvina":
    "O coração indispensável (45 a 95%) de Valpolicella e Amarone. A cutícula grossa protege as bagas da podridão nos 4 meses de appassimento de inverno e gera glicerol, cereja azeda e amêndoa amarga.",
  "grape-aglianico":
    "Vai especialmente bem em solos vulcânicos de altitude (monte Vulture, na Basilicata, e Irpinia, perto do Vesúvio). Une fumaça vulcânica, cereja preta, ferro e uma estrutura enorme de tanino e acidez.",
  "grape-carmenere":
    "Uva original do Médoc do século XVIII (Cabernet Franc × Gros Cabernet), quase apagada na Europa pela filoxera e pela coulure. Redescoberta no Chile em 1994 pelo ampelógrafo francês Jean-Michel Boursiquot, depois de um século sendo confundida com Merlot.",
  "grape-zinfandel":
    "Geneticamente idêntica à Primitivo italiana e à antiga Tribidrag croata (Crljenak Kaštelanski). O amadurecimento desigual no cacho faz conviverem, na colheita, bagos passificados e bagos vermelhos ácidos: geleia de amora, pimenta-preta e álcool alto.",
  "grape-pinotage":
    "Criada em 1925 na Universidade de Stellenbosch pelo professor Abraham Izak Perold, cruzando Pinot Noir e Cinsault (então chamada Hermitage na África do Sul).",
  "grape-gewurztraminer":
    "Mutação aromática de casca rosa da Savagnin Rose. O composto de aroma é o óxido de rosa cis, com lichia, delícia turca, água de rosas e gengibre.",
  "grape-semillon":
    "Dois papéis lendários: em Sauternes, a casca dourada e fina recebe a podridão nobre e vira néctar de damasco e açafrão; no Hunter Valley, é colhida cedo, por volta de 10,5% vol., e envelhece na garrafa até torrada, lanolina e creme de limão.",
  "prod-selosse":
    "O padrinho do movimento dos produtores de Champagne em Avize. Famoso pelo Substance, um Blanc de Blancs Grand Cru feito num sistema de solera inspirado em Jerez, começado em 1986.",
  "prod-raveneau":
    "Fundado em 1948 em Chablis, com parcelas em três Grand Crus (Les Clos, Valmur, Blanchot) e seis Premier Crus, em encostas íngremes de marga de ostra Kimmeridgian. Envelhece em feuillette já usada (132 L) e lacre de cera.",
  "prod-tempier":
    "Sob Lucien e Lulu Peyraud, salvou a Mourvèdre da substituição do pós-guerra em Bandol. Os crus tintos de vinhedo único (até 95% de Mourvèdre em Cabassaou) e o rosado gastronômico são ícones da viticultura francesa.",
  "prod-biondi-santi":
    "O inventor do Brunello di Montalcino: Ferruccio Biondi-Santi engarrafou o primeiro Brunello moderno em 1888, na Tenuta Greppo. O clone BBS11 foi selecionado depois por Franco Biondi-Santi com a Universidade de Florença e registrado em 1978. O vinho envelhece por décadas em grandes botti de carvalho da Eslavônia.",
  "prod-quintarelli":
    "'Il Maestro del Veneto.' Famoso pelos rótulos escritos à mão e por envelhecer o Amarone della Valpolicella de 7 a 10 anos em botti de carvalho da Eslavônia antes do lançamento.",
  "prod-alvaro-palacios":
    "Líder do renascimento do Priorat em 1989. L'Ermita é um anfiteatro íngreme voltado para o nordeste, de llicorella, plantado entre 1910 e 1939 com Garnacha velha, e tem o status de Gran Vinya Classificada.",
  "prod-henschke":
    "O grande vinho de vinhedo único da Austrália. Hill of Grace sai do bloco Grandfathers, de Shiraz de pé franco anterior à filoxera, plantado por volta de 1860 no alto do Eden Valley, em frente à igreja luterana de Gnadenberg.",
  "prod-ridge":
    "Guiada por décadas pelo enólogo-filósofo Paul Draper. A 400–800 m, nas montanhas frias de Santa Cruz, sobre o raro calcário franciscano em decomposição da Califórnia. O Ridge Monte Bello 1971 ficou em 5º no Julgamento de Paris de 1976 e em 1º na reedição dos 30 anos, em 2006.",
  // South America and Brazil batch.
  "app-vale-dos-vinhedos":
    "Primeira indicação geográfica do Brasil (IP, 2002) e primeira Denominação de Origem (2012): 72,45 km² do planalto vulcânico da Serra Geral, em Bento Gonçalves, Garibaldi e Monte Belo do Sul. Os tintos da DO precisam ter Merlot como base (pelo menos 60% do corte), e os espumantes são só pelo método tradicional, com no mínimo 9 meses sobre as leveduras.",
  "app-altos-de-pinto-bandeira":
    "Denominação de Origem exclusiva para espumantes (INPI, 2022): 65 km² entre 520 e 770 m de altitude, no planalto basáltico da Serra Geral. Só vale o método tradicional, com prensagem de cachos inteiros e pelo menos 12 meses sobre as leveduras antes do dégorgement, a partir de Chardonnay, Pinot Noir e no máximo 25% de Riesling Itálico.",
  "app-vinhos-de-altitude-sc":
    "A IG dos vinhos de altitude do Brasil (IP, 2021): só entram vinhedos a 840 m ou mais, e a maioria fica entre 900 e 1.400 m no planalto basáltico de São Joaquim, Água Doce, Bom Retiro e Urupema. O verão ameno e seco, com grande amplitude térmica, mantém o ácido málico alto e dá tintos intensos e de acidez marcante; os espumantes são feitos pelo método charmat e pelo tradicional.",
  "app-limari":
    "Vale semiárido do norte do Chile, conhecido pelo pisco e pelos petróglifos, refrescado pela neblina matinal chamada 'camanchaca'. É um dos poucos lugares do país com solos calcários e tem cerca de 780 ha de Chardonnay, fresco e mineral, além de espumantes pelo método tradicional.",
  "app-itata":
    "Uma das áreas vitícolas mais antigas das Américas, plantada desde o século XVI. País e Moscatel de Alejandría, em sequeiro, conduzidas em cabeça e em grande parte de pé-franco — e, depois do terremoto de 1939, também Cinsault — crescem em encostas de granito e quartzo. As tinajas de barro são os recipientes tradicionais de fermentação e amadurecimento, e a Cinsault daqui dá tintos leves e refrescantes.",
  "grape-torrontes":
    "A uva branca emblemática da Argentina. O DNA mostra que a Torrontés Riojano é um cruzamento natural de Moscatel de Alexandria com Criolla Chica (a Listán Prieto, a País do Chile), o que explica seus vinhos secos com aroma de moscatel. Seu lar são os altos Vales Calchaquíes, em Salta, em solos arenosos e pedregosos com grande amplitude térmica, onde costuma fermentar em inox, sem madeira.",
  "grape-pais":
    "A espanhola Listán Prieto, provavelmente a primeira vinífera levada às Américas pelos missionários — Mission na Califórnia, Criolla Chica na Argentina. Só o Itata tem 3.877 ha de vinhas velhas, conduzidas em cabeça e de pé-franco, em solos graníticos. Os vinhos são sempre de cor clara, com taninos rústicos que os enólogos domam com técnicas como a maceração carbônica.",
  "prod-cave-geisse":
    "Fundada em Pinto Bandeira em 1979 pelo agrônomo e enólogo chileno Mario Geisse, que veio ao Brasil em 1976 para dirigir a operação local da Moët & Chandon. Os testes de espumante pelo método tradicional começaram em 1981; hoje o Cave Geisse Brut tem 70% Chardonnay e 30% Pinot Noir, com 24 meses sobre as leveduras, e o Brut 1998, guardado por 12 anos, mostrou o potencial de envelhecimento dos espumantes de Pinto Bandeira.",
  "prod-miolo":
    "Giuseppe Miolo chegou a Bento Gonçalves em 1897 e comprou o Lote 43, no atual Vale dos Vinhedos; a vinícola da família é de 1989, e seu primeiro vinho engarrafado foi um Merlot. O grupo é o maior exportador de vinhos do Brasil, seus vinhos do Vale dos Vinhedos levam o selo da DO, e o espumante Millésime passa pelo menos 18 meses sobre as leveduras.",
  "prod-casa-valduga":
    "A família Valduga veio de Rovereto, no norte da Itália, no fim do século XIX e plantou alguns dos primeiros vinhedos no coração do atual Vale dos Vinhedos. Seus ícones amadurecem em carvalho francês e depois em caves subterrâneas: o Storia Merlot 2020 passou 18 meses em barricas novas de carvalho francês e 50 meses na cave, com 15,5% de álcool.",
  "prod-pizzato":
    "Propriedade familiar do Vale dos Vinhedos: Antônio Pizzato chegou da Itália em 1875, mas a família vendia suas uvas até a primeira safra própria, em 1999 — 15.500 garrafas de Merlot. O Merlot DNA99 só é feito nos grandes anos, nove vezes em 25 safras, e amadurece em carvalho francês de primeiro uso; a vinícola o descreve como encorpado e, ao mesmo tempo, elegante.",
  "prod-lidio-carraro":
    "A vinícola 'purista' do Brasil: nada de madeira, movimentação por gravidade e nenhuma filtração, para que o vinho mostre só a uva e o lugar. Os vinhedos foram plantados no Vale dos Vinhedos a partir de 1998, em solo argiloarenoso de basalto, e em Encruzilhada do Sul a partir de 2001, em solo arenoso de granito; o corte Quorum junta Merlot, Cabernet Sauvignon, Cabernet Franc e Tannat.",
  "prod-guaspari":
    "Vinícola paulista na Serra da Mantiqueira: a família chegou em 2001, plantou em 2006 e fez suas primeiras 30 garrafas em 2008. A Syrah cresce entre 1.000 e 1.140 m, e a dupla poda leva a colheita para o inverno seco, em julho e agosto. O Syrah Vista do Chá passa 28 meses em carvalho francês e mais 32 meses na garrafa.",
  "prod-zuccardi":
    "A história da Zuccardi começou em 1963, com um vinhedo plantado para demonstrar um sistema de irrigação. A vinícola de Paraje Altamira, inaugurada em 2016, é toda de concreto sem revestimento, e o Malbec Concreto fermenta com cachos inteiros e amadurece em concreto, a partir de parcelas pedregosas e calcárias entre 1.050 e 1.150 m.",
  "prod-achaval-ferrer":
    "Fundada em 1998 em torno de Malbecs de vinhedo único, vindos de antigos plantios de Mendoza de 1910, 1921, 1923 e 1950. A Finca Altamira, plantada em 1950 a 1.100 m na margem sul do rio Tunuyán, cresce sobre cinzas vulcânicas e seixos aluviais ricos em sedimentos calcários; fermenta em pequenos tanques de concreto, faz a malolática em carvalho francês novo e mostra violeta e mineralidade.",
  "prod-colome":
    "Fundada em 1831, a Colomé é a vinícola em produção contínua mais antiga da Argentina; a família Hess a comprou em 2001. Os vinhedos sobem de 2.300 m a 3.111 m, e o Altura Máxima, a 3.111 m sobre cascalho calcário e granítico, dá vinhos muito florais e de taninos delicados. O Malbec Auténtico não passa por madeira.",
  "prod-chacra":
    "Piero Incisa della Rocchetta, neto do criador do Sassicaia, faz Pinot Noir em Río Negro, como o Treinta y Dos, de vinhas sem enxerto plantadas em 1932. A propriedade tem certificação biodinâmica, o Chardonnay é feito com Jean-Marc Roulot, e nos solos de cascalho as noites chegam a ser até 40 graus mais frias que os dias.",
  "prod-el-enemigo":
    "A Bodega Aleanna, de Alejandro Vigil. O Gran Enemigo Gualtallary (85% Cabernet Franc, 15% Malbec) vem de solos calcários e rochosos a 1.470 m, com 40% de cachos inteiros, fermentado e amadurecido em concreto, com pH 3,03; a safra 2013 recebeu 100 pontos da Wine Advocate. O Chardonnay amadurece sob véu de flor, e a Bonarda em grandes tonéis.",
  "prod-almaviva":
    "Parceria de 1997 entre o Baron Philippe de Rothschild e a Concha y Toro, lançada em 1998 como o primeiro vinho 'conceito château' do Chile. Seus 65 ha ficam a 650 m, em solos aluviais na margem norte do rio Maipo, em Puente Alto; o 1997 tinha 72% Cabernet Sauvignon, 23% Carménère e 5% Cabernet Franc, com 16 meses em carvalho francês novo.",
  "prod-don-melchor":
    "Cabernet Sauvignon de Puente Alto, feito pela primeira vez em 1987, 100% varietal. O vinhedo fica a 650 m, em solos pedregosos na margem norte do rio Maipo, e é manejado em 7 parcelas e 151 microparcelas. O 2021 (93% Cabernet Sauvignon) passou 15 meses em carvalho francês, 68% novo, tem notas de violeta e, segundo a vinícola, 35 a 40 anos de potencial de guarda; foi eleito o Vinho do Ano pela Wine Spectator.",
  "prod-clos-apalta":
    "Corte liderado pela Carménère, de Apalta, cujas parcelas mais antigas foram plantadas entre 1915 e 1920. Seus 40 ha de vinhas de pé-franco crescem em granito perto do rio Tinguiririca, em clima semimediterrâneo com enorme amplitude térmica. O 2021 (75% Carménère) fez a malolática em carvalho francês novo, amadureceu 21 meses em barricas 78% novas e mostra pimenta-do-reino.",
  "prod-sena":
    "Fundada em 1995 por Eduardo Chadwick e Robert Mondavi como um corte ícone chileno, hoje cultivado em biodinâmica em Ocoa, no Vale do Aconcágua, em clima mediterrâneo sobre andesito vulcânico, coluvião e aluvião. O 1995 tinha 70% Cabernet Sauvignon e 30% Carménère, com 14 meses em carvalho francês novo; na Degustação de Berlim de 2004, o Seña 2001 ficou em segundo, atrás do Viñedo Chadwick 2000.",
  "prod-montes":
    "Primeira colheita em 1987, fundada em 1988 como Discover Wines. A Montes diz ter introduzido a Syrah no Chile em 1993, comprou a propriedade de Apalta em 1995, lançou o primeiro vinho ícone chileno, o Alpha M, em 1996, o Syrah Folly em 2000 e o Purple Angel, primeiro Carménère ícone do Chile, em 2003; o Folly vem das encostas mais altas da Finca de Apalta.",
  "prod-de-martino":
    "O Viejas Tinajas Cinsault da De Martino vem de Guarilihue, no Itata costeiro, a 22 km do Pacífico, em granito decomposto: o vinhedo foi plantado em 1982 sem porta-enxerto, conduzido em gobelet e sem irrigação. As bagas inteiras fermentam em estilo semicarbônico em tinajas de barro centenárias, e o vinho é floral, com violeta, taninos finos e macios e 12,5% de álcool.",
  "prod-garzon":
    "Propriedade em Maldonado a 18 km do oceano Atlântico, cuja brisa constante refresca as vinhas, sobre rocha alterada do antigo embasamento cristalino do Uruguai (o 'balasto'), com granito exposto. O Albariño passa de 3 a 6 meses sobre borras finas e é fresco e mineral, enquanto os Tannat de topo amadurecem de 12 a 18 meses em grandes tonéis relativamente neutros de 1.500 a 2.500 litros.",
  "prod-bouza":
    "Vinícola familiar de raízes galegas que começou em 1998 com um vinhedo de 35 anos em Las Violetas, Canelones, e em 2001 restaurou uma vinícola dos anos 1950 em Melilla, Montevidéu, em clima temperado com influência atlântica. Plantou Albariño e Tempranillo ao lado das Chardonnay, Merlot e Tannat herdadas; o Albariño passa 4 meses sobre as borras, e o Tannat de parcela única B6 amadurece 12 meses em carvalho francês e americano novo.",
  // Batch 2: global producers.
  "prod-clos-rougeard":
    "Propriedade em Chacé, Saumur-Champigny, com história que remonta a 1664 e oito gerações da família Foucault. Cabernet Franc de cultivo orgânico sobre tuffeau turoniano e argilo-calcário; o Le Bourg faz a malolática em barricas novas e fica nelas de 18 a 24 meses. Um perfil comercial da propriedade atribui ao Le Bourg um potencial de guarda imenso e diz que os vinhos atravessam décadas.",
  "prod-huet":
    "Fundado em Vouvray em 1928 por Gaston Huet, com três vinhedos históricos de Chenin Blanc: Le Haut-Lieu, Le Mont e Clos du Bourg. Biodinâmico desde 1988, um dos pioneiros no Loire; seus vinhos doces botritizados estão entre os mais longevos do mundo.",
  "prod-dagueneau":
    "Domaine de Saint-Andelain cujo Sauvignon Blanc vem de solos de sílex, calcário e argila. O Silex fermenta em barrica sobre as borras finas, com bâtonnage, e estagia em barris de 450 e 600 litros e nos alongados 'charutos' de 350 litros criados por Didier Dagueneau. Isso não é um estágio longo sur lie. Desde 2017 os vinhos saem como Vin de France.",
  "prod-coulee-de-serrant":
    "Apelação monopólio de 7 ha de Chenin Blanc em encostas íngremes de xisto vermelho sobre o Loire, plantada por monges cistercienses em 1130. Biodinâmica desde 1981; o vinho passa de 6 a 8 meses em carvalho (no máximo 5% novo), com bâtonnage.",
  "prod-keller":
    "Propriedade de Rheinhessen cujo vinhedo Dalsheimer Hubacker pertence à família Keller desde 1789. Rieslings secos de vinhedos calcários como Hubacker, Morstein e Kirchspiel, com fermentação espontânea, longo contato com as borras e estágio em grandes tonéis Fuder antigos de carvalho alemão.",
  "prod-jj-prum":
    "Propriedade de Wehlen em encostas íngremes de ardósia devoniana, com cerca de 90% de vinhas sem enxerto. Os Rieslings fermentam espontaneamente e amadurecem sobre as borras em inox; os auslese botritizados e os vinhos mais doces podem evoluir por 20 a 30 anos ou mais.",
  "prod-donnhoff":
    "Propriedade do Nahe cujo Grosses Gewächs Hermannshöhle nasce em uma encosta íngreme voltada para o sul, de ardósia cinza-escura com pórfiro vulcânico e calcário. O Riesling fermenta e amadurece em inox e em tonéis tradicionais de carvalho, com uma nota salina que a vinícola atribui à ardósia.",
  "prod-fx-pichler":
    "Propriedade familiar da Wachau, com terraços de até 450 m sobre gnaisse e granito decomposto, como no Loibenberg, cerca de 250 m acima do Danúbio. Grüner Veltliner e Riesling estagiam sobre as borras em inox; desde a safra 2020 os rótulos seguem as regras da Wachau DAC.",
  "prod-prager":
    "Propriedade de Weißenkirchen; Franz Prager foi cofundador da Vinea Wachau em 1983, e Toni Bodenstein assumiu depois a adega. Os terraços íngremes de Achleiten têm pouca terra sobre gnaisse de Gföhl, anfibolito e ardósia; os vinhos fermentam espontaneamente em inox e mostram uma nota mineral de pederneira.",
  "prod-chave":
    "Domaine familiar desde 1481, que monta seu Hermitage com parcelas como as encostas íngremes de granito de Bessards; o Hermitage branco é sobretudo Marsanne de vinhas com quase 100 anos. O tinto fermenta em cimento, inox e carvalho aberto antigo, e depois estagia cerca de 18 meses em barricas de 228 litros, das quais cerca de 10% são novas. Costuma pedir pelo menos 20 anos de garrafa para mostrar o melhor.",
  "prod-clape":
    "Referência de Cornas: cerca de 8,8 ha de vinhas velhas de Syrah em terraços íngremes de granito voltados para sudeste, replantados por Auguste Clape a partir de 1968. Fermentação com cachos inteiros e cerca de 24 meses em foudres velhos de 1.000 litros, com notas de trufa e salinidade de granito.",
  "prod-foillard":
    "Produtor de Villié-Morgon cujo Gamay da Côte du Py cresce sobre granito e xisto. Os cachos inteiros fermentam por três a quatro semanas com pouco ou nenhum enxofre, e o vinho estagia de 6 a 9 meses em barricas usadas da Borgonha; a Kermit Lynch fala de uma 'espinha dorsal mineral'.",
  "prod-lapierre":
    "Domaine de Morgon com 15 ha de Gamay com certificação orgânica, vinhas de 70 anos em média, sobre granito decomposto pobre e ácido. Maceração semicarbônica tradicional do Beaujolais por 10 a 21 dias, sem SO2 adicionado e sem leveduras selecionadas.",
  "prod-cornelissen":
    "Propriedade da encosta norte do Etna, com primeira safra em 2001, construída em torno de vinhas em alberello sem enxerto. O Magma é 100% Nerello Mascalese sem enxerto, de vinhas com mais de 100 anos na Contrada Barbabecchi, a 870–910 m; fermenta com leveduras nativas e passa 18 meses em tanques neutros de epóxi e mais 18 em garrafa.",
  "prod-benanti":
    "Casa do Etna cujo Pietra Marina, Etna Bianco Superiore, é Carricante de vinhas em alberello em terraços de solo vulcânico arenoso, com grande amplitude térmica entre dia e noite. Passa cerca de 30 meses sobre as borras e mais 12 em garrafa; a ficha técnica descreve um estilo mineral e sápido.",
  "prod-sigalas":
    "Propriedade de Santorini com vinhas de pé-franco, imunes à filoxera, em solo vulcânico 'aspa', conduzidas rente ao chão em cestos 'kouloura' contra o vento. O Assyrtiko PDO Santorini vem de vinhas com mais de 60 anos, é vinificado em inox com pelo menos 4 meses sobre as borras; 14% de álcool e acidez vibrante.",
  "prod-oremus":
    "Propriedade do Tokaj pertencente ao grupo espanhol Vega Sicilia. O Aszú macera as bagas com podridão nobre no mosto, à moda tradicional, e depois passa dois a três anos em barrica e pelo menos um em garrafa, em adegas escavadas na rocha vulcânica; os vinhos evoluem por décadas.",
  "prod-chateau-climens":
    "Premier cru classé de Barsac na classificação de 1855, 100% Sémillon sobre uma fina camada de areia ferruginosa vermelha em cima de calcário fissurado. As névoas matinais do frio rio Ciron favorecem a podridão nobre; fermenta em barricas de carvalho francês, 30 a 40% novas, estagia de 20 a 22 meses e é biodinâmico desde 2010.",
  "prod-valdespino":
    "Bodega de Jerez com vinhedos no Pago de Macharnudo. O Fino Inocente foge do padrão atual de Jerez: fermenta em barris de carvalho americano e depois envelhece sob o véu de flor numa solera com dez criaderas, até uma idade média de 10 anos. A ficha do importador o descreve como salino e mineral. A Manzanilla da casa reflete o Atlântico e o Guadalquivir.",
  "prod-lustau":
    "Casa de Jerez fundada em 1896, que trabalha a uva Palomino de solos de albariza. Seu Fino Jarana envelhece biologicamente sob o véu de flor no sistema de solera, e a ficha técnica da bodega o descreve como salino e mineral.",
  "prod-salon":
    "O Champagne de terroir único de Eugène-Aimé Salon: só Chardonnay, de um único cru (Le Mesnil-sur-Oger), feito apenas em grandes safras. Os vinhos descansam cerca de dez anos na adega antes do lançamento; a casa destaca o caráter calcário e salino e um potencial de guarda de mais de 15 anos.",
  "prod-egly-ouriet":
    "Vinhateiro de Ambonnay. O Brut Tradition Grand Cru tem 70% Pinot Noir e 30% Chardonnay de Ambonnay, Bouzy e Verzenay, fermenta em barrica com leveduras nativas e sem malolática, e passa 48 meses sobre as borras; a crítica destaca o giz e o final longo e salino.",
  "prod-larmandier-bernier":
    "Vinhateiro de Vertus, na Côte des Blancs, com Chardonnay orgânico e biodinâmico sobre giz campaniano. Os vinhos fermentam com leveduras próprias e amadurecem cerca de um ano sobre as borras; o Terre de Vertus depois passa seis anos ou mais na adega e se destaca pela salinidade e mineralidade.",
  "prod-felton-road":
    "Propriedade de Bannockburn em encostas quentes voltadas para o norte, de loess glacial, com cultivo biodinâmico certificado pela Demeter e pela BioGro. Central Otago é a exceção continental da Nova Zelândia; o Pinot Noir da Felton Road estagia em carvalho francês, cerca de 30% novo.",
};

export function localizedNote(id: string, fallback: string, locale: Locale): string {
  if (locale !== "pt-BR") return fallback;
  return PT_NOTES[id] ?? fallback;
}
