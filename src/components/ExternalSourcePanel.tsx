import { useState } from "react";
import { ONLINE_PRESETS } from "../data/hydroTypes";
import { fetchOnlineUrl, fetchOpenMeteoFlood, parseExcelToSeries } from "../data/parseExternal";
import { useHydroSource } from "../context/HydroSourceContext";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

export default function ExternalSourcePanel() {
  const { bundle, activateLubi, activateSeries, loading } = useHydroSource();
  const [open, setOpen] = useState(bundle.mode !== "lubi");
  const [tab, setTab] = useState<"excel" | "online">(bundle.mode === "excel" ? "excel" : "online");
  const [riverName, setRiverName] = useState(bundle.mode === "lubi" ? "Oubangui" : bundle.riverName);
  const [lat, setLat] = useState(String(ONLINE_PRESETS[0].lat));
  const [lon, setLon] = useState(String(ONLINE_PRESETS[0].lon));
  const [url, setUrl] = useState("");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(null);

  const run = async (fn: () => Promise<void>) => {
    setBusy(true);
    setMsg(null);
    try {
      await fn();
      setMsg({ type: "ok", text: "Source activée. La Lubi reste disponible via « Revenir à la Lubi »." });
    } catch (e) {
      setMsg({ type: "err", text: e instanceof Error ? e.message : "Échec du chargement" });
    } finally {
      setBusy(false);
    }
  };

  const onExcel = (file: File | undefined) => {
    if (!file) return;
    const la = Number(lat.replace(",", "."));
    const lo = Number(lon.replace(",", "."));
    if (!Number.isFinite(la) || !Number.isFinite(lo)) {
      setMsg({ type: "err", text: "Latitude / longitude invalides (point de carte)." });
      return;
    }
    void run(async () => {
      const buf = await file.arrayBuffer();
      const series = parseExcelToSeries(buf, file.name, riverName, la, lo);
      await activateSeries(series);
    });
  };

  const onPreset = (id: string) => {
    const p = ONLINE_PRESETS.find((x) => x.id === id);
    if (!p) return;
    setRiverName(p.name.split("—")[0].trim());
    setLat(String(p.lat));
    setLon(String(p.lon));
  };

  return (
    <div className="rounded-xl p-5" style={{ ...card, border: "1px dashed rgba(34,211,238,0.25)" }}>
      <button type="button" className="w-full flex items-center justify-between text-left" onClick={() => setOpen((v) => !v)}>
        <div>
          <p className="text-[10px] font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(148,163,184,0.45)" }}>
            Option avancée
          </p>
          <p className="font-display font-600 text-sm text-white">Autre rivière / source externe</p>
          <p className="text-[11px] mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>
            La Lubi reste la source principale. Vous pouvez charger un Excel ou un débit en ligne (ex. Oubangui).
          </p>
        </div>
        <span className="font-mono text-lg" style={{ color: "#22d3ee" }}>{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="mt-4 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="text-[10px] font-mono px-2 py-1 rounded"
              style={{
                background: bundle.mode === "lubi" ? "rgba(16,185,129,0.12)" : "rgba(245,158,11,0.12)",
                color: bundle.mode === "lubi" ? "#10b981" : "#f59e0b",
              }}
            >
              Actif : {bundle.riverName} · {bundle.sourceLabel}
            </span>
            {bundle.mode !== "lubi" && (
              <button
                type="button"
                onClick={() => void activateLubi()}
                className="text-[11px] font-mono px-2.5 py-1 rounded-lg"
                style={{ background: "rgba(34,211,238,0.1)", color: "#22d3ee" }}
              >
                Revenir à la Lubi
              </button>
            )}
          </div>

          <div className="flex gap-2">
            {(["excel", "online"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className="px-3 py-1.5 rounded-lg text-[11px] font-mono font-600"
                style={{
                  background: tab === t ? "rgba(34,211,238,0.15)" : "rgba(255,255,255,0.04)",
                  color: tab === t ? "#22d3ee" : "#94a3b8",
                  border: tab === t ? "1px solid rgba(34,211,238,0.3)" : "1px solid transparent",
                }}
              >
                {t === "excel" ? "Fichier Excel" : "Données en ligne"}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <label className="block">
              <p className="text-[11px] mb-1" style={{ color: "rgba(148,163,184,0.6)" }}>Nom de la rivière</p>
              <input
                value={riverName}
                onChange={(e) => setRiverName(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-sm font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(34,211,238,0.2)" }}
              />
            </label>
            <label className="block">
              <p className="text-[11px] mb-1" style={{ color: "rgba(148,163,184,0.6)" }}>Latitude</p>
              <input
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-sm font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(34,211,238,0.2)" }}
              />
            </label>
            <label className="block">
              <p className="text-[11px] mb-1" style={{ color: "rgba(148,163,184,0.6)" }}>Longitude</p>
              <input
                value={lon}
                onChange={(e) => setLon(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg text-sm font-mono outline-none"
                style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(34,211,238,0.2)" }}
              />
            </label>
          </div>

          {tab === "excel" ? (
            <div>
              <p className="text-[11px] mb-2" style={{ color: "rgba(148,163,184,0.55)" }}>
                1re feuille (ou feuille Qsim) : colonne Date + colonnes de débit en m³/s. Colonne Junction / Jonction optionnelle.
              </p>
              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                disabled={busy || loading}
                onChange={(e) => {
                  onExcel(e.target.files?.[0]);
                  e.target.value = "";
                }}
                className="text-[11px] font-mono"
                style={{ color: "#94a3b8" }}
              />
            </div>
          ) : (
            <div className="space-y-3">
              <div>
                <p className="text-[11px] mb-2" style={{ color: "rgba(148,163,184,0.55)" }}>
                  Débit journalier GloFAS via Open-Meteo (point le plus proche du cours d’eau).
                </p>
                <div className="flex flex-wrap gap-1.5 mb-2">
                  {ONLINE_PRESETS.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => onPreset(p.id)}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono"
                      style={{ background: "rgba(255,255,255,0.05)", color: "#e2e8f0", border: "1px solid rgba(255,255,255,0.08)" }}
                    >
                      {p.name}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => {
                    const la = Number(lat.replace(",", "."));
                    const lo = Number(lon.replace(",", "."));
                    if (!Number.isFinite(la) || !Number.isFinite(lo)) {
                      setMsg({ type: "err", text: "Latitude / longitude invalides." });
                      return;
                    }
                    void run(async () => {
                      const series = await fetchOpenMeteoFlood(la, lo, riverName || "Rivière");
                      await activateSeries(series);
                    });
                  }}
                  className="px-4 py-2 rounded-lg text-sm font-600"
                  style={{ background: "linear-gradient(135deg, #06b6d4, #0891b2)", color: "white", opacity: busy ? 0.6 : 1 }}
                >
                  {busy ? "Chargement…" : "Charger le débit en ligne"}
                </button>
              </div>
              <div>
                <p className="text-[11px] mb-1" style={{ color: "rgba(148,163,184,0.55)" }}>
                  Ou URL JSON / CSV (date + q). Peut échouer si le serveur bloque CORS.
                </p>
                <div className="flex gap-2">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://…"
                    className="flex-1 px-3 py-1.5 rounded-lg text-sm font-mono outline-none"
                    style={{ background: "rgba(255,255,255,0.06)", color: "#e2e8f0", border: "1px solid rgba(34,211,238,0.2)" }}
                  />
                  <button
                    type="button"
                    disabled={busy || !url.trim()}
                    onClick={() => {
                      const la = Number(lat.replace(",", ".")) || 0;
                      const lo = Number(lon.replace(",", ".")) || 0;
                      void run(async () => {
                        const series = await fetchOnlineUrl(url.trim(), riverName || "Rivière", la, lo);
                        await activateSeries(series);
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg text-[11px] font-mono"
                    style={{ background: "rgba(34,211,238,0.1)", color: "#22d3ee" }}
                  >
                    Importer
                  </button>
                </div>
              </div>
            </div>
          )}

          {msg && (
            <p
              className="text-[12px] px-3 py-2 rounded-lg"
              style={{
                background: msg.type === "ok" ? "rgba(16,185,129,0.12)" : "rgba(239,68,68,0.12)",
                color: msg.type === "ok" ? "#10b981" : "#fca5a5",
              }}
            >
              {msg.text}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
