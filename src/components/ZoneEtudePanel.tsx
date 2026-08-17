import { useCallback, useEffect, useState } from "react";
import {
  TERRITOIRE_FAITS,
  TERRITOIRE_PARAGRAPHES,
  TERRITOIRE_PHOTOS,
} from "../data/territoireLubi";

const card = {
  background: "rgba(15,36,68,0.7)",
  border: "1px solid rgba(34,211,238,0.1)",
  borderRadius: 12,
};

function PhotoLightbox({
  index,
  onClose,
  onPrev,
  onNext,
}: {
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const photo = TERRITOIRE_PHOTOS[index];

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") onPrev();
      if (e.key === "ArrowRight") onNext();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, onNext, onPrev]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(4,10,20,0.88)" }}
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={photo.alt}
    >
      <div className="relative w-full max-w-4xl" onClick={(e) => e.stopPropagation()}>
        <img
          src={photo.src}
          alt={photo.alt}
          className="w-full max-h-[72vh] object-contain rounded-lg"
          style={{ background: "#071223" }}
        />
        <p className="mt-3 text-sm" style={{ color: "rgba(226,232,240,0.85)" }}>
          {photo.caption}
        </p>
        <p className="mt-1 text-[11px] font-mono" style={{ color: "rgba(148,163,184,0.5)" }}>
          {index + 1} / {TERRITOIRE_PHOTOS.length} · bassin de la Lubi
        </p>
        <button
          type="button"
          onClick={onClose}
          className="absolute -top-10 right-0 text-sm"
          style={{ color: "rgba(226,232,240,0.7)" }}
        >
          Fermer ✕
        </button>
        <button
          type="button"
          onClick={onPrev}
          className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-3 w-9 h-9 rounded-full text-lg"
          style={{ background: "rgba(7,18,35,0.9)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.3)" }}
          aria-label="Photo précédente"
        >
          ‹
        </button>
        <button
          type="button"
          onClick={onNext}
          className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-3 w-9 h-9 rounded-full text-lg"
          style={{ background: "rgba(7,18,35,0.9)", color: "#22d3ee", border: "1px solid rgba(34,211,238,0.3)" }}
          aria-label="Photo suivante"
        >
          ›
        </button>
      </div>
    </div>
  );
}

export default function ZoneEtudePanel() {
  const [open, setOpen] = useState<number | null>(null);

  const onPrev = useCallback(() => {
    setOpen((i) => (i == null ? i : (i + TERRITOIRE_PHOTOS.length - 1) % TERRITOIRE_PHOTOS.length));
  }, []);
  const onNext = useCallback(() => {
    setOpen((i) => (i == null ? i : (i + 1) % TERRITOIRE_PHOTOS.length));
  }, []);

  return (
    <div className="rounded-xl p-5" style={card}>
      <div className="mb-4">
        <p className="text-[11px] font-mono uppercase tracking-widest mb-1" style={{ color: "rgba(34,211,238,0.7)" }}>
          Territoire
        </p>
        <h2 className="font-display font-600 text-lg text-white">Zone d’étude — rivière Lubi</h2>
        <p className="text-[11px] mt-0.5" style={{ color: "rgba(148,163,184,0.5)" }}>
          Kasaï Oriental · Sankuru · Kasaï Central · RDC
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-2 mb-4">
        {TERRITOIRE_FAITS.map((f) => (
          <div
            key={f.label}
            className="px-2.5 py-2 rounded-lg"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(34,211,238,0.1)" }}
          >
            <p className="text-[9px] font-mono uppercase tracking-wider" style={{ color: "rgba(148,163,184,0.5)" }}>
              {f.label}
            </p>
            <p className="text-[11px] font-600 mt-0.5" style={{ color: "#e2e8f0" }}>{f.value}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 mb-5">
        {TERRITOIRE_PARAGRAPHES.map((p) => (
          <p key={p.slice(0, 40)} className="text-sm leading-relaxed" style={{ color: "rgba(226,232,240,0.78)" }}>
            {p}
          </p>
        ))}
      </div>

      <p className="text-[11px] font-mono uppercase tracking-widest mb-2.5" style={{ color: "rgba(148,163,184,0.5)" }}>
        Images du territoire
      </p>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-2.5">
        {TERRITOIRE_PHOTOS.map((p, i) => (
          <button
            key={p.src}
            type="button"
            onClick={() => setOpen(i)}
            className="group overflow-hidden rounded-lg text-left"
            style={{ border: "1px solid rgba(34,211,238,0.12)", background: "#071223" }}
          >
            <img
              src={p.src}
              alt={p.alt}
              className="w-full h-28 md:h-32 object-cover transition-transform group-hover:scale-[1.03]"
            />
            <p className="px-2 py-1.5 text-[10px] leading-snug" style={{ color: "rgba(148,163,184,0.7)" }}>
              {p.caption}
            </p>
          </button>
        ))}
      </div>

      {open != null && (
        <PhotoLightbox index={open} onClose={() => setOpen(null)} onPrev={onPrev} onNext={onNext} />
      )}
    </div>
  );
}
