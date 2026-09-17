// ─── Modale d'immobilisation sécurisée ────────────────────────────────────────
// 4 verrous de sécurité, motif obligatoire, mot de passe opérateur,
// envoi de la commande SMS RELAY,1# au traceur.

import { useState } from "react";
import { C, va } from "@/theme";import type { Vehicle } from "@/data/mock";

export default function ImmobilizationModal({ vehicle, onClose }: { vehicle: Vehicle; onClose: () => void }) {
  const [reason, setReason] = useState("");
  const [password, setPassword] = useState("");
  const [step, setStep] = useState<"confirm" | "success">("confirm");
  const [checks] = useState([
    { label: "Vitesse nulle vérifiée", ok: vehicle.speed === 0 },
    { label: "Moteur à l'arrêt ou résiduel", ok: vehicle.speed === 0 },
    { label: "Signal GPS actif", ok: vehicle.gsm > 0 },
    { label: "Connexion traceur établie", ok: vehicle.status !== "offline" },
  ]);

  const allChecksOk = checks.every((c) => c.ok);
  const canExecute = reason && password.length >= 4;

  if (step === "success") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }}>
        <div className="rounded-2xl border p-8 text-center" style={{ background: C.navyMid, borderColor: va(C.green, "40%"), width: 360 }}>
          <div className="text-5xl mb-4">✅</div>
          <h3 className="font-bold text-lg mb-2" style={{ color: C.text }}>Commande envoyée</h3>
          <p className="text-sm mb-4" style={{ color: C.textMuted }}>
            SMS RELAY,1# envoyé au traceur du véhicule <span className="font-mono font-semibold">{vehicle.plate}</span>. Confirmation attendue sous 30s.
          </p>
          <button onClick={onClose} className="px-6 py-2 rounded-xl font-semibold text-sm" style={{ background: C.primary, color: "white" }}>Fermer</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.8)" }} onClick={onClose}>
      <div className="rounded-2xl border shadow-2xl w-[500px]" style={{ background: C.navyMid, borderColor: va(C.red, "27%") }} onClick={(e) => e.stopPropagation()}>
        {/* Title bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: C.border }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: va(C.red, "45%") }}>🔌</div>
            <div>
              <h3 className="font-bold text-sm" style={{ color: C.text }}>Commande d'Immobilisation Sécurisée</h3>
              <p className="text-xs" style={{ color: C.textMuted }}>Micodus MV730 / Relais S20 · <span className="font-mono font-semibold">{vehicle.plate}</span></p>
            </div>
          </div>
          <button onClick={onClose} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: C.navy, color: C.textMuted }}>✕</button>
        </div>

        <div className="px-6 py-4 space-y-4">
          {/* Warning banner */}
          <div className="rounded-xl px-4 py-3 border" style={{ background: va(C.orange, "13%"), borderColor: va(C.orange, "40%") }}>
            <div className="flex items-start gap-2">
              <span className="text-base mt-0.5">⚠️</span>
              <div>
                <p className="text-xs font-bold mb-1" style={{ color: C.orange }}>AVERTISSEMENT DE SÉCURITÉ</p>
                <p className="text-xs leading-relaxed" style={{ color: C.orange }}>
                  Cette action coupe l'alimentation moteur via relais physique. Elle ne doit être exécutée qu'avec l'accord du responsable de flotte et en conformité avec le cadre légal ivoirien.
                </p>
              </div>
            </div>
          </div>

          {/* 4 safety checks */}
          <div>
            <p className="text-xs font-semibold mb-2" style={{ color: C.textMuted }}>Vérification des 4 verrous de sécurité</p>
            <div className="space-y-2">
              {checks.map((c, i) => (
                <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg" style={{ background: C.navy, border: `1px solid ${c.ok ? va(C.green, "20%") : va(C.red, "20%")}` }}>
                  <span className="text-sm">{c.ok ? "✅" : "❌"}</span>
                  <span className="text-xs" style={{ color: c.ok ? C.green : C.red }}>{c.label}</span>
                  <span className="ml-auto text-xs font-semibold" style={{ color: c.ok ? C.green : C.red }}>{c.ok ? "OK" : "BLOQUANT"}</span>
                </div>
              ))}
            </div>
            {!allChecksOk && (
              <p className="text-xs mt-2 text-center" style={{ color: C.red }}>
                ⛔ Des verrous de sécurité ne sont pas satisfaits. Immobilisation risquée.
              </p>
            )}
          </div>
{/* Reason */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMuted }}>Motif d'immobilisation *</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              style={{ background: C.navy, borderColor: reason ? C.primary : C.border, color: reason ? C.text : C.textMuted }}
            >
              <option value="">Sélectionner un motif obligatoire…</option>
              <option value="theft">🚨 Vol suspecté</option>
              <option value="hours">🕐 Usage hors horaires autorisés</option>
              <option value="payment">💳 Non-paiement / Impayé</option>
              <option value="emergency">🆘 Urgence sécuritaire</option>
              <option value="maintenance">🔧 Maintenance d'urgence</option>
            </select>
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: C.textMuted }}>Mot de passe opérateur *</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 rounded-xl border outline-none text-sm"
              style={{ background: C.navy, borderColor: password.length >= 4 ? C.primary : C.border, color: C.text }}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center gap-3 px-6 py-4 border-t" style={{ borderColor: C.border }}>
          <button onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-sm border" style={{ borderColor: C.border, color: C.textMuted, background: C.navy }}>
            Annuler
          </button>
          <button
            disabled={!canExecute}
            onClick={() => canExecute && setStep("success")}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-all"
            style={{
              background: canExecute ? C.red : C.switchOff,
              color: canExecute ? "white" : C.gray,
              cursor: canExecute ? "pointer" : "not-allowed",
            }}
          >
            🔌 Exécuter la coupure <span className="text-xs font-mono opacity-70">(RELAY,1#)</span>
          </button>
        </div>
      </div>
    </div>
  );
}