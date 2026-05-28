"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

type Globo = {
  id: number;
  x: number;
  y: number;
  size: number;
  emoji: string;
};

type Particula = {
  id: number;
  x: number;
  y: number;
  angle: number;
  distance: number;
};

export default function GlobosAntiestres() {
  const [globos, setGlobos] = useState<Globo[]>([]);
  const [particulas, setParticulas] = useState<Particula[]>([]);
  const [activo, setActivo] = useState(true);
  const [score, setScore] = useState(0);

  const WIDTH = 420;
  const HEIGHT = 500;

  const emojis = ["💙", "🌈", "✨", "🫧"];

  // URL DE FONDO
  const backgroundImage =
    "https://media.istockphoto.com/id/1891623651/es/vector/paisaje-de-nubes-en-cielo-azul-brillante.jpg?s=612x612&w=0&k=20&c=Z1ug9QwJZGfK170l9gBaZlbhPxGjgOFq8cqfs6ONvJ0=";

  // GENERAR GLOBOS
  useEffect(() => {
    if (!activo) return;

    const interval = setInterval(() => {
      setGlobos((prev) => [
        ...prev,
        {
          id: Date.now() + Math.random(),
          x: Math.random() * (WIDTH - 80),
          y: HEIGHT,
          size: Math.random() * 25 + 55,
          emoji: emojis[Math.floor(Math.random() * emojis.length)],
        },
      ]);
    }, 800);

    return () => clearInterval(interval);
  }, [activo]);

  // MOVIMIENTO
  useEffect(() => {
    const interval = setInterval(() => {
      setGlobos((prev) =>
        prev
          .map((g) => ({
            ...g,
            y: g.y - 1.5,
          }))
          .filter((g) => g.y > -150)
      );
    }, 16);

    return () => clearInterval(interval);
  }, []);

  const reventar = (globo: Globo) => {
    const centerX = globo.x + globo.size / 2;
    const centerY = globo.y + globo.size / 2;

    const nuevas = Array.from({ length: 16 }).map((_, i) => ({
      id: Date.now() + i,
      x: centerX,
      y: centerY,
      angle: Math.random() * 360,
      distance: Math.random() * 100 + 30,
    }));

    setParticulas((prev) => [...prev, ...nuevas]);

    // SONIDO
    const audio = new Audio("/sounds/pop.mp3");
    audio.volume = 0.3;
    audio.play().catch(() => { });

    // SCORE
    setScore((s) => s + 1);

    // ELIMINAR GLOBO
    setGlobos((prev) => prev.filter((g) => g.id !== globo.id));

    // ELIMINAR PARTÍCULAS
    setTimeout(() => {
      setParticulas((prev) =>
        prev.filter((p) => !nuevas.some((np) => np.id === p.id))
      );
    }, 700);
  };

  return (
    <div
      className="relative overflow-hidden rounded-3xl shadow-2xl"
      style={{
        width: WIDTH,
        height: HEIGHT,
      }}
    >
      {/* FONDO CON IMAGEN */}
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${backgroundImage})`,
        }}
      />

      {/* OVERLAY */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[1px]" />

      {/* SCORE */}
      <div className="absolute top-4 left-4 z-20 bg-black/40 text-white px-4 py-2 rounded-xl backdrop-blur-md">
        ⭐ Puntos: {score}
      </div>

      {/* GLOBOS */}
      <AnimatePresence>
        {globos.map((g) => (
          <motion.div
            key={g.id}
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              y: [0, -5, 0],
            }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{
              duration: 0.4,
              y: {
                repeat: Infinity,
                duration: 2,
              },
            }}
            whileHover={{
              scale: 1.15,
            }}
            className="absolute cursor-pointer z-10 flex flex-col items-center"
            style={{
              left: g.x,
              top: g.y,
            }}
            onClick={() => reventar(g)}
          >
            {/* GLOBO */}
            <div
              className="rounded-full flex items-center justify-center shadow-xl border border-white/40"
              style={{
                width: g.size,
                height: g.size,
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.4), rgba(255,255,255,0.1))",
                backdropFilter: "blur(10px)",
                fontSize: g.size / 2,
              }}
            >
              {g.emoji}
            </div>

            {/* CUERDA */}
            <div
              className="bg-white/70"
              style={{
                width: 2,
                height: g.size * 0.8,
              }}
            />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* PARTÍCULAS */}
      {particulas.map((p) => (
        <motion.div
          key={p.id}
          initial={{
            opacity: 1,
            scale: 1,
          }}
          animate={{
            x: Math.cos((p.angle * Math.PI) / 180) * p.distance,
            y: Math.sin((p.angle * Math.PI) / 180) * p.distance,
            opacity: 0,
            scale: 0,
          }}
          transition={{
            duration: 0.7,
          }}
          className="absolute w-3 h-3 rounded-full bg-white"
          style={{
            left: p.x,
            top: p.y,
            pointerEvents: "none",
          }}
        />
      ))}

      {/* BOTONES */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-3 z-20">
        <button
          onClick={() => {
            setActivo(false);
            setGlobos([]);
            setParticulas([]);
          }}
          className="px-4 py-2 rounded-xl bg-red-500/80 text-white backdrop-blur-md hover:scale-105 transition"
        >
          Limpiar
        </button>

        <button
          onClick={() => {
            setActivo((a) => !a);
          }}
          className="px-4 py-2 rounded-xl bg-blue-500/80 text-white backdrop-blur-md hover:scale-105 transition"
        >
          {activo ? "Pausar" : "Reanudar"}
        </button>
      </div>
    </div>
  );
}