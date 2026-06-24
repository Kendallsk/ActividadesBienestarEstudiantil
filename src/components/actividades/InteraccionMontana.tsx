"use client";
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { notifyActivityReady } from "../../lib/activity-events";

const RADIO_BORRADOR = 25; 

export default function DespejarNiebla() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [progreso, setProgreso] = useState(0);
  const [completado, setCompletado] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const movimientosRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (!ctx) return;
    
    // Ajustar tamaño
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;
    contextRef.current = ctx;

    // Dibujar niebla inicial (basada en tu imagen de nubes)
    ctx.fillStyle = "#f1f5f9"; 
    ctx.globalAlpha = 0.9;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Añadir algunas "nubes" extra para textura
    ctx.globalAlpha = 0.3;
    for(let i=0; i<20; i++) {
        ctx.beginPath();
        ctx.arc(Math.random()*canvas.width, Math.random()*canvas.height, 50, 0, Math.PI*2);
        ctx.fill();
    }
    ctx.globalAlpha = 1.0;
  }, []);

  const erase = (e: React.MouseEvent | React.TouchEvent) => {
    if (completado || !contextRef.current || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const x = ('clientX' in e ? e.clientX : e.touches[0].clientX) - rect.left;
    const y = ('clientY' in e ? e.clientY : e.touches[0].clientY) - rect.top;

    setMousePos({ x, y });

    if (isDrawing) {
      const ctx = contextRef.current;
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, RADIO_BORRADOR, 0, Math.PI * 2);
      ctx.fill();
      
      // Calcular progreso cada vez que movemos (para que no esté en 0%)
      movimientosRef.current += 1;
      if (movimientosRef.current % 5 === 0) calcularProgreso();
    }
  };

  const calcularProgreso = () => {
    const canvas = canvasRef.current;
    const ctx = contextRef.current;
    if (!canvas || !ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;
    let transparent = 0;

    for (let i = 3; i < pixels.length; i += 4) {
      if (pixels[i] < 50) transparent++;
    }

    const currentProg = Math.round((transparent / (pixels.length / 4)) * 100);
    setProgreso(currentProg);
    
    if (currentProg > 85) {
      setCompletado(true);
      notifyActivityReady({
        reason: "interaccion_visual_completada",
        datos: {
          progreso_limpieza: currentProg,
        },
      });
    }
  };

  return (
    <div className="p-8 bg-slate-900 rounded-3xl border border-slate-700 w-full max-w-xl mx-auto shadow-2xl overflow-hidden">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-white text-2xl font-black italic uppercase tracking-tighter">Mente Clara</h2>
          <p className="text-slate-400 text-xs">Limpia la neblina moviendo el mouse</p>
        </div>
        <div className="text-right">
          <span className="text-slate-500 text-xs font-bold block">LIMPIO</span>
          <span className="text-3xl font-mono font-black text-cyan-400">{progreso}%</span>
        </div>
      </div>

      <div className="relative aspect-video bg-[#aee8fd] rounded-2xl border-4 border-slate-800 overflow-hidden cursor-none">
        {/* MONTAÑA DE FONDO (Basada en tu referencia) */}
        {/* IMAGEN DE FONDO */}
        <img
          src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSkzIhNkC5ftE6DcvGxE3B5Lokl3icib_BsQLMzyoGWHgHDAprH1JzipDiA&s=10"
          alt="Montaña"
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* CANVAS DE INTERACCIÓN */}
        <canvas
          ref={canvasRef}
          onMouseDown={() => setIsDrawing(true)}
          onMouseMove={erase}
          onMouseUp={() => {setIsDrawing(false); calcularProgreso();}}
          onMouseLeave={() => setIsDrawing(false)}
          onTouchStart={() => setIsDrawing(true)}
          onTouchMove={erase}
          onTouchEnd={() => {setIsDrawing(false); calcularProgreso();}}
          className="absolute inset-0 z-10 w-full h-full touch-none"
        />

        {/* CURSOR PERSONALIZADO (BORRADOR VISIBLE) */}
        {!completado && (
          <div 
            className={`absolute z-20 pointer-events-none rounded-full border-2 border-white shadow-lg transition-transform ${isDrawing ? 'scale-75 bg-white/20' : 'scale-100 bg-white/10'}`}
            style={{ 
              width: RADIO_BORRADOR * 2, 
              height: RADIO_BORRADOR * 2,
              left: mousePos.x - RADIO_BORRADOR,
              top: mousePos.y - RADIO_BORRADOR,
              boxShadow: '0 0 15px rgba(255,255,255,0.5)'
            }}
          />
        )}

        {/* PANTALLA DE ÉXITO */}
        <AnimatePresence>
          {completado && (
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-cyan-500/20 backdrop-blur-sm"
            >
              <motion.span initial={{ scale: 0 }} animate={{ scale: 1.2 }} className="text-6xl mb-2">☀️</motion.span>
              <h3 className="text-white text-2xl font-black italic uppercase">¡Día Despejado!</h3>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Barra de Progreso Inferior */}
      <div className="mt-4 w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700">
        <motion.div 
          className="h-full bg-cyan-400"
          animate={{ width: `${progreso}%` }}
        />
      </div>
    </div>
  );
}
