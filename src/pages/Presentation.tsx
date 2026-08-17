import ZoneEtudePanel from "../components/ZoneEtudePanel";
import { useHydroSource } from "../context/HydroSourceContext";

export default function Presentation() {
  const { bundle } = useHydroSource();

  if (bundle.mode !== "lubi") {
    return (
      <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
        <div
          className="rounded-xl p-5"
          style={{
            background: "rgba(15,36,68,0.7)",
            border: "1px solid rgba(34,211,238,0.1)",
          }}
        >
          <p className="font-display font-600 text-white mb-1">Présentation du territoire</p>
          <p className="text-sm" style={{ color: "rgba(148,163,184,0.7)" }}>
            Cette page décrit le bassin de la Lubi. Revenez à la source Lubi dans Paramètres pour l’afficher.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-screen-2xl mx-auto">
      <ZoneEtudePanel />
    </div>
  );
}
