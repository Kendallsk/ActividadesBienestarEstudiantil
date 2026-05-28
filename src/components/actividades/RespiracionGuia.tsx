"use client";
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function RespiracionGuia() {
  const [fase, setFase] = useState('Inhala');

  useEffect(() => {
    const intervalo = setInterval(() => {
      setFase((prev) => (prev === 'Inhala' ? 'Exhala' : 'Inhala'));
    }, 4000); // 4 segundos para inhalar, 4 para exhalar

    return () => clearInterval(intervalo);
  }, []);

  return (
    <div className="p-10 bg-slate-800 rounded-3xl shadow-2xl text-center flex flex-col items-center">
      <h3 className="text-white mb-8 font-semibold text-lg">Respiración Coherente</h3>
      
      <div className="relative flex items-center justify-center w-64 h-64">
        {/* Círculo de fondo (pulso suave) */}
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          className="absolute w-full h-full bg-cyan-500/10 rounded-full"
        />

        {/* Círculo principal que guía la respiración */}
        <motion.div
          animate={{ scale: fase === 'Inhala' ? 1.2 : 0.6 }}
          transition={{ duration: 4, ease: "easeInOut" }}
          className="w-40 h-40 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-full shadow-[0_0_40px_rgba(34,211,238,0.5)] flex items-center justify-center"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={fase}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-white font-bold text-xl uppercase tracking-widest"
            >
              {fase}
            </motion.span>
          </AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-10 space-y-2">
        <p className="text-slate-400 text-sm">Sincroniza tu pecho con el círculo</p>
        <div className="flex gap-2 justify-center">
          <span className={`h-1 w-8 rounded-full transition-all duration-1000 ${fase === 'Inhala' ? 'bg-cyan-400 w-12' : 'bg-slate-600'}`} />
          <span className={`h-1 w-8 rounded-full transition-all duration-1000 ${fase === 'Exhala' ? 'bg-cyan-400 w-12' : 'bg-slate-600'}`} />
        </div>
      </div>
    </div>
  );
}