import type { Lang } from "../data/locales";

export type TemplateId = "classic" | "bold" | "soft";

export const TEMPLATES: { id: TemplateId; name: string; description: string }[] = [
  { id: "classic", name: "Clássico", description: "Claro e confiável. Funciona para qualquer nicho." },
  { id: "bold", name: "Impacto", description: "Escuro, tipografia grande. Ótimo para serviços e barbearias." },
  { id: "soft", name: "Acolhedor", description: "Tons suaves e serifas. Ideal para salões e restaurantes." },
];

export type ServiceItem = { title: string; desc: string };

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
};

export type RenderOptions = { forPdf?: boolean };
