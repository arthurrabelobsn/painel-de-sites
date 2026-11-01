export type LeadStatus = "novo" | "contatado" | "demo" | "fechado" | "perdido";

export const STATUS: { id: LeadStatus; label: string; cls: string }[] = [
  { id: "novo", label: "Novo", cls: "bg-bg text-ink border border-line" },
  { id: "contatado", label: "Contatado", cls: "bg-blue-50 text-blue-700" },
  { id: "demo", label: "Demo enviada", cls: "bg-accent-soft text-accent" },
  { id: "fechado", label: "Fechado", cls: "bg-ok-soft text-ok" },
  { id: "perdido", label: "Perdido", cls: "bg-zinc-100 text-zinc-500" },
];

export type Lead = {
  id: string;
  user_id: string;
  place_id: string;
  name: string;
  niche: string;
  country: string;
  city: string | null;
  address: string | null;
  phone: string | null;
  intl_phone: string | null;
  email: string | null;
  maps_url: string | null;
  rating: number | null;
  reviews: number | null;
  hours: string[] | null;
  status: LeadStatus;
  notes: string | null;
  created_at: string;
};

export type Profile = {
  id: string;
  full_name: string | null;
  sender_name: string | null;
  sender_email: string | null;
  sender_phone: string | null;
  gemini_api_key: string | null;
};
