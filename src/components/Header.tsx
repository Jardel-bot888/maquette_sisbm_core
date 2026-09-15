// ─── En-tête SISBM CORE ────────────────────────────────────────────────────────
// Logo, recherche globale fonctionnelle (véhicule / conducteur / zone),
// horloge, crédits SMS, sélecteur d'organisation, cloche notifications, profil.

import { useEffect, useRef, useState } from "react";
import logoUrl from "../../image/logo.png";
import { C } from "@/theme";
import { allVehicles, zones, smsAccount } from "@/data/mock";
import { BlinkDot, LiveClock } from "@/ui";
import { CarFront, Map, User } from "lucide-react";

type HeaderProps = {
  onNotifClick: () => void;
  onUserMenu: () => void;
  onNavigate: (label: string) => void;
  unreadCount: number;
};

type SearchHit = { kind: "vehicle"; label: string; sub: string } | { kind: "zone"; label: string; sub: string } | { kind: "driver"; label: string; sub: string };

type FixedRect = { left: number; top: number; width: number };

export default function Header({ onNotifClick, onUserMenu, onNavigate, unreadCount }: HeaderProps) {
  const [showOrgMenu, setShowOrgMenu] = useState(false);
  const [search, setSearch] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);

  // La navbar est en overflow-hidden (aucun débordement possible) : les menus
  // déroulants sont donc positionnés en `fixed` à partir du rect de leur bouton
  // pour ne jamais être rognés par ce conteneur.
  const searchBoxRef = useRef<HTMLDivElement | null>(null);
  const inputBoxRef = useRef<HTMLDivElement | null>(null);
  const orgBtnRef = useRef<HTMLButtonElement | null>(null);
  const [searchDrop, setSearchDrop] = useState<FixedRect | null>(null);
  const [orgDrop, setOrgDrop] = useState<FixedRect | null>(null);

  const measure = (el: HTMLElement | null): FixedRect | null => {
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return { left: r.left, top: r.bottom, width: r.width };
  };

  const openSearch = () => {
    setSearchDrop(measure(inputBoxRef.current ?? searchBoxRef.current));
    setSearchOpen(true);
  };

  const openOrgMenu = () => {
    const r = measure(orgBtnRef.current);
    setOrgDrop(r ? { left: Math.max(8, r.left + r.width - 208), top: r.top, width: 208 } : null);
    setShowOrgMenu(!showOrgMenu);
  };

  useEffect(() => {
    const onChange = () => {
      if (searchOpen) setSearchDrop(measure(inputBoxRef.current ?? searchBoxRef.current));
      if (showOrgMenu) {
        const r = measure(orgBtnRef.current);
        setOrgDrop(r ? { left: Math.max(8, r.left + r.width - 208), top: r.top, width: 208 } : null);
      }
    };
    window.addEventListener("resize", onChange);
    return () => window.removeEventListener("resize", onChange);
  }, [searchOpen, showOrgMenu]);

  const q = search.trim().toLowerCase();
  const hits: SearchHit[] = [];
  if (q) {
    allVehicles.forEach((v) => {
      if (v.plate.toLowerCase().includes(q) || v.model.toLowerCase().includes(q)) {
        hits.push({ kind: "vehicle", label: `${v.plate} · ${v.model}`, sub: v.pos });
      }
    });
    allVehicles.forEach((v) => {
      if (v.driver.toLowerCase().includes(q)) hits.push({ kind: "driver", label: v.driver, sub: `${v.plate} · Conducteur` });
    });
    zones.forEach((z) => {
      if (z.name.toLowerCase().includes(q) || z.commune.toLowerCase().includes(q)) {
        hits.push({ kind: "zone", label: z.name, sub: `${z.commune} · Géofence` });
      }
    });
  }

  const goTo = (kind: string) => {
    setSearchOpen(false);
    setSearch("");
    onNavigate(kind === "zone" ? "Zones géographiques" : "Tracking GPS");
  };

  return (
    <header className="relative flex-shrink-0 border-b" style={{ background: C.navyMid, borderColor: C.border }}>
      {/* ══ Rangée unique et rigide : 3 colonnes, hauteur fixe, AUCUN retour à la ligne possible ══ */}
      <div className="flex items-center h-16 gap-3 px-4 overflow-hidden">

        {/* ── COLONNE GAUCHE : Logo SISBM + badge Live (espacement gap-4 + largeur minimale garantie :
              le badge ne peut plus chevaucher le logo et le sidebar ne peut plus déborder dessus) ── */}
        <div className="flex items-center gap-4 shrink-0 min-w-[110px] md:min-w-[180px]">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl border shrink-0" style={{ background: "#0B1320", borderColor: C.border }}>
              <img src={logoUrl} alt="SISBM logo" className="h-full w-full object-contain p-1.5" />
            </div>
            <span className="font-black text-xl leading-none tracking-tight whitespace-nowrap" style={{ color: C.text }}>SISBM</span>
          </div>
          <div className="hidden lg:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold leading-none whitespace-nowrap shrink-0" style={{ borderColor: C.green, color: C.green, background: "#052E16" }}>
            <BlinkDot color={C.green} />
            Live · Serveur OK
          </div>
        </div>

        {/* ─ COLONNE CENTRE : UNIQUEMENT la barre de recherche (input tronqué si l'espace manque) ── */}
        <div ref={searchBoxRef} className="flex-1 min-w-[130px] flex items-center justify-center px-4">
          <div ref={inputBoxRef} className="flex items-center gap-2 h-10 px-3 rounded-lg border w-full max-w-xs lg:max-w-sm" style={{ background: C.navy, borderColor: searchOpen ? C.primary : C.navyLight }}>
            <svg className="w-4 h-4 shrink-0" fill="none" stroke={C.gray} viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8" strokeWidth="2" />
              <path d="m21 21-4.35-4.35" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              value={search}
              onChange={(e) => { setSearch(e.target.value); openSearch(); }}
              onFocus={openSearch}
              onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
              placeholder="Immatriculation, conducteur, zone, traceur…"
              className="bg-transparent text-sm outline-none w-full min-w-0 truncate"
              style={{ color: C.text }}
            />
            {search === "" && <kbd className="hidden sm:inline-block text-xs px-1.5 py-0.5 rounded leading-none shrink-0" style={{ background: C.navyLight, color: C.textMuted }}>⌘K</kbd>}
          </div>
        {searchOpen && q && searchDrop && (
            <div className="fixed mt-1.5 rounded-xl border shadow-2xl py-1.5 z-[45] max-h-72 overflow-y-auto" style={{ left: searchDrop.left, top: searchDrop.top, width: searchDrop.width, background: C.navyMid, borderColor: C.navyLight }}>
              {hits.length === 0 && (
                <p className="px-4 py-3 text-xs" style={{ color: C.textMuted }}>Aucun résultat pour « {search} »</p>
              )}
              {hits.slice(0, 8).map((h, i) => (
                <button key={i} onMouseDown={() => goTo(h.kind)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-white/5">
                  <span className="flex h-7 w-7 items-center justify-center rounded-lg" style={{ background: C.navyLight }}>
                    {h.kind === "zone" ? <Map className="h-3.5 w-3.5" style={{ color: C.orange }} /> : h.kind === "driver" ? <User className="h-3.5 w-3.5" style={{ color: C.primary }} /> : <CarFront className="h-3.5 w-3.5" style={{ color: C.green }} />}
                  </span>
                  <span className="min-w-0">
                    <span className="block text-xs font-semibold truncate" style={{ color: C.text }}>{h.label}</span>
                    <span className="block text-[11px] truncate" style={{ color: C.textMuted }}>{h.sub}</span>
                  </span>
                </button>
              ))}
              <div className="border-t mt-1 pt-1" style={{ borderColor: C.border }}>
                <button onMouseDown={() => goTo("vehicle")} className="w-full px-4 py-2 text-left text-xs font-semibold" style={{ color: C.primary }}>
                  Voir le tracking complet →
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ── COLONNE DROITE : horloge, SMS, sélecteur d'organisation, notifications, profil ── */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="hidden md:flex xl:hidden shrink-0"><LiveClock compact /></div>
          <div className="hidden xl:flex shrink-0"><LiveClock /></div>

          <div className="hidden 2xl:flex items-center gap-2 px-3 h-10 rounded-lg border whitespace-nowrap shrink-0" style={{ background: "#1C1917", borderColor: "#44403C" }}>
            <span className="text-xs leading-none" style={{ color: C.textMuted }}>SMS restant</span>
            <span className="font-bold text-sm leading-none" style={{ color: "#FCD34D" }}>{smsAccount.credits}</span>
            <button className="text-xs px-2 py-1 rounded font-semibold leading-none" style={{ background: "#92400E", color: "#FCD34D" }}>
              Recharger
            </button>
          </div>

        <div className="hidden xl:block relative shrink-0">
            <button ref={orgBtnRef} onClick={openOrgMenu} className="flex items-center gap-2 px-3 h-10 rounded-lg border text-sm whitespace-nowrap shrink-0" style={{ background: C.navy, borderColor: C.navyLight, color: C.text }}>
              <span className="w-5 h-5 rounded text-xs font-bold flex items-center justify-center" style={{ background: C.primary }}>T</span>
              <span className="leading-none max-w-[150px] truncate" style={{ color: C.text }}>{smsAccount.org}</span>
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </button>
            {showOrgMenu && orgDrop && (
              <div className="fixed mt-1 rounded-xl border shadow-2xl py-1 z-[45]" style={{ left: orgDrop.left, top: orgDrop.top, width: orgDrop.width, background: C.navyMid, borderColor: C.navyLight }}>
                {["Transports Kouamé", "Logistique Abidjan", "Fleet CI SAS"].map((org) => (
                  <button key={org} onClick={() => setShowOrgMenu(false)} className="w-full text-left px-4 py-2 text-sm hover:bg-[#334155]" style={{ color: C.text }}>
                    {org}
                  </button>
                ))}
              </div>
            )}
          </div>

        <button onClick={onNotifClick} className="relative w-10 h-10 rounded-lg flex items-center justify-center border flex-shrink-0" style={{ background: C.navy, borderColor: C.navyLight }}>
          <svg className="w-5 h-5" fill="none" stroke={C.textMuted} viewBox="0 0 24 24">
            <path d="M15 17H9m6 0a3 3 0 01-6 0m6 0h3.17A2 2 0 0020 15V9a7 7 0 00-14 0v6a2 2 0 001.83 2H9" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <BlinkDot color={C.red} />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-xs font-bold flex items-center justify-center" style={{ background: C.red, color: "white", fontSize: 9 }}>
              {unreadCount}
            </span>
          )}
        </button>

        <button onClick={onUserMenu} className="flex items-center gap-2 px-2 h-10 rounded-lg border whitespace-nowrap flex-shrink-0" style={{ background: C.navy, borderColor: C.navyLight }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: C.primary, color: "white" }}>AD</div>
          <div className="hidden xl:block text-left leading-none">
            <div className="text-xs font-semibold" style={{ color: C.text }}>Administrateur</div>
            <div className="text-xs mt-0.5" style={{ color: C.textMuted }}>Super Admin</div>
          </div>
          <svg className="w-3 h-3 ml-1" fill="none" stroke={C.gray} viewBox="0 0 24 24">
            <path d="M19 9l-7 7-7-7" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
        </div>
      </div>
    </header>
  );
}