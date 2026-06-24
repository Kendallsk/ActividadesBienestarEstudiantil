"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Poppins } from "next/font/google";
import { notifyActivityReady } from "../../lib/activity-events";

// ─────────────────────────────────────────────────────────────
// FUENTE
// ─────────────────────────────────────────────────────────────

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// ─────────────────────────────────────────────────────────────
// TIPOS
// ─────────────────────────────────────────────────────────────

interface Burbuja {
  id: number;
  color: string;
  mensaje: string;
  tipo: "positivo" | "negativo";
  size: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
}

interface Particula {
  id: number;
  x: number;
  y: number;
  color: string;
  vx: number;
  vy: number;
  life: number;
  size: number;
}

// ─────────────────────────────────────────────────────────────
// BURBUJA VISUAL
// ─────────────────────────────────────────────────────────────

function BurbujaVisual({
  burbuja,
  onExplode,
}: {
  burbuja: Burbuja;
  onExplode: (id: number) => void;
}) {
  const gradId = `grad-${burbuja.id}`;
  const s = burbuja.size;

  return (
    <motion.div
      animate={{
        y: [0, -6, 0],
        rotate: [0, 1, -1, 0],
      }}
      transition={{
        repeat: Infinity,
        duration: 4,
        ease: "easeInOut",
      }}
      whileHover={{
        scale: 1.05,
      }}
      className="absolute select-none"
      style={{
        left: `${burbuja.x}%`,
        top: `${burbuja.y}%`,
        width: s,
        height: s,
        transform: "translate(-50%, -50%)",
        zIndex: 10,
        cursor: burbuja.tipo === "positivo" ? "pointer" : "default",
        pointerEvents: burbuja.tipo === "positivo" ? "auto" : "none",
        filter:
          burbuja.tipo === "positivo"
            ? "drop-shadow(0 0 18px rgba(255,255,255,0.8))"
            : "drop-shadow(0 0 10px rgba(0,0,0,0.35))",
      }}
      onClick={() => burbuja.tipo === "positivo" && onExplode(burbuja.id)}
    >
      <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`}>
        <defs>
          <radialGradient id={gradId} cx="35%" cy="30%" r="65%">
            <stop offset="0%" stopColor="white" stopOpacity="0.95" />
            <stop
              offset="30%"
              stopColor={burbuja.color}
              stopOpacity="0.5"
            />
            <stop
              offset="100%"
              stopColor={burbuja.color}
              stopOpacity="0.9"
            />
          </radialGradient>
        </defs>

        <circle
          cx={s / 2}
          cy={s / 2}
          r={s / 2 - 2}
          fill={`url(#${gradId})`}
          stroke={burbuja.color}
          strokeWidth="1.5"
          strokeOpacity="0.4"
          style={{
            backdropFilter: "blur(12px)",
          }}
        />

        <ellipse
          cx={s * 0.38}
          cy={s * 0.28}
          rx={s * 0.14}
          ry={s * 0.08}
          fill="white"
          opacity="0.75"
        />

        <circle
          cx={s * 0.6}
          cy={s * 0.42}
          r={s * 0.04}
          fill="white"
          opacity="0.5"
        />
      </svg>

      {/* TEXTO */}
      <div
        className="absolute inset-0 flex items-center justify-center text-center"
        style={{
          padding: s * 0.14,
          pointerEvents: "none",
        }}
      >
        <p
          style={{
            fontSize: Math.max(10, s * 0.095),
            color: "#0a0a0aff",
            fontWeight: 600,
            lineHeight: 1.35,
            textShadow: "0 2px 10px rgba(0,0,0,0.35)",
            maxWidth: "100%",
            maxHeight: "100%",
            overflow: "hidden",
            display: "-webkit-box",
            WebkitLineClamp: 5,
            WebkitBoxOrient: "vertical",
            wordBreak: "break-word",
          }}
        >
          {burbuja.mensaje}
        </p>
      </div>
    </motion.div>
  );
}

// ─────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────

export default function BurbujasEmocionales() {
  const [input, setInput] = useState("");
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [energia, setEnergia] = useState(100);

  const [mousePos, setMousePos] = useState({
    x: 0,
    y: 0,
  });

  const [respuestaIA, setRespuestaIA] = useState("");

  const bubblesRef = useRef<Burbuja[]>([]);
  const particulasRef = useRef<Particula[]>([]);
  const nextId = useRef(1);
  const animRef = useRef<number | null>(null);

  const explosionesPendientes = useRef<
    { x: number; y: number; color: string }[]
  >([]);

  const [, setRenderTick] = useState(0);

  const forceRender = () => {
    setRenderTick((n) => n + 1);
  };

  // ─────────────────────────────────────────────────────────────
  // LOOP ANIMACIÓN
  // ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const tick = () => {
      let changed = false;

      while (explosionesPendientes.current.length > 0) {
        const exp = explosionesPendientes.current.pop()!;

        const nuevas: Particula[] = Array.from(
          { length: 24 },
          (_, i) => ({
            id: Date.now() + i + Math.random() * 1000,
            x: exp.x,
            y: exp.y,
            color: exp.color,
            vx: (Math.random() - 0.5) * 2.2,
            vy: (Math.random() - 0.5) * 2.2,
            size: 4 + Math.random() * 8,
            life: 1,
          })
        );

        particulasRef.current = [
          ...particulasRef.current,
          ...nuevas,
        ];

        changed = true;
      }

      // MOVER BURBUJAS
      const toRemove: number[] = [];

      bubblesRef.current = bubblesRef.current.map((b) => {
        if (b.tipo === "negativo") {
          const newY = b.y - b.vy;

          if (newY < -12) {
            explosionesPendientes.current.push({
              x: b.x,
              y: 5,
              color: b.color,
            });

            toRemove.push(b.id);

            setEnergia((e) => Math.max(0, e - 5));

            changed = true;

            return b;
          }

          changed = true;

          return {
            ...b,
            y: newY,
          };
        } else {
          let nx = b.x + b.vx;
          let ny = b.y + b.vy;

          let nvx = b.vx;
          let nvy = b.vy;

          if (nx < 5 || nx > 95) nvx = -nvx;
          if (ny < 8 || ny > 88) nvy = -nvy;

          nx = Math.max(5, Math.min(95, nx));
          ny = Math.max(8, Math.min(88, ny));

          changed = true;

          return {
            ...b,
            x: nx,
            y: ny,
            vx: nvx,
            vy: nvy,
          };
        }
      });

      if (toRemove.length > 0) {
        bubblesRef.current = bubblesRef.current.filter(
          (b) => !toRemove.includes(b.id)
        );
      }

      // PARTÍCULAS
      if (particulasRef.current.length > 0) {
        particulasRef.current = particulasRef.current
          .map((p) => ({
            ...p,
            x: p.x + p.vx,
            y: p.y + p.vy,
            vy: p.vy + 0.02,
            life: p.life - 0.02,
          }))
          .filter((p) => p.life > 0);

        changed = true;
      }

      if (changed) forceRender();

      animRef.current = requestAnimationFrame(tick);
    };

    animRef.current = requestAnimationFrame(tick);

    return () => {
      if (animRef.current) {
        cancelAnimationFrame(animRef.current);
      }
    };
  }, []);

  // ─────────────────────────────────────────────────────────────
  // EXPLOTAR BURBUJA
  // ─────────────────────────────────────────────────────────────

  const explotarBurbuja = (id: number) => {
    const b = bubblesRef.current.find((b) => b.id === id);

    if (!b) return;

    explosionesPendientes.current.push({
      x: b.x,
      y: b.y,
      color: b.color,
    });

    bubblesRef.current = bubblesRef.current.filter(
      (bb) => bb.id !== id
    );

    setEnergia((e) => Math.min(100, e + 5));

    const audio = new Audio("/sounds/pop.mp3");
    audio.volume = 0.25;
    audio.play().catch(() => { });

    forceRender();
  };

  // ─────────────────────────────────────────────────────────────
  // ENVIAR
  // ─────────────────────────────────────────────────────────────

  const handleEnviar = async () => {
    if (!input.trim() || cargando) return;
    const entradaEstudiante = input.trim();

    setCargando(true);
    setError(null);

    try {
      const res = await fetch("/api/burbujas-emocionales", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          sentimiento: entradaEstudiante,
        }),
      });

      const data = await res.json();

      const esNegativo =
        data.sentimiento !== "positivo";

      const size = 100 + Math.random() * 40;

      const nueva: Burbuja = {
        id: nextId.current++,
        color: data.color ?? "#9ad0ff",
        mensaje: data.mensaje ?? "",
        tipo: esNegativo ? "negativo" : "positivo",
        size,
        x: 15 + Math.random() * 70,
        y: esNegativo
          ? 92
          : 40 + Math.random() * 40,

        vx: (Math.random() - 0.5) * 0.12,

        vy: esNegativo
          ? 0.08 + Math.random() * 0.06
          : (Math.random() < 0.5 ? 1 : -1) *
          (0.05 + Math.random() * 0.08),
      };

      bubblesRef.current = [
        ...bubblesRef.current,
        nueva,
      ];

      setRespuestaIA(
        esNegativo
          ? "Respira profundo 💙 Deja que esa emoción se libere lentamente."
          : "Qué bonito sentimiento ✨ Sigue cultivando esa energía positiva."
      );

      const audio = new Audio("/sounds/bubble.mp3");
      audio.volume = 0.2;
      audio.play().catch(() => { });

      forceRender();

      setInput("");

      notifyActivityReady({
        reason: "respuesta_ia_generada",
        datos: {
          entrada_estudiante: entradaEstudiante,
          respuesta_ia: {
            sentimiento: data.sentimiento,
            color: data.color ?? "#9ad0ff",
            mensaje: data.mensaje ?? "",
            tipo_visual: esNegativo ? "negativo" : "positivo",
          },
        },
      });
    } catch {
      setError(
        "No se pudo conectar con la IA. Inténtalo de nuevo."
      );
    } finally {
      setCargando(false);
    }
  };

  const burbujas = bubblesRef.current;
  const particulas = particulasRef.current;

  // ─────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────

  return (
    <motion.div
      animate={{
        scale: [1, 1.01, 1],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
      }}
      className={`relative w-full overflow-hidden rounded-[32px] shadow-2xl border border-white/20 ${poppins.className}`}
      style={{
        minHeight: 620,
      }}
      onMouseMove={(e) => {
        const rect =
          e.currentTarget.getBoundingClientRect();

        setMousePos({
          x: (e.clientX - rect.left) / rect.width,
          y: (e.clientY - rect.top) / rect.height,
        });
      }}
    >
      {/* FONDO */}
      <motion.div
        className="absolute inset-0"
        animate={{
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 20,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1511300636408-a63a89df3482?q=80&w=1600')",
          backgroundSize: "cover",
          backgroundPosition: "center",
          transform: `translate(
            ${mousePos.x * -10}px,
            ${mousePos.y * -10}px
          ) scale(1.1)`,
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px]" />

      {/* PARTÍCULAS DECORATIVAS */}
      {[...Array(25)].map((_, i) => (
        <div
          key={i}
          className="absolute rounded-full bg-white/30 animate-pulse"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* ENERGÍA */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-30">
        <div className="w-56 h-4 bg-white/20 rounded-full overflow-hidden backdrop-blur-md border border-white/20">
          <motion.div
            className="h-full bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D]"
            animate={{
              width: `${energia}%`,
            }}
          />
        </div>

        <p className="text-center text-white text-xs mt-2 font-semibold tracking-wide">
          Energía emocional ✨
        </p>
      </div>

      {/* RESPUESTA IA */}
      <AnimatePresence>
        {respuestaIA && (
          <motion.div
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            exit={{
              opacity: 0,
            }}
            className="absolute bottom-28 left-1/2 -translate-x-1/2 z-30 bg-white/10 backdrop-blur-xl px-5 py-3 rounded-2xl border border-white/20 shadow-xl text-sm text-white max-w-sm text-center"
          >
            {respuestaIA}
          </motion.div>
        )}
      </AnimatePresence>

      {/* PARTÍCULAS */}
      {particulas.map((p) => (
        <div
          key={p.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
            background: p.color,
            opacity: p.life,
            borderRadius: "999px",
            boxShadow: `0 0 12px ${p.color}`,
            transform: "translate(-50%, -50%)",
            zIndex: 20,
          }}
        />
      ))}

      {/* BURBUJAS */}
      {burbujas.map((b) => (
        <BurbujaVisual
          key={b.id}
          burbuja={b}
          onExplode={explotarBurbuja}
        />
      ))}

      {/* VACÍO */}
      {burbujas.length === 0 &&
        particulas.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
            <motion.div
              animate={{
                y: [0, -10, 0],
              }}
              transition={{
                repeat: Infinity,
                duration: 3,
              }}
              className="text-7xl mb-4"
            >
              🫧
            </motion.div>

            <p className="text-white/90 text-xl font-semibold text-center px-8">
              Expresa cómo te sientes
            </p>

            <p className="text-white/70 text-sm text-center mt-3 px-8">
              y transforma tus emociones en burbujas vivas ✨
            </p>
          </div>
        )}

      {/* INPUT */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-white/10 backdrop-blur-xl border-t border-white/20 z-30">
        {error && (
          <p className="text-red-300 text-xs mb-2 text-center">
            {error}
          </p>
        )}

        <div className="flex gap-3 max-w-2xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
            onKeyDown={(e) =>
              e.key === "Enter" && handleEnviar()
            }
            placeholder="¿Cómo te sientes ahora mismo?"
            className="flex-1 px-6 py-4 rounded-full bg-white/15 backdrop-blur-xl text-sm text-white placeholder:text-white/60 border border-white/20 focus:outline-none focus:ring-2 focus:ring-cyan-300 shadow-lg"
            disabled={cargando}
          />

          <motion.button
            whileTap={{
              scale: 0.95,
            }}
            whileHover={{
              scale: 1.05,
            }}
            onClick={handleEnviar}
            disabled={
              cargando || !input.trim()
            }
            className="px-6 py-4 rounded-full bg-gradient-to-r from-[#7F5AF0] to-[#2CB67D] text-white font-bold shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {cargando
              ? "Analizando..."
              : "Enviar ✨"}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
