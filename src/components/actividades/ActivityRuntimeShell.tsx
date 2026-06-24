"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { ActivityInfo } from "../../lib/activity-info";
import {
  ACTIVITY_INTERACTION_EVENT,
  ACTIVITY_READY_EVENT,
} from "../../lib/activity-events";

type RuntimePhase = "intro" | "countdown" | "playing";
type CompletionStatus = "pending" | "ready" | "sent";

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
  const interactionDataRef = useRef<Record<string, unknown> | null>(null);
  const [phase, setPhase] = useState<RuntimePhase>("intro");
  const [countdown, setCountdown] = useState(3);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [completionStatus, setCompletionStatus] =
    useState<CompletionStatus>("pending");
  const completionStatusRef = useRef<CompletionStatus>("pending");
  const [attemptKey, setAttemptKey] = useState(0);

  const setCompletion = (s: CompletionStatus) => {
    completionStatusRef.current = s;
    setCompletionStatus(s);
  };

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        interactionDataRef.current = {
          ...interactionDataRef.current,
          ...detail,
        };
        console.log("[Shell] Datos de interaccion recibidos:", interactionDataRef.current);
      }

      // Solo considerar la actividad como lista si ya está en fase de reproducción.
      if (phase !== "playing") {
        console.log("[Shell] Ignorando evento de interaccion: actividad no está en 'playing'");
        return;
      }

      // Enviar finalización inmediatamente cuando la actividad indica que está lista.
      if (completionStatusRef.current !== "sent") {
        finishActivity();
      }
    };

    window.addEventListener(ACTIVITY_INTERACTION_EVENT, handler);
    return () => window.removeEventListener(ACTIVITY_INTERACTION_EVENT, handler);
  }, [phase]);

  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        interactionDataRef.current = {
          ...interactionDataRef.current,
          ...detail,
        };
      }

      // Ignorar señales de "ready" si la actividad no ha comenzado.
      if (phase !== "playing") {
        console.log("[Shell] Ignorando evento de ready: actividad no está en 'playing'");
        return;
      }

      // Enviar finalización inmediatamente cuando la actividad indica que está lista.
      if (completionStatusRef.current !== "sent") {
        finishActivity();
      }
    };

    window.addEventListener(ACTIVITY_READY_EVENT, handler);
    return () => window.removeEventListener(ACTIVITY_READY_EVENT, handler);
  }, [phase]);

  useEffect(() => {
    if (phase !== "playing") return;

    startedAtRef.current = Date.now();
    const interval = window.setInterval(() => {
      if (startedAtRef.current === null) return;
      setElapsedSeconds(Math.floor((Date.now() - startedAtRef.current) / 1000));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [phase, attemptKey]);

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

  const resetAttempt = () => {
    interactionDataRef.current = null;
    startedAtRef.current = Date.now();
    setElapsedSeconds(0);
    setCompletionStatus("pending");
    setAttemptKey((current) => current + 1);
  };

  const buildCompletionPayload = () => {
    const interactionData = interactionDataRef.current ?? {};
    const datos =
      typeof interactionData.datos === "object" && interactionData.datos !== null
        ? (interactionData.datos as Record<string, unknown>)
        : {};

    return {
      type: "BIENESTAR_ACTIVIDAD_COMPLETADA",
      actividad: activity,
      timestamp: new Date().toISOString(),
      asignacionId: params.get("asignacionId"),
      intentoId: params.get("intentoId"),
      estudianteId: params.get("estudianteId"),
      duracion_segundos: elapsedSeconds,
      culmino: true,
      ...interactionData,
      datos: {
        resumen: {
          finalizacion: "actividad_detectada_completa",
        },
        ...datos,
      },
    };
  };

  const finishActivity = () => {
    if (completionStatusRef.current === "sent") return;
    const payload = buildCompletionPayload();
    if (window.parent !== window) {
      window.parent.postMessage(payload, "*");
    }
    console.log("[Bienestar] Actividad completada:", payload);
    setCompletion("sent");
  };

  // Manual finalization removed: activities must send ready/interaction events
  // and finalization will be sent automatically when the activity reports ready.

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
                resetAttempt();
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
    <div className="relative h-screen w-screen overflow-hidden bg-white">
      <div key={attemptKey} className="flex h-full w-full items-center justify-center p-4">
        {children}
      </div>

      {/* Finalización ahora se envía automáticamente; mostrar solo un aviso informativo */}
      {completionStatus !== "pending" && (
        <div className="absolute inset-x-4 bottom-4 z-50 mx-auto flex max-w-md flex-col gap-3 rounded-2xl border border-emerald-200 bg-white/95 p-4 text-center shadow-2xl backdrop-blur">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Actividad terminada
            </p>
            <p className="mt-1 text-sm font-bold text-slate-800">
              {completionStatus === "sent"
                ? "La finalización fue enviada al aplicativo principal."
                : "La actividad finalizó automáticamente."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
