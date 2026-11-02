import type { Lang } from "./locales";

export type OutreachTemplate = {
  id: string;
  label: string; // nome no painel (pt-BR)
  channel: "whatsapp" | "email";
  hint: string;
  subject?: Record<Lang, string>;
  body: Record<Lang, string>;
};

// Marcadores: {name} negócio · {city} cidade · {link} link da demo · {sender} seu nome
export const OUTREACH: OutreachTemplate[] = [
  {
    id: "ask",
    label: "Oferecer a demo, sem link",
    channel: "whatsapp",
    hint: "Pergunta se pode mandar a demonstração, sem dizer que já está pronta. A mais leve.",
    body: {
      en: "Hi {name}! I'm {sender}, I design websites for local businesses. I noticed you don't have a website yet, so I put together a free preview of what yours could look like. Can I send it over? No cost and no commitment.",
      de: "Hallo {name}! Ich bin {sender} und erstelle Websites für lokale Betriebe. Mir ist aufgefallen, dass Sie noch keine Website haben – deshalb habe ich einen kostenlosen Entwurf für Sie vorbereitet. Darf ich ihn Ihnen schicken? Unverbindlich und kostenlos.",
      fr: "Bonjour {name} ! Je m'appelle {sender}, je crée des sites web pour les commerces locaux. J'ai vu que vous n'aviez pas encore de site, alors j'ai préparé une maquette gratuite du vôtre. Je peux vous l'envoyer ? Sans engagement.",
      es: "¡Hola, {name}! Soy {sender} y hago páginas web para negocios locales. Vi que todavía no tenéis web, así que he preparado una demo gratuita de cómo podría quedar la vuestra. ¿Os la envío? Sin coste ni compromiso.",
      it: "Ciao {name}! Sono {sender} e realizzo siti web per attività locali. Ho notato che non avete ancora un sito, così ho preparato una demo gratuita di come potrebbe essere il vostro. Posso inviarvela? Gratis e senza impegno.",
      pt: "Olá, {name}! Chamo-me {sender} e faço sites para negócios locais. Reparei que ainda não têm site, por isso preparei uma demonstração gratuita de como poderia ficar o vosso. Posso enviar? Sem custos nem compromisso.",
      nl: "Hallo {name}! Ik ben {sender} en maak websites voor lokale bedrijven. Ik zag dat jullie nog geen website hebben, dus ik heb een gratis voorbeeld gemaakt van hoe die eruit kan zien. Mag ik het sturen? Gratis en vrijblijvend.",
    },
  },
  {
    id: "demo",
    label: "WhatsApp com a demo",
    channel: "whatsapp",
    hint: "Curta e direta, com o link da demonstração. A melhor para o 1º contato.",
    body: {
      en: "Hi {name}! I'm {sender}. I created a website preview for your business in {city} — you can see it here: {link}\n\nIt already has your contact details, services and a call button. If you like it, I can put it live with your own domain this week. Happy to make any changes you want.",
      de: "Hallo {name}! Ich bin {sender}. Ich habe einen Website-Entwurf für Ihren Betrieb in {city} erstellt – hier können Sie ihn ansehen: {link}\n\nKontaktdaten, Leistungen und ein Anruf-Button sind schon drin. Wenn er Ihnen gefällt, stelle ich ihn diese Woche mit Ihrer eigenen Domain online. Änderungen sind natürlich jederzeit möglich.",
      fr: "Bonjour {name} ! C'est {sender}. J'ai créé une maquette de site pour votre commerce à {city}, la voici : {link}\n\nVos coordonnées, vos services et un bouton d'appel y sont déjà. Si elle vous plaît, je peux la mettre en ligne avec votre propre nom de domaine cette semaine. Je peux bien sûr la modifier selon vos envies.",
      es: "¡Hola, {name}! Soy {sender}. He creado una demo de web para vuestro negocio en {city}, podéis verla aquí: {link}\n\nYa incluye vuestros datos de contacto, servicios y un botón para llamar. Si os gusta, la publico esta semana con vuestro propio dominio. Puedo cambiar lo que queráis.",
      it: "Ciao {name}! Sono {sender}. Ho creato una demo del sito per la vostra attività a {city}, eccola: {link}\n\nCi sono già contatti, servizi e un pulsante per chiamare. Se vi piace, la metto online questa settimana con il vostro dominio. Posso modificare tutto ciò che volete.",
      pt: "Olá, {name}! Sou o {sender}. Criei uma demonstração de site para o vosso negócio em {city}, podem ver aqui: {link}\n\nJá tem os contactos, os serviços e um botão para ligar. Se gostarem, coloco-o online esta semana com o vosso próprio domínio. Posso alterar o que quiserem.",
      nl: "Hallo {name}! Ik ben {sender}. Ik heb een websitevoorbeeld gemaakt voor jullie zaak in {city}, hier te bekijken: {link}\n\nContactgegevens, diensten en een belknop staan er al in. Als het bevalt, zet ik het deze week online met jullie eigen domeinnaam. Aanpassingen zijn geen probleem.",
    },
  },
  {
    id: "demo_short",
    label: "Curta, com o link",
    channel: "whatsapp",
    hint: "Duas frases e o link. Boa para quem lê rápido no celular.",
    body: {
      en: "Hi {name}, {sender} here. I made a free website preview for your business: {link}\nTake a look when you have a minute and let me know what you think!",
      de: "Hallo {name}, hier ist {sender}. Ich habe einen kostenlosen Website-Entwurf für Ihren Betrieb erstellt: {link}\nSchauen Sie gern kurz rein und sagen Sie mir, was Sie davon halten!",
      fr: "Bonjour {name}, c'est {sender}. J'ai préparé une maquette de site gratuite pour votre commerce : {link}\nJetez-y un œil quand vous avez une minute et dites-moi ce que vous en pensez !",
      es: "Hola, {name}, soy {sender}. He preparado una demo gratuita de web para vuestro negocio: {link}\nEchadle un vistazo cuando tengáis un momento y decidme qué os parece.",
      it: "Ciao {name}, sono {sender}. Ho preparato una demo gratuita del sito per la vostra attività: {link}\nDateci un'occhiata quando avete un minuto e fatemi sapere cosa ne pensate!",
      pt: "Olá, {name}, é o {sender}. Preparei uma demonstração gratuita de site para o vosso negócio: {link}\nDeem uma vista de olhos quando tiverem um minuto e digam-me o que acham!",
      nl: "Hallo {name}, met {sender}. Ik heb een gratis websitevoorbeeld voor jullie zaak gemaakt: {link}\nKijk er gerust even naar en laat me weten wat jullie ervan vinden!",
    },
  },
  {
    id: "demo_google",
    label: "Argumento do Google, com o link",
    channel: "whatsapp",
    hint: "Explica por que um site traz clientes e termina com uma pergunta.",
    body: {
      en: "Hello {name}! When people in {city} search Google for a business like yours, they usually pick one with a website. I built a free preview of yours so you can see how it would look: {link}\nWould you like me to put it online for you? {sender}",
      de: "Hallo {name}! Wenn Menschen in {city} bei Google nach einem Betrieb wie Ihrem suchen, wählen sie meist einen mit Website. Ich habe Ihnen einen kostenlosen Entwurf gebaut, damit Sie sehen, wie Ihre aussehen könnte: {link}\nSoll ich sie für Sie online stellen? {sender}",
      fr: "Bonjour {name} ! Quand les gens à {city} cherchent un commerce comme le vôtre sur Google, ils choisissent en général celui qui a un site. J'ai créé une maquette gratuite du vôtre pour que vous voyiez le rendu : {link}\nVoulez-vous que je le mette en ligne pour vous ? {sender}",
      es: "¡Hola, {name}! Cuando la gente de {city} busca en Google un negocio como el vuestro, suele elegir uno que tenga web. Os he hecho una demo gratuita para que veáis cómo quedaría la vuestra: {link}\n¿Queréis que la ponga online? {sender}",
      it: "Ciao {name}! Quando le persone a {city} cercano su Google un'attività come la vostra, di solito scelgono quella con un sito. Ho creato una demo gratuita per farvi vedere come sarebbe il vostro: {link}\nVolete che lo metta online per voi? {sender}",
      pt: "Olá, {name}! Quando as pessoas em {city} procuram no Google um negócio como o vosso, costumam escolher um que tenha site. Fiz uma demonstração gratuita para verem como ficaria o vosso: {link}\nQuerem que o coloque online? {sender}",
      nl: "Hallo {name}! Als mensen in {city} op Google zoeken naar een zaak zoals die van jullie, kiezen ze meestal er een met een website. Ik heb een gratis voorbeeld gemaakt zodat jullie kunnen zien hoe die eruit zou zien: {link}\nZal ik hem voor jullie online zetten? {sender}",
    },
  },
  {
    id: "ready",
    label: "Demo pronta, sem link",
    channel: "whatsapp",
    hint: "Diz que o site já está feito e pede um “sim” para mandar o link. Menos risco de bloqueio.",
    body: {
      en: "Hi {name}, I'm {sender}. I've already designed a website for your business in {city}, with your contact details, services and opening hours. Can I send you the link to have a look? It's free.",
      de: "Hallo {name}, ich bin {sender}. Ich habe bereits eine Website für Ihren Betrieb in {city} gestaltet – mit Kontaktdaten, Leistungen und Öffnungszeiten. Darf ich Ihnen den Link schicken? Kostenlos.",
      fr: "Bonjour {name}, je suis {sender}. J'ai déjà conçu un site pour votre commerce à {city}, avec vos coordonnées, vos services et vos horaires. Je peux vous envoyer le lien pour le voir ? C'est gratuit.",
      es: "Hola, {name}, soy {sender}. Ya he diseñado una web para vuestro negocio en {city}, con vuestros datos de contacto, servicios y horario. ¿Os paso el enlace para verla? Es gratis.",
      it: "Ciao {name}, sono {sender}. Ho già realizzato un sito per la vostra attività a {city}, con contatti, servizi e orari. Posso mandarvi il link per vederlo? È gratis.",
      pt: "Olá, {name}, sou o {sender}. Já desenhei um site para o vosso negócio em {city}, com os contactos, os serviços e o horário. Posso enviar o link para verem? É gratuito.",
      nl: "Hallo {name}, ik ben {sender}. Ik heb al een website ontworpen voor jullie zaak in {city}, met contactgegevens, diensten en openingstijden. Mag ik de link sturen om te bekijken? Het is gratis.",
    },
  },
  {
    id: "email",
    label: "E-mail com a demo",
    channel: "email",
    hint: "Versão mais completa, para quando você tiver o e-mail do negócio.",
    subject: {
      en: "A website preview for {name}",
      de: "Ein Website-Entwurf für {name}",
      fr: "Une maquette de site pour {name}",
      es: "Una demo de web para {name}",
      it: "Una demo del sito per {name}",
      pt: "Uma demonstração de site para {name}",
      nl: "Een websitevoorbeeld voor {name}",
    },
    body: {
      en: "Hello,\n\nI came across {name} on Google Maps and noticed you don't have a website yet. Most people in {city} search online before choosing a local business, so I built a free preview of what your site could look like:\n\n{link}\n\nIt includes your services, opening hours, map and a one-tap call button. If you'd like it live on your own domain, I can set everything up for you — no technical work on your side.\n\nWould you be open to a quick chat this week?\n\nBest regards,\n{sender}\n\nIf you'd rather not hear from me again, just reply and I won't contact you.",
      de: "Guten Tag,\n\nich bin auf Google Maps auf {name} gestoßen und habe gesehen, dass Sie noch keine Website haben. Die meisten Menschen in {city} suchen online, bevor sie sich für einen Betrieb entscheiden – deshalb habe ich einen kostenlosen Entwurf für Ihre Website erstellt:\n\n{link}\n\nEr enthält Ihre Leistungen, Öffnungszeiten, eine Karte und einen Anruf-Button. Wenn Sie möchten, stelle ich ihn mit Ihrer eigenen Domain online – ohne technischen Aufwand für Sie.\n\nHätten Sie diese Woche Zeit für ein kurzes Gespräch?\n\nMit freundlichen Grüßen\n{sender}\n\nFalls Sie keine weiteren Nachrichten wünschen, antworten Sie einfach kurz – ich melde mich dann nicht mehr.",
      fr: "Bonjour,\n\nJ'ai découvert {name} sur Google Maps et j'ai remarqué que vous n'aviez pas encore de site. La plupart des habitants de {city} cherchent en ligne avant de choisir un commerce, alors j'ai réalisé une maquette gratuite de votre site :\n\n{link}\n\nElle présente vos services, vos horaires, un plan et un bouton d'appel. Si vous le souhaitez, je la mets en ligne avec votre propre nom de domaine, sans aucune démarche technique de votre part.\n\nSeriez-vous disponible pour en parler rapidement cette semaine ?\n\nBien cordialement,\n{sender}\n\nSi vous ne souhaitez plus recevoir de messages, répondez simplement et je ne vous recontacterai pas.",
      es: "Hola:\n\nEncontré {name} en Google Maps y vi que todavía no tenéis web. La mayoría de la gente en {city} busca en internet antes de elegir un negocio, así que he preparado una demo gratuita de cómo podría ser vuestra web:\n\n{link}\n\nIncluye vuestros servicios, horario, mapa y un botón para llamar. Si os interesa, la publico con vuestro propio dominio sin que tengáis que hacer nada técnico.\n\n¿Os viene bien hablar unos minutos esta semana?\n\nUn saludo,\n{sender}\n\nSi preferís no recibir más mensajes, respondedme y no volveré a escribir.",
      it: "Buongiorno,\n\nho trovato {name} su Google Maps e ho notato che non avete ancora un sito. La maggior parte delle persone a {city} cerca online prima di scegliere un'attività, così ho preparato una demo gratuita del vostro sito:\n\n{link}\n\nContiene servizi, orari, mappa e un pulsante per chiamare. Se volete, la metto online con il vostro dominio, senza alcun lavoro tecnico da parte vostra.\n\nAvreste qualche minuto questa settimana per parlarne?\n\nCordiali saluti,\n{sender}\n\nSe preferite non ricevere altri messaggi, rispondete pure e non vi contatterò più.",
      pt: "Olá,\n\nEncontrei a {name} no Google Maps e reparei que ainda não têm site. A maioria das pessoas em {city} pesquisa online antes de escolher um negócio, por isso preparei uma demonstração gratuita de como poderia ficar o vosso site:\n\n{link}\n\nInclui os vossos serviços, horário, mapa e um botão para ligar. Se quiserem, coloco-o online com o vosso próprio domínio, sem trabalho técnico da vossa parte.\n\nTêm disponibilidade para uma conversa rápida esta semana?\n\nCumprimentos,\n{sender}\n\nSe preferirem não receber mais mensagens, basta responder e não voltarei a contactar.",
      nl: "Goedendag,\n\nIk kwam {name} tegen op Google Maps en zag dat jullie nog geen website hebben. De meeste mensen in {city} zoeken online voordat ze een zaak kiezen, dus ik heb een gratis voorbeeld van jullie website gemaakt:\n\n{link}\n\nHet bevat jullie diensten, openingstijden, een kaart en een belknop. Als jullie willen, zet ik het online met jullie eigen domeinnaam – zonder technisch gedoe.\n\nHebben jullie deze week even tijd voor een kort gesprek?\n\nMet vriendelijke groet,\n{sender}\n\nLiever geen berichten meer? Reageer kort en ik neem geen contact meer op.",
    },
  },
  {
    id: "followup",
    label: "Follow-up (3–5 dias depois)",
    channel: "whatsapp",
    hint: "Lembrete gentil para quem não respondeu.",
    body: {
      en: "Hi {name}, just following up on the website preview I sent: {link}\nNo pressure at all — happy to answer any questions or adjust anything. Have a great week! {sender}",
      de: "Hallo {name}, ich wollte kurz an den Website-Entwurf erinnern: {link}\nGanz unverbindlich – bei Fragen oder Änderungswünschen bin ich gern für Sie da. Schöne Woche! {sender}",
      fr: "Bonjour {name}, je reviens vers vous au sujet de la maquette du site : {link}\nAucune obligation, je reste disponible pour toute question ou modification. Belle semaine ! {sender}",
      es: "Hola, {name}, os escribo sobre la demo de la web que os envié: {link}\nSin ningún compromiso; si tenéis dudas o queréis cambios, aquí estoy. ¡Buena semana! {sender}",
      it: "Ciao {name}, vi riscrivo per la demo del sito che vi ho inviato: {link}\nNessun impegno, sono a disposizione per domande o modifiche. Buona settimana! {sender}",
      pt: "Olá, {name}, volto a escrever sobre a demonstração do site que enviei: {link}\nSem compromisso nenhum, fico disponível para dúvidas ou alterações. Boa semana! {sender}",
      nl: "Hallo {name}, ik kom even terug op het websitevoorbeeld: {link}\nGeheel vrijblijvend, ik help graag met vragen of aanpassingen. Fijne week! {sender}",
    },
  },
];

export function fillTemplate(text: string, vars: Record<string, string>) {
  return text.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined && vars[k] !== "" ? vars[k] : m));
}
