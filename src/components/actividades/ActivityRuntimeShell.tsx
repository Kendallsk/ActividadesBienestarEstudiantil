"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActivityInfo } from "../../lib/activity-info";

const DURACION_MINIMA_SEGUNDOS = 50;
type RuntimePhase = "intro" | "countdown" | "playing";

export default function ActivityRuntimeShell({
  activity,
  info,
  children,
}: {
  activity: string;
  info?: ActivityInfo;
  children: React.ReactNode;
}) {
  const startedAtRef = useRef<number | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const interactionDataRef = useRef<Record<string, any> | null>(null);
  const [phase, setPhase] = useState<RuntimePhase>("intro");
  const [countdown, setCountdown] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completed, setCompleted] = useState(false);

  // Listen for interaction data from child activity components
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        interactionDataRef.current = { ...interactionDataRef.current, ...detail };
        console.log("[Shell] Datos de interacción recibidos:", interactionDataRef.current);
      }
    };
    window.addEventListener("bienestar-interaccion-data", handler);
    return () => window.removeEventListener("bienestar-interaccion-data", handler);
  }, []);

  useEffect(() => {
    if (phase !== "playing") return;
    startedAtRef.current = Date.now();
    const interval = window.setInterval(() => {
      if (startedAtRef.current === null) return;
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase]);

  useEffect(() => {
    if (phase !== "countdown") return;
    const interval = window.setInterval(() => {
      setCountdown((current) => {
        if (current <= 1) {
          window.clearInterval(interval);
          setPhase("playing");
          return 3;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase]);

  const params = useMemo(() => {
    if (typeof window === "undefined") {
      return new URLSearchParams();
    }

    return new URLSearchParams(window.location.search);
  }, []);

  const remainingSeconds = Math.max(0, DURACION_MINIMA_SEGUNDOS - elapsedSeconds);
  const canFinish = remainingSeconds === 0 && !completed;

  const finishActivity = () => {
    if (!canFinish) return;

    // Merge interaction data collected from child activity (e.g. Pensamientos)
    const interactionData = interactionDataRef.current ?? {};

    const payload = {
      type: "BIENESTAR_ACTIVIDAD_COMPLETADA",
      actividad: activity,
      timestamp: new Date().toISOString(),
      asignacionId: params.get("asignacionId"),
      intentoId: params.get("intentoId"),
      estudianteId: params.get("estudianteId"),
      duracion_segundos: elapsedSeconds,
      culmino: true,
      // Include the actual student data from the activity
      ...interactionData,
      datos: {
        resumen: {
          finalizacion: "manual_despues_de_tiempo_minimo",
        },
        ...(interactionData.datos ?? {}),
      },
    };

    if (window.parent !== window) {
      window.parent.postMessage(payload, "*");
    }

    console.log("[Bienestar] Actividad completada:", payload);
    setCompleted(true);
  };

  if (phase === "intro") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#ADD8E6] p-6">
        <div className="w-full max-w-3xl overflow-hidden rounded-3xl border border-gray-200 bg-white shadow-xl">
          <div className="flex items-center gap-4 bg-[#2A6EBB] px-8 py-6">
            <span className="text-5xl">{info?.emoji ?? "🎯"}</span>
            <div>
              <h1 className="text-2xl font-black text-white">
                {info?.title ?? activity}
              </h1>
              <p className="mt-1 text-sm text-blue-100">
                Instrucciones antes de comenzar
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 px-8 py-6">
            <p className="text-base font-medium leading-relaxed text-[#1F4E79]">
              {info?.description ?? "Preparate para comenzar la actividad."}
            </p>

            {info?.steps && info.steps.length > 0 && (
              <div>
                <p className="mb-3 text-sm font-bold uppercase tracking-wide text-[#2A6EBB]">
                  Pasos a seguir
                </p>
                <ol className="flex flex-col gap-3">
                  {info.steps.map((step, index) => (
                    <li key={step} className="flex items-start gap-3">
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#2A6EBB] text-sm font-bold text-white">
                        {index + 1}
                      </span>
                      <span className="text-sm leading-relaxed text-[#333333]">
                        {step}
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            )}

            <button
              type="button"
              onClick={() => {
                setCountdown(3);
                setElapsedSeconds(0);
                setPhase("countdown");
              }}
              className="self-end rounded-full bg-[#2A6EBB] px-8 py-3 text-base font-bold text-white shadow-md transition hover:bg-[#1F4E79]"
            >
              Comenzar actividad
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (phase === "countdown") {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#ADD8E6]">
        <p className="text-lg font-bold text-[#1F4E79]">
          Preparandote para comenzar...
        </p>
        <div
          key={countdown}
          className="text-8xl font-black text-[#2A6EBB]"
          style={{ animation: "scaleIn 0.5s ease-out" }}
        >
          {countdown}
        </div>
        <style>{`
          @keyframes scaleIn {
            0% { transform: scale(1.8); opacity: 0; }
            60% { transform: scale(0.9); opacity: 1; }
            100% { transform: scale(1); opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-white">
      {children}

      <div className="absolute right-4 bottom-4 z-50 flex items-center gap-3 rounded-2xl border border-slate-200 bg-white/95 px-4 py-3 shadow-xl backdrop-blur">
        <div className="text-right">
          <p className="text-xs font-semibold text-slate-500">
            {completed ? "Actividad finalizada" : "Finalizacion"}
          </p>
          <p className="text-sm font-bold text-slate-800">
            {canFinish || completed
              ? "Lista para registrar"
              : `${remainingSeconds}s restantes`}
          </p>
        </div>
        <button
          type="button"
          onClick={finishActivity}
          disabled={!canFinish}
          className="rounded-xl bg-[#2A6EBB] px-4 py-2 text-sm font-bold text-white transition disabled:cursor-not-allowed disabled:bg-slate-300"
        >
          {completed ? "Enviada" : "Finalizar"}
        </button>
      </div>
    </div>
  );
}
