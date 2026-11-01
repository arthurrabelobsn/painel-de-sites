import { SITE_UI, type Lang } from "../data/locales";
import { nicheById } from "../data/niches";
import { fillTemplate } from "../data/outreach";
import type { SiteData, TemplateId } from "./types";

export type LeadLike = {
  name: string;
  niche: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  intl_phone: string | null;
  email?: string | null;
  rating: number | null;
  reviews: number | null;
  hours?: string[] | null;
};

/** Site completo a partir do lead, usando a copy pronta do nicho (sem IA) */
export function defaultSiteData(lead: LeadLike, lang: Lang, template: TemplateId = "classic"): SiteData {
  const niche = nicheById(lead.niche);
  const copy = niche.copy[lang];
  const vars = { name: lead.name, city: lead.city ?? "" };
  const intl = lead.intl_phone ?? "";
  return {
    template,
    lang,
    nicheId: niche.id,
    name: lead.name,
    headline: fillTemplate(copy.headline, vars),
    sub: fillTemplate(copy.sub, vars),
    about: fillTemplate(copy.about, vars),
    services: copy.services.map(([title, desc]) => ({ title, desc })),
    benefits: SITE_UI[lang].benefits.map(([title, desc]) => ({ title, desc })),
    phone: lead.phone ?? "",
    intlPhone: intl,
    whatsapp: intl.replace(/\D/g, ""),
    email: lead.email ?? "",
    address: lead.address ?? "",
    city: lead.city ?? "",
    hours: lead.hours ?? [],
    rating: lead.rating,
    reviews: lead.reviews,
    showRating: !!lead.rating && lead.rating >= 4,
    logo: "",
    heroImage: "",
    primary: niche.palette[0],
    dark: niche.palette[1],
    light: niche.palette[2],
    showMap: true,
    showDemoBadge: true,
  };
}
