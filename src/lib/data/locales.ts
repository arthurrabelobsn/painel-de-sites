export type Lang = "en" | "de" | "fr" | "es" | "it" | "pt" | "nl";

export const LANG_NAMES: Record<Lang, string> = {
  en: "Inglês",
  de: "Alemão",
  fr: "Francês",
  es: "Espanhol",
  it: "Italiano",
  pt: "Português (PT)",
  nl: "Holandês",
};

export type Country = { code: string; name: string; lang: Lang; flag: string; cities: string[] };

export const COUNTRIES: Country[] = [
  { code: "PT", name: "Portugal", lang: "pt", flag: "🇵🇹", cities: ["Lisboa", "Porto", "Braga", "Coimbra", "Faro", "Aveiro", "Setúbal", "Funchal"] },
  { code: "ES", name: "Espanha", lang: "es", flag: "🇪🇸", cities: ["Madrid", "Barcelona", "Valencia", "Sevilla", "Málaga", "Bilbao", "Zaragoza", "Alicante"] },
  { code: "FR", name: "França", lang: "fr", flag: "🇫🇷", cities: ["Paris", "Lyon", "Marseille", "Toulouse", "Nice", "Nantes", "Bordeaux", "Lille"] },
  { code: "IT", name: "Itália", lang: "it", flag: "🇮🇹", cities: ["Roma", "Milano", "Napoli", "Torino", "Bologna", "Firenze", "Bari", "Verona"] },
  { code: "DE", name: "Alemanha", lang: "de", flag: "🇩🇪", cities: ["Berlin", "München", "Hamburg", "Köln", "Frankfurt", "Stuttgart", "Düsseldorf", "Leipzig"] },
  { code: "AT", name: "Áustria", lang: "de", flag: "🇦🇹", cities: ["Wien", "Graz", "Linz", "Salzburg", "Innsbruck"] },
  { code: "CH", name: "Suíça (alemão)", lang: "de", flag: "🇨🇭", cities: ["Zürich", "Basel", "Bern", "Luzern", "St. Gallen"] },
  { code: "NL", name: "Países Baixos", lang: "nl", flag: "🇳🇱", cities: ["Amsterdam", "Rotterdam", "Den Haag", "Utrecht", "Eindhoven", "Groningen"] },
  { code: "BE", name: "Bélgica (francês)", lang: "fr", flag: "🇧🇪", cities: ["Bruxelles", "Liège", "Namur", "Charleroi"] },
  { code: "IE", name: "Irlanda", lang: "en", flag: "🇮🇪", cities: ["Dublin", "Cork", "Galway", "Limerick", "Waterford"] },
  { code: "GB", name: "Reino Unido", lang: "en", flag: "🇬🇧", cities: ["London", "Manchester", "Birmingham", "Leeds", "Glasgow", "Liverpool", "Bristol", "Edinburgh"] },
];

export const countryByCode = (code: string) => COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];

/** Textos fixos da interface dos sites gerados, em cada idioma */
export type SiteUI = {
  services: string;
  about: string;
  contact: string;
  callNow: string;
  whatsapp: string;
  quote: string;
  why: string;
  benefits: [string, string][];
  hours: string;
  address: string;
  phone: string;
  email: string;
  findUs: string;
  rights: string;
  rating: string;
  demo: string;
};

export const SITE_UI: Record<Lang, SiteUI> = {
  en: {
    services: "Services", about: "About us", contact: "Contact", callNow: "Call now", whatsapp: "Message us on WhatsApp",
    quote: "Get a free quote", why: "Why choose us",
    benefits: [["Fast response", "We reply quickly and show up on time."], ["Fair prices", "Clear quotes with no surprises."], ["Local experts", "Trusted by neighbours across the area."]],
    hours: "Opening hours", address: "Address", phone: "Phone", email: "Email", findUs: "Find us", rights: "All rights reserved.",
    rating: "reviews on Google", demo: "Website demo",
  },
  de: {
    services: "Leistungen", about: "Über uns", contact: "Kontakt", callNow: "Jetzt anrufen", whatsapp: "Per WhatsApp schreiben",
    quote: "Kostenloses Angebot", why: "Warum wir",
    benefits: [["Schnelle Reaktion", "Wir antworten schnell und kommen pünktlich."], ["Faire Preise", "Klare Angebote ohne Überraschungen."], ["Aus der Region", "Von Nachbarn in der ganzen Gegend empfohlen."]],
    hours: "Öffnungszeiten", address: "Adresse", phone: "Telefon", email: "E-Mail", findUs: "So finden Sie uns", rights: "Alle Rechte vorbehalten.",
    rating: "Bewertungen auf Google", demo: "Website-Entwurf",
  },
  fr: {
    services: "Services", about: "À propos", contact: "Contact", callNow: "Appeler", whatsapp: "Écrire sur WhatsApp",
    quote: "Devis gratuit", why: "Pourquoi nous choisir",
    benefits: [["Réponse rapide", "Nous répondons vite et arrivons à l'heure."], ["Prix justes", "Des devis clairs, sans surprise."], ["Experts locaux", "Recommandés par les voisins du quartier."]],
    hours: "Horaires", address: "Adresse", phone: "Téléphone", email: "E-mail", findUs: "Nous trouver", rights: "Tous droits réservés.",
    rating: "avis sur Google", demo: "Maquette du site",
  },
  es: {
    services: "Servicios", about: "Sobre nosotros", contact: "Contacto", callNow: "Llamar ahora", whatsapp: "Escríbenos por WhatsApp",
    quote: "Presupuesto gratis", why: "Por qué elegirnos",
    benefits: [["Respuesta rápida", "Respondemos enseguida y llegamos puntuales."], ["Precios justos", "Presupuestos claros, sin sorpresas."], ["Expertos locales", "Recomendados por vecinos de toda la zona."]],
    hours: "Horario", address: "Dirección", phone: "Teléfono", email: "Email", findUs: "Dónde estamos", rights: "Todos los derechos reservados.",
    rating: "reseñas en Google", demo: "Demo de la web",
  },
  it: {
    services: "Servizi", about: "Chi siamo", contact: "Contatti", callNow: "Chiama ora", whatsapp: "Scrivici su WhatsApp",
    quote: "Preventivo gratuito", why: "Perché sceglierci",
    benefits: [["Risposta rapida", "Rispondiamo subito e arriviamo puntuali."], ["Prezzi onesti", "Preventivi chiari, senza sorprese."], ["Esperti locali", "Consigliati dai vicini di tutta la zona."]],
    hours: "Orari", address: "Indirizzo", phone: "Telefono", email: "Email", findUs: "Dove siamo", rights: "Tutti i diritti riservati.",
    rating: "recensioni su Google", demo: "Demo del sito",
  },
  pt: {
    services: "Serviços", about: "Sobre nós", contact: "Contacto", callNow: "Ligar agora", whatsapp: "Fale connosco no WhatsApp",
    quote: "Orçamento grátis", why: "Porquê escolher-nos",
    benefits: [["Resposta rápida", "Respondemos depressa e chegamos a horas."], ["Preços justos", "Orçamentos claros, sem surpresas."], ["Especialistas locais", "Recomendados pelos vizinhos de toda a zona."]],
    hours: "Horário", address: "Morada", phone: "Telefone", email: "Email", findUs: "Onde estamos", rights: "Todos os direitos reservados.",
    rating: "avaliações no Google", demo: "Demonstração do site",
  },
  nl: {
    services: "Diensten", about: "Over ons", contact: "Contact", callNow: "Bel nu", whatsapp: "Stuur ons een WhatsApp",
    quote: "Gratis offerte", why: "Waarom wij",
    benefits: [["Snelle reactie", "We reageren snel en zijn op tijd."], ["Eerlijke prijzen", "Duidelijke offertes, geen verrassingen."], ["Lokale vakmensen", "Aanbevolen door buren in de hele regio."]],
    hours: "Openingstijden", address: "Adres", phone: "Telefoon", email: "E-mail", findUs: "Hier vindt u ons", rights: "Alle rechten voorbehouden.",
    rating: "reviews op Google", demo: "Website-demo",
  },
};
