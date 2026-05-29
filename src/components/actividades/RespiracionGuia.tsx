"use client";
import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RespiracionCoherente() {
  const segundosFase = 6;
  const tiempoTotalCiclo = segundosFase * 2; // 12 segundos = 1 ciclo
  const totalCiclos = 12;

  const [tiempoActual, setTiempoActual] = useState(0);
  const [ciclosCompletados, setCiclosCompletados] = useState(0);
  const [reproduciendo, setReproduciendo] = useState(true);

  const tiempoInicioRef = useRef(Date.now());
  const ultimoTiempoRef = useRef(Date.now());

  // Timer principal
  useEffect(() => {
    if (!reproduciendo) return;

    const intervalo = setInterval(() => {
      const ahora = Date.now();
      const tiempoTranscurrido = (ahora - tiempoInicioRef.current) / 1000;

      const nuevoTiempoActual = tiempoTranscurrido % tiempoTotalCiclo;
      const ciclosNuevos = Math.floor(tiempoTranscurrido / tiempoTotalCiclo);

      setTiempoActual(nuevoTiempoActual);
      setCiclosCompletados(Math.min(ciclosNuevos, totalCiclos));

    }, 80); // Actualización fluida

    return () => clearInterval(intervalo);
  }, [reproduciendo, tiempoTotalCiclo, totalCiclos]);

  // Reset cuando se pausa
  useEffect(() => {
    if (!reproduciendo) {
      tiempoInicioRef.current = Date.now() - (ciclosCompletados * tiempoTotalCiclo * 1000);
    }
  }, [reproduciendo]);

  const esInhalacion = tiempoActual < segundosFase;

  let porcentajeProgreso = 0;
  if (esInhalacion) {
    porcentajeProgreso = (tiempoActual / segundosFase) * 100;
  } else {
    const tiempoExhalando = tiempoActual - segundosFase;
    porcentajeProgreso = (1 - (tiempoExhalando / segundosFase)) * 100;
  }

  const escalaActual = 0.8 + (porcentajeProgreso / 100) * 0.5;

  return (
    <div className="w-full max-w-md p-8 bg-[#1a2333] rounded-3xl text-center shadow-2xl border border-slate-700/30 flex flex-col items-center justify-between min-h-[500px] font-sans text-slate-200">
      
      <div className="w-full">
        <h3 className="text-white text-xl font-semibold tracking-wide">Respiración Coherente</h3>
        <p className="text-xs text-slate-400 mt-1">{segundosFase} segundos por fase</p>
      </div>

      {/* Esfera Central */}
      <div className="relative w-64 h-64 my-6 flex items-center justify-center">
        <div
          className="absolute inset-0 bg-cyan-500 rounded-full blur-2xl opacity-20 transition-transform duration-100"
          style={{ transform: `scale(${escalaActual * 1.1})` }}
        />
        <div
          className="w-48 h-48 rounded-full flex items-center justify-center relative overflow-hidden transition-transform duration-100"
          style={{
            transform: `scale(${escalaActual})`,
            background: 'radial-gradient(circle, rgba(34,211,238,0.2) 0%, rgba(16,185,129,0) 70%)',
            border: '2px dashed rgba(34, 211, 238, 0.4)',
            boxShadow: '0 0 40px rgba(34, 211, 238, 0.2), inset 0 0 30px rgba(34, 211, 238, 0.1)'
          }}
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 30, ease: "linear", repeat: Infinity }}
            className="absolute inset-0 opacity-40 mix-blend-screen"
            style={{
              backgroundImage: `radial-gradient(rgba(34, 211, 238, 0.8) 1px, transparent 1px)`,
              backgroundSize: '8px 8px'
            }}
          />
        </div>

        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <AnimatePresence mode="wait">
            <motion.div
              key={esInhalacion ? "inhala" : "exhala"}
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -5 }}
              transition={{ duration: 0.25 }}
            >
              <span className="text-white text-3xl font-bold tracking-widest uppercase">
                {esInhalacion ? "INHALA" : "EXHALA"}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>

      {/* === PROGRESO === */}
      <div className="w-full space-y-4 px-4">
        {/* 1. Barras Verdes - Progreso Total */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Progreso de la Sesión</span>
            <span className="text-slate-400">{ciclosCompletados}/{totalCiclos}</span>
          </div>
          <div className="grid grid-cols-12 gap-1.5 h-2">
            {Array.from({ length: totalCiclos }).map((_, idx) => (
              <div
                key={idx}
                className={`h-full rounded-sm transition-all duration-300 ${
                  idx < ciclosCompletados ? 'bg-emerald-400' : 'bg-slate-700/50'
                }`}
              />
            ))}
          </div>
        </div>

        {/* 2. Barra Cyan - Respiración Actual (la que quitaste accidentalmente) */}
        <div className="space-y-1.5 text-left">
          <div className="flex justify-between text-xs font-semibold text-slate-300">
            <span>Respiración Actual</span>
            <span className="font-mono text-cyan-400">
              {(esInhalacion ? tiempoActual : tiempoActual - segundosFase).toFixed(1)}s
            </span>
          </div>
          <div className="w-full bg-slate-700/50 h-2 rounded-full overflow-hidden">
            <div
              className="bg-cyan-400 h-full transition-all duration-100 ease-linear"
              style={{ width: `${porcentajeProgreso}%` }}
            />
          </div>
        </div>

        <div className="pt-2 flex justify-center text-xs">
          <button
            onClick={() => setReproduciendo(!reproduciendo)}
            className="text-cyan-400 hover:underline font-medium"
          >
            {reproduciendo ? "⏸️ Pausar" : "▶️ Reanudar"}
          </button>
        </div>
      </div>
    </div>
  );
}