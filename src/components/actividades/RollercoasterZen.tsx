"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Fase = "INHALAR" | "RETENER" | "EXHALAR" | "DESCANSO";

// Tiempos más naturales (respiración real)
const TIEMPOS_FASES: Record<Fase, number> = {
  INHALAR: 6,
  RETENER: 3,
  EXHALAR: 7,
  DESCANSO: 4,
};

// Progreso sobre la vía
const PROGRESO_FASES: Record<Fase, { start: number; end: number; texto: string; color: string }> = {
  INHALAR: { start: 0, end: 0.35, texto: "Sube con calma...", color: "text-cyan-400" },
  RETENER: { start: 0.35, end: 0.55, texto: "Sostén el aire...", color: "text-yellow-400" },
  EXHALAR: { start: 0.55, end: 0.85, texto: "Suelta suavemente...", color: "text-pink-500" },
  DESCANSO: { start: 0.85, end: 1.0, texto: "Prepárate...", color: "text-emerald-400" },
};

export default function RollercoasterZen() {
  const [fase, setFase] = useState<Fase>("INHALAR");
  const [segundos, setSegundos] = useState<number>(TIEMPOS_FASES.INHALAR);

  useEffect(() => {
    const fases: Fase[] = ["INHALAR", "RETENER", "EXHALAR", "DESCANSO"];

    const timer = setInterval(() => {
      setSegundos((prev) => {
        if (prev === 1) {
          const actualIndex = fases.indexOf(fase);
          const nextIndex = (actualIndex + 1) % fases.length;
          const siguienteFase = fases[nextIndex];
          setFase(siguienteFase);
          return TIEMPOS_FASES[siguienteFase];
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fase]);

  return (
    <div className="p-8 bg-slate-900 rounded-3xl shadow-2xl border border-slate-700 w-full max-w-xl mx-auto overflow-hidden">
      
      {/* HEADER */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-white text-3xl font-black italic uppercase bg-gradient-to-r from-cyan-400 to-blue-600 bg-clip-text text-transparent">
            Viaje de Calma
          </h2>
          <p className="text-slate-400 text-sm">Respira siguiendo el recorrido</p>
        </div>

        <div className="bg-slate-800 px-4 py-2 rounded-xl text-center">
          <span className="text-slate-500 text-xs block">Fase</span>
          <span className={`text-4xl font-mono font-bold ${PROGRESO_FASES[fase].color}`}>
            {segundos}s
          </span>
        </div>
      </div>

      {/* ESCENA */}
      <div className="relative aspect-[16/9] bg-sky-200 rounded-2xl p-2 mb-8">
        <svg viewBox="0 0 500 281" className="w-full h-full">
          
          {/* Cielo */}
          <rect x="0" y="0" width="500" height="200" fill="#a4e4fc" />

          {/* Césped */}
          <rect x="0" y="200" width="500" height="81" fill="#78bf4c" />

          {/* Árbol izquierdo */}
          <g transform="translate(20,120) scale(0.7)">
            <path d="M 50,0 L 0,100 L 100,100 Z" fill="#2c9a63" />
            <path d="M 50,30 L 10,120 L 90,120 Z" fill="#1b8352" />
            <rect x="40" y="120" width="20" height="40" fill="#8c6141" />
          </g>

          {/* Árbol derecho */}
          <g transform="translate(380,130) scale(0.7)">
            <path d="M 50,0 L 0,100 L 100,100 Z" fill="#1b8352" />
            <path d="M 50,30 L 10,120 L 90,120 Z" fill="#0c6d41" />
            <rect x="40" y="120" width="20" height="30" fill="#6d4734" />
          </g>

          {/* Montículos */}
          <path d="M 100,200 C 130,170 170,170 200,200 Z" fill="#4d943a"/>
          <path d="M 300,200 C 330,180 370,180 400,200 Z" fill="#3d822b"/>

          {/* Vía */}
          <path
            d="M 10,180 C 50,80 100,30 180,30 C 260,30 310,160 380,160 C 420,160 460,130 490,130"
            fill="none"
            stroke="#ef4444"
            strokeWidth="5"
            strokeLinecap="round"
          />

          {/* Vagón */}
          <motion.text
            fontSize="30"
            key={fase}
            style={{
              offsetPath: `path("M 10,180 C 50,80 100,30 180,30 C 260,30 310,160 380,160 C 420,160 460,130 490,130")`,
              offsetRotate: "auto",
            }}
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
          >
            😊
          </motion.text>
        </svg>
      </div>

      {/* PANEL */}
      <div className="bg-slate-800 p-6 rounded-2xl text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={fase}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
          >
            <span className={`px-3 py-1 text-xs font-bold uppercase text-slate-900 ${PROGRESO_FASES[fase].color.replace("text", "bg")}`}>
              {fase}
            </span>
            <p className="text-white mt-2">{PROGRESO_FASES[fase].texto}</p>
          </motion.div>
        </AnimatePresence>

        {/* Barra */}
        <div className="w-full h-2 bg-slate-700 rounded-full mt-4 overflow-hidden">
          <motion.div
            key={fase}
            initial={{ width: "0%" }}
            animate={{ width: "100%" }}
            transition={{ duration: TIEMPOS_FASES[fase], ease: "linear" }}
            className={`h-full ${PROGRESO_FASES[fase].color.replace("text", "bg")}`}
          />
        </div>
      </div>
    </div>
  );
}