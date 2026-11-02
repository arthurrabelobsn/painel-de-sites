import type { Lang } from "../data/locales";

import { PRESETS } from "./presets";

/** Id de um modelo (ver presets.ts): gerais ("classic", "bold"…) ou de nicho ("n-bakery"…) */
export type TemplateId = string;

export const TEMPLATES: { id: TemplateId; name: string; description: string; niche?: string }[] = PRESETS.map((p) => ({
  id: p.id,
  name: p.name,
  description: p.description,
  niche: p.niche,
}));

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
  heroNote?: string; // aviso curto acima do título (promoção, novidade); vazio = sem aviso
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
  heroImage: string; // foto enviada (data URL); vazio = usa a foto de banco
  heroPhoto?: string; // foto de banco do topo (id do Unsplash); ausente = a padrão do nicho; "" = sem foto
  aboutImage?: string; // foto enviada para o "sobre"
  aboutPhoto?: string; // foto de banco do "sobre"; ausente = a segunda do nicho; "" = sem foto
  primary: string;
  dark: string;
  light: string;
  showMap: boolean;
  showDemoBadge: boolean;
  blocks?: Block[];
  hidden?: Partial<Record<SectionKey, boolean>>;
};

export type RenderOptions = { forPdf?: boolean };
