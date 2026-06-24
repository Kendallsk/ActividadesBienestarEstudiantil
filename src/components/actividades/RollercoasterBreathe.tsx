"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notifyActivityReady } from "../../lib/activity-events";

const TIEMPOS = { INHALAR: 5, EXHALAR: 5 };
const CICLOS_REQUERIDOS = 5;

export default function SoplarVela() {
  const [fase, setFase] = useState<"INHALAR" | "EXHALAR">("INHALAR");
  const [ciclosCompletados, setCiclosCompletados] = useState(0);
  const [completada, setCompletada] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const tiempoInicioRef = useRef(0);
  const particulasViento = Array.from({ length: 14 }, (_, i) => ({
    id: i,
    x: 45 + ((i * 37) % 110),
    y: 35 - ((i * 23) % 60),
  }));

  useEffect(() => {
    if (completada) return;
    if (tiempoInicioRef.current === 0) {
      tiempoInicioRef.current = Date.now();
    }

    const interval = setInterval(() => {
      const transcurrido = (Date.now() - tiempoInicioRef.current) / 1000;
      const duracionCiclo = TIEMPOS.INHALAR + TIEMPOS.EXHALAR;
      const tiempoEnCiclo = transcurrido % duracionCiclo;

      // Determinar fase
      const nuevaFase = tiempoEnCiclo < TIEMPOS.INHALAR ? "INHALAR" : "EXHALAR";
      if (nuevaFase !== fase) setFase(nuevaFase);

      // Calcular progreso (se llena y se vacía)
      let nuevoProgreso = 0;
      if (nuevaFase === "INHALAR") {
        nuevoProgreso = (tiempoEnCiclo / TIEMPOS.INHALAR) * 100;
      } else {
        nuevoProgreso = 100 - ((tiempoEnCiclo - TIEMPOS.INHALAR) / TIEMPOS.EXHALAR) * 100;
      }
      setProgreso(nuevoProgreso);

      // Ciclos completados
      const nuevosCompletados = Math.floor(transcurrido / duracionCiclo);
      if (nuevosCompletados !== ciclosCompletados) {
        setCiclosCompletados(nuevosCompletados);
      }

      if (nuevosCompletados >= CICLOS_REQUERIDOS) {
        setCompletada(true);
        notifyActivityReady({
          reason: "ciclos_respiracion_completados",
          datos: {
            ciclos_completados: CICLOS_REQUERIDOS,
          },
        });
      }
    }, 40); // Más fluido

    return () => clearInterval(interval);
  }, [fase, ciclosCompletados, completada]);

  const esExhalando = fase === "EXHALAR";

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-700 shadow-2xl text-center">
      
      <h2 className="text-3xl font-black text-white tracking-tight mb-1">Sopla la Vela</h2>
      <p className="text-slate-400 mb-10">Respira con calma y enfócate</p>

      {/* VELA */}
      <div className="relative h-80 flex items-center justify-center mb-10">
        <svg viewBox="0 0 200 260" className="w-60 h-60 drop-shadow-2xl" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <linearGradient id="cera" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#e2e8f0" />
              <stop offset="100%" stopColor="#94a3b8" />
            </linearGradient>
          </defs>

          <motion.rect x="72" y="118" width="56" height="115" rx="14" fill="url(#cera)" stroke="#cbd5e1" strokeWidth="3"/>
          <path d="M72 125 Q80 115 100 118 Q120 115 128 125" fill="#cbd5e1" opacity="0.6"/>
          <line x1="100" y1="118" x2="100" y2="98" stroke="#1e2937" strokeWidth="4.5" strokeLinecap="round"/>

          <AnimatePresence mode="wait">
            {!completada && (
              <>
                <motion.circle cx="100" cy="93" r="24" fill="#fb923c" opacity="0.18"
                  animate={{ scale: esExhalando ? 1.25 : 1.08 }}
                  transition={{ duration: esExhalando ? 0.45 : 2.2, repeat: Infinity }}
                />
                <motion.path d="M100 115 Q79 79 99 64 Q121 81 100 115" fill="#f59e0b"
                  animate={{
                    scale: esExhalando ? [1, 0.68, 0.92] : [1, 1.08, 1],
                    rotate: esExhalando ? [-22, 22, -12] : [-3, 3, -2],
                    x: esExhalando ? [-7, 8, -5] : 0,
                  }}
                  transition={{ duration: esExhalando ? 0.32 : 1.9, repeat: Infinity }}
                />
                <motion.path d="M100 111 Q90 82 100 73 Q110 85 100 111" fill="#fef08c"
                  animate={{ scale: [1, 1.12, 1] }}
                  transition={{ duration: 1.3, repeat: Infinity }}
                />
              </>
            )}
          </AnimatePresence>

          {completada && (
            <motion.path d="M98 100 Q75 55 115 38" stroke="#bae6fd" strokeWidth="5" fill="none" strokeLinecap="round"
              initial={{ pathLength: 0, opacity: 0 }} animate={{ pathLength: 1, opacity: 0.7 }} transition={{ duration: 3 }}
            />
          )}
        </svg>

        <AnimatePresence>
          {esExhalando && !completada && (
            <div className="absolute inset-0 pointer-events-none">
              {particulasViento.map((particula, i) => (
                <motion.div key={particula.id} className="absolute w-1 h-1 bg-sky-100 rounded-full"
                  initial={{ x: 99, y: 102, opacity: 0.85 }}
                  animate={{ x: particula.x, y: particula.y, opacity: 0, scale: 0.2 }}
                  transition={{ duration: 1.15, delay: i * 0.04 }}
                />
              ))}
            </div>
          )}
        </AnimatePresence>
      </div>

      {/* FASE */}
      <motion.div key={fase} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-white tracking-widest mb-8 uppercase">
        {fase}
      </motion.div>

      {/* BARRA DE PROGRESO - Ahora se llena y se vacía correctamente */}
      <div className="px-6 mb-10">
        <div className="flex justify-between text-sm text-slate-400 mb-2">
          <span>Progreso actual</span>
          <span className="font-mono text-cyan-300">{(progreso / 100 * (fase === "INHALAR" ? 5 : 5)).toFixed(1)}s</span>
        </div>
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-400"
            animate={{ width: `${progreso}%` }}
            transition={{ duration: 0.08, ease: "linear" }}
          />
        </div>
      </div>

      {/* Ciclos */}
      <div className="px-6">
        <div className="flex justify-between text-sm text-slate-400 mb-3">
          <span>Ciclos completados</span>
          <span>{ciclosCompletados} / {CICLOS_REQUERIDOS}</span>
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: CICLOS_REQUERIDOS }).map((_, i) => (
            <div key={i} className={`h-3 rounded-full transition-all duration-700 ${
              i < ciclosCompletados ? "bg-emerald-500 shadow shadow-emerald-500/60" : "bg-slate-700"
            }`} />
          ))}
        </div>
      </div>

      {completada && (
        <motion.button initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
          onClick={() => window.location.reload()}
          className="mt-12 w-full py-4 bg-emerald-500 hover:bg-emerald-600 font-bold text-lg rounded-2xl text-white transition-all">
          Practicar nuevamente
        </motion.button>
      )}
    </div>
  );
}
