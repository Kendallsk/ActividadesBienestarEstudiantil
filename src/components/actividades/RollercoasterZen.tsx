"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notifyActivityReady } from "../../lib/activity-events";

type Fase = "INHALAR" | "RETENER" | "EXHALAR" | "DESCANSO";

// Tiempos
const TIEMPOS_FASES: Record<Fase, number> = {
  INHALAR: 6,
  RETENER: 3,
  EXHALAR: 7,
  DESCANSO: 4,
};
const CICLOS_REQUERIDOS = 3;

// Configuración
const PROGRESO_FASES: Record<
  Fase,
  {
    start: number;
    end: number;
    texto: string;
    color: string;
    bg: string;
  }
> = {
  // SUBE
  INHALAR: {
    start: 0,
    end: 0.42,
    texto: "Sube con calma...",
    color: "text-cyan-400",
    bg: "bg-cyan-400",
  },

  // QUIETO EN LA PUNTA
  RETENER: {
    start: 0.42,
    end: 0.42,
    texto: "Sostén el aire...",
    color: "text-yellow-400",
    bg: "bg-yellow-400",
  },

  // BAJA
  EXHALAR: {
    start: 0.42,
    end: 0.9,
    texto: "Suelta suavemente...",
    color: "text-pink-500",
    bg: "bg-pink-500",
  },

  // DESCANSO FINAL
  DESCANSO: {
    start: 0.9,
    end: 1,
    texto: "Prepárate...",
    color: "text-emerald-400",
    bg: "bg-emerald-400",
  },
};

// VIA
const TRACK_PATH =
  "M 10,185 C 60,70 110,30 180,45 C 250,60 280,170 360,170 C 420,170 450,110 490,120";

export default function RollercoasterZen() {
  const [fase, setFase] = useState<Fase>("INHALAR");
  const [ciclosCompletados, setCiclosCompletados] = useState(0);
  const [completada, setCompletada] = useState(false);

  const [segundos, setSegundos] = useState<number>(
    TIEMPOS_FASES.INHALAR
  );

  useEffect(() => {
    const fases: Fase[] = [
      "INHALAR",
      "RETENER",
      "EXHALAR",
      "DESCANSO",
    ];

    const timer = setInterval(() => {
      if (completada) return;

      setSegundos((prev) => {
        if (prev === 1) {
          const actualIndex = fases.indexOf(fase);

          const nextIndex =
            (actualIndex + 1) % fases.length;

          const siguienteFase = fases[nextIndex];

          setFase(siguienteFase);

          if (fase === "DESCANSO") {
            setCiclosCompletados((current) => {
              const next = current + 1;
              if (next >= CICLOS_REQUERIDOS) {
                setCompletada(true);
                notifyActivityReady({
                  reason: "ciclos_respiracion_completados",
                  datos: {
                    ciclos_completados: CICLOS_REQUERIDOS,
                  },
                });
              }
              return Math.min(next, CICLOS_REQUERIDOS);
            });
          }

          return TIEMPOS_FASES[siguienteFase];
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fase, completada]);

  return (
    <div className="p-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-xl mx-auto overflow-hidden">
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-white text-3xl font-black italic uppercase bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Viaje de Calma
          </h2>

          <p className="text-slate-400 text-sm">
            Respira siguiendo el recorrido ({ciclosCompletados}/{CICLOS_REQUERIDOS})
          </p>
        </div>

        <div className="bg-slate-800 px-4 py-2 rounded-xl text-center">
          <span className="text-slate-500 text-xs block">
            Fase
          </span>

          <span
            className={`text-4xl font-mono font-bold ${PROGRESO_FASES[fase].color}`}
          >
            {segundos}s
          </span>
        </div>
      </div>

      {/* ESCENA */}
      <div
        className="relative aspect-[16/9] rounded-2xl p-2 mb-8 overflow-hidden bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://img.magnific.com/fotos-premium/fondo-imagen-dibujos-animados-parque-espacio-copia_1169880-286376.jpg?semt=ais_hybrid&w=740&q=80')",
        }}
      >
        <svg viewBox="0 0 500 281" className="w-full h-full">
          {/* Camino */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.45)"
            strokeWidth="10"
            strokeLinecap="round"
          />

          {/* Brillo */}
          <path
            d={TRACK_PATH}
            fill="none"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="3"
            strokeLinecap="round"
          />

          {/* Emoji */}
          <motion.g
            key={fase}
            initial={{
              offsetDistance: `${PROGRESO_FASES[fase].start * 100}%`,
            }}
            animate={{
              offsetDistance: `${PROGRESO_FASES[fase].end * 100}%`,
            }}
            transition={{
              duration: TIEMPOS_FASES[fase],
              ease:
                fase === "INHALAR"
                  ? "easeIn"
                  : fase === "EXHALAR"
                  ? "easeOut"
                  : "linear",
            }}
            style={{
              offsetPath: `path("${TRACK_PATH}")`,
              offsetRotate: "auto",
            }}
          >
            <text
              fontSize="28"
              filter="drop-shadow(0px 0px 6px white)"
            >
              😊
            </text>
          </motion.g>
        </svg>
      </div>

      {/* PANEL */}
      <div className="bg-slate-800 p-6 rounded-2xl text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={fase}
            initial={{
              opacity: 0,
              y: 20,
              scale: 0.9,
            }}
            animate={{
              opacity: 1,
              y: 0,
              scale: 1,
            }}
            exit={{
              opacity: 0,
              y: -20,
              scale: 1.1,
            }}
            transition={{
              duration: 0.4,
              type: "spring",
            }}
          >
            {/* ETIQUETA */}
            <motion.div
              initial={{ scale: 0.7 }}
              animate={{ scale: 1 }}
              className={`
                inline-flex
                items-center
                gap-2
                px-5
                py-2
                rounded-full
                text-sm
                font-bold
                uppercase
                text-slate-900
                ${PROGRESO_FASES[fase].bg}
              `}
            >
              <span className="w-2 h-2 rounded-full bg-white" />
              {fase}
            </motion.div>

            {/* TEXTO */}
            <motion.p
              className={`mt-4 text-xl font-semibold ${PROGRESO_FASES[fase].color}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {PROGRESO_FASES[fase].texto}
            </motion.p>
          </motion.div>
        </AnimatePresence>

        {/* Barra */}
        <div className="w-full h-3 bg-slate-700 rounded-full mt-5 overflow-hidden">
          <motion.div
            key={fase}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{
              duration: TIEMPOS_FASES[fase],
              ease: "linear",
            }}
            className={`h-full rounded-full ${PROGRESO_FASES[fase].bg}`}
          />
        </div>
      </div>
    </div>
  );
}
