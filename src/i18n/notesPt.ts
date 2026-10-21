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
};

export function localizedNote(id: string, fallback: string, locale: Locale): string {
  if (locale !== "pt-BR") return fallback;
  return PT_NOTES[id] ?? fallback;
}
