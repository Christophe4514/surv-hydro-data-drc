import { useState } from "react";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

function Toggle({ checked, onChange }: { checked: boolean; onChange: () => void }) {
  return (
    <button
      onClick={onChange}
      className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
      style={{ background: checked ? "#06b6d4" : "rgba(255,255,255,0.1)" }}
    >
      <div
        className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform"
        style={{ left: checked ? "calc(100% - 18px)" : "2px" }}
      />
    </button>
  );
}

export default function Parametres() {
  const [settings, setSettings] = useState({
    notifAlerte: true,
    notifCritique: true,
    notifVigilance: false,
    notifEmail: false,
    autoRefresh: true,
    refreshInterval: "15",
    unite: "m",
    langue: "fr",
    theme: "dark",
    seuil_normal: "1.5",
    seuil_vigilance: "1.3",
    seuil_alerte: "1.2",
    seuil_critique: "1.0",
    profondeur_nav_min: "1.5",
    profondeur_vigilance: "1.2",
  });

  const toggle = (key: keyof typeof settings) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  const update = (key: keyof typeof settings, val: string) =>
    setSettings((s) => ({ ...s, [key]: val }));

  return (
    <div className="p-4 md:p-6 space-y-5 max-w-screen-lg mx-auto">
      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Informations système</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Application", value: "LUBI HYDRO" },
            { label: "Version", value: "v1.0.0" },
            { label: "Source données", value: "Modele_Lubi1.xlsx" },
            { label: "Dernière MAJ", value: "31/12/2022 00:00" },
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
          Formule profondeur-calc : Q = 28 × 65 × H^(5/3) × √0,000625  ⇒  H = (Q / 45,5)^(3/5). Tirants : 1,5 m / 1,3 m / 1,2 m (étiage). Carte : Shape Lubi (WGS84).
        </p>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Notifications et alertes</p>
        <div className="space-y-3">
          {[
            { key: "notifCritique" as const, label: "Alertes critiques", sub: "Notification immédiate pour les niveaux critiques" },
            { key: "notifAlerte" as const, label: "Alertes (niveau alerte)", sub: "Notification pour les dépassements de seuil" },
            { key: "notifVigilance" as const, label: "Vigilance", sub: "Notification pour les zones de vigilance" },
            { key: "notifEmail" as const, label: "Notifications par email", sub: "Envoi d'un email pour chaque alerte active" },
          ].map(({ key, label, sub }) => (
            <div key={key} className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
              <div>
                <p className="text-sm text-white">{label}</p>
                <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>{sub}</p>
              </div>
              <Toggle checked={settings[key] as boolean} onChange={() => toggle(key)} />
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Données et actualisation</p>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <p className="text-sm text-white">Actualisation automatique</p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>Actualiser les données automatiquement</p>
            </div>
            <Toggle checked={settings.autoRefresh as boolean} onChange={() => toggle("autoRefresh")} />
          </div>
          <div className="flex items-center justify-between p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
            <div>
              <p className="text-sm text-white">Intervalle d'actualisation</p>
              <p className="text-[11px]" style={{ color: "rgba(148,163,184,0.5)" }}>Fréquence de mise à jour des données</p>
            </div>
            <select
              value={settings.refreshInterval}
              onChange={(e) => update("refreshInterval", e.target.value)}
              className="px-3 py-1.5 rounded-lg text-[11px] font-mono outline-none"
              style={{ background: "rgba(255,255,255,0.06)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.2)" }}
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
        <p className="font-display font-600 text-sm text-white mb-1">Seuils hydrologiques — Station LUB-001</p>
        <p className="text-[11px] mb-4" style={{ color: "rgba(148,163,184,0.5)" }}>
          Ces seuils définissent les niveaux de vigilance, d'alerte et de danger pour la rivière Lubi.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { key: "seuil_normal" as const, label: "Seuil normal", color: "#10b981", unit: "m" },
            { key: "seuil_vigilance" as const, label: "Seuil vigilance", color: "#f59e0b", unit: "m" },
            { key: "seuil_alerte" as const, label: "Seuil alerte", color: "#f97316", unit: "m" },
            { key: "seuil_critique" as const, label: "Seuil critique", color: "#ef4444", unit: "m" },
          ].map(({ key, label, color, unit }) => (
            <div key={key} className="p-3 rounded-lg" style={{ background: `${color}0d`, border: `1px solid ${color}25` }}>
              <p className="text-[10px] font-mono uppercase tracking-wider mb-2" style={{ color: `${color}99` }}>
                {label}
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings[key]}
                  onChange={(e) => update(key, e.target.value)}
                  step="0.1"
                  className="w-16 px-2 py-1 rounded font-mono text-sm font-700 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", color, border: `1px solid ${color}40` }}
                />
                <span className="text-[11px] font-mono" style={{ color: `${color}80` }}>{unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-xl p-5" style={card}>
        <p className="font-display font-600 text-sm text-white mb-4">Seuils de navigation</p>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "profondeur_nav_min" as const, label: "Profondeur navigable min.", color: "#10b981" },
            { key: "profondeur_vigilance" as const, label: "Profondeur vigilance", color: "#f59e0b" },
          ].map(({ key, label, color }) => (
            <div key={key} className="p-3 rounded-lg" style={{ background: "rgba(255,255,255,0.02)" }}>
              <p className="text-[11px] mb-2" style={{ color: "rgba(226,232,240,0.7)" }}>{label}</p>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={settings[key]}
                  onChange={(e) => update(key, e.target.value)}
                  step="0.1"
                  className="w-16 px-2 py-1 rounded font-mono text-sm font-700 outline-none"
                  style={{ background: "rgba(255,255,255,0.06)", color, border: `1px solid ${color}40` }}
                />
                <span className="text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.4)" }}>m</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3">
        <button
          className="px-5 py-2.5 rounded-lg text-sm font-600 transition-colors"
          style={{ background: "rgba(255,255,255,0.05)", color: "rgba(148,163,184,0.7)", border: "1px solid rgba(255,255,255,0.08)" }}
        >
          Réinitialiser
        </button>
        <button
          className="px-5 py-2.5 rounded-lg text-sm font-600 transition-colors"
          style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "white" }}
        >
          Enregistrer les paramètres
        </button>
      </div>
    </div>
  );
}
