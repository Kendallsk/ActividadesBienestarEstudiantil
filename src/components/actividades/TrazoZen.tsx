"use client";
import React, { useRef, useEffect, useState } from 'react';

export default function TrazoZen() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Configuración del pincel
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 15;
    ctx.strokeStyle = '#22d3ee'; // Cian-400

    // Efecto de desvanecimiento constante
    const fadeEffect = setInterval(() => {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.05)'; // Color del fondo con transparencia
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }, 50);

    return () => clearInterval(fadeEffect);
  }, []);

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    draw(e);
  };

  const stopDrawing = () => setIsDrawing(false);

  const draw = (e: any) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Obtener coordenadas correctas
    const rect = canvas.getBoundingClientRect();
    const x = (e.clientX || e.touches[0].clientX) - rect.left;
    const y = (e.clientY || e.touches[0].clientY) - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(x, y);

    // Pequeña vibración al dibujar
    if ("vibrate" in navigator) navigator.vibrate(5);
  };

  return (
    <div className="p-6 bg-slate-800 rounded-3xl shadow-2xl text-center">
      <h3 className="text-white mb-4 font-semibold text-lg">Trazo de Calma</h3>
      <p className="text-slate-400 text-xs mb-4">Dibuja algo lento y mira cómo desaparece...</p>
      
      <canvas
        ref={canvasRef}
        width={300}
        height={300}
        className="bg-slate-900 rounded-xl cursor-crosshair touch-none mx-auto border border-slate-700"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
      />

      <button 
        onClick={() => {
          const ctx = canvasRef.current?.getContext('2d');
          ctx?.clearRect(0, 0, 300, 300);
        }}
        className="mt-6 px-5 py-2 bg-slate-700 text-cyan-400 rounded-full text-sm hover:bg-slate-600 transition-colors"
      >
        Limpiar Lienzo
      </button>
    </div>
  );
}