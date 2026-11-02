import type { Lang } from "./locales";
import type { NicheGroup } from "./niches";

type Pairs = [string, string][];

/**
 * Diferenciais ("Por que escolher") por categoria de nicho.
 * Só promessas de atitude, nunca fatos que o negócio talvez não tenha
 * (anos de experiência, garantias, prêmios).
 */
export const BENEFITS: Record<Exclude<NicheGroup, "casa">, Record<Lang, Pairs>> = {
  beleza: {
    en: [["Attention to detail", "Time dedicated just to you."], ["Quality products", "Chosen to look after you."], ["A relaxed space", "Unwind while we take care of you."]],
    de: [["Liebe zum Detail", "Zeit, die nur Ihnen gehört."], ["Gute Produkte", "Ausgewählt, um Sie zu pflegen."], ["Entspannte Atmosphäre", "Abschalten, während wir uns um Sie kümmern."]],
    fr: [["Le souci du détail", "Du temps rien que pour vous."], ["Des produits de qualité", "Choisis pour prendre soin de vous."], ["Un lieu apaisant", "Détendez-vous, on s'occupe de tout."]],
    es: [["Cuidamos cada detalle", "Tiempo dedicado solo a ti."], ["Productos de calidad", "Elegidos para cuidarte."], ["Un espacio tranquilo", "Relájate mientras te cuidamos."]],
    it: [["Cura dei dettagli", "Tempo dedicato solo a te."], ["Prodotti di qualità", "Scelti per prenderci cura di te."], ["Un ambiente rilassante", "Rilassati, al resto pensiamo noi."]],
    pt: [["Atenção ao detalhe", "Tempo dedicado só a si."], ["Produtos de qualidade", "Escolhidos para cuidar de si."], ["Um espaço acolhedor", "Relaxe enquanto cuidamos de si."]],
    nl: [["Oog voor detail", "Tijd die helemaal voor jou is."], ["Goede producten", "Gekozen om goed voor je te zorgen."], ["Een rustige plek", "Ontspan terwijl wij voor je zorgen."]],
  },
  comida: {
    en: [["Fresh ingredients", "Good produce, chosen every day."], ["Made with care", "Recipes prepared the proper way."], ["Part of the neighbourhood", "A place you'll want to come back to."]],
    de: [["Frische Zutaten", "Gute Produkte, jeden Tag ausgewählt."], ["Mit Sorgfalt gemacht", "Rezepte, so wie sie sein sollen."], ["Aus der Nachbarschaft", "Ein Ort, an den man gern zurückkommt."]],
    fr: [["Des produits frais", "Sélectionnés chaque jour."], ["Fait avec soin", "Des recettes préparées dans les règles."], ["Une adresse de quartier", "Un endroit où l'on revient volontiers."]],
    es: [["Ingredientes frescos", "Buen producto, elegido cada día."], ["Hecho con cariño", "Recetas preparadas como debe ser."], ["De barrio", "Un sitio al que apetece volver."]],
    it: [["Ingredienti freschi", "Buoni prodotti, scelti ogni giorno."], ["Fatto con cura", "Ricette preparate come si deve."], ["Di quartiere", "Un posto dove tornare volentieri."]],
    pt: [["Ingredientes frescos", "Bons produtos, escolhidos todos os dias."], ["Feito com cuidado", "Receitas preparadas como deve ser."], ["Do bairro", "Um lugar para onde apetece voltar."]],
    nl: [["Verse ingrediënten", "Goede producten, elke dag gekozen."], ["Met zorg gemaakt", "Recepten zoals het hoort."], ["Uit de buurt", "Een plek waar je graag terugkomt."]],
  },
  saude: {
    en: [["Personal attention", "Time to listen to each person."], ["Easy to book", "Call or send a message."], ["Close to you", "A local practice you can rely on."]],
    de: [["Persönliche Betreuung", "Zeit, jedem zuzuhören."], ["Einfache Terminvergabe", "Anrufen oder Nachricht schreiben."], ["In Ihrer Nähe", "Eine Praxis vor Ort, auf die Sie zählen können."]],
    fr: [["Une écoute personnalisée", "Du temps pour chaque personne."], ["Rendez-vous facile", "Par téléphone ou message."], ["Près de chez vous", "Un cabinet de proximité de confiance."]],
    es: [["Atención personal", "Tiempo para escuchar a cada persona."], ["Cita fácil", "Llama o envía un mensaje."], ["Cerca de ti", "Un centro de confianza en tu zona."]],
    it: [["Attenzione personale", "Tempo per ascoltare ogni persona."], ["Prenotazione semplice", "Chiama o scrivi un messaggio."], ["Vicino a te", "Un centro di fiducia nella tua zona."]],
    pt: [["Atenção personalizada", "Tempo para ouvir cada pessoa."], ["Marcação simples", "Ligue ou envie mensagem."], ["Perto de si", "Um espaço de confiança na sua zona."]],
    nl: [["Persoonlijke aandacht", "Tijd om naar iedereen te luisteren."], ["Makkelijk afspreken", "Bel of stuur een bericht."], ["Dichtbij", "Een vertrouwde praktijk in de buurt."]],
  },
  outros: {
    en: [["Clear communication", "We explain everything in plain words."], ["Careful work", "Attention to every detail."], ["Local and trusted", "A business from your area."]],
    de: [["Klare Kommunikation", "Wir erklären alles verständlich."], ["Sorgfältige Arbeit", "Mit Blick fürs Detail."], ["Aus der Region", "Ein Betrieb aus Ihrer Nähe."]],
    fr: [["Une communication claire", "On vous explique tout simplement."], ["Un travail soigné", "Attentif à chaque détail."], ["Local et de confiance", "Une entreprise de votre région."]],
    es: [["Trato claro", "Te lo explicamos todo con sencillez."], ["Trabajo cuidado", "Atentos a cada detalle."], ["Cercanos y de confianza", "Un negocio de tu zona."]],
    it: [["Comunicazione chiara", "Ti spieghiamo tutto con semplicità."], ["Lavoro accurato", "Attenti a ogni dettaglio."], ["Locali e affidabili", "Un'attività della tua zona."]],
    pt: [["Comunicação clara", "Explicamos tudo de forma simples."], ["Trabalho cuidado", "Atentos a cada detalhe."], ["Local e de confiança", "Um negócio da sua zona."]],
    nl: [["Duidelijke communicatie", "We leggen alles helder uit."], ["Zorgvuldig werk", "Met oog voor elk detail."], ["Lokaal en betrouwbaar", "Een bedrijf uit uw regio."]],
  },
};
