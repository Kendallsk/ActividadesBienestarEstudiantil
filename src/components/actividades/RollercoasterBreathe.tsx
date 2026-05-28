"use client";
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIEMPOS = { INHALAR: 4, RETENER: 4, EXHALAR: 6 };
const CICLOS_REQUERIDOS = 3;

export default function SoplarVela() {
  const [fase, setFase] = useState<keyof typeof TIEMPOS>("INHALAR");
  const [segundos, setSegundos] = useState(TIEMPOS.INHALAR);
  const [ciclo, setCiclo] = useState(1);
  const [actividadCompletada, setActividadCompletada] = useState(false);

  useEffect(() => {
    if (actividadCompletada) return;

    const timer = setInterval(() => {
      setSegundos((prev) => {
        if (prev === 1) {
          avanzarFase();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [fase, actividadCompletada]);

  const avanzarFase = () => {
    if (fase === "INHALAR") {
      setFase("RETENER");
      setSegundos(TIEMPOS.RETENER);
    } else if (fase === "RETENER") {
      setFase("EXHALAR");
      setSegundos(TIEMPOS.EXHALAR);
    } else if (fase === "EXHALAR") {
      if (ciclo >= CICLOS_REQUERIDOS) {
        setActividadCompletada(true);
      } else {
        setCiclo((prev) => prev + 1);
        setFase("INHALAR");
        setSegundos(TIEMPOS.INHALAR);
      }
    }
  };

  return (
    <div className="p-8 bg-slate-900 rounded-3xl border border-slate-700 w-full max-w-md mx-auto shadow-2xl text-center">
      <h2 className="text-white text-2xl font-black uppercase mb-2 italic">
        {actividadCompletada ? "¡Logrado!" : "Sopla la Vela"}
      </h2>

      <p className="text-slate-400 text-sm mb-6">
        Ciclo {ciclo} de {CICLOS_REQUERIDOS}
      </p>

      {/* ESCENA */}
      <div className="relative h-64 rounded-2xl mb-8 flex items-center justify-center overflow-hidden">

        {/* 🌌 Fondo */}
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,200,100,0.15),transparent_70%)]" />

        <svg viewBox="0 0 200 200" className="w-48 h-48 relative z-10">

          {/* Vela */}
          <rect x="80" y="120" width="40" height="60" rx="6" fill="#60a5fa" />
          <rect x="80" y="120" width="40" height="60" rx="6" fill="rgba(0,0,0,0.2)" />

          {/* Mecha */}
          <line x1="100" y1="120" x2="100" y2="110" stroke="#1e293b" strokeWidth="3" />

          {/* 🔥 LLAMA */}
          <AnimatePresence>
            {!actividadCompletada && (
              <>
                {/* Glow */}
                <motion.circle
                  cx="100"
                  cy="95"
                  r="18"
                  fill="rgba(251,191,36,0.25)"
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.4, 0.7, 0.4],
                  }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />

                {/* Llama exterior */}
                <motion.path
                  d="M 100,110 Q 85,90 100,70 Q 115,90 100,110"
                  fill="#f59e0b"
                  animate={
                    fase === "EXHALAR"
                      ? {
                          scale: [1, 0.7, 1.1],
                          rotate: [0, 20, -20],
                          x: [0, 6, -6],
                        }
                      : {
                          scale: [1, 1.1, 1],
                        }
                  }
                  transition={{
                    repeat: Infinity,
                    duration: fase === "EXHALAR" ? 0.4 : 1.5,
                  }}
                />

                {/* Llama interna */}
                <motion.path
                  d="M 100,108 Q 92,92 100,78 Q 108,92 100,108"
                  fill="#fde68a"
                  animate={{
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ repeat: Infinity, duration: 1.2 }}
                />
              </>
            )}
          </AnimatePresence>

          {/* 💨 Humo */}
          {actividadCompletada && (
            <motion.path
              d="M 100,105 C 90,85 120,70 100,50"
              stroke="#cbd5f5"
              fill="none"
              strokeWidth="2"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.5, y: -40 }}
              transition={{ duration: 2 }}
            />
          )}
        </svg>

        {/* 🌬️ Partículas al soplar */}
        {fase === "EXHALAR" && !actividadCompletada && (
          <div className="absolute inset-0 pointer-events-none">
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 bg-white rounded-full opacity-70"
                initial={{ x: 100, y: 100 }}
                animate={{
                  x: 100 + Math.random() * 80 - 40,
                  y: 80 - Math.random() * 60,
                  opacity: 0,
                }}
                transition={{ duration: 0.8 }}
              />
            ))}
          </div>
        )}
      </div>

      {/* CONTROLES */}
      {!actividadCompletada && (
        <div className="space-y-4">
          <div className="text-4xl font-mono font-black text-white bg-slate-800 px-6 py-2 rounded-2xl border border-slate-700 inline-block">
            {segundos}s
          </div>

          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <motion.div
              key={fase + ciclo}
              initial={{ width: "0%" }}
              animate={{ width: "100%" }}
              transition={{
                duration: TIEMPOS[fase],
                ease: "linear",
              }}
              className="h-full bg-cyan-500"
            />
          </div>
        </div>
      )}

      {/* BOTÓN */}
      {actividadCompletada && (
        <motion.button
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          onClick={() => window.location.reload()}
          className="w-full py-4 bg-emerald-500 text-white font-bold rounded-2xl hover:bg-emerald-400"
        >
          Repetir
        </motion.button>
      )}
    </div>
  );
}