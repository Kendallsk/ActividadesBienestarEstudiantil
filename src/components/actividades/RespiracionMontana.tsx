"use client";
import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

const TIEMPOS = { INHALAR: 5, EXHALAR: 6 }; // Subida más rápida, bajada más lenta y relajante
const CICLOS_REQUERIDOS = 5;

export default function RollercoasterBreathe() {
  const [fase, setFase] = useState<"INHALAR" | "EXHALAR">("INHALAR");
  const [ciclosCompletados, setCiclosCompletados] = useState(0);
  const [completada, setCompletada] = useState(false);
  const [progreso, setProgreso] = useState(0);

  const tiempoInicioRef = useRef(Date.now());

  useEffect(() => {
    if (completada) return;

    const interval = setInterval(() => {
      const transcurrido = (Date.now() - tiempoInicioRef.current) / 1000;
      const duracionCiclo = TIEMPOS.INHALAR + TIEMPOS.EXHALAR;
      const tiempoEnCiclo = transcurrido % duracionCiclo;

      const nuevaFase = tiempoEnCiclo < TIEMPOS.INHALAR ? "INHALAR" : "EXHALAR";
      if (nuevaFase !== fase) setFase(nuevaFase);

      const nuevosCompletados = Math.floor(transcurrido / duracionCiclo);
      if (nuevosCompletados !== ciclosCompletados) setCiclosCompletados(nuevosCompletados);

      if (nuevosCompletados >= CICLOS_REQUERIDOS) {
        setCompletada(true);
      }

      // Progreso visual (0-100)
      const prog = nuevaFase === "INHALAR"
        ? (tiempoEnCiclo / TIEMPOS.INHALAR) * 100
        : 100 - ((tiempoEnCiclo - TIEMPOS.INHALAR) / TIEMPOS.EXHALAR) * 100;

      setProgreso(prog);
    }, 50);

    return () => clearInterval(interval);
  }, [fase, ciclosCompletados, completada]);

  const esInhalando = fase === "INHALAR";

  return (
    <div className="w-full max-w-md mx-auto p-8 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-3xl border border-slate-700 shadow-2xl text-center">
      <h2 className="text-3xl font-black text-white tracking-tight mb-1">Rollercoaster Breathe 🎢</h2>
      <p className="text-slate-400 mb-10">Sube inhalando • Baja exhalando</p>

      {/* Visual de Montaña Rusa */}
      <div className="relative h-72 flex items-center justify-center mb-10">
        <motion.div
          animate={{ y: esInhalando ? -35 : 35 }}
          transition={{ duration: esInhalando ? TIEMPOS.INHALAR : TIEMPOS.EXHALAR, ease: esInhalando ? "easeOut" : "easeIn" }}
          className="relative"
        >
          <div className="text-7xl mb-4">🎢</div>
          <motion.div
            animate={{ scale: esInhalando ? 1.15 : 0.85 }}
            className="w-28 h-28 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-2xl flex items-center justify-center mx-auto shadow-xl"
          >
            <span className="text-4xl">🛤️</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Fase */}
      <motion.div
        key={fase}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold text-white tracking-widest mb-8 uppercase"
      >
        {esInhalando ? "INHALA" : "EXHALA"}
      </motion.div>

      {/* Barra de progreso */}
      <div className="px-6 mb-10">
        <div className="h-3 bg-slate-800 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-cyan-400 to-blue-500"
            animate={{ width: `${progreso}%` }}
            transition={{ duration: 0.1, ease: "linear" }}
          />
        </div>
      </div>

      {/* Progreso de ciclos */}
      <div className="px-6">
        <div className="flex justify-between text-sm text-slate-400 mb-3">
          <span>Ciclos completados</span>
          <span>{ciclosCompletados} / {CICLOS_REQUERIDOS}</span>
        </div>
        <div className="grid grid-cols-5 gap-2.5">
          {Array.from({ length: CICLOS_REQUERIDOS }).map((_, i) => (
            <div
              key={i}
              className={`h-3 rounded-full transition-all duration-700 ${
                i < ciclosCompletados ? "bg-emerald-500" : "bg-slate-700"
              }`}
            />
          ))}
        </div>
      </div>

      {completada && (
        <motion.button
          onClick={() => window.location.reload()}
          className="mt-12 w-full py-4 bg-emerald-500 hover:bg-emerald-600 font-bold text-lg rounded-2xl text-white"
        >
          Practicar nuevamente
        </motion.button>
      )}
    </div>
  );
}