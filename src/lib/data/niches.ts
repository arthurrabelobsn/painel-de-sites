import type { Lang } from "./locales";
import { EXTRA_NICHES } from "./niches-extra";

export type NicheCopy = {
  headline: string;
  sub: string;
  about: string;
  services: [string, string][];
};

export type NicheGroup = "casa" | "beleza" | "comida" | "saude" | "outros";

export const NICHE_GROUPS: { id: NicheGroup; label: string }[] = [
  { id: "casa", label: "Casa e reparos" },
  { id: "beleza", label: "Beleza" },
  { id: "comida", label: "Comida e bebida" },
  { id: "saude", label: "Saúde, bem-estar e pets" },
  { id: "outros", label: "Veículos e outros" },
];

export type Niche = {
  id: string;
  label: string; // nome no painel (pt-BR)
  emoji: string;
  group: NicheGroup;
  /** termo usado na busca do Google, no idioma do país */
  search: Record<Lang, string>;
  /** cor principal sugerida, cor escura, cor clara */
  palette: [string, string, string];
  copy: Record<Lang, NicheCopy>;
};

// Marcadores: {name} = nome do negócio, {city} = cidade
const BASE_NICHES: Niche[] = [
  {
    id: "plumber",
    label: "Encanador",
    emoji: "🔧",
    group: "casa",
    search: { en: "plumber", de: "Klempner", fr: "plombier", es: "fontanero", it: "idraulico", pt: "canalizador", nl: "loodgieter" },
    palette: ["#1d6fe0", "#0b1f3a", "#e8f1ff"],
    copy: {
      en: { headline: "Reliable plumbing in {city}", sub: "Leaks, blocked drains and boilers fixed fast — by local plumbers you can trust.", about: "{name} has been keeping homes and businesses in {city} running smoothly. We arrive on time, explain the job clearly and leave everything clean.", services: [["Leak repairs", "Fast fixes for pipes, taps and toilets."], ["Blocked drains", "Sinks, showers and drains cleared."], ["Boilers & water heaters", "Installation, repair and servicing."], ["Bathroom fitting", "New bathrooms from start to finish."]] },
      de: { headline: "Zuverlässige Sanitärarbeiten in {city}", sub: "Lecks, verstopfte Abflüsse und Heizungen – schnell repariert vom Fachbetrieb vor Ort.", about: "{name} sorgt in {city} dafür, dass in Haushalten und Betrieben alles läuft. Wir kommen pünktlich, erklären die Arbeit verständlich und hinterlassen alles sauber.", services: [["Leckreparatur", "Schnelle Hilfe bei Rohren, Armaturen und WCs."], ["Rohrreinigung", "Verstopfte Abflüsse und Duschen frei."], ["Heizung & Warmwasser", "Einbau, Reparatur und Wartung."], ["Badsanierung", "Ihr neues Bad aus einer Hand."]] },
      fr: { headline: "Votre plombier de confiance à {city}", sub: "Fuites, canalisations bouchées et chauffe-eau : réparés rapidement par des artisans locaux.", about: "{name} accompagne les particuliers et les entreprises de {city}. Nous arrivons à l'heure, expliquons clairement l'intervention et laissons tout propre.", services: [["Réparation de fuites", "Tuyaux, robinets et WC réparés vite."], ["Débouchage", "Éviers, douches et canalisations."], ["Chauffe-eau & chaudières", "Installation, réparation et entretien."], ["Salle de bain", "Rénovation complète de A à Z."]] },
      es: { headline: "Fontanería de confianza en {city}", sub: "Fugas, atascos y calentadores reparados rápido por fontaneros de la zona.", about: "{name} trabaja para hogares y negocios de {city}. Llegamos puntuales, explicamos el trabajo con claridad y lo dejamos todo limpio.", services: [["Reparación de fugas", "Tuberías, grifos e inodoros."], ["Desatascos", "Fregaderos, duchas y desagües."], ["Calentadores y calderas", "Instalación, reparación y mantenimiento."], ["Reformas de baño", "Tu baño nuevo de principio a fin."]] },
      it: { headline: "Idraulico di fiducia a {city}", sub: "Perdite, scarichi intasati e caldaie riparati in fretta da professionisti della zona.", about: "{name} aiuta famiglie e attività di {city}. Arriviamo puntuali, spieghiamo il lavoro con chiarezza e lasciamo tutto pulito.", services: [["Riparazione perdite", "Tubi, rubinetti e sanitari."], ["Spurgo scarichi", "Lavandini, docce e scarichi liberi."], ["Caldaie e boiler", "Installazione, riparazione e manutenzione."], ["Bagni completi", "Il tuo nuovo bagno chiavi in mano."]] },
      pt: { headline: "Canalizador de confiança em {city}", sub: "Fugas, entupimentos e esquentadores resolvidos depressa por profissionais da zona.", about: "A {name} cuida de casas e negócios em {city}. Chegamos a horas, explicamos o trabalho com clareza e deixamos tudo limpo.", services: [["Reparação de fugas", "Canos, torneiras e sanitas."], ["Desentupimentos", "Lava-loiças, chuveiros e esgotos."], ["Esquentadores e caldeiras", "Instalação, reparação e manutenção."], ["Remodelação de WC", "A sua casa de banho nova, do início ao fim."]] },
      nl: { headline: "Betrouwbare loodgieter in {city}", sub: "Lekkages, verstopte afvoeren en cv-ketels snel opgelost door vakmensen uit de buurt.", about: "{name} helpt huishoudens en bedrijven in {city}. We zijn op tijd, leggen het werk duidelijk uit en laten alles netjes achter.", services: [["Lekkages", "Leidingen, kranen en toiletten."], ["Ontstoppen", "Gootstenen, douches en afvoeren."], ["Cv-ketel & boiler", "Installatie, reparatie en onderhoud."], ["Badkamers", "Uw nieuwe badkamer van A tot Z."]] },
    },
  },
  {
    id: "electrician",
    label: "Eletricista",
    emoji: "⚡",
    group: "casa",
    search: { en: "electrician", de: "Elektriker", fr: "électricien", es: "electricista", it: "elettricista", pt: "eletricista", nl: "elektricien" },
    palette: ["#f2a900", "#1c1a14", "#fff6dc"],
    copy: {
      en: { headline: "Safe, certified electricians in {city}", sub: "From a faulty socket to a full rewire — done right the first time.", about: "{name} delivers safe electrical work for homes and businesses in {city}. Certified, tidy and always upfront about the price.", services: [["Fault finding", "Power cuts and tripping switches solved."], ["Rewiring", "Full and partial rewires to current standards."], ["Lighting", "Indoor, outdoor and LED installations."], ["Safety checks", "Inspections and certificates."]] },
      de: { headline: "Sichere Elektroarbeiten in {city}", sub: "Von der defekten Steckdose bis zur Neuinstallation – fachgerecht beim ersten Mal.", about: "{name} steht in {city} für sichere Elektroinstallationen in Haushalten und Betrieben. Zertifiziert, sauber und mit klaren Preisen.", services: [["Fehlersuche", "Stromausfälle und auslösende Sicherungen."], ["Neuinstallation", "Komplett oder teilweise nach Norm."], ["Beleuchtung", "Innen, außen und LED."], ["E-Check", "Prüfungen und Protokolle."]] },
      fr: { headline: "Électricien certifié à {city}", sub: "De la prise défectueuse à la rénovation complète, un travail bien fait du premier coup.", about: "{name} réalise des installations électriques sûres pour les particuliers et les pros de {city}. Certifié, soigneux et transparent sur les prix.", services: [["Dépannage", "Coupures et disjonctions résolues."], ["Mise aux normes", "Rénovation totale ou partielle."], ["Éclairage", "Intérieur, extérieur et LED."], ["Diagnostic", "Contrôles et attestations."]] },
      es: { headline: "Electricistas certificados en {city}", sub: "Desde un enchufe averiado hasta una instalación completa, bien hecho a la primera.", about: "{name} realiza trabajos eléctricos seguros para hogares y negocios de {city}. Certificados, limpios y con precios claros.", services: [["Averías", "Cortes de luz y saltos de diferencial."], ["Instalaciones nuevas", "Completas o parciales según normativa."], ["Iluminación", "Interior, exterior y LED."], ["Boletines", "Revisiones y certificados."]] },
      it: { headline: "Elettricista certificato a {city}", sub: "Dalla presa guasta all'impianto completo, fatto bene al primo colpo.", about: "{name} realizza impianti elettrici sicuri per case e attività di {city}. Certificati, ordinati e trasparenti sui prezzi.", services: [["Guasti", "Blackout e salvavita che saltano."], ["Impianti nuovi", "Rifacimenti completi o parziali a norma."], ["Illuminazione", "Interni, esterni e LED."], ["Certificazioni", "Verifiche e dichiarazioni di conformità."]] },
      pt: { headline: "Eletricista certificado em {city}", sub: "Da tomada avariada à instalação completa, bem feito à primeira.", about: "A {name} faz trabalhos elétricos seguros para casas e negócios em {city}. Certificados, cuidadosos e com preços claros.", services: [["Avarias", "Falhas de luz e disjuntores a disparar."], ["Instalações novas", "Totais ou parciais, dentro das normas."], ["Iluminação", "Interior, exterior e LED."], ["Inspeções", "Certificados e verificações."]] },
      nl: { headline: "Erkende elektricien in {city}", sub: "Van een kapot stopcontact tot een complete installatie – in één keer goed.", about: "{name} zorgt voor veilige elektrische installaties bij particulieren en bedrijven in {city}. Erkend, netjes en duidelijk over de prijs.", services: [["Storingen", "Stroomuitval en springende groepen."], ["Nieuwe installatie", "Volledig of gedeeltelijk volgens de norm."], ["Verlichting", "Binnen, buiten en led."], ["Keuringen", "Inspecties en rapporten."]] },
    },
  },
  {
    id: "barber",
    label: "Barbearia",
    emoji: "💈",
    group: "beleza",
    search: { en: "barber shop", de: "Barbershop", fr: "barbier", es: "barbería", it: "barbiere", pt: "barbearia", nl: "kapper heren" },
    palette: ["#b8892d", "#141210", "#f5efe4"],
    copy: {
      en: { headline: "Sharp cuts and classic shaves in {city}", sub: "Walk in looking good, walk out looking great.", about: "{name} is a neighbourhood barber in {city} where craft meets conversation. Precise fades, beard trims and hot-towel shaves.", services: [["Haircut", "Classic and modern cuts."], ["Skin fade", "Clean, precise fades."], ["Beard trim", "Shaped and lined up."], ["Hot-towel shave", "The traditional experience."]] },
      de: { headline: "Präzise Schnitte und klassische Rasur in {city}", sub: "Gut rein, noch besser raus.", about: "{name} ist der Barbershop in {city}, in dem Handwerk und gute Gespräche zusammenkommen. Fades, Bartpflege und Nassrasur.", services: [["Haarschnitt", "Klassisch und modern."], ["Fade", "Saubere, präzise Übergänge."], ["Bartpflege", "Geformt und konturiert."], ["Nassrasur", "Mit heißem Tuch, ganz klassisch."]] },
      fr: { headline: "Coupes nettes et rasage à l'ancienne à {city}", sub: "Entrez bien, ressortez impeccable.", about: "{name} est le barbier de quartier à {city}, où le savoir-faire rencontre la bonne humeur. Dégradés, barbe et rasage à la serviette chaude.", services: [["Coupe", "Classique ou tendance."], ["Dégradé", "Net et précis."], ["Taille de barbe", "Sculptée et dessinée."], ["Rasage traditionnel", "Serviette chaude et coupe-chou."]] },
      es: { headline: "Cortes precisos y afeitado clásico en {city}", sub: "Entra bien, sal mejor.", about: "{name} es la barbería de barrio en {city} donde el oficio se une a la buena charla. Degradados, barba y afeitado con toalla caliente.", services: [["Corte de pelo", "Clásico y moderno."], ["Degradado", "Limpio y preciso."], ["Arreglo de barba", "Perfilada y definida."], ["Afeitado clásico", "Con toalla caliente."]] },
      it: { headline: "Tagli precisi e rasatura classica a {city}", sub: "Entra bene, esci ancora meglio.", about: "{name} è il barbiere di quartiere a {city} dove mestiere e chiacchiere vanno insieme. Sfumature, barba e rasatura con panno caldo.", services: [["Taglio", "Classico e moderno."], ["Sfumatura", "Pulita e precisa."], ["Barba", "Modellata e rifinita."], ["Rasatura classica", "Con panno caldo."]] },
      pt: { headline: "Cortes precisos e barba clássica em {city}", sub: "Entre bem, saia ainda melhor.", about: "A {name} é a barbearia de bairro em {city} onde o ofício se junta a uma boa conversa. Degradés, barba e barbear com toalha quente.", services: [["Corte de cabelo", "Clássico e moderno."], ["Degradé", "Limpo e preciso."], ["Barba", "Aparada e desenhada."], ["Barbear clássico", "Com toalha quente."]] },
      nl: { headline: "Strakke coupes en klassiek scheren in {city}", sub: "Goed binnen, nog beter naar buiten.", about: "{name} is de buurtbarbier in {city} waar vakmanschap en een goed gesprek samenkomen. Fades, baardverzorging en scheren met hete handdoek.", services: [["Knippen", "Klassiek en modern."], ["Fade", "Strak en precies."], ["Baard trimmen", "Gevormd en strak."], ["Klassiek scheren", "Met hete handdoek."]] },
    },
  },
  {
    id: "hair-salon",
    label: "Salão de beleza",
    emoji: "✂️",
    group: "beleza",
    search: { en: "hair salon", de: "Friseursalon", fr: "salon de coiffure", es: "peluquería", it: "parrucchiere", pt: "cabeleireiro", nl: "kapsalon" },
    palette: ["#c2577a", "#2a1520", "#fbeef2"],
    copy: {
      en: { headline: "Hair you'll love, in the heart of {city}", sub: "Cuts, colour and care from stylists who listen.", about: "At {name} in {city} we take the time to understand what you want, then make it happen. Relaxed atmosphere, honest advice and beautiful results.", services: [["Cut & style", "For every length and texture."], ["Colour", "Highlights, balayage and full colour."], ["Treatments", "Repair and shine for tired hair."], ["Occasions", "Updos for weddings and events."]] },
      de: { headline: "Haare, die Sie lieben – mitten in {city}", sub: "Schnitt, Farbe und Pflege von Stylisten, die zuhören.", about: "Bei {name} in {city} nehmen wir uns Zeit, Ihre Wünsche zu verstehen. Entspannte Atmosphäre, ehrliche Beratung und schöne Ergebnisse.", services: [["Schnitt & Styling", "Für jede Länge und Struktur."], ["Farbe", "Strähnen, Balayage und Färben."], ["Pflege", "Kuren für glänzendes Haar."], ["Anlässe", "Hochsteckfrisuren für Hochzeiten."]] },
      fr: { headline: "Des cheveux qu'on adore, au cœur de {city}", sub: "Coupe, couleur et soins par des coiffeurs à l'écoute.", about: "Chez {name} à {city}, nous prenons le temps de comprendre vos envies. Ambiance détendue, conseils sincères et beaux résultats.", services: [["Coupe & brushing", "Pour toutes les longueurs."], ["Couleur", "Mèches, balayage et coloration."], ["Soins", "Réparation et brillance."], ["Événements", "Chignons pour mariages et soirées."]] },
      es: { headline: "Un pelo que te encanta, en el centro de {city}", sub: "Corte, color y cuidado con estilistas que escuchan.", about: "En {name}, en {city}, nos tomamos el tiempo de entender lo que quieres. Ambiente relajado, consejos sinceros y resultados preciosos.", services: [["Corte y peinado", "Para todo tipo de pelo."], ["Color", "Mechas, balayage y tinte."], ["Tratamientos", "Reparación y brillo."], ["Eventos", "Recogidos para bodas y fiestas."]] },
      it: { headline: "Capelli che ami, nel cuore di {city}", sub: "Taglio, colore e cura con stilisti che ascoltano.", about: "Da {name} a {city} ci prendiamo il tempo di capire cosa desideri. Atmosfera rilassata, consigli sinceri e risultati bellissimi.", services: [["Taglio e piega", "Per ogni lunghezza."], ["Colore", "Colpi di sole, balayage e tinta."], ["Trattamenti", "Ristrutturazione e luminosità."], ["Cerimonie", "Acconciature per matrimoni ed eventi."]] },
      pt: { headline: "Um cabelo que vai adorar, no centro de {city}", sub: "Corte, cor e tratamento com cabeleireiros que ouvem.", about: "Na {name}, em {city}, dedicamos tempo a perceber o que procura. Ambiente descontraído, conselhos sinceros e resultados bonitos.", services: [["Corte e brushing", "Para todos os comprimentos."], ["Coloração", "Madeixas, balayage e cor."], ["Tratamentos", "Reparação e brilho."], ["Eventos", "Penteados para casamentos e festas."]] },
      nl: { headline: "Haar waar je blij van wordt, midden in {city}", sub: "Knippen, kleuren en verzorgen door stylisten die luisteren.", about: "Bij {name} in {city} nemen we de tijd om te begrijpen wat je wilt. Ontspannen sfeer, eerlijk advies en mooie resultaten.", services: [["Knippen & föhnen", "Voor elke haarlengte."], ["Kleuren", "Highlights, balayage en kleuring."], ["Behandelingen", "Herstel en glans."], ["Gelegenheden", "Opsteekkapsels voor bruiloften."]] },
    },
  },
  {
    id: "restaurant",
    label: "Restaurante",
    emoji: "🍽️",
    group: "comida",
    search: { en: "restaurant", de: "Restaurant", fr: "restaurant", es: "restaurante", it: "ristorante", pt: "restaurante", nl: "restaurant" },
    palette: ["#c8452c", "#1e1410", "#fbf1e8"],
    copy: {
      en: { headline: "Good food, made with care in {city}", sub: "Fresh ingredients, generous plates and a table waiting for you.", about: "{name} is a local favourite in {city}. We cook with seasonal produce and serve it with a warm welcome — for lunch, dinner or something to take home.", services: [["Lunch", "Daily dishes at fair prices."], ["Dinner", "Relaxed evenings with friends and family."], ["Takeaway", "Your favourites to enjoy at home."], ["Private events", "Birthdays, groups and celebrations."]] },
      de: { headline: "Gutes Essen, mit Liebe gekocht in {city}", sub: "Frische Zutaten, großzügige Teller und ein Tisch für Sie.", about: "{name} ist ein Lieblingsort in {city}. Wir kochen mit saisonalen Produkten und empfangen Sie herzlich – mittags, abends oder zum Mitnehmen.", services: [["Mittagstisch", "Tagesgerichte zu fairen Preisen."], ["Abendessen", "Entspannte Abende mit Familie und Freunden."], ["Zum Mitnehmen", "Ihre Lieblingsgerichte für zu Hause."], ["Feiern", "Geburtstage, Gruppen und Events."]] },
      fr: { headline: "Une bonne cuisine, faite avec soin à {city}", sub: "Produits frais, assiettes généreuses et une table qui vous attend.", about: "{name} est une adresse appréciée à {city}. Nous cuisinons des produits de saison et vous accueillons chaleureusement, midi et soir, sur place ou à emporter.", services: [["Déjeuner", "Plats du jour à prix doux."], ["Dîner", "Des soirées conviviales."], ["À emporter", "Vos plats préférés à la maison."], ["Privatisation", "Anniversaires, groupes et fêtes."]] },
      es: { headline: "Buena comida, hecha con cariño en {city}", sub: "Ingredientes frescos, platos generosos y una mesa esperándote.", about: "{name} es un rincón querido de {city}. Cocinamos con producto de temporada y te recibimos con cariño, a mediodía, por la noche o para llevar.", services: [["Menú del día", "Platos caseros a buen precio."], ["Cenas", "Noches tranquilas con amigos y familia."], ["Para llevar", "Tus platos favoritos en casa."], ["Eventos", "Cumpleaños, grupos y celebraciones."]] },
      it: { headline: "Buona cucina, fatta con cura a {city}", sub: "Ingredienti freschi, piatti generosi e un tavolo che ti aspetta.", about: "{name} è un punto di riferimento a {city}. Cuciniamo con prodotti di stagione e ti accogliamo con calore, a pranzo, a cena o da asporto.", services: [["Pranzo", "Piatti del giorno a prezzi onesti."], ["Cena", "Serate rilassate in compagnia."], ["Asporto", "I tuoi piatti preferiti a casa."], ["Eventi privati", "Compleanni, gruppi e feste."]] },
      pt: { headline: "Boa comida, feita com cuidado em {city}", sub: "Ingredientes frescos, pratos generosos e uma mesa à sua espera.", about: "A {name} é um lugar querido em {city}. Cozinhamos com produtos da época e recebemos com carinho, ao almoço, ao jantar ou para levar.", services: [["Almoço", "Pratos do dia a preços justos."], ["Jantar", "Noites tranquilas com família e amigos."], ["Take-away", "Os seus pratos favoritos em casa."], ["Eventos", "Aniversários, grupos e celebrações."]] },
      nl: { headline: "Goed eten, met zorg gemaakt in {city}", sub: "Verse ingrediënten, royale borden en een tafel voor u klaar.", about: "{name} is een geliefde plek in {city}. We koken met seizoensproducten en ontvangen u hartelijk – voor lunch, diner of om mee te nemen.", services: [["Lunch", "Dagschotels voor een eerlijke prijs."], ["Diner", "Ontspannen avonden met vrienden."], ["Afhalen", "Uw favorieten thuis."], ["Feesten", "Verjaardagen, groepen en events."]] },
    },
  },
  {
    id: "cleaning",
    label: "Limpeza",
    emoji: "🧽",
    group: "casa",
    search: { en: "cleaning service", de: "Reinigungsfirma", fr: "entreprise de nettoyage", es: "empresa de limpieza", it: "impresa di pulizie", pt: "empresa de limpeza", nl: "schoonmaakbedrijf" },
    palette: ["#14a37f", "#0c2420", "#e4f6f0"],
    copy: {
      en: { headline: "Spotless homes and offices in {city}", sub: "Trusted cleaners, flexible schedules and results you'll notice.", about: "{name} keeps homes and workplaces in {city} fresh and tidy. Vetted staff, quality products and a team that treats your space with respect.", services: [["Home cleaning", "Weekly, fortnightly or one-off."], ["Office cleaning", "Before or after working hours."], ["Deep cleaning", "Kitchens, bathrooms and every corner."], ["Move-in / move-out", "Ready for keys handover."]] },
      de: { headline: "Blitzsaubere Wohnungen und Büros in {city}", sub: "Zuverlässiges Personal, flexible Termine, sichtbare Ergebnisse.", about: "{name} sorgt in {city} für saubere Wohnungen und Arbeitsplätze. Geprüftes Personal, gute Produkte und ein respektvoller Umgang mit Ihren Räumen.", services: [["Haushaltsreinigung", "Wöchentlich, 14-tägig oder einmalig."], ["Büroreinigung", "Vor oder nach Geschäftsschluss."], ["Grundreinigung", "Küche, Bad und jede Ecke."], ["Umzugsreinigung", "Bereit für die Schlüsselübergabe."]] },
      fr: { headline: "Maisons et bureaux impeccables à {city}", sub: "Personnel de confiance, horaires flexibles, résultats visibles.", about: "{name} entretient logements et bureaux à {city}. Équipe sérieuse, produits de qualité et respect de vos espaces.", services: [["Ménage à domicile", "Hebdomadaire ou ponctuel."], ["Nettoyage de bureaux", "Avant ou après vos horaires."], ["Grand nettoyage", "Cuisine, salle de bain, chaque recoin."], ["Fin de bail", "Prêt pour l'état des lieux."]] },
      es: { headline: "Casas y oficinas impecables en {city}", sub: "Personal de confianza, horarios flexibles y resultados que se notan.", about: "{name} mantiene limpios hogares y negocios de {city}. Equipo de confianza, productos de calidad y respeto por tu espacio.", services: [["Limpieza de hogar", "Semanal, quincenal o puntual."], ["Limpieza de oficinas", "Antes o después del horario laboral."], ["Limpieza a fondo", "Cocina, baños y cada rincón."], ["Fin de obra / mudanza", "Listo para entregar llaves."]] },
      it: { headline: "Case e uffici splendenti a {city}", sub: "Personale affidabile, orari flessibili, risultati visibili.", about: "{name} si prende cura di case e uffici a {city}. Personale selezionato, prodotti di qualità e rispetto per i tuoi spazi.", services: [["Pulizie domestiche", "Settimanali o una tantum."], ["Pulizie uffici", "Prima o dopo l'orario di lavoro."], ["Pulizie a fondo", "Cucina, bagni e ogni angolo."], ["Traslochi", "Pronto per la consegna chiavi."]] },
      pt: { headline: "Casas e escritórios impecáveis em {city}", sub: "Equipa de confiança, horários flexíveis e resultados que se notam.", about: "A {name} mantém casas e escritórios limpos em {city}. Equipa selecionada, produtos de qualidade e respeito pelo seu espaço.", services: [["Limpeza doméstica", "Semanal, quinzenal ou pontual."], ["Limpeza de escritórios", "Antes ou depois do expediente."], ["Limpeza profunda", "Cozinha, casas de banho e cada canto."], ["Mudanças", "Pronta para entregar as chaves."]] },
      nl: { headline: "Brandschone woningen en kantoren in {city}", sub: "Betrouwbare schoonmakers, flexibele tijden, zichtbaar resultaat.", about: "{name} houdt woningen en werkplekken in {city} fris en netjes. Gescreend personeel, goede producten en respect voor uw ruimte.", services: [["Huishoudelijk", "Wekelijks, tweewekelijks of eenmalig."], ["Kantoren", "Voor of na werktijd."], ["Dieptereiniging", "Keuken, badkamer en elke hoek."], ["Verhuisschoonmaak", "Klaar voor de sleuteloverdracht."]] },
    },
  },
  {
    id: "auto-repair",
    label: "Oficina mecânica",
    emoji: "🚗",
    group: "outros",
    search: { en: "car repair garage", de: "Autowerkstatt", fr: "garage automobile", es: "taller mecánico", it: "officina meccanica", pt: "oficina automóvel", nl: "autogarage" },
    palette: ["#e0482b", "#141820", "#f2f4f7"],
    copy: {
      en: { headline: "Honest car repairs in {city}", sub: "Servicing, MOT prep and repairs on all makes — explained in plain words.", about: "{name} is an independent garage in {city}. We diagnose properly, quote before we start and get you back on the road fast.", services: [["Servicing", "Interim and full services."], ["Diagnostics", "Warning lights and fault codes."], ["Brakes & tyres", "Safety first, fair prices."], ["Repairs", "Clutch, suspension and more."]] },
      de: { headline: "Ehrliche Autoreparatur in {city}", sub: "Inspektion, HU-Vorbereitung und Reparaturen für alle Marken – verständlich erklärt.", about: "{name} ist die freie Werkstatt in {city}. Wir prüfen gründlich, nennen den Preis vorher und bringen Sie schnell wieder auf die Straße.", services: [["Inspektion", "Nach Herstellervorgaben."], ["Diagnose", "Warnleuchten und Fehlerspeicher."], ["Bremsen & Reifen", "Sicherheit zu fairen Preisen."], ["Reparaturen", "Kupplung, Fahrwerk und mehr."]] },
      fr: { headline: "Un garage honnête à {city}", sub: "Entretien, préparation au contrôle technique et réparations toutes marques.", about: "{name} est un garage indépendant à {city}. Diagnostic sérieux, devis avant travaux et véhicule rendu rapidement.", services: [["Entretien", "Révisions constructeur."], ["Diagnostic", "Voyants et codes défaut."], ["Freins & pneus", "La sécurité à prix juste."], ["Réparations", "Embrayage, suspension et plus."]] },
      es: { headline: "Taller mecánico honesto en {city}", sub: "Mantenimiento, pre-ITV y reparaciones de todas las marcas, explicado claro.", about: "{name} es un taller independiente en {city}. Diagnosticamos bien, presupuestamos antes de empezar y te devolvemos el coche rápido.", services: [["Mantenimiento", "Revisiones oficiales."], ["Diagnosis", "Testigos y códigos de avería."], ["Frenos y neumáticos", "Seguridad a buen precio."], ["Reparaciones", "Embrague, suspensión y más."]] },
      it: { headline: "Officina onesta a {city}", sub: "Tagliandi, revisioni e riparazioni per tutte le marche, spiegate in modo chiaro.", about: "{name} è un'officina indipendente a {city}. Diagnosi accurate, preventivo prima di iniziare e auto pronta in fretta.", services: [["Tagliandi", "Secondo le specifiche della casa."], ["Diagnosi", "Spie e codici errore."], ["Freni e gomme", "Sicurezza a prezzi giusti."], ["Riparazioni", "Frizione, sospensioni e altro."]] },
      pt: { headline: "Oficina de confiança em {city}", sub: "Revisões, preparação para inspeção e reparações de todas as marcas.", about: "A {name} é uma oficina independente em {city}. Diagnosticamos bem, damos orçamento antes de começar e devolvemos o carro depressa.", services: [["Revisões", "Segundo o plano da marca."], ["Diagnóstico", "Luzes de aviso e códigos de erro."], ["Travões e pneus", "Segurança a preço justo."], ["Reparações", "Embraiagem, suspensão e mais."]] },
      nl: { headline: "Eerlijke autogarage in {city}", sub: "Onderhoud, APK en reparaties voor alle merken – helder uitgelegd.", about: "{name} is een onafhankelijke garage in {city}. We stellen een goede diagnose, geven vooraf een prijs en u rijdt snel weer.", services: [["Onderhoud", "Kleine en grote beurten."], ["Diagnose", "Waarschuwingslampjes en foutcodes."], ["Remmen & banden", "Veilig voor een eerlijke prijs."], ["Reparaties", "Koppeling, vering en meer."]] },
    },
  },
  {
    id: "gardener",
    label: "Jardinagem",
    emoji: "🌿",
    group: "casa",
    search: { en: "gardener landscaping", de: "Gärtner Gartenpflege", fr: "jardinier paysagiste", es: "jardinero", it: "giardiniere", pt: "jardineiro", nl: "hovenier" },
    palette: ["#3f8f3a", "#12200f", "#eef6e8"],
    copy: {
      en: { headline: "Beautiful gardens across {city}", sub: "Maintenance, planting and design for gardens of every size.", about: "{name} looks after gardens in and around {city}. Reliable visits, tidy work and gardens you'll want to spend time in.", services: [["Garden maintenance", "Mowing, pruning and weeding."], ["Hedges & trees", "Trimming and safe removal."], ["Planting", "Borders, beds and new lawns."], ["Garden design", "Patios, paths and full makeovers."]] },
      de: { headline: "Schöne Gärten in ganz {city}", sub: "Pflege, Bepflanzung und Gestaltung für Gärten jeder Größe.", about: "{name} kümmert sich um Gärten in und um {city}. Zuverlässige Termine, saubere Arbeit und Gärten zum Wohlfühlen.", services: [["Gartenpflege", "Rasen, Schnitt und Unkraut."], ["Hecken & Bäume", "Schnitt und sichere Fällung."], ["Bepflanzung", "Beete und neuer Rasen."], ["Gartengestaltung", "Terrassen, Wege, Neugestaltung."]] },
      fr: { headline: "De beaux jardins partout à {city}", sub: "Entretien, plantation et aménagement pour tous les jardins.", about: "{name} entretient les jardins de {city} et des environs. Passages réguliers, travail soigné et jardins où il fait bon vivre.", services: [["Entretien", "Tonte, taille et désherbage."], ["Haies & arbres", "Taille et abattage sécurisé."], ["Plantations", "Massifs et nouvelles pelouses."], ["Aménagement", "Terrasses, allées et créations."]] },
      es: { headline: "Jardines bonitos en todo {city}", sub: "Mantenimiento, plantación y diseño para jardines de cualquier tamaño.", about: "{name} cuida jardines en {city} y alrededores. Visitas puntuales, trabajo limpio y jardines para disfrutar.", services: [["Mantenimiento", "Césped, poda y desbroce."], ["Setos y árboles", "Poda y tala segura."], ["Plantación", "Parterres y césped nuevo."], ["Diseño de jardines", "Terrazas, caminos y reformas."]] },
      it: { headline: "Giardini curati in tutta {city}", sub: "Manutenzione, piantumazione e progettazione per ogni giardino.", about: "{name} si prende cura dei giardini di {city} e dintorni. Interventi puntuali, lavoro ordinato e giardini da vivere.", services: [["Manutenzione", "Sfalcio, potatura e diserbo."], ["Siepi e alberi", "Potatura e abbattimento sicuro."], ["Piantumazione", "Aiuole e prati nuovi."], ["Progettazione", "Terrazze, vialetti e restyling."]] },
      pt: { headline: "Jardins bonitos em toda a {city}", sub: "Manutenção, plantação e design para jardins de todos os tamanhos.", about: "A {name} cuida de jardins em {city} e arredores. Visitas pontuais, trabalho limpo e jardins para aproveitar.", services: [["Manutenção", "Relva, podas e limpeza."], ["Sebes e árvores", "Poda e abate seguro."], ["Plantação", "Canteiros e relva nova."], ["Design de jardins", "Pátios, caminhos e remodelações."]] },
      nl: { headline: "Mooie tuinen in heel {city}", sub: "Onderhoud, beplanting en ontwerp voor tuinen van elk formaat.", about: "{name} verzorgt tuinen in en rond {city}. Betrouwbare bezoeken, netjes werk en tuinen om van te genieten.", services: [["Tuinonderhoud", "Maaien, snoeien en wieden."], ["Hagen & bomen", "Snoeien en veilig kappen."], ["Beplanting", "Borders en nieuw gazon."], ["Tuinontwerp", "Terrassen, paden en complete make-overs."]] },
    },
  },
];

export const NICHES: Niche[] = [...BASE_NICHES, ...EXTRA_NICHES];

export const nicheById = (id: string) => NICHES.find((n) => n.id === id) ?? NICHES[0];
