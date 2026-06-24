"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { notifyActivityReady } from "../../lib/activity-events";

export default function RegistroPensamientosIA() {
    const [situacion, setSituacion] = useState("");
    const [pensamiento, setPensamiento] = useState("");

    const [iaAnalisis, setIaAnalisis] = useState({
        distorsion: "",
        sugerencia: "",
    });

    const [estado, setEstado] = useState<
        "ENTRADA" | "PROCESANDO" | "RESULTADO" | "GUARDADO"
    >("ENTRADA");

    const analizarConIA = async () => {
        if (!pensamiento.trim()) return;

        setEstado("PROCESANDO");

        try {
                // Reintentos con backoff exponencial en caso de errores temporales (503, 429, timeouts)
                // Ajuste: reducir intentos y aumentar timeout porque el backend puede tardar mucho.
                const maxAttempts = 2;
                let attempt = 0;
                let lastError: unknown = null;

                while (attempt < maxAttempts) {
                    attempt += 1;
                    try {
                        // Nota: removemos AbortController/timeouts para evitar AbortError
                        // cuando el backend responde tarde. Confiamos en que el servidor
                        // terminará la petición; los intentos se hacen de forma secuencial.
                        const res = await fetch("/api/analizar", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ pensamiento, situacion }),
                        });

                        if (!res.ok) {
                            const text = await res.text().catch(() => "");
                            const errMsg = `IA request failed: ${res.status} ${res.statusText} ${text}`;
                            const err = new Error(errMsg);
                            // For 5xx/429 try again, otherwise throw
                            if (res.status >= 500 || res.status === 429) {
                                throw err;
                            }
                            throw err;
                        }

                        const data = await res.json();

                        if (data.error) throw new Error(data.error);

                        setIaAnalisis(data);
                        setEstado("RESULTADO");
                        lastError = null;
                        break;
                    } catch (err) {
                        lastError = err;
                        const waitMs = 500 * Math.pow(2, attempt - 1); // 500, 1000, 2000
                        console.warn(`[Pensamientos] Intento ${attempt} falló:`, err);
                        if (attempt < maxAttempts) {
                            console.warn(`[Pensamientos] Esperando ${waitMs}ms antes del siguiente intento.`);
                            await new Promise((r) => setTimeout(r, waitMs));
                        }
                    }
                }

                if (lastError) {
                    throw lastError;
                }
        } catch (error: unknown) {
                const message = error instanceof Error ? error.message : "Error desconocido";
                console.error("[Pensamientos] Error al analizar con IA:", message);

                        // Si la IA no responde, ofrecer un fallback local para no bloquear la UX.
                        const isServiceUnavailable = /(503|Service Unavailable|generativelanguage|high demand|This model is currently experiencing high demand)/i.test(message);

                if (isServiceUnavailable) {
                    // Respuesta predeterminada que guía al estudiante a reformular
                    setIaAnalisis({
                        distorsion: "No se pudo obtener un análisis automático en este momento.",
                        sugerencia:
                            "Intenta describir tu pensamiento con más detalle o guarda tu reflexión para revisar más tarde. Puedes reintentar en unos minutos.",
                    });
                    setEstado("RESULTADO");
                    // Notificar al usuario brevemente
                    alert("Servicio de IA temporalmente saturado. Se ha aplicado una respuesta local sugerida.");
                } else {
                    setEstado("ENTRADA");
                    alert("Error al conectar con la IA. Intenta nuevamente más tarde.");
                }
        }
    };

    const resetear = () => {
        setPensamiento("");
        setSituacion("");
        setIaAnalisis({
            distorsion: "",
            sugerencia: "",
        });
        setEstado("ENTRADA");
    };

    // La finalizacion general la maneja ActivityRuntimeShell.
    const guardarReflexion = () => {
        const interactionData = {
            entrada_estudiante: pensamiento,
            respuesta_ia: {
                distorsion_detectada: iaAnalisis.distorsion,
                sugerencia_ia: iaAnalisis.sugerencia,
                situacion,
            },
        };

        notifyActivityReady({
            reason: "respuesta_ia_generada",
            pensamiento,
            situacion,
            respuestaIa: {
                distorsion: iaAnalisis.distorsion,
                sugerencia: iaAnalisis.sugerencia,
            },
            datos: interactionData,
        });

        setEstado("GUARDADO");
    };


    return (
        <div className="relative overflow-hidden w-full max-w-3xl mx-auto rounded-[32px] border border-white/10 bg-[#07111f] shadow-[0_0_80px_rgba(0,255,255,0.08)]">

            {/* Fondo Atmosférico */}
            <div className="absolute inset-0">
                <div className="absolute top-[-100px] left-[-50px] w-[260px] h-[260px] bg-cyan-500/20 blur-3xl rounded-full" />
                <div className="absolute bottom-[-120px] right-[-80px] w-[300px] h-[300px] bg-fuchsia-500/20 blur-3xl rounded-full" />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_50%)]" />
            </div>

            <div className="relative z-10 p-8 md:p-10">

                {/* HEADER */}
                <motion.div
                    initial={{ opacity: 0, y: -15 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-400/20 flex items-center justify-center text-3xl shadow-lg shadow-cyan-500/20">
                            🧠
                        </div>

                        <div>
                            <h1 className="text-3xl font-black text-white tracking-tight">
                                Cuestiona tu pensamiento
                            </h1>

                            <p className="text-slate-400 text-sm mt-1">
                                Explora tus pensamientos y recibe una reinterpretación más saludable.
                            </p>
                        </div>
                    </div>
                </motion.div>

                <AnimatePresence mode="wait">

                    {/* ENTRADA */}
                    {estado === "ENTRADA" && (
                        <motion.div
                            key="entrada"
                            initial={{ opacity: 0, y: 15 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -15 }}
                            transition={{ duration: 0.35 }}
                            className="space-y-5"
                        >

                            {/* Situación */}
                            <div>
                                <label className="text-sm text-cyan-300 font-semibold block mb-2">
                                    🌍 Situación
                                </label>

                                <input
                                    type="text"
                                    placeholder="¿Qué ocurrió?"
                                    value={situacion}
                                    onChange={(e) => setSituacion(e.target.value)}
                                    className="
                                        w-full
                                        rounded-2xl
                                        border border-white/10
                                        bg-white/5
                                        backdrop-blur-xl
                                        px-5 py-4
                                        text-white
                                        placeholder:text-slate-500
                                        outline-none
                                        transition-all
                                        focus:border-cyan-400/50
                                        focus:bg-white/10
                                        focus:shadow-[0_0_25px_rgba(34,211,238,0.15)]
                                    "
                                />
                            </div>

                            {/* Pensamiento */}
                            <div>
                                <label className="text-sm text-fuchsia-300 font-semibold block mb-2">
                                    💭 Pensamiento
                                </label>

                                <textarea
                                    rows={5}
                                    placeholder="Escribe lo que estás pensando..."
                                    value={pensamiento}
                                    onChange={(e) => setPensamiento(e.target.value)}
                                    className="
                                        w-full
                                        rounded-2xl
                                        border border-white/10
                                        bg-white/5
                                        backdrop-blur-xl
                                        px-5 py-4
                                        text-white
                                        placeholder:text-slate-500
                                        outline-none
                                        resize-none
                                        transition-all
                                        focus:border-fuchsia-400/50
                                        focus:bg-white/10
                                        focus:shadow-[0_0_25px_rgba(217,70,239,0.15)]
                                    "
                                />
                            </div>

                            {/* BOTÓN */}
                            <motion.button
                                whileHover={{
                                    scale: 1.02,
                                }}
                                whileTap={{
                                    scale: 0.98,
                                }}
                                onClick={analizarConIA}
                                className="
                                    group
                                    relative
                                    w-full
                                    overflow-hidden
                                    rounded-2xl
                                    py-4
                                    font-bold
                                    text-white
                                    bg-gradient-to-r
                                    from-cyan-500
                                    to-fuchsia-500
                                    shadow-lg
                                    shadow-cyan-500/20
                                "
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    ✨ Analizar pensamiento
                                </span>

                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-white/10" />
                            </motion.button>
                        </motion.div>
                    )}

                    {/* PROCESANDO */}
                    {estado === "PROCESANDO" && (
                        <motion.div
                            key="procesando"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="py-20 flex flex-col items-center justify-center"
                        >

                            {/* Loader */}
                            <motion.div
                                animate={{
                                    rotate: 360,
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                    ease: "linear",
                                }}
                                className="
                                    w-20 h-20
                                    rounded-full
                                    border-4
                                    border-cyan-500/20
                                    border-t-cyan-400
                                    mb-6
                                "
                            />

                            <motion.p
                                animate={{
                                    opacity: [0.4, 1, 0.4],
                                }}
                                transition={{
                                    repeat: Infinity,
                                    duration: 2,
                                }}
                                className="text-cyan-300 text-lg font-semibold"
                            >
                                Analizando patrones de pensamiento...
                            </motion.p>

                            <p className="text-slate-500 text-sm mt-2">
                                La IA está reinterpretando tu pensamiento
                            </p>
                        </motion.div>
                    )}

                    {/* RESULTADO */}
                    {estado === "RESULTADO" && (
                        <motion.div
                            key="resultado"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="space-y-6"
                        >

                            {/* Distorsión */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.2 }}
                                className="
                                    rounded-3xl
                                    border border-red-400/20
                                    bg-red-500/10
                                    backdrop-blur-xl
                                    p-6
                                "
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-2xl bg-red-500/20 flex items-center justify-center text-2xl">
                                        ⚠️
                                    </div>

                                    <div>
                                        <h3 className="text-red-300 font-bold text-lg">
                                            Distorsión Detectada
                                        </h3>

                                        <p className="text-red-200/60 text-sm">
                                            Posible patrón cognitivo identificado
                                        </p>
                                    </div>
                                </div>

                                <p className="text-red-100 leading-relaxed">
                                    {iaAnalisis.distorsion}
                                </p>
                            </motion.div>

                            {/* Sugerencia */}
                            <motion.div
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 0.35 }}
                                className="
                                    rounded-3xl
                                    border border-emerald-400/20
                                    bg-emerald-500/10
                                    backdrop-blur-xl
                                    p-6
                                "
                            >
                                <div className="flex items-center gap-3 mb-3">
                                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                                        🌱
                                    </div>

                                    <div>
                                        <h3 className="text-emerald-300 font-bold text-lg">
                                            Reinterpretación Saludable
                                        </h3>

                                        <p className="text-emerald-200/60 text-sm">
                                            Una perspectiva más equilibrada
                                        </p>
                                    </div>
                                </div>

                                <p className="text-emerald-100 leading-relaxed">
                                    {iaAnalisis.sugerencia}
                                </p>
                            </motion.div>

                            {/* BOTONES */}
                            <div className="flex gap-4 pt-2">

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={resetear}
                                    className="
                                        flex-1
                                        py-4
                                        rounded-2xl
                                        bg-white/5
                                        border border-white/10
                                        text-white
                                        hover:bg-white/10
                                        transition-all
                                    "
                                >
                                    🔄 Nuevo análisis
                                </motion.button>

                                <motion.button
                                    whileHover={{ scale: 1.03 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={guardarReflexion}
                                    className="
                                        flex-1
                                        py-4
                                        rounded-2xl
                                        bg-gradient-to-r
                                        from-cyan-500
                                        to-fuchsia-500
                                        text-white
                                        font-bold
                                        shadow-lg
                                        shadow-cyan-500/20
                                    "
                                >
                                    💾 Guardar reflexión
                                </motion.button>
                            </div>
                        </motion.div>
                    )}

                    {/* GUARDADO */}
                    {estado === "GUARDADO" && (
                        <motion.div
                            key="guardado"
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="py-16 flex flex-col items-center justify-center text-center gap-6"
                        >
                            <motion.div
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                                className="w-24 h-24 rounded-full bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-5xl"
                            >
                                ✅
                            </motion.div>
                            <div>
                                <h3 className="text-2xl font-black text-white mb-2">
                                    ¡Reflexión enviada!
                                </h3>
                                <p className="text-slate-400 text-sm max-w-xs">
                                    Tu psicóloga ha recibido tu reflexión y la revisará en tu próxima sesión.
                                </p>
                            </div>
                            <motion.button
                                whileHover={{ scale: 1.03 }}
                                whileTap={{ scale: 0.97 }}
                                onClick={resetear}
                                className="px-8 py-3 rounded-2xl bg-white/10 border border-white/20 text-white hover:bg-white/20 transition-all"
                            >
                                🔄 Nueva reflexión
                            </motion.button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
