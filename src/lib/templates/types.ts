import type { Lang } from "../data/locales";

export type TemplateId = "classic" | "bold" | "soft" | "storefront" | "service";

export const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: "classic", name: "Clássico", description: "Claro e confiável. Funciona para qualquer nicho." },
  { id: "bold", name: "Impacto", description: "Escuro, tipografia grande. Ótimo para serviços e barbearias." },
  { id: "soft", name: "Acolhedor", description: "Tons suaves e serifas. Ideal para salões e restaurantes." },
  { id: "storefront", name: "Vitrine", description: "O nome vira letreiro com toldo listrado. Para lojas de bairro, padarias, cafés e barbearias." },
  { id: "service", name: "Atendimento", description: "Cartão de contato em destaque e serviços em lista. Para chamados, reparos e clínicas." },
];

export type ServiceItem = { title: string; desc: string };

/** Seções extras que a IA (ou o usuário) pode criar */
export const BLOCK_TYPES = ["text", "list", "steps", "faq", "pricing", "cta", "custom"] as const;
export type BlockType = (typeof BLOCK_TYPES)[number];

export const BLOCK_POSITIONS = ["after-hero", "after-services", "after-about", "before-contact"] as const;
export type BlockPosition = (typeof BLOCK_POSITIONS)[number];

export const BLOCK_LABELS: Record<BlockType, string> = {
  text: "Texto",
  list: "Lista de destaques",
  steps: "Passo a passo",
  faq: "Perguntas frequentes",
  pricing: "Preços",
  cta: "Faixa de chamada",
  custom: "HTML personalizado",
};

export const POSITION_LABELS: Record<BlockPosition, string> = {
  "after-hero": "Depois do topo",
  "after-services": "Depois dos serviços",
  "after-about": "Depois do “sobre”",
  "before-contact": "Antes do contato",
};

export type BlockItem = { title: string; desc?: string; price?: string };

export type Block = {
  id: string;
  type: BlockType;
  position: BlockPosition;
  title?: string;
  text?: string;
  button?: string;
  items?: BlockItem[];
  html?: string; // só no tipo "custom" (higienizado antes de renderizar)
};

/** Seções fixas dos modelos que podem ser escondidas */
export const SECTION_KEYS = ["services", "why", "about", "contact"] as const;
export type SectionKey = (typeof SECTION_KEYS)[number];
export const SECTION_LABELS: Record<SectionKey, string> = {
  services: "Serviços",
  why: "Por que escolher",
  about: "Sobre",
  contact: "Contato",
};

export type SiteData = {
  template: TemplateId;
  lang: Lang;
  nicheId: string;
  name: string;
  headline: string;
  sub: string;
  about: string;
  services: ServiceItem[];
  benefits: ServiceItem[];
  phone: string;
  intlPhone: string;
  whatsapp: string; // só dígitos com DDI; vazio = sem botão
  email: string;
  address: string;
  city: string;
  hours: string[];
  rating: number | null;
  reviews: number | null;
  showRating: boolean;
  logo: string; // data URL ou vazio (usa monograma)
  heroImage: string; // data URL ou vazio (usa arte do nicho)
  primary: string;
  dark: string;
  light: string;
  showMap: boolean;
  showDemoBadge: boolean;
  blocks?: Block[];
  hidden?: Partial<Record<SectionKey, boolean>>;
};

export type RenderOptions = { forPdf?: boolean };
