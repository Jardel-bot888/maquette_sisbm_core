// ─── Panneau historique : trajets horodatés + lecteur de relecture ─────────
// Exigence module 2 : « Historique détaillé des trajets » + « Relecture des
// déplacements ». Filtres période + véhicule, synthèse parc, table des
// trajets, détail moteur (Ignition ON/OFF) et lecteur temporel (play/pause,
// ×1/×4/×16, curseur) rejouant le trajet sur la carte Leaflet.
import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays, CarFront, Download, History, Pause, Play, RotateCcw, Route as RouteIcon, Timer,
} from "lucide-react";
import { MapContainer, Polyline, TileLayer, CircleMarker, useMap } from "react-leaflet";
import { C, va } from "@/theme";
import type { Vehicle } from "@/data/mock";
import { Btn, Card, LiveClock, PageHeader } from "@/ui";
import { TILE_LAYERS, type MapLayerName } from "@/components/LiveMap";
import { useGpsFeed } from "@/data/gpsFeed";
import {
  TRIP_RETENTION_LABEL, buildWeekHistory, formatDuration, loadCachedTrips,
  saveCachedTrips, summarizeTrips, timeLabelOf, type Trip,
} from "@/data/history";

const SPEEDS = [1, 4, 16] as const;

/** Exporte un trajet (points horodatés) en CSV. */
function exportTripCsv(t: Trip) {
  const rows = ["heure,latitude,longitude", ...t.points.map((p) =>
    `${timeLabelOf(p.t)},${p.lat.toFixed(6)},${p.lng.toFixed(6)}`)];
  const blob = new Blob([rows.join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `trajet-${t.plate.replace(/\s+/g, "_")}-${t.dayKey}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

/** Cadre la carte sur le trajet dès qu'il change. */
function FitTrip({ trip }: { trip: Trip }) {
  const map = useMap();
  useEffect(() => {
    if (trip.points.length > 1) {
      map.fitBounds(trip.points.map((p) => [p.lat, p.lng] as [number, number]), { padding: [24, 24] });
    }
  }, [map, trip.id]);
  return null;
}

/** Tête de relecture : tracé parcouru/restant + position courante suivie. */
function ReplayHead({ trip, cursor }: { trip: Trip; cursor: number }) {
  const map = useMap();
  const pts = trip.points;
  const head = pts[Math.min(cursor, pts.length - 1)];
  useEffect(() => { map.panTo([head.lat, head.lng], { animate: true }); }, [map, head.lat, head.lng]);
  return (
    <>
      <Polyline positions={pts.slice(0, cursor + 1).map((p) => [p.lat, p.lng] as [number, number])} pathOptions={{ className: "sisbm-route-done", interactive: false }} />
      {cursor + 1 < pts.length && (
        <Polyline positions={pts.slice(cursor).map((p) => [p.lat, p.lng] as [number, number])} pathOptions={{ className: "sisbm-route-todo", interactive: false }} />
      )}
      <CircleMarker center={[head.lat, head.lng]} radius={9} pathOptions={{ className: "sisbm-replay-head" }} />
    </>
  );
}
export default function TripHistory({ onVehicleClick }: { onVehicleClick?: (v: Vehicle) => void }) {
  const { vehicles: live } = useGpsFeed();
  const [all] = useState<Trip[]>(() => {
    const cached = loadCachedTrips();
    const merged = cached.length > 0 ? cached : buildWeekHistory();
    saveCachedTrips(merged);
    return merged;
  });
  const [plate, setPlate] = useState<string>("all");
  const [period, setPeriod] = useState<string>("7");
  const [openId, setOpenId] = useState<string | null>(null);
  const [replayId, setReplayId] = useState<string | null>(null);
  const [cursor, setCursor] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [rate, setRate] = useState<1 | 4 | 16>(4);
  const tiles = TILE_LAYERS.standard;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const filtered = useMemo(() => {
    const cutoff = Date.now() - Number(period) * 86_400_000;
    return all.filter((t) =>
      (plate === "all" || t.plate === plate) && t.endT >= cutoff);
  }, [all, plate, period]);
  const summary = useMemo(() => summarizeTrips(filtered), [filtered]);
  const replay = all.find((t) => t.id === replayId) ?? null;

  const startReplay = (t: Trip) => { setReplayId(t.id); setCursor(0); setPlaying(true); };

  useEffect(() => {
    if (timer.current) { clearInterval(timer.current); timer.current = null; }
    if (playing && replay) {
      timer.current = setInterval(() => {
        setCursor((c) => {
          if (c + 1 >= replay.points.length) { setPlaying(false); return c; }
          return c + 1;
        });
      }, Math.max(80, 900 / rate));
    }
    return () => { if (timer.current) { clearInterval(timer.current); timer.current = null; } };
  }, [playing, replay, rate]);

  const replayT = replay ? replay.points[Math.min(cursor, replay.points.length - 1)].t : 0;

  return (
    <div className="space-y-4">
      <PageHeader
        title="Historique des trajets"
        subtitle="Trajets horodatés des 7 derniers jours : départs, arrivées, distances, arrêts et contact moteur."
        actions={<LiveClock compact />}
      />
      <div className="flex items-center gap-2 flex-wrap">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold" style={{ color: C.textMuted }}>
          <CalendarDays className="h-3.5 w-3.5" /> Période
        </span>
        {[["1", "24 h"], ["3", "3 j"], ["7", "7 j"]].map(([k, label]) => (
          <button key={k} type="button" onClick={() => setPeriod(k)} aria-pressed={period === k}
            className="text-xs px-3 py-1.5 rounded-lg border font-semibold"
            style={{ background: period === k ? va(C.primary, "13%") : C.cardBg, borderColor: period === k ? C.primary : C.border, color: period === k ? C.primary : C.textMuted }}>
            {label}
          </button>
        ))}
        <select value={plate} onChange={(e) => setPlate(e.target.value)} aria-label="Filtrer par véhicule"
          className="text-xs px-2.5 py-1.5 rounded-lg border outline-none"
          style={{ background: C.navy, borderColor: C.border, color: C.text }}>
          <option value="all">Tous véhicules</option>
          {live.map((v) => <option key={v.plate} value={v.plate}>{v.plate} · {v.model}</option>)}
        </select>
        <span className="text-[11px] ml-auto" style={{ color: C.textMuted }}>{TRIP_RETENTION_LABEL}</span>
      </div>
      <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))" }}>
        {[
          { icon: History, label: "Trajets", value: String(summary.count) },
          { icon: RouteIcon, label: "Distance", value: `${summary.km.toLocaleString("fr-FR")} km` },
          { icon: Timer, label: "Temps roulé", value: formatDuration(summary.durationMin) },
          { icon: CarFront, label: "Vmax période", value: `${summary.maxSpeed} km/h` },
        ].map((s, i) => (
          <Card key={i}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: C.navy }}>
                <s.icon className="h-4 w-4" style={{ color: C.primaryLight }} />
              </div>
              <div>
                <p className="text-lg font-black font-mono tabular-nums leading-none" style={{ color: C.text }}>{s.value}</p>
                <p className="text-[11px] mt-1" style={{ color: C.textMuted }}>{s.label} · {summary.stops} arrêt(s)</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {replay && (
        <div className="rounded-2xl border overflow-hidden" style={{ background: C.cardBg, borderColor: C.primary }}>
          <div className="flex items-center gap-2 flex-wrap px-3 py-2 border-b" style={{ borderColor: C.border }}>
            <span className="text-xs font-bold font-mono" style={{ color: C.text }}>
              ▶ {replay.plate} · {replay.date} · {timeLabelOf(replay.startT)} → {timeLabelOf(replay.endT)}
            </span>
            <span className="text-[11px] font-mono tabular-nums" style={{ color: C.primaryLight }}>
              {timeLabelOf(replayT)} · point {Math.min(cursor + 1, replay.points.length)}/{replay.points.length}
            </span>
            <span className="flex items-center gap-1 ml-auto">
              <button type="button" aria-label={playing ? "Suspendre la relecture" : "Reprendre la relecture"}
                onClick={() => (cursor + 1 >= replay.points.length ? (setCursor(0), setPlaying(true)) : setPlaying((p) => !p))}
                className="w-8 h-7 rounded-lg border flex items-center justify-center" style={{ background: C.navy, borderColor: C.border, color: C.text }}>
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              </button>
              <button type="button" aria-label="Recommencer la relecture" onClick={() => { setCursor(0); setPlaying(true); }}
                className="w-8 h-7 rounded-lg border flex items-center justify-center" style={{ background: C.navy, borderColor: C.border, color: C.textMuted }}>
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
              {([1, 4, 16] as const).map((s) => (
                <button key={s} type="button" onClick={() => setRate(s)} aria-pressed={rate === s}
                  className="text-[11px] font-mono px-2 h-7 rounded-lg border font-bold"
                  style={{ background: rate === s ? va(C.primary, "13%") : C.navy, borderColor: rate === s ? C.primary : C.border, color: rate === s ? C.primary : C.textMuted }}>
                  ×{s}
                </button>
              ))}
              <Btn variant="secondary" onClick={() => exportTripCsv(replay)}><Download className="h-3.5 w-3.5" /> CSV</Btn>
              <button type="button" onClick={() => { setReplayId(null); setPlaying(false); }}
                className="text-xs px-2 h-7 rounded-lg border" style={{ background: C.navy, borderColor: C.border, color: C.textMuted }}>✕ Fermer</button>
            </span>
          </div>
          <input type="range" min={0} max={replay.points.length - 1} value={cursor}
            onChange={(e) => setCursor(Number(e.target.value))} aria-label="Curseur temporel du trajet"
            className="w-full accent-[var(--sisbm-primary)] px-3" style={{ display: "block" }} />
          <div style={{ height: 300 }}>
            <MapContainer zoomControl={false} attributionControl={false} style={{ height: "100%", width: "100%" }}
              center={[replay.points[0].lat, replay.points[0].lng]} zoom={13}>
              <TileLayer url={tiles.url} attribution={tiles.attribution} maxZoom={tiles.maxZoom} subdomains={tiles.subdomains ?? "abc"} />
              <FitTrip trip={replay} />
              <ReplayHead trip={replay} cursor={cursor} />
            </MapContainer>
          </div>
        </div>
      )}

      <div className="rounded-2xl border p-4" style={{ background: C.cardBg, borderColor: C.borderSoft }}>
        <span className="font-bold text-sm block mb-3" style={{ color: C.text }}>
          {filtered.length} trajet(s) · {plate === "all" ? "tout le parc" : plate}
        </span>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr style={{ borderBottom: `1px solid ${C.border}` }}>
                {["Date", "Véhicule", "Départ → Arrivée", "Distance", "Durée", "Vit. max", "Arrêts", "Actions"].map((h) => (
                  <th key={h} className="text-left pb-2.5 pr-3 font-semibold whitespace-nowrap" style={{ color: C.textMuted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t) => (
                <>
                  <tr key={t.id} style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}>
                    <td className="py-3 pr-3 font-mono whitespace-nowrap" style={{ color: C.textMuted }}>{t.date}</td>
                    <td className="py-3 pr-3 font-mono font-bold whitespace-nowrap" style={{ color: C.text }}>{t.plate}</td>
                    <td className="py-3 pr-3" style={{ color: C.textDim }}>
                      <span className="font-mono font-bold">{timeLabelOf(t.startT)}</span> {t.startPos}
                      <span style={{ color: C.textMuted }}> → </span>
                      <span className="font-mono font-bold">{timeLabelOf(t.endT)}</span> {t.endPos}
                    </td>
                    <td className="py-3 pr-3 font-mono tabular-nums" style={{ color: C.text }}>{t.distanceKm} km</td>
                    <td className="py-3 pr-3 font-mono tabular-nums whitespace-nowrap" style={{ color: C.text }}>{formatDuration(t.durationMin)}</td>
                    <td className="py-3 pr-3 font-mono font-bold tabular-nums" style={{ color: t.maxSpeed > 80 ? C.red : C.text }}>{t.maxSpeed} km/h</td>
                    <td className="py-3 pr-3 font-mono tabular-nums" style={{ color: C.textMuted }}>{t.stops.length}</td>
                    <td className="py-3 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <button type="button" onClick={() => startReplay(t)}
                          className="px-2 py-1 rounded-lg text-[11px] border font-semibold"
                          style={{ background: replayId === t.id ? va(C.primary, "13%") : C.navy, borderColor: replayId === t.id ? C.primary : C.border, color: replayId === t.id ? C.primary : C.textMuted }}>
                          ▶ Relire
                        </button>
                        <button type="button" onClick={() => setOpenId(openId === t.id ? null : t.id)} aria-expanded={openId === t.id}
                          className="px-2 py-1 rounded-lg text-[11px] border"
                          style={{ background: C.navy, borderColor: C.border, color: C.textMuted }}>
                          {openId === t.id ? "Masquer" : "Détail"}
                        </button>
                      </div>
                    </td>
                  </tr>
                  {openId === t.id && (
                    <tr key={`${t.id}-detail`} style={{ borderBottom: `1px solid ${va(C.border, "33%")}` }}>
                      <td colSpan={8} className="pb-3 pr-3">
                        <div className="rounded-xl border px-3 py-2.5 text-[11px] space-y-1.5" style={{ background: C.navy, borderColor: C.border }}>
                          <p style={{ color: C.textDim }}>
                            🔑 Contact moteur : <span className="font-mono font-bold" style={{ color: C.green }}>ON {timeLabelOf(t.engine[0].t)} ({t.engine[0].pos})</span>
                            <span style={{ color: C.textMuted }}> → </span>
                            <span className="font-mono font-bold" style={{ color: C.red }}>OFF {timeLabelOf(t.engine[1].t)} ({t.engine[1].pos})</span>
                          </p>
                          {t.stops.length > 0 ? t.stops.map((s, i) => (
                            <p key={i} style={{ color: C.textDim }}>
                              🅿 Arrêt {i + 1} : <span className="font-mono">{timeLabelOf(s.at)}</span> · {s.pos} · {formatDuration(s.durationMin)}
                            </p>
                          )) : <p style={{ color: C.textMuted }}>Sans arrêt intermédiaire (trajet direct).</p>}
                          <p style={{ color: C.textMuted }}>
                            Vitesse moyenne {t.avgSpeed} km/h · {t.points.length} points GNSS · départ {timeLabelOf(t.startT)} / arrivée {timeLabelOf(t.endT)}.
                          </p>
                          <div className="flex items-center gap-2 pt-1">
                            <button type="button" onClick={() => exportTripCsv(t)}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold"
                              style={{ background: C.navyMid, borderColor: C.border, color: C.textDim }}>
                              <Download className="h-3 w-3" /> Export CSV horodaté
                            </button>
                            {onVehicleClick && (
                              <button type="button" onClick={() => {
                                const v = live.find((x) => x.plate === t.plate);
                                if (v) onVehicleClick(v);
                              }}
                                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border font-semibold"
                                style={{ background: va(C.primary, "13%"), borderColor: C.primary, color: C.primary }}>
                                <CarFront className="h-3 w-3" /> Fiche véhicule
                              </button>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-xs" style={{ color: C.textMuted }}>Aucun trajet sur cette période.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

