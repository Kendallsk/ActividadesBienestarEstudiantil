"use client";
import React, { useRef, useEffect, useState } from 'react';
import { notifyActivityReady } from "../../lib/activity-events";

type ShapeType = 'circle' | 'square' | 'triangle' | 'zigzag';

export default function TrazoZen() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const targetCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [pointsCount, setPointsCount] = useState(0);
  const pointsRef = useRef(0);
  const notifiedRef = useRef(false);
  const [targetShape, setTargetShape] = useState<ShapeType | null>(null);
  const [showGuide, setShowGuide] = useState(true);
  const [difficulty, setDifficulty] = useState(0.6); // matching threshold
  const lastPosRef = useRef<{ x: number; y: number } | null>(null);

  const CANVAS_SIZE = 360;

  useEffect(() => {
    // Initialize canvases
    const canvas = canvasRef.current;
    const targetCanvas = targetCanvasRef.current;
    if (!canvas || !targetCanvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Style
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.lineWidth = 14;
    ctx.strokeStyle = '#22d3ee';

    // Clear initially
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw initial target
    generateNewTarget();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const generateNewTarget = (shape?: ShapeType) => {
    const pick: ShapeType = shape ?? (['circle','square','triangle','zigzag'] as ShapeType[])[Math.floor(Math.random()*4)];
    setTargetShape(pick);
    drawTarget(pick);
    // reset user canvas
    clearCanvas();
  };

  const drawTarget = (shape: ShapeType) => {
    const targetCanvas = targetCanvasRef.current;
    if (!targetCanvas) return;
    const tctx = targetCanvas.getContext('2d');
    if (!tctx) return;
    tctx.clearRect(0,0,targetCanvas.width,targetCanvas.height);

    // soft background for target preview
    tctx.fillStyle = 'rgba(255,255,255,0)';
    tctx.fillRect(0,0,targetCanvas.width,targetCanvas.height);

    tctx.strokeStyle = 'rgba(255,255,255,0.4)';
    tctx.lineWidth = 12;
    tctx.lineJoin = 'round';
    tctx.lineCap = 'round';

    const padding = 40;
    const w = targetCanvas.width - padding*2;
    const h = targetCanvas.height - padding*2;
    const cx = targetCanvas.width/2;
    const cy = targetCanvas.height/2;

    tctx.beginPath();
    if (shape === 'circle') {
      tctx.arc(cx, cy, Math.min(w,h)/2, 0, Math.PI*2);
    } else if (shape === 'square') {
      tctx.rect(padding, padding, w, h);
    } else if (shape === 'triangle') {
      tctx.moveTo(cx, padding);
      tctx.lineTo(targetCanvas.width - padding, targetCanvas.height - padding);
      tctx.lineTo(padding, targetCanvas.height - padding);
      tctx.closePath();
    } else if (shape === 'zigzag') {
      const steps = 6;
      const stepW = w / steps;
      let x = padding;
      let up = true;
      tctx.moveTo(x, cy);
      for (let i=0;i<steps;i++){
        const y = up ? padding : targetCanvas.height - padding;
        tctx.lineTo(x, y);
        x += stepW;
        up = !up;
      }
    }
    tctx.stroke();
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    setIsDrawing(true);
    const pos = getPointFromEvent(e);
    lastPosRef.current = pos;
    // begin path
    const ctx = canvasRef.current?.getContext('2d');
    if (ctx && pos) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const stopDrawing = async () => {
    setIsDrawing(false);
    lastPosRef.current = null;
    // after stopping, compare
    await evaluateMatch();
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;
    const pos = getPointFromEvent(e);
    if (!pos) return;

    ctx.lineTo(pos.x, pos.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(pos.x, pos.y);

    pointsRef.current += 1;
    setPointsCount(pointsRef.current);
  };

  const getPointFromEvent = (e: any) => {
    const canvas = canvasRef.current; if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches && e.touches[0];
    const clientX = touch ? touch.clientX : e.clientX;
    const clientY = touch ? touch.clientY : e.clientY;
    return { x: clientX - rect.left, y: clientY - rect.top };
  };

  const clearCanvas = () => {
    const ctx = canvasRef.current?.getContext('2d');
    if (!ctx || !canvasRef.current) return;
    ctx.clearRect(0,0,canvasRef.current.width, canvasRef.current.height);
    // fill background
    ctx.fillStyle = '#0b1220';
    ctx.fillRect(0,0,canvasRef.current.width, canvasRef.current.height);
    pointsRef.current = 0;
    setPointsCount(0);
    notifiedRef.current = false;
  };

  const evaluateMatch = async () => {
    if (!targetCanvasRef.current || !canvasRef.current || !targetShape) return;
    const tctx = targetCanvasRef.current.getContext('2d');
    const uctx = canvasRef.current.getContext('2d');
    if (!tctx || !uctx) return;

    // compare by pixel overlap: where target has stroke, check user stroke
    const tw = targetCanvasRef.current.width;
    const th = targetCanvasRef.current.height;
    const targetData = tctx.getImageData(0,0,tw,th).data;
    const userData = uctx.getImageData(0,0,tw,th).data;

    let targetCount = 0;
    let overlap = 0;
    for (let i=0;i<targetData.length;i+=4){
      const aT = targetData[i+3];
      const aU = userData[i+3];
      if (aT > 40) {
        targetCount++;
        if (aU > 40) overlap++;
      }
    }

    const ratio = targetCount === 0 ? 0 : overlap / targetCount;
    console.log('[TrazoZen] match ratio', ratio, 'points', pointsRef.current);

    const required = difficulty; // e.g., 0.6
    if (ratio >= required && pointsRef.current > 10 && !notifiedRef.current) {
      notifiedRef.current = true;
      // send completion event
      notifyActivityReady({
        reason: 'trazo_replicado',
        datos: { target: targetShape, puntos: pointsRef.current, match: ratio },
      });
    }
  };

  return (
    <div className="p-6 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl shadow-2xl text-center max-w-xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-white font-extrabold text-xl">Trazo Zen — Replica la figura</h3>
          <p className="text-slate-400 text-sm">Observa la figura guía y trata de replicarla lo más fiel posible.</p>
        </div>
        <div className="text-right">
          <div className="text-xs text-slate-400">Puntos: <span className="font-bold text-white">{pointsCount}</span></div>
          <div className="text-xs text-slate-400">Objetivo: <span className="font-bold text-white">{targetShape}</span></div>
        </div>
      </div>

      <div className="relative mx-auto" style={{width: CANVAS_SIZE, height: CANVAS_SIZE}}>
        <canvas ref={targetCanvasRef} width={CANVAS_SIZE} height={CANVAS_SIZE} className="absolute inset-0 w-full h-full rounded-xl pointer-events-none opacity-60" style={{mixBlendMode: 'screen'}} />
        <canvas
          ref={canvasRef}
          width={CANVAS_SIZE}
          height={CANVAS_SIZE}
          className="rounded-xl cursor-crosshair touch-none border border-slate-700"
          onMouseDown={startDrawing}
          onMouseMove={(e)=>{ if(isDrawing) draw(e); }}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={(e)=>{ if((e as any).touches?.length) draw(e); }}
          onTouchEnd={stopDrawing}
        />
      </div>

      <div className="mt-4 flex items-center justify-center gap-3">
        <button onClick={()=>{ clearCanvas(); }} className="px-4 py-2 bg-slate-700 text-cyan-400 rounded-full text-sm hover:bg-slate-600">Limpiar</button>
        <button onClick={()=>{ generateNewTarget(); }} className="px-4 py-2 bg-emerald-600 text-white rounded-full text-sm hover:bg-emerald-700">Nueva figura</button>
        <button onClick={()=>setShowGuide(!showGuide)} className="px-4 py-2 bg-blue-600 text-white rounded-full text-sm hover:bg-blue-700">Guía: {showGuide? 'ON':'OFF'}</button>
        <select value={String(difficulty)} onChange={(e)=>setDifficulty(Number(e.target.value))} className="ml-2 rounded-md bg-slate-700 text-white px-2 py-1">
          <option value="0.5">Fácil</option>
          <option value="0.6">Normal</option>
          <option value="0.7">Difícil</option>
        </select>
      </div>

      <style>{`\n        canvas { background: #07111f; }\n      `}</style>
    </div>
  );
}
