/**
 * Modelos de site. Cada um é uma combinação decidida de tipografia, forma, cores e composição de seções,
 * com base nas direções de arte da tasteskill (estudo de 247 sites de galeria) e nas regras de acabamento do Emil Kowalski.
 */
import type { FieldKind } from "./theme";
import type { Deco } from "./deco";

/* ---------------- Tipografia (só Google Fonts, para o PDF conseguir carregar) ---------------- */
export type FontSystem = {
  q: string; // parâmetros do css2
  display: string;
  text: string;
  weight: number;
  track: number; // em em
  lead: number;
  upper?: boolean;
  cw: number; // largura média do caractere em em (para caber em 2 linhas)
  textWeight?: number;
};

export const FONTS = {
  albert: { q: "family=Albert+Sans:wght@400;500;600", display: "'Albert Sans'", text: "'Albert Sans'", weight: 600, track: -0.035, lead: 1, cw: 0.52 },
  schibsted: { q: "family=Schibsted+Grotesk:wght@400;600;800", display: "'Schibsted Grotesk'", text: "'Schibsted Grotesk'", weight: 800, track: -0.05, lead: 0.9, cw: 0.54 },
  hanken: { q: "family=Hanken+Grotesk:wght@400;500;600", display: "'Hanken Grotesk'", text: "'Hanken Grotesk'", weight: 500, track: -0.05, lead: 0.92, cw: 0.5 },
  bricolage: { q: "family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600", display: "'Bricolage Grotesque'", text: "'Bricolage Grotesque'", weight: 600, track: -0.04, lead: 0.92, cw: 0.52 },
  franklin: { q: "family=Libre+Franklin:wght@600;700&family=Source+Serif+4:opsz,wght@8..60,400;8..60,600", display: "'Libre Franklin'", text: "'Source Serif 4'", weight: 700, track: -0.035, lead: 0.92, cw: 0.56 },
  anton: { q: "family=Anton&family=Work+Sans:wght@400;500;600", display: "'Anton'", text: "'Work Sans'", weight: 400, track: -0.01, lead: 0.88, upper: true, cw: 0.44 },
  shoulders: { q: "family=Big+Shoulders+Display:wght@800&family=Public+Sans:wght@400;500;600", display: "'Big Shoulders Display'", text: "'Public Sans'", weight: 800, track: -0.005, lead: 0.88, upper: true, cw: 0.42 },
  barlow: { q: "family=Barlow+Condensed:wght@600;700&family=Barlow:wght@400;500;600", display: "'Barlow Condensed'", text: "'Barlow'", weight: 700, track: -0.02, lead: 0.9, upper: true, cw: 0.44 },
  bebas: { q: "family=Bebas+Neue&family=EB+Garamond:wght@400;500;600", display: "'Bebas Neue'", text: "'EB Garamond'", weight: 400, track: -0.02, lead: 0.86, upper: true, cw: 0.4, textWeight: 400 },
  unbounded: { q: "family=Unbounded:wght@700;800&family=Onest:wght@400;500;600", display: "'Unbounded'", text: "'Onest'", weight: 800, track: -0.03, lead: 1, upper: true, cw: 0.72 },
  chivo: { q: "family=Chivo:wght@400;600;900", display: "'Chivo'", text: "'Chivo'", weight: 900, track: -0.05, lead: 0.88, upper: true, cw: 0.62 },
  epilogue: { q: "family=Epilogue:wght@400;500;900", display: "'Epilogue'", text: "'Epilogue'", weight: 900, track: -0.04, lead: 0.9, cw: 0.58 },
  jost: { q: "family=Jost:wght@400;500;700", display: "'Jost'", text: "'Jost'", weight: 700, track: -0.03, lead: 0.9, upper: true, cw: 0.6 },
  jostSentence: { q: "family=Jost:wght@400;500;600", display: "'Jost'", text: "'Jost'", weight: 600, track: -0.035, lead: 0.92, cw: 0.5 },
  spartan: { q: "family=League+Spartan:wght@700&family=Figtree:wght@400;500;600", display: "'League Spartan'", text: "'Figtree'", weight: 700, track: -0.04, lead: 0.88, cw: 0.52 },
  bodoni: { q: "family=Bodoni+Moda:opsz,wght@6..96,500&family=Jost:wght@400;500", display: "'Bodoni Moda'", text: "'Jost'", weight: 500, track: -0.02, lead: 0.95, cw: 0.52 },
  newsreader: { q: "family=Newsreader:opsz,wght@6..72,300;6..72,400;6..72,500", display: "'Newsreader'", text: "'Newsreader'", weight: 300, track: -0.045, lead: 0.92, cw: 0.46, textWeight: 400 },
  literata: { q: "family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600", display: "'Literata'", text: "'Literata'", weight: 500, track: -0.02, lead: 1.02, cw: 0.52 },
  zilla: { q: "family=Zilla+Slab:wght@400;500;600", display: "'Zilla Slab'", text: "'Zilla Slab'", weight: 600, track: -0.025, lead: 1, cw: 0.48 },
  besley: { q: "family=Besley:wght@800&family=Libre+Franklin:wght@400;500;600", display: "'Besley'", text: "'Libre Franklin'", weight: 800, track: -0.02, lead: 0.95, cw: 0.56 },
  redhat: { q: "family=Red+Hat+Display:wght@900&family=Red+Hat+Text:wght@400;500;600", display: "'Red Hat Display'", text: "'Red Hat Text'", weight: 900, track: -0.03, lead: 0.92, cw: 0.56 },
  worksans: { q: "family=Work+Sans:wght@300;400;500", display: "'Work Sans'", text: "'Work Sans'", weight: 300, track: -0.035, lead: 1, cw: 0.5 },
  imbue: { q: "family=Imbue:opsz,wght@10..100,400&family=Albert+Sans:wght@400;500;600", display: "'Imbue'", text: "'Albert Sans'", weight: 400, track: -0.01, lead: 0.9, upper: true, cw: 0.36 },
} satisfies Record<string, FontSystem>;

export type FontKey = keyof typeof FONTS;

/* ---------------- Forma (um motivo por modelo: máscara das imagens, marcador de listas) ---------------- */
export type Motif = { radius?: string; clip?: string; mask?: string; bullet?: string };

const keyhole = `url("data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 140" preserveAspectRatio="none"><circle cx="50" cy="46" r="46"/><path d="M26 70 L74 70 L92 140 L8 140 Z"/></svg>',
)}")`;

export const MOTIFS = {
  square: { radius: "0" },
  soft: { radius: "28px" },
  arch: { radius: "999px 999px 0 0" },
  circle: { radius: "50%" },
  oval: { radius: "50% / 42%" },
  leaf: { radius: "6% 70% 6% 70%" },
  drop: { radius: "50% 0 50% 50%" },
  capsule: { radius: "999px" },
  blob: { radius: "62% 38% 46% 54% / 58% 44% 56% 42%" },
  cup: { radius: "0 0 48% 48% / 0 0 38% 38%" },
  gable: { clip: "polygon(50% 0,100% 30%,100% 100%,0 100%,0 30%)" },
  hex: { clip: "polygon(25% 0,75% 0,100% 50%,75% 100%,25% 100%,0 50%)" },
  chamfer: { clip: "polygon(14% 0,100% 0,100% 86%,86% 100%,0 100%,0 14%)" },
  cross: { clip: "polygon(30% 0,70% 0,70% 30%,100% 30%,100% 70%,70% 70%,70% 100%,30% 100%,30% 70%,0 70%,0 30%,30% 30%)" },
  keyhole: { mask: keyhole, radius: "0" },
  petal: { radius: "50% 50% 0 50%" },
} satisfies Record<string, Motif>;

export type MotifKey = keyof typeof MOTIFS;

/* ---------------- Composição ---------------- */
export type HeroKind =
  | "statement" // título grande à esquerda, imagem na forma do modelo à direita
  | "monument" // o nome do negócio como letreiro, de ponta a ponta
  | "split" // metade em cor chapada, metade imagem
  | "phone" // o telefone vira o elemento principal
  | "poster" // cartaz: cor chapada e tipografia pesada
  | "quiet" // discreto: título contido e uma imagem larga
  | "immersive" // a foto ocupa o topo inteiro e um degradê na cor do negócio a funde com o texto
  | "fade" // texto à esquerda, foto até a borda direita entrando com degradê lateral
  | "centered"; // texto centralizado e foto larga que surge do fundo com degradê

export type ServicesKind = "rows" | "menu" | "board" | "checklist" | "tiles" | "swatches";
export type WhyKind = "band" | "stack" | "columns";
export type AboutKind = "facts" | "media";
export type Signature = "callband" | "timetable";

export type Preset = {
  id: string;
  name: string;
  description: string;
  niche?: string; // modelos feitos para um nicho
  font: FontKey;
  mode: "light" | "paper" | "dark";
  motif: MotifKey;
  btn: "square" | "pill";
  hero: HeroKind;
  services: ServicesKind;
  why: WhyKind;
  about: AboutKind;
  sig?: Signature;
  /** no topo, o título é o nome do negócio (e a frase vira apoio) */
  nameTitle?: boolean;
  /** telefone em tamanho grande dentro do topo */
  phoneInHero?: boolean;
  /** fotos sem recorte de forma (cantos retos ou arredondados) */
  soft?: boolean;
  /** degradês, divisórias, texturas e outros elementos de personalidade */
  deco?: Deco;
  /** cor de cada faixa (o resto usa o fundo) */
  fields?: Partial<Record<"hero" | "services" | "why" | "about" | "contact" | "sig" | "footer", FieldKind>>;
};

/* Modelos gerais: funcionam para qualquer nicho */
export const GENERAL_PRESETS: Preset[] = [
  {
    id: "classic", name: "Clássico", description: "Título grande, lista de serviços em linhas e contato em faixa escura. Seguro para qualquer nicho.",
    font: "albert", mode: "light", motif: "square", btn: "pill", hero: "statement", services: "rows", why: "band", about: "facts",
    fields: { why: "accent", contact: "dark" },
 },
  {
    id: "bold", name: "Impacto", description: "Sala escura: fundo escuro do início ao fim e tipografia pesada.",
    font: "schibsted", mode: "dark", motif: "square", btn: "square", hero: "statement", services: "rows", why: "stack", about: "facts",
    fields: { why: "tone", contact: "tone" },
 },
  {
    id: "soft", name: "Acolhedor", description: "Serifa leve, fundo papel e imagem em arco. Para salões, restaurantes e cuidados.",
    font: "newsreader", mode: "paper", motif: "arch", btn: "pill", hero: "statement", services: "menu", why: "columns", about: "media",
    fields: { why: "ground", contact: "dark", services: "ground" },
 },
  {
    id: "storefront", name: "Vitrine", description: "O nome vira letreiro de loja, com horário em destaque. Para comércio de bairro.",
    font: "bricolage", mode: "paper", motif: "arch", btn: "square", hero: "monument", services: "menu", why: "columns", about: "facts", sig: "timetable",
    fields: { sig: "accent", contact: "dark" },
 },
  {
    id: "service", name: "Atendimento", description: "O telefone é o protagonista e os serviços viram checklist. Para chamados e reparos.",
    font: "hanken", mode: "light", motif: "soft", btn: "pill", hero: "phone", services: "checklist", why: "stack", about: "facts", sig: "callband",
    fields: { sig: "accent", why: "tone", contact: "dark" },
 },
  {
    id: "editorial", name: "Revista", description: "Diagramado como uma matéria impressa: nome no cabeçalho, serifa no texto.",
    font: "franklin", mode: "paper", motif: "square", btn: "square", hero: "monument", services: "rows", why: "stack", about: "media",
    fields: { why: "ground", contact: "dark", footer: "ground" },
 },
  {
    id: "poster", name: "Cartaz", description: "Cor chapada e letras condensadas enormes, direto como um cartaz de rua.",
    font: "anton", mode: "light", motif: "square", btn: "square", hero: "poster", services: "board", why: "band", about: "facts",
    fields: { hero: "accent", services: "dark", why: "light", contact: "accent" },
 },
  {
    id: "chapters", name: "Capítulos", description: "Cada seção é um capítulo com a sua própria cor, como cartazes lado a lado.",
    font: "epilogue", mode: "light", motif: "square", btn: "pill", hero: "split", services: "tiles", why: "columns", about: "facts",
    fields: { hero: "light", services: "ground", why: "accent", about: "dark", contact: "light", footer: "accent" },
 },
  {
    id: "quiet", name: "Discreto", description: "Contido e elegante: título pequeno, muito respiro e uma imagem larga.",
    font: "worksans", mode: "light", motif: "square", btn: "square", hero: "quiet", services: "rows", why: "columns", about: "facts",
    fields: { why: "tone", contact: "tone" },
 },
  {
    id: "split", name: "Palco dividido", description: "Metade da tela em cor chapada, metade imagem. Moderno e direto.",
    font: "hanken", mode: "light", motif: "square", btn: "square", hero: "split", services: "checklist", why: "band", about: "media",
    fields: { hero: "dark", why: "accent", contact: "dark" },
 },
];

/* Modelos por nicho: cada um com uma ideia tirada do próprio ofício */
export const NICHE_PRESETS: Preset[] = [
  {
    id: "n-plumber", niche: "plumber", name: "Linha direta", description: "Gota como forma, topo em azul profundo, telefone gigante e faixa de chamada urgente.",
    font: "barlow", mode: "light", motif: "drop", btn: "square", hero: "immersive", services: "checklist", why: "stack", about: "facts", sig: "callband",
    soft: true, phoneInHero: true, 
    deco: { heroBg: "deep", divider: "wave" },
    fields: { hero: "dark", sig: "accent", why: "tone", contact: "dark" },
 },
  {
    id: "n-electrician", niche: "electrician", name: "Alta tensão", description: "Fundo escuro, cor de alerta e serviços em blocos de energia.",
    font: "chivo", mode: "dark", motif: "chamfer", btn: "square", hero: "immersive", services: "tiles", why: "band", about: "facts", sig: "callband",
    soft: true, phoneInHero: true, 
    deco: { heroBg: "glow", divider: "slant", h1Grad: true },
    fields: { sig: "accent", why: "tone", contact: "tone" },
 },
  {
    id: "n-locksmith", niche: "locksmith", name: "Fechadura", description: "A imagem vira buraco de fechadura; telefone 24h em destaque.",
    font: "shoulders", mode: "dark", motif: "keyhole", btn: "square", hero: "immersive", services: "checklist", why: "stack", about: "facts", sig: "callband",
    soft: true, phoneInHero: true, 
    deco: { heroBg: "spot", divider: "slant" },
    fields: { sig: "accent", contact: "tone" },
 },
  {
    id: "n-hvac", niche: "hvac", name: "Clima", description: "Círculos como termostato, metade da tela em cor fria.",
    font: "redhat", mode: "light", motif: "circle", btn: "pill", hero: "fade", services: "checklist", why: "band", about: "media", sig: "callband",
    soft: true, 
    deco: { heroBg: "deep", divider: "wave" },
    fields: { hero: "accent", sig: "dark", why: "light", contact: "dark" },
 },
  {
    id: "n-roofer", niche: "roofer", name: "Telhado", description: "A forma do telhado recorta as imagens; serifa forte de placa de obra.",
    font: "besley", mode: "paper", motif: "gable", btn: "square", hero: "immersive", services: "rows", why: "band", about: "media",
    soft: true, 
    deco: { heroBg: "tint", divider: "slant" },
    fields: { why: "dark", contact: "accent" },
 },
  {
    id: "n-painter", niche: "painter", name: "Cartela de cores", description: "Os serviços viram amostras de tinta, cada um num tom da cor do negócio, sobre um topo em degradê.",
    font: "spartan", mode: "light", motif: "square", btn: "square", hero: "fade", services: "swatches", why: "columns", about: "facts",
    soft: true, 
    deco: { heroBg: "mesh", divider: "wave" },
    fields: { why: "light", contact: "dark" },
 },
  {
    id: "n-carpenter", niche: "carpenter", name: "Oficina", description: "Cantos chanfrados como peça cortada, fundo papel e serifa de oficina.",
    font: "zilla", mode: "paper", motif: "chamfer", btn: "square", hero: "fade", services: "rows", why: "stack", about: "media",
    soft: true, nameTitle: true, 
    deco: { heroBg: "warm", divider: "slant" },
    fields: { why: "ground", contact: "dark" },
 },
  {
    id: "n-gardener", niche: "gardener", name: "Folha", description: "Folha como forma de todas as imagens, verde chapado e serifa calma.",
    font: "literata", mode: "paper", motif: "leaf", btn: "pill", hero: "immersive", services: "rows", why: "columns", about: "media",
    soft: true, 
    deco: { heroBg: "deep", divider: "hills" },
    fields: { hero: "accent", why: "light", contact: "dark" },
 },
  {
    id: "n-cleaning", niche: "cleaning", name: "Brilho", description: "Claro e arejado, bolhas como forma e checklist do que é limpo.",
    font: "albert", mode: "light", motif: "circle", btn: "pill", hero: "centered", services: "checklist", why: "band", about: "facts",
    soft: true, 
    deco: { heroBg: "mesh", divider: "wave" },
    fields: { why: "accent", contact: "light" },
 },
  {
    id: "n-movers", niche: "movers", name: "Caixa", description: "Cartaz de mudança: letras condensadas, cor chapada, serviços em quadro.",
    font: "anton", mode: "light", motif: "square", btn: "square", hero: "immersive", services: "board", why: "stack", about: "facts", sig: "callband",
    soft: true, 
    deco: { heroBg: "deep", divider: "slant" },
    fields: { hero: "accent", services: "dark", sig: "light", contact: "accent" },
 },
  {
    id: "n-auto-repair", niche: "auto-repair", name: "Box", description: "Porca sextavada como forma, fundo escuro de oficina e quadro de serviços.",
    font: "redhat", mode: "dark", motif: "hex", btn: "square", hero: "immersive", services: "board", why: "band", about: "facts",
    soft: true, 
    deco: { heroBg: "glow", divider: "slant" },
    fields: { hero: "dark", services: "tone", why: "accent", contact: "tone" },
 },
  {
    id: "n-barber", niche: "barber", name: "Cadeira", description: "Letreiro condensado, espelho em cápsula e tabela de serviços como na parede.",
    font: "bebas", mode: "dark", motif: "capsule", btn: "square", hero: "centered", services: "board", why: "stack", about: "media", sig: "timetable",
    soft: true, nameTitle: true, 
    deco: { heroBg: "spot", divider: "slant" },
    fields: { services: "tone", sig: "accent", contact: "tone" },
 },
  {
    id: "n-hair-salon", niche: "hair-salon", name: "Espelho", description: "Serifa de revista de moda, espelho oval e cardápio de serviços.",
    font: "bodoni", mode: "paper", motif: "oval", btn: "pill", hero: "fade", services: "menu", why: "columns", about: "media", sig: "timetable",
    soft: true, 
    deco: { heroBg: "mesh", divider: "wave" },
    fields: { hero: "light", sig: "dark", contact: "accent" },
 },
  {
    id: "n-beauty", niche: "beauty", name: "Ritual", description: "Serifa leve e grande, muito respiro e tratamentos em cardápio.",
    font: "newsreader", mode: "paper", motif: "oval", btn: "pill", hero: "centered", services: "menu", why: "columns", about: "media",
    soft: true, 
    deco: { heroBg: "mesh", divider: "wave" },
    fields: { services: "light", why: "ground", contact: "dark" },
 },
  {
    id: "n-pet-grooming", niche: "pet-grooming", name: "Patinha", description: "Formas arredondadas, cores alegres e serviços em blocos coloridos.",
    font: "spartan", mode: "light", motif: "blob", btn: "pill", hero: "fade", services: "tiles", why: "band", about: "facts",
    soft: true, 
    deco: { heroBg: "mesh", divider: "wave" },
    fields: { why: "light", contact: "accent" },
 },
  {
    id: "n-physio", niche: "physio", name: "Movimento", description: "Cápsulas como forma, tipografia limpa e passo a passo do cuidado.",
    font: "hanken", mode: "light", motif: "capsule", btn: "pill", hero: "fade", services: "rows", why: "stack", about: "media",
    soft: true, 
    deco: { heroBg: "tint", divider: "wave" },
    fields: { why: "light", contact: "dark" },
 },
  {
    id: "n-clinic", niche: "clinic", name: "Consultório", description: "A cruz como forma, metade em cor clara e marcação de consulta em destaque.",
    font: "albert", mode: "light", motif: "cross", btn: "pill", hero: "centered", services: "checklist", why: "columns", about: "facts", sig: "callband",
    soft: true, 
    deco: { heroBg: "tint", divider: "wave" },
    fields: { hero: "light", sig: "accent", why: "tone", contact: "dark" },
 },
  {
    id: "n-restaurant", niche: "restaurant", name: "Mesa posta", description: "Diagramado como um cardápio impresso, prato redondo e horário da casa.",
    font: "franklin", mode: "paper", motif: "circle", btn: "square", hero: "centered", services: "menu", why: "columns", about: "media", sig: "timetable",
    soft: true, nameTitle: true, 
    deco: { heroBg: "warm", divider: "wave" },
    fields: { services: "ground", sig: "dark", contact: "accent" },
 },
  {
    id: "n-bakery", niche: "bakery", name: "Forno", description: "A boca do forno em arco, o nome como letreiro e o horário das fornadas.",
    font: "bricolage", mode: "paper", motif: "arch", btn: "pill", hero: "centered", services: "menu", why: "columns", about: "media", sig: "timetable",
    soft: true, nameTitle: true, 
    deco: { heroBg: "warm", divider: "wave" },
    fields: { sig: "accent", contact: "dark" },
 },
  {
    id: "n-cafe", niche: "cafe", name: "Balcão", description: "Xícara como forma, letras geométricas e a lousa do balcão.",
    font: "jostSentence", mode: "light", motif: "cup", btn: "square", hero: "immersive", services: "menu", why: "band", about: "media", sig: "timetable",
    soft: true, 
    deco: { heroBg: "deep", divider: "wave" },
    fields: { hero: "dark", why: "light", sig: "accent", contact: "dark" },
 },
  {
    id: "n-florist", niche: "florist", name: "Pétala", description: "Pétala como forma, serifa alta e cores de estação.",
    font: "imbue", mode: "paper", motif: "petal", btn: "pill", hero: "centered", services: "tiles", why: "columns", about: "media",
    soft: true, nameTitle: true, 
    deco: { heroBg: "mesh", divider: "wave" },
    fields: { why: "light", contact: "accent" },
 },
];

export const PRESETS: Preset[] = [...GENERAL_PRESETS, ...NICHE_PRESETS];

export const presetById = (id: string) => PRESETS.find((p) => p.id === id) ?? GENERAL_PRESETS[0];

/** Modelo indicado para o nicho: o próprio do nicho, se houver */
export const presetForNiche = (niche: string) => NICHE_PRESETS.find((p) => p.niche === niche)?.id ?? "classic";
