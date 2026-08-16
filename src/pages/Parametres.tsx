import { useEffect, useMemo, useState } from "react";
import { formatDateFr } from "../data/lubiData";
import { DEFAULT_SETTINGS, useSettings, type AppSettings } from "../context/SettingsContext";
import ExternalSourcePanel from "../components/ExternalSourcePanel";
import { useHydroSource } from "../context/HydroSourceContext";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? "#06b6d4" : "rgba(255,255,255,0.1)" }}
      aria-pressed={checked}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );
}

function num(raw: string): number {
  return Number(String(raw).replace(",", "."));
}

function validate(s: AppSettings): string | null {
  const n = num(s.seuil_normal);
  const v = num(s.seuil_vigilance);
  const a = num(s.seuil_alerte);
  const c = num(s.seuil_critique);
  const nav = num(s.profondeur_nav_min);
  const etg = num(s.profondeur_vigilance);
  if ([n, v, a, c, nav, etg].some((x) => !Number.isFinite(x) || x <= 0)) {
    return "Tous les seuils doivent être des nombres strictement positifs.";
  }
  if (!(n > v && v > a && a > c)) {
    return "Seuils hydrologiques : normal > vigilance > alerte > critique.";
  }
  if (!(nav > etg)) {
    return "Seuil navigable doit être supérieur au seuil de vigilance (étiage).";
  }
  if (s.notifEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.email.trim())) {
    return "Indiquez une adresse email valide pour activer les notifications.";
  }
  return null;
}

export default function Parametres() {
  const { settings, save, reset, seuils, qNavigable, qEtiage, formatDepth } = useSettings();
  const { bundle } = useHydroSource();
  const [draft, setDraft] = useState<AppSettings>(settings);
  const [message, setMessage] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const dirty = useMemo(() => JSON.stringify(draft) !== JSON.stringify(settings), [draft, settings]);

  const toggle = (key: keyof AppSettings) =>
    setDraft((s) => ({ ...s, [key]: !s[key] }));

  const update = (key: keyof AppSettings, val: string) =>
    setDraft((s) => ({ ...s, [key]: val }));

  const onSave = () => {
    const err = validate(draft);
    if (err) {
      setMessage({ type: "err", text: err });
      return;
    }
    save({ ...draft, email: draft.email.trim() });
    setMessage({
      type: "ok",
      text: draft.notifEmail
        ? `Paramètres enregistrés. Alertes simulées vers ${draft.email.trim()}.`
        : "Paramètres enregistrés. Ils s’appliquent à la carte, la navigation et les alertes.",
    });
  };

  const onReset = () => {
    reset();
    setDraft(DEFAULT_SETTINGS);
    setMessage({ type: "ok", text: "Valeurs par défaut restaurées (tirants Excel 1,5 / 1,2 m)." });
  };

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-lg mx-auto">
      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Informations système</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Application", value: "LUBI HYDRO" },
            { label: "Version", value: "v1.0.0" },
            { label: "Source données", value: bundle.sourceLabel },
            { label: "Dernière MAJ", value: bundle.LAST_DATE ? `${formatDateFr(bundle.LAST_DATE)} ${bundle.LAST_HEURE}` : "—" },
          ].map((s) => (
            <div key={s.label} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.03)" }}>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-1" style={{ color: "rgba(148,163,184,0.4)" }}>
                {s.label}
              </p>
              <p className="text-sm font-mono font-600" style={{ color: "#22d3ee" }}>{s.value}</p>
            </div>
          ))}
        </div>
        <p className="text-[11px] mt-3 px-3 py-2 rounded-lg font-mono" style={{ background: "rgba(34,211,238,0.05)", color: "rgba(34,211,238,0.6)", border: "1px solid rgba(34,211,238,0.1)" }}>
          Période {bundle.DATA_PERIOD.start} → {bundle.DATA_PERIOD.end} ({bundle.DATA_PERIOD.nDays} j).
          {bundle.mode === "lubi" ? " Carte : Shape Lubi + Port Lubi (WGS84)." : " Carte : point de référence (pas de shapefile bassin)."}
        </p>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Notifications et alertes</p>
        <div className="space-y-3">
          {[
            { key: "notifCritique" as const, label: "Alertes critiques", sub: "Afficher les niveaux critiques dans la cloche et les compteurs" },
            { key: "notifAlerte" as const, label: "Alertes (niveau alerte)", sub: "Afficher les dépassements de seuil d’alerte" },
            { key: "notifVigilance" as const, label: "Vigilance", sub: "Afficher les zones de vigilance" },
            { key: "notifEmail" as const, label: "Notifications par email", sub: "Adresser un récapitulatif (simulation locale, pas de serveur mail)" },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div>
                <p className="text-sm text-white">{label}</p>
                <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{sub}</p>
              </div>
              <Toggle checked={draft[key] as boolean} onChange={() => toggle(key)} />
            </div>
          ))}
          {draft.notifEmail && (
            <div className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-sm text-white mb-2">Adresse email</p>
              <input
                type="email"
                value={draft.email}
                onChange={(e) => update("email", e.target.value)}
                placeholder="ex. hydrologie@exemple.cd"
                className="w-full px-3 py-2 rounded-lg text-sm font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(34,211,238,0.2)" }}
              />
            </div>
          )}
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Données et actualisation</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <p className="text-sm text-white">Actualisation automatique</p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>
                Horodatage local de l’interface (les séries Qsim 2009–2022 restent figées)
              </p>
            </div>
            <Toggle checked={draft.autoRefresh} onChange={() => toggle("autoRefresh")} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <p className="text-sm text-white">Intervalle d'actualisation</p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>Fréquence de mise à jour de l’horloge</p>
            </div>
            <select
              value={draft.refreshInterval}
              onChange={(e) => update("refreshInterval", e.target.value)}
              disabled={!draft.autoRefresh}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono outline-none"
              style={{ background: "rgba(255,255,255,0.06)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)", opacity: draft.autoRefresh ? 1 : 0.45 }}
            >
              <option value="5">5 min</option>
              <option value="15">15 min</option>
              <option value="30">30 min</option>
              <option value="60">1 heure</option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Affichage</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <label className="p-3 rounded-lg block" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[11px] mb-2" style={{ color: "rgba(226,232,240,0.7)" }}>Unité de hauteur</p>
            <select
              value={draft.unite}
              onChange={(e) => update("unite", e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-[11px] font-mono outline-none"
              style={{ background: "rgba(255,255,255,0.06)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)" }}
            >
              <option value="m">Mètres (m)</option>
              <option value="cm">Centimètres (cm)</option>
            </select>
          </label>
          <label className="p-3 rounded-lg block" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[11px] mb-2" style={{ color: "rgba(226,232,240,0.7)" }}>Langue des dates</p>
            <select
              value={draft.langue}
              onChange={(e) => update("langue", e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-[11px] font-mono outline-none"
              style={{ background: "rgba(255,255,255,0.06)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)" }}
            >
              <option value="fr">Français</option>
              <option value="en">English</option>
            </select>
          </label>
          <label className="p-3 rounded-lg block" style={{ background: "rgba(255,255,255,0.02)" }}>
            <p className="text-[11px] mb-2" style={{ color: "rgba(226,232,240,0.7)" }}>Thème</p>
            <select
              value={draft.theme}
              onChange={(e) => update("theme", e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg text-[11px] font-mono outline-none"
              style={{ background: "rgba(255,255,255,0.06)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)" }}
            >
              <option value="dark">Sombre (navy)</option>
              <option value="dim">Sombre atténué</option>
            </select>
          </label>
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-1">Seuils hydrologiques</p>
        <p className="text-[11px] mb-4" style={{ color: "rgba(148,163,184,0.5)" }}>
          Niveaux de statut (normal → critique) appliqués aux stations et à la vue générale.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "seuil_normal" as const, label: "Seuil normal", color: "#10b981" },
            { key: "seuil_vigilance" as const, label: "Seuil vigilance", color: "#f59e0b" },
            { key: "seuil_alerte" as const, label: "Seuil alerte", color: "#f97316" },
            { key: "seuil_critique" as const, label: "Seuil critique", color: "#ef4444" },
          ].map(({ key, label, color }) => (
            <div key={key} className="p-3 rounded-lg" style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: `${color}99` }}>
                {label}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={draft[key]}
                  onChange={(e) => update(key, e.target.value)}
                  step="0.1"
                  min="0.1"
                  className="w-16 px-2 py-1 rounded font-mono text-sm font-700 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", color, border: `1px solid ${color}40` }}
                />
                <span className="text-[11px] font-mono" style={{ color: `${color}80` }}>m</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Seuils de navigation</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "profondeur_nav_min" as const, label: "Hauteur navigable min.", color: "#10b981" },
            { key: "profondeur_vigilance" as const, label: "Hauteur vigilance (étiage)", color: "#f59e0b" },
          ].map(({ key, label, color }) => (
            <div key={key} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] mb-2" style={{ color: "rgba(226,232,240,0.7)" }}>{label}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={draft[key]}
                  onChange={(e) => update(key, e.target.value)}
                  step="0.1"
                  min="0.1"
                  className="w-16 px-2 py-1 rounded font-mono text-sm font-700 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", color, border: `1px solid ${color}40` }}
                />
                <span className="text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>m</span>
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] mt-3 font-mono" style={{ color: "rgba(148,163,184,0.5)" }}>
          Actifs : navigable ≥ {formatDepth(seuils.navigable, 1)} (Q ≥ {qNavigable} m³/s) · étiage {formatDepth(seuils.etage, 1)} (Q ≥ {qEtiage} m³/s)
        </p>
      </div>

      <ExternalSourcePanel />

      {message && (
        <div
          className="px-4 py-3 rounded-lg text-sm"
          style={{
            background: message.type === "ok" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
            border: `1px solid ${message.type === "ok" ? "rgba(16,185,129,0.35)" : "rgba(239,68,68,0.35)"}`,
            color: message.type === "ok" ? "#10b981" : "#fca5a5",
          }}
        >
          {message.text}
        </div>
      )}

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 rounded-lg text-sm font-600 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Réinitialiser
        </button>
        <button
          type="button"
          onClick={onSave}
          disabled={!dirty}
          className="px-5 py-2.5 rounded-lg text-sm font-600 transition-colors"
          style={{
            background: dirty ? "linear-gradient(135deg, #06b6d4, #0891b2)" : "rgba(255,255,255,0.08)",
            color: dirty ? "white" : "rgba(148,163,184,0.5)",
            cursor: dirty ? "pointer" : "not-allowed",
          }}
        >
          Enregistrer les paramètres
        </button>
      </div>
    </div>
  );
}
