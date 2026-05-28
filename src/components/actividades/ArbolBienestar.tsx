"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Tipos ─────────────────────────────────────────────────────────────────────
type Categoria = "hoja" | "flor" | "fruto";

interface Elemento {
  id: number;
  categoria: Categoria;
  color: string;
  explicacion: string;
  posIndex: number; // índice de posición en el árbol
}

// ─── Posiciones de las puntas de las ramas (x, y en viewBox 500x440) ──────────
const POSICIONES = [
  { x: 250, y: 72 },  // 0 - cima
  { x: 163, y: 112 }, // 1 - arriba izq
  { x: 337, y: 112 }, // 2 - arriba der
  { x: 92, y: 152 }, // 3 - medio-alto izq
  { x: 408, y: 152 }, // 4 - medio-alto der
  { x: 45, y: 200 }, // 5 - lateral izq
  { x: 455, y: 200 }, // 6 - lateral der
  { x: 188, y: 200 }, // 7 - medio izq
  { x: 312, y: 200 }, // 8 - medio der
  { x: 110, y: 258 }, // 9 - bajo izq
  { x: 390, y: 258 }, // 10 - bajo der
  { x: 60, y: 238 }, // 11 - muy lateral izq
  { x: 440, y: 238 }, // 12 - muy lateral der
];

// ─── Ícono Hoja ───────────────────────────────────────────────────────────────
function Hoja({ color, size = 30 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.2} viewBox="0 0 30 36">
      <path d="M15 2 C 5 4 2 14 4 24 C 6 32 10 34 15 34 C 20 34 24 32 26 24 C 28 14 25 4 15 2 Z"
        fill={color} />
      <line x1="15" y1="34" x2="15" y2="8" stroke="white" strokeWidth="1.3" strokeOpacity="0.55" />
      <line x1="15" y1="22" x2="9" y2="16" stroke="white" strokeWidth="0.9" strokeOpacity="0.4" />
      <line x1="15" y1="24" x2="21" y2="18" stroke="white" strokeWidth="0.9" strokeOpacity="0.4" />
      <line x1="15" y1="16" x2="10" y2="11" stroke="white" strokeWidth="0.7" strokeOpacity="0.35" />
      <line x1="15" y1="18" x2="20" y2="13" stroke="white" strokeWidth="0.7" strokeOpacity="0.35" />
    </svg>
  );
}

// ─── Ícono Flor ───────────────────────────────────────────────────────────────
function Flor({ color, size = 34 }: { color: string; size?: number }) {
  const petalos = Array.from({ length: 6 }, (_, i) => {
    const angle = (i * 60 - 90) * (Math.PI / 180);
    return { cx: 17 + Math.cos(angle) * 8, cy: 17 + Math.sin(angle) * 8 };
  });
  return (
    <svg width={size} height={size} viewBox="0 0 34 34">
      {petalos.map((p, i) => (
        <ellipse key={i} cx={p.cx} cy={p.cy} rx="6" ry="4"
          transform={`rotate(${i * 60} ${p.cx} ${p.cy})`}
          fill={color} opacity="0.92" />
      ))}
      <circle cx="17" cy="17" r="5.5" fill="#FFF0A0" />
      <circle cx="17" cy="17" r="3" fill="#FFD700" />
      <circle cx="15" cy="15" r="1" fill="white" opacity="0.5" />
    </svg>
  );
}

// ─── Ícono Fruto ──────────────────────────────────────────────────────────────
function Fruto({ color, size = 28 }: { color: string; size?: number }) {
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 28 32">
      {/* Tallo */}
      <path d="M14 6 Q 17 2 21 4" stroke="#6B9E5E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      {/* Cuerpo */}
      <ellipse cx="14" cy="19" rx="11" ry="12" fill={color} />
      {/* Línea central */}
      <path d="M14 8 Q 13 14 14 30" stroke="rgba(0,0,0,0.1)" strokeWidth="1.5" fill="none" />
      {/* Brillo */}
      <ellipse cx="9" cy="14" rx="3.5" ry="5.5" fill="white" opacity="0.22"
        transform="rotate(-20 9 14)" />
    </svg>
  );
}

// ─── Componente Elemento en el árbol ─────────────────────────────────────────
function ElementoArbol({ el, isNew }: { el: Elemento; isNew: boolean }) {
  const pos = POSICIONES[el.posIndex % POSICIONES.length];

  return (
    <motion.g
      initial={isNew ? { scale: 0, opacity: 0 } : { scale: 1, opacity: 1 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 260, damping: 18, duration: 0.6 }}
    >
      <foreignObject
        x={pos.x - 18}
        y={pos.y - 20}
        width="36"
        height="40"
        overflow="visible"
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", height: "100%" }}>
          {el.categoria === "hoja" && <Hoja color={el.color} size={28} />}
          {el.categoria === "flor" && <Flor color={el.color} size={32} />}
          {el.categoria === "fruto" && <Fruto color={el.color} size={26} />}
        </div>
      </foreignObject>
    </motion.g>
  );
}

// ─── SVG del Árbol (ramas y tronco) ──────────────────────────────────────────
function ArbolSVG({ elementos }: { elementos: Elemento[] }) {
  const newId = elementos.length > 0 ? elementos[elementos.length - 1].id : -1;

  return (
    <svg viewBox="0 0 500 440" className="w-full" style={{ maxHeight: 400 }}>
      {/* Tronco */}
      <path d="M250 435 C 248 410 252 385 250 355 C 248 325 252 295 250 265"
        stroke="#8B6914" strokeWidth="18" fill="none" strokeLinecap="round" />
      <path d="M250 435 C 248 410 252 385 250 355 C 248 325 252 295 250 265"
        stroke="#A07830" strokeWidth="12" fill="none" strokeLinecap="round" />

      {/* Ramas principales nivel 1 */}
      <path d="M250 355 Q 200 330 155 300 Q 120 276 92 252" stroke="#7A5C10" strokeWidth="10" fill="none" strokeLinecap="round" />
      <path d="M250 355 Q 300 330 345 300 Q 380 276 408 252" stroke="#7A5C10" strokeWidth="10" fill="none" strokeLinecap="round" />

      {/* Ramas nivel 2 */}
      <path d="M250 310 Q 215 282 190 252 Q 170 225 163 208" stroke="#7A5C10" strokeWidth="7" fill="none" strokeLinecap="round" />
      <path d="M250 310 Q 285 282 310 252 Q 330 225 337 208" stroke="#7A5C10" strokeWidth="7" fill="none" strokeLinecap="round" />

      {/* Ramas nivel 3 */}
      <path d="M250 270 Q 230 240 215 210 Q 200 182 188 165" stroke="#8B6914" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M250 270 Q 270 240 285 210 Q 300 182 312 165" stroke="#8B6914" strokeWidth="5" fill="none" strokeLinecap="round" />
      <path d="M250 265 Q 248 230 249 200 Q 250 170 250 138" stroke="#8B6914" strokeWidth="5" fill="none" strokeLinecap="round" />

      {/* Sub-ramas izquierda */}
      <path d="M92 252 Q 70 242 45 225" stroke="#8B6914" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M92 252 Q 76 228 60 205" stroke="#8B6914" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Sub-ramas derecha */}
      <path d="M408 252 Q 430 242 455 225" stroke="#8B6914" strokeWidth="4" fill="none" strokeLinecap="round" />
      <path d="M408 252 Q 424 228 440 205" stroke="#8B6914" strokeWidth="3" fill="none" strokeLinecap="round" />

      {/* Sub-sub izq */}
      <path d="M163 208 Q 140 172 92 130" stroke="#8B6914" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M188 165 Q 170 138 163 112" stroke="#8B6914" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Sub-sub der */}
      <path d="M337 208 Q 360 172 408 130" stroke="#8B6914" strokeWidth="3" fill="none" strokeLinecap="round" />
      <path d="M312 165 Q 330 138 337 112" stroke="#8B6914" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Rama cima */}
      <path d="M250 138 Q 248 108 250 72" stroke="#8B6914" strokeWidth="2.5" fill="none" strokeLinecap="round" />

      {/* Pasto */}
      <ellipse cx="250" cy="438" rx="120" ry="10" fill="#9DC98A" opacity="0.5" />

      {/* Elementos del árbol */}
      {elementos.map((el) => (
        <ElementoArbol key={el.id} el={el} isNew={el.id === newId} />
      ))}
    </svg>
  );
}

// ─── Leyenda ──────────────────────────────────────────────────────────────────
function Leyenda({ conteo }: { conteo: Record<Categoria, number> }) {
  return (
    <div className="flex gap-4 justify-center flex-wrap">
      {[
        { tipo: "hoja" as Categoria, label: "Hojas", emoji: "🌿", desc: "Reflexiones", color: "#A8D5A2" },
        { tipo: "flor" as Categoria, label: "Flores", emoji: "🌸", desc: "Logros", color: "#F9C6D0" },
        { tipo: "fruto" as Categoria, label: "Frutos", emoji: "🍊", desc: "Metas", color: "#FFB347" },
      ].map(({ tipo, label, emoji, desc, color }) => (
        <div key={tipo} className="flex items-center gap-2 bg-white/70 rounded-full px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm">
          <span>{emoji}</span>
          <span style={{ color }}>{label}</span>
          <span className="text-gray-400">{desc}</span>
          <span className="bg-gray-100 rounded-full px-2 py-0.5 font-bold text-gray-700">
            {conteo[tipo]}
          </span>
        </div>
      ))}
    </div>
  );
}

// ─── Componente Principal ─────────────────────────────────────────────────────
let globalId = 1;

export default function ArbolBienestar() {
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [elementos, setElementos] = useState<Elemento[]>([]);
  const [ultimaFrase, setUltimaFrase] = useState<{ texto: string; categoria: Categoria } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const conteo: Record<Categoria, number> = {
    hoja: elementos.filter((e) => e.categoria === "hoja").length,
    flor: elementos.filter((e) => e.categoria === "flor").length,
    fruto: elementos.filter((e) => e.categoria === "fruto").length,
  };

  const handleEnviar = async () => {
    if (!input.trim() || cargando) return;
    const entradaEstudiante = input.trim();
    setCargando(true);
    setError(null);

    try {
      const res = await fetch("/api/arbol-bienestar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pensamiento: entradaEstudiante }),
      });
      const data = await res.json();

      const nuevo: Elemento = {
        id: globalId++,
        categoria: data.categoria as Categoria,
        color: data.color ?? "#A8D5A2",
        explicacion: data.explicacion_corta ?? "",
        posIndex: elementos.length % POSICIONES.length,
      };

      setElementos((prev) => [...prev, nuevo]);
      setUltimaFrase({ texto: data.explicacion_corta, categoria: data.categoria });
      setInput("");

      const params = new URLSearchParams(window.location.search);
      const payload = {
        type: "BIENESTAR_ACTIVIDAD_INTERACCION",
        actividad: "arbol-bienestar",
        timestamp: new Date().toISOString(),
        asignacionId: params.get("asignacionId"),
        intentoId: params.get("intentoId"),
        estudianteId: params.get("estudianteId"),
        datos: {
          entrada_estudiante: entradaEstudiante,
          respuesta_ia: {
            categoria: data.categoria,
            color: data.color ?? "#A8D5A2",
            mensaje: data.explicacion_corta ?? "",
          },
        },
      };

      if (window.parent !== window) {
        window.parent.postMessage(payload, "*");
      }

      console.log("[Bienestar] Interaccion enviada:", payload);
    } catch {
      setError("No se pudo conectar con la IA. Intenta de nuevo.");
    } finally {
      setCargando(false);
    }
  };

  const handleReset = () => {
    setElementos([]);
    setUltimaFrase(null);
  };

  const categoriaLabel: Record<Categoria, string> = {
    hoja: "🌿 Reflexión del día",
    flor: "🌸 Logro o alegría",
    fruto: "🍊 Meta cumplida",
  };

  return (
    <div
      className="relative w-full rounded-2xl overflow-hidden flex flex-col"
      style={{
        background: "linear-gradient(180deg, #e8f5e1 0%, #f5faf0 40%, #fef9f0 100%)",
        minHeight: 560,
      }}
    >
      {/* Cielo decorativo */}
      <div className="absolute top-0 left-0 right-0 h-24 pointer-events-none"
        style={{ background: "linear-gradient(180deg, #daeef8 0%, transparent 100%)" }} />
      <div className="absolute top-3 left-8 text-lg opacity-40">☁️</div>
      <div className="absolute top-5 right-16 text-xl opacity-30">☁️</div>
      <div className="absolute top-2 right-40 text-sm opacity-25">☁️</div>

      {/* Árbol */}
      <div className="flex-1 px-4 pt-4 pb-2">
        <ArbolSVG elementos={elementos} />
      </div>

      {/* Mensaje de la IA */}
      <AnimatePresence mode="wait">
        {ultimaFrase && (
          <motion.div
            key={ultimaFrase.texto}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
            className="mx-4 mb-3 px-4 py-3 rounded-xl bg-white/70 backdrop-blur-sm border border-white shadow-sm text-center"
          >
            <p className="text-xs font-semibold text-gray-400 mb-1">
              {categoriaLabel[ultimaFrase.categoria]}
            </p>
            <p className="text-sm font-bold text-gray-700 italic">
              &quot;{ultimaFrase.texto}&quot;
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Leyenda */}
      {elementos.length > 0 && (
        <div className="px-4 mb-3">
          <Leyenda conteo={conteo} />
        </div>
      )}

      {/* Estado vacío */}
      {elementos.length === 0 && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none"
          style={{ paddingBottom: 140, paddingTop: 20 }}>
          <p className="text-gray-400 text-sm text-center px-10 leading-relaxed">
            🌱 Comparte un pensamiento o logro del día<br />
            y mira cómo crece tu árbol de bienestar
          </p>
        </div>
      )}

      {/* Input */}
      <div className="px-4 pb-4 bg-white/50 backdrop-blur-md border-t border-white/70">
        {error && <p className="text-red-400 text-xs text-center pt-2">{error}</p>}
        <div className="flex gap-2 pt-3 max-w-lg mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleEnviar()}
            placeholder="¿Qué lograste hoy? ¿Cómo te sientes? ¿Qué aprendiste?"
            className="flex-1 px-4 py-2.5 rounded-full border border-green-200 bg-white/90 text-sm focus:outline-none focus:ring-2 focus:ring-green-300 text-gray-700 placeholder-gray-400"
            disabled={cargando}
          />
          <button
            onClick={handleEnviar}
            disabled={cargando || !input.trim()}
            className="px-5 py-2.5 rounded-full text-white text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{ background: "linear-gradient(135deg, #6BAF70, #4A9050)" }}
          >
            {cargando ? (
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : "✦ Agregar"}
          </button>
          {elementos.length > 0 && (
            <button onClick={handleReset}
              className="px-3 py-2.5 rounded-full text-gray-400 text-xs hover:text-red-400 hover:bg-red-50 transition-colors border border-gray-200 bg-white/80">
              Reiniciar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
