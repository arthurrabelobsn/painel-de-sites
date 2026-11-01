"use client";

import "leaflet/dist/leaflet.css";
import { useEffect, useRef } from "react";
import type { CircleMarker, LayerGroup, Map as LeafletMap } from "leaflet";
import { CITY_COORDS, COUNTRY_VIEW } from "@/lib/data/cityCoords";
import type { Country } from "@/lib/data/locales";

const INK = "#15140f";
const ACCENT = "#ff5a1f";

/**
 * Mapa clicável das cidades sugeridas.
 * Laranja = cidade média (menos concorrência), preto = cidade grande.
 */
export function CityMap({ country, selected, onSelect }: { country: Country; selected: string; onSelect: (city: string) => void }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<LeafletMap | null>(null);
  const layer = useRef<LayerGroup | null>(null);
  const markers = useRef<Map<string, { mk: CircleMarker; isMid: boolean }>>(new Map());
  const onSelectRef = useRef(onSelect);
  onSelectRef.current = onSelect;

  // cria o mapa uma vez
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const L = (await import("leaflet")).default;
      if (cancelled || !el.current || map.current) return;
      const m = L.map(el.current, { zoomControl: true, scrollWheelZoom: false, attributionControl: true });
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 12,
        minZoom: 4,
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
        className: "city-map-tiles",
      }).addTo(m);
      layer.current = L.layerGroup().addTo(m);
      map.current = m;
      drawMarkers(L);
    })();
    return () => {
      cancelled = true;
      map.current?.remove();
      map.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // redesenha ao trocar de país
  useEffect(() => {
    (async () => {
      const L = (await import("leaflet")).default;
      drawMarkers(L);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [country.code]);

  // destaca a cidade escolhida (pela lista ou pelo mapa)
  useEffect(() => {
    markers.current.forEach(({ mk, isMid }, name) => style(mk, name === selected, isMid));
    const mk = markers.current.get(selected)?.mk;
    if (mk && map.current) {
      mk.openTooltip();
      mk.bringToFront();
      if (!map.current.getBounds().pad(-0.1).contains(mk.getLatLng())) map.current.panTo(mk.getLatLng());
    }
  }, [selected]);

  function style(mk: CircleMarker, active: boolean, isMid: boolean) {
    const color = isMid ? ACCENT : INK;
    mk.setStyle({
      radius: active ? 11 : isMid ? 6 : 7,
      color: active ? "#ffffff" : color,
      weight: active ? 3 : 1.5,
      fillColor: color,
      fillOpacity: active ? 1 : 0.85,
    });
    if (!active) mk.closeTooltip();
  }

  function drawMarkers(L: typeof import("leaflet")) {
    const m = map.current;
    const group = layer.current;
    if (!m || !group) return;
    group.clearLayers();
    markers.current.clear();

    const [lat, lng, zoom] = COUNTRY_VIEW[country.code] ?? [48, 6, 5];
    m.setView([lat, lng], zoom, { animate: false });

    const coords = CITY_COORDS[country.code] ?? {};
    const add = (name: string, isMid: boolean) => {
      const c = coords[name];
      if (!c) return;
      const mk = L.circleMarker(c, { radius: isMid ? 6 : 7, fillColor: isMid ? ACCENT : INK, color: isMid ? ACCENT : INK });
      mk.bindTooltip(name, { direction: "top", offset: [0, -6] });
      mk.on("click", () => onSelectRef.current(name));
      mk.addTo(group);
      markers.current.set(name, { mk, isMid });
      style(mk, name === selected, isMid);
    };
    country.cities.forEach((c) => add(c, false));
    country.midCities.forEach((c) => add(c, true));
    markers.current.get(selected)?.mk.openTooltip();
  }

  return (
    <div className="relative overflow-hidden rounded-xl border border-line">
      <div ref={el} className="h-[340px] w-full bg-bg" aria-label={`Mapa de cidades — ${country.name}`} />
      <div className="pointer-events-none absolute bottom-2 left-2 z-[400] flex gap-3 rounded-lg bg-white/90 px-2.5 py-1.5 text-[12px] shadow-sm">
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: ACCENT }} /> Média · menos concorrência</span>
        <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rounded-full" style={{ background: INK }} /> Grande</span>
      </div>
    </div>
  );
}
