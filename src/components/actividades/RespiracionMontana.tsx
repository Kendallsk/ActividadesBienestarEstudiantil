"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Tiempos en segundos para cada fase
const TIEMPO_INHALAR = 5;
const TIEMPO_RETENER = 5;
const TIEMPO_EXHALAR = 5;

// Definimos los estados de la respiración
type FaseRespiracion = 'INHALAR' | 'RETENER' | 'EXHALAR';

export default function RespiracionMontana() {
  const [fase, setFase] = useState<FaseRespiracion>('INHALAR');
  const [segundos, setSegundos] = useState(TIEMPO_INHALAR);

  useEffect(() => {
    // Definimos la lógica del ciclo
    const timer = setInterval(() => {
      setSegundos((prev) => {
        if (prev === 1) {
          // Cambiar de fase cuando llegue a cero
          if (fase === 'INHALAR') {
            setFase('RETENER');
            return TIEMPO_RETENER;
          } else if (fase === 'RETENER') {
            setFase('EXHALAR');
            return TIEMPO_EXHALAR;
          } else {
            setFase('INHALAR');
            return TIEMPO_INHALAR;
          }
        }
        return prev - 1;
      });
    }, 1000); // Actualiza cada segundo

    return () => clearInterval(timer);
  }, [fase]); // Se reinicia el efecto si cambia la fase

  // Configuración de la animación del indicador (coordenadas SVG)
  const animacionesIndicador = {
    INHALAR: { cx: "30%", cy: "60%" },   // Subiendo por el lado izquierdo
    RETENER: { cx: "50%", cy: "40%" },   // Descansando en la cima
    EXHALAR: { cx: "70%", cy: "60%" }    // Bajando por el lado derecho
  };

  // Textos y colores para cada fase
  const infoFase = {
    INHALAR: { 
      texto: 'Inhala Profundo... visualiza que estás subiendo una montaña.', 
      color: 'text-cyan-400',
      icono: '⬆️'
    },
    RETENER: { 
      texto: 'Retén el aire... visualízate sentado descansando al pie de la montaña.', 
      color: 'text-yellow-400',
      icono: '🧘'
    },
    EXHALAR: { 
      texto: 'Exhala Profundo... visualiza que estás bajando la montaña.', 
      color: 'text-blue-500',
      icono: '⬇️'
    }
  };

  return (
    <div className="p-8 bg-slate-900 rounded-3xl shadow-2xl text-center border border-slate-700">
      <h3 className="text-white mb-6 font-bold text-2xl uppercase tracking-wider">
        Respiración de la Montaña
      </h3>

      {/* 1. Visualización de la Montaña y el Indicador */}
      <div className="relative w-full aspect-[4/3] bg-slate-950 rounded-2xl p-4 overflow-hidden border border-slate-700 mb-8">
        <svg viewBox="0 0 400 300" className="w-full h-full">
          {/* Silueta de la Montaña (SVG Paths) */}
          <path 
            d="M 50,250 C 100,100 150,50 200,50 C 250,50 300,100 350,250 L 50,250 Z" 
            fill="none" 
            stroke="#475569" // slate-600
            strokeWidth="3"
            strokeDasharray="8 8" // Montaña dibujada con líneas punteadas
          />
          
          {/* Símbolo de la Cima */}
          <circle cx="200" cy="50" r="10" fill="none" stroke="#e2e8f0" strokeWidth="2"/>

          {/* INDICADOR (El círculo que se mueve) */}
          <motion.circle 
            r="12" 
            fill="none" 
            stroke="#22d3ee" // cyan-400
            strokeWidth="4"
            className="shadow-[0_0_20px_rgba(34,211,238,0.7)]"
            animate={animacionesIndicador[fase]}
            transition={{ 
              duration: TIEMPO_INHALAR, // El indicador se mueve durante toda la fase
              ease: "easeInOut" 
            }}
          />
        </svg>
        
        {/* Marcadores de Base y Cima */}
        <div className="absolute bottom-4 left-4 text-slate-500 text-xs">Inicio / Fin</div>
        <div className="absolute top-4 left-1/2 -translate-x-1/2 text-cyan-400 text-xs font-semibold">Cima - Descanso</div>
      </div>

      {/* 2. Panel de Control y Textos de la Imagen */}
      <div className="bg-slate-800 p-6 rounded-2xl flex flex-col items-center justify-center gap-4">
        
        {/* Título de la Fase y Timer */}
        <div className="flex items-center gap-4">
          <span className="text-5xl">{infoFase[fase].icono}</span>
          <div>
            <AnimatePresence mode="wait">
              <motion.h4 
                key={fase} 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className={`text-2xl font-bold ${infoFase[fase].color}`}
              >
                {fase}
              </motion.h4>
            </AnimatePresence>
            <span className="text-4xl text-white font-mono font-bold">{segundos} <span className="text-sm">segundos</span></span>
          </div>
        </div>

        {/* El Texto Explicativo de la Imagen */}
        <p className="text-slate-300 text-sm max-w-sm mt-2 italic">
          {infoFase[fase].texto}
        </p>

        {/* Barra de Progreso */}
        <div className="w-full h-1.5 bg-slate-700 rounded-full mt-2 overflow-hidden">
          <motion.div 
            key={fase}
            initial={{ width: "100%" }}
            animate={{ width: "0%" }}
            transition={{ duration: TIEMPO_INHALAR, ease: "linear" }}
            className={`h-full ${infoFase[fase].color.replace('text-', 'bg-')}`} // Truco Tailwind para cambiar color
          />
        </div>
      </div>
    </div>
  );
}