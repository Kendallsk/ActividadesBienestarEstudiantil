"use client";
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { notifyActivityReady } from "../../lib/activity-events";

export default function BurbujasAlivio() {
  const [burbujas, setBurbujas] = useState(Array(20).fill(false));

  const reventar = (i: number) => {
    if (burbujas[i]) return; // Evita repetir si ya explotó

    const nuevas = [...burbujas];
    nuevas[i] = true;
    setBurbujas(nuevas);

    if (nuevas.every(Boolean)) {
      notifyActivityReady({
        reason: "burbujas_reventadas",
        datos: {
          burbujas_reventadas: nuevas.length,
        },
      });
    }

    // 1. Sonido
    const audio = new Audio('/sounds/pop.mp3');
    audio.volume = 0.5;
    audio.play();

    // 2. Vibración (Solo funcionará en móviles, pero se deja listo)
    if ("vibrate" in navigator) {
      navigator.vibrate(50); // Vibra 50 milisegundos
    }
  };

  return (
    <div className="p-8 bg-slate-800 rounded-3xl text-center shadow-xl">
      <h3 className="text-white mb-6 font-semibold">Terapia de Burbujas</h3>
      
      <div className="grid grid-cols-5 gap-4">
        {burbujas.map((rev, i) => (
          <motion.button
            key={i}
            whileTap={{ scale: 0.9 }}
            // Animación de "vibración" visual para la PC
            animate={rev ? { x: [0, -2, 2, -2, 0] } : {}} 
            onClick={() => reventar(i)}
            className={`w-12 h-12 rounded-full shadow-lg transition-all ${
              rev ? 'bg-slate-700 opacity-30 scale-90' : 'bg-cyan-400 hover:bg-cyan-300'
            }`}
          />
        ))}
      </div>

      <button 
        onClick={() => setBurbujas(Array(20).fill(false))}
        className="mt-8 px-4 py-2 bg-slate-700 text-cyan-400 rounded-lg text-sm hover:bg-slate-600"
      >
        Reiniciar Actividad
      </button>
    </div>
  );
}
