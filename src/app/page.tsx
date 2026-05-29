"use client";

import { useState, useEffect } from 'react';
import JSZip from 'jszip';
import Link from 'next/link';
import BurbujasAlivio from '../components/actividades/BurbujasAlivio';
import TrazoZen from '../components/actividades/TrazoZen';
import RespiracionGuia from '../components/actividades/RespiracionGuia';
import RespiracionMontana from '../components/actividades/RespiracionMontana';
import RollercoasterZen from '../components/actividades/RollercoasterZen';
import InteraccionMontana from '../components/actividades/InteraccionMontana';
import RollercoasterBreathe from '../components/actividades/RollercoasterBreathe';
import Globos from '../components/actividades/globos';
import Pensamientos from '../components/actividades/Pensamientos';
import MeditacionGuiada from '../components/actividades/MeditacionGuiada';
import BurbujasEmocionales from '../components/actividades/BurbujasEmocionales';
import ArbolBienestar from '../components/actividades/ArbolBienestar';

// ─── Datos de instrucciones por slug ────────────────────────────────────────
const ACTIVITY_INFO: Record<string, { emoji: string; description: string; steps: string[] }> = {
  'respiracion-guia': {
    emoji: '🌬️',
    description: 'Un ejercicio de respiración diafragmática guiada que te ayudará a calmar tu sistema nervioso y reducir la ansiedad en pocos minutos.',
    steps: [
      'Siéntate en una posición cómoda con la espalda recta.',
      'Coloca una mano en el pecho y otra en el abdomen.',
      'Sigue el ritmo visual: inhala cuando el círculo crezca, exhala cuando se contraiga.',
      'Repite el ciclo las veces que necesites.',
    ],
  },
  'respiracion-montana': {
    emoji: '⛰️',
    description: 'Visualiza el ascenso y descenso de una montaña mientras sincronizas tu respiración con el movimiento, creando calma interior.',
    steps: [
      'Relaja los hombros y cierra los ojos unos segundos.',
      'Cuando la línea suba, inhala profundamente por la nariz.',
      'Mantén el aire en la cima de la montaña.',
      'Exhala lentamente por la boca mientras la línea desciende.',
    ],
  },
  'rollercoaster-breathe': {
     emoji: "🕯️",
     description: "Usa la visualización de una vela para practicar tu respiración: inhala para mantenerla encendida y exhala suavemente como si soplaras para apagarla.",
  steps: [
    "Siéntate cómodo y relájate.",
    "Inhala profundamente por la nariz durante 5 segundos imaginando que la vela se mantiene encendida.",
    "Exhala suavemente por la boca durante 5 segundos como si soplaras la vela con cuidado.",
    "Observa cómo la llama se mueve con tu respiración.",
    "Repite el ciclo 5 veces manteniendo la calma.",
  ],
  },
  'rollercoaster-zen': {
    emoji: '🧘',
    description: 'Una versión más lenta y meditativa de la respiración en montaña rusa, diseñada para alcanzar un estado profundo de relajación.',
    steps: [
      'Encuentra una posición cómoda y cierra los ojos.',
      'Sigue el movimiento suave de la animación.',
      'Inhala en 4 tiempos, retén 4 tiempos, exhala en 4 tiempos.',
      'Repite hasta sentir una calma profunda.',
    ],
  },
  'burbujas-alivio': {
    emoji: '🫧',
    description: 'Revienta burbujas virtuales como técnica de grounding. Cada burbuja que tocas te ancla al momento presente y aleja la ansiedad.',
    steps: [
      'Toma tres respiraciones profundas antes de comenzar.',
      'Haz clic o toca las burbujas que aparecen en pantalla.',
      'Concéntrate en el sonido y la sensación de cada burbuja al reventarse.',
      'Si tu mente divaga, vuelve a enfocarte en la siguiente burbuja.',
    ],
  },
  'trazo-zen': {
    emoji: '✏️',
    description: 'Dibuja libremente en el lienzo digital. El dibujo mindful es una técnica poderosa para despejar la mente y reducir el estrés.',
    steps: [
      'No te preocupes por dibujar algo bonito, no es el objetivo.',
      'Mueve el cursor o dedo de forma lenta y consciente.',
      'Observa los colores y trazos que van apareciendo.',
      'Respira profundo con cada trazo que realizas.',
    ],
  },
  'interaccion-montana': {
    emoji: '🏔️',
    description: 'Interactúa con un paisaje de montaña generativo. Controla elementos del entorno natural para anclar tu atención al presente.',
    steps: [
      'Explora la pantalla moviendo el cursor con calma.',
      'Observa cómo el entorno reacciona a tus movimientos.',
      'No hay objetivo que cumplir, solo explorar.',
      'Respira con naturalidad mientras interactúas.',
    ],
  },
  'globos': {
    emoji: '🎈',
    description: 'Infla y suelta globos con el ritmo de tu respiración. Una metáfora visual para aprender a soltar las preocupaciones.',
    steps: [
      'Mantén presionado el botón para inflar el globo (inhala).',
      'Suéltalo para dejarlo volar (exhala y suelta la tensión).',
      'Imagina que cada globo lleva una preocupación lejos de ti.',
      'Repite el proceso cuantas veces necesites.',
    ],
  },
  'pensamientos': {
    emoji: '💭',
    description: 'Un diario de reestructuración cognitiva. Escribe un pensamiento negativo y transforma su perspectiva de forma guiada.',
    steps: [
      'Escribe con honestidad el pensamiento que te genera ansiedad.',
      'Lee las preguntas de reflexión con calma y sin juzgarte.',
      'Responde desde la compasión, como si le hablaras a un amigo.',
      'Al finalizar, nota si tu percepción del pensamiento cambió.',
    ],
  },
  'burbujas-emocionales': {
    emoji: '🫧',
    description: 'Escribe cómo te sientes y la Inteligencia Artificial convierte tus emociones en burbujas. Las negativas suben y explotan; las positivas flotan y te acompañan.',
    steps: [
      'Escribe en el campo de texto cómo te sientes en este momento.',
      'Presiona "Enviar" y espera que la IA analice tu emoción.',
      'Observa la burbuja que aparece: si sube y explota, era una emoción difícil que se va.',
      'Si flota y rebota, es una emoción positiva que te acompaña. ¡Puedes tocarla!',
    ],
  },
  'arbol-bienestar': {
    emoji: '🌳',
    description: 'Comparte tus pensamientos, logros y aprendizajes del día. La IA los convierte en hojas, flores o frutos que hacen crecer tu árbol personal de bienestar.',
    steps: [
      'Escribe un pensamiento, logro o aprendizaje del día en el campo de texto.',
      'La IA analizará tu mensaje y añadirá una hoja (reflexión), flor (logro) o fruto (meta cumplida).',
      'Observa cómo tu árbol crece con cada aporte que compartes.',
      'Sigue agregando pensamientos hasta que tu árbol esté lleno de vida.',
    ],
  },
  'meditacion-guiada': {
    emoji: '🧘‍♀️',
    description: 'Una sesión de meditación guiada en video con instrucciones paso a paso para principiantes y personas con ansiedad.',
    steps: [
      'Busca un lugar tranquilo donde nadie te interrumpa.',
      'Ajusta el volumen a un nivel cómodo.',
      'Siéntate o recuéstate en una posición que sea sostenible.',
      'Sigue las instrucciones del video sin esforzarte demasiado.',
    ],
  },
};

// ─── Ícono de play ────────────────────────────────────────────────────────────
const PlayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="currentColor" className="text-[#2A6EBB]">
    <polygon points="5 3 19 12 5 21 5 3"></polygon>
  </svg>
);

// ─── ActivityWrapper ──────────────────────────────────────────────────────────
type Phase = 'idle' | 'intro' | 'countdown' | 'playing';

function ActivityWrapper({
  title,
  slug,
  category,
  children,
}: {
  title: string;
  slug: string;
  category: string;
  children: React.ReactNode;
}) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [countdown, setCountdown] = useState(3);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const info = ACTIVITY_INFO[slug];

  // Countdown timer
  useEffect(() => {
    if (phase !== 'countdown') return;
    const interval = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setPhase('playing');
          return 3;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  const handleClose = () => {
    setPhase('idle');
    setCountdown(3);
  };

  const handleExportLink = (e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/embed/${slug}`;
    navigator.clipboard.writeText(url);
    alert('Enlace copiado al portapapeles:\n' + url);
    setShowExportMenu(false);
  };

  const handleExportZip = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const zip = new JSZip();
    const url = `${window.location.origin}/embed/${slug}`;

    // manifest.json — archivo clave para que el otro proyecto lea los datos sin parsear HTML
    const manifest = {
      version: "1.0",
      tipo: "actividad-bienestar",
      titulo: title,
      slug: slug,
      categoria: category,
      category: category,
      embed_url: url,
      emoji: info?.emoji ?? "🎯",
      descripcion: info?.description ?? "",
      description: info?.description ?? "",
      indicaciones: info?.steps ?? [],
      instrucciones: info?.steps ?? [],
      pasos: info?.steps ?? [],
      steps: info?.steps ?? [],
      finalizacion: {
        tipo: "manual_despues_de_tiempo_minimo",
        duracion_minima_segundos: 50,
        countdown_inicio_segundos: 3,
        evento: "BIENESTAR_ACTIVIDAD_COMPLETADA",
      },
      eventos: {
        interaccion: "BIENESTAR_ACTIVIDAD_INTERACCION",
        completada: "BIENESTAR_ACTIVIDAD_COMPLETADA",
      },
      persistencia_recomendada: {
        guardar_texto_estudiante: true,
        guardar_respuesta_ia: true,
        guardar_estado_culminacion: true,
      },
    };
    zip.file("manifest.json", JSON.stringify(manifest, null, 2));
    zip.file("instrucciones.json", JSON.stringify({
      titulo: title,
      slug,
      categoria: category,
      descripcion: info?.description ?? "",
      indicaciones: info?.steps ?? [],
      countdown_inicio_segundos: 3,
    }, null, 2));
    zip.file("instrucciones.txt", [
      title,
      "",
      info?.description ?? "",
      "",
      "Pasos a seguir:",
      ...(info?.steps ?? []).map((step, index) => `${index + 1}. ${step}`),
      "",
      "Antes de ejecutar la actividad se muestra un conteo de 3, 2, 1.",
    ].join("\n"));

    const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
    body, html { margin: 0; padding: 0; width: 100%; height: 100%; overflow: hidden; background: #fff; }
    iframe { width: 100%; height: 100%; border: none; }
  </style>
</head>
<body>
  <iframe src="${url}" allow="autoplay; fullscreen"></iframe>
</body>
</html>`;
    zip.file("index.html", htmlContent);
    const blob = await zip.generateAsync({ type: "blob" });
    const blobUrl = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = blobUrl;
    a.download = `actividad-${slug}.zip`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(blobUrl);
    setShowExportMenu(false);
  };

  // ── PLAYING ──
  if (phase === 'playing') {
    return (
      <div className="w-full relative pt-14 pb-8 px-6 bg-[#ADD8E6] rounded-3xl border border-gray-200 shadow-sm flex flex-col items-center">
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white hover:bg-red-500 transition-all bg-white border border-gray-300 rounded-full p-2 z-10 shadow-sm"
          title="Detener y cerrar"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
        {children}
      </div>
    );
  }

  // ── COUNTDOWN ──
  if (phase === 'countdown') {
    return (
      <div className="w-full h-64 rounded-3xl bg-[#ADD8E6] border border-gray-200 shadow-sm flex flex-col items-center justify-center gap-4 overflow-hidden relative">
        <p className="text-[#1F4E79] font-bold text-lg">Preparándote para comenzar…</p>
        <div
          key={countdown}
          className="text-8xl font-black text-[#2A6EBB] animate-ping-once"
          style={{ animation: 'scaleIn 0.5s ease-out' }}
        >
          {countdown}
        </div>
        <style>{`
          @keyframes scaleIn {
            0%   { transform: scale(1.8); opacity: 0; }
            60%  { transform: scale(0.9); opacity: 1; }
            100% { transform: scale(1);   opacity: 1; }
          }
        `}</style>
      </div>
    );
  }

  // ── INTRO ──
  if (phase === 'intro') {
    return (
      <div className="w-full rounded-3xl bg-[#ADD8E6] border border-gray-200 shadow-sm overflow-hidden">
        {/* Header */}
        <div className="bg-[#2A6EBB] px-8 py-6 flex items-center gap-4">
          <span className="text-5xl">{info?.emoji ?? '🎯'}</span>
          <div>
            <h3 className="text-2xl font-black text-white">{title}</h3>
            <p className="text-blue-100 text-sm mt-1">Instrucciones antes de comenzar</p>
          </div>
          <button
            onClick={handleClose}
            className="ml-auto text-white/70 hover:text-white hover:bg-white/20 rounded-full p-2 transition-colors"
            title="Cancelar"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-8 py-6 flex flex-col gap-6">
          {/* Descripción */}
          <p className="text-[#1F4E79] text-base leading-relaxed font-medium">
            {info?.description ?? 'Prepárate para comenzar la actividad.'}
          </p>

          {/* Pasos */}
          {info?.steps && (
            <div>
              <p className="text-[#2A6EBB] font-bold text-sm uppercase tracking-wider mb-3">Pasos a seguir</p>
              <ol className="flex flex-col gap-3">
                {info.steps.map((step, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-[#2A6EBB] text-white text-sm font-bold flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <span className="text-[#333333] text-sm leading-relaxed">{step}</span>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Botón de inicio */}
          <button
            onClick={() => {
              setCountdown(3);
              setPhase('countdown');
            }}
            className="self-end mt-2 flex items-center gap-3 bg-[#2A6EBB] hover:bg-[#1F4E79] text-white font-bold py-3 px-8 rounded-full transition-colors shadow-md text-base"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="5 3 19 12 5 21 5 3"></polygon>
            </svg>
            Comenzar actividad
          </button>
        </div>
      </div>
    );
  }

  // ── IDLE (tarjeta normal) ──
  return (
    <div className="w-full">
      <div
        onClick={() => setPhase('intro')}
        className="w-full h-36 rounded-3xl bg-[#ADD8E6] border border-transparent hover:border-[#2A6EBB] hover:shadow-md transition-all cursor-pointer flex flex-row items-center justify-start px-8 gap-6 group shadow-sm"
      >
        <div className="flex items-center justify-center bg-white group-hover:bg-[#eaf1f8] rounded-full w-16 h-16 transition-colors shadow-sm shrink-0 border border-gray-200 group-hover:border-[#2A6EBB]/30">
          <div className="group-hover:scale-110 transition-transform flex items-center justify-center pl-1">
            <PlayIcon />
          </div>
        </div>
        <div className="flex flex-col text-left flex-1">
          <h3 className="text-xl font-bold text-[#333333] mb-1 group-hover:text-[#2A6EBB] transition-colors">{title}</h3>
          <p className="text-[#222222] text-sm mt-1">Clic para ver instrucciones y ejecutar</p>
        </div>

        {/* Botón de Exportar */}
        <div className="relative" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={() => setShowExportMenu(!showExportMenu)}
            className="flex items-center gap-2 bg-white px-4 py-2 rounded-full text-sm font-bold text-[#2A6EBB] border border-[#2A6EBB]/30 hover:bg-[#2A6EBB] hover:text-white transition-colors shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="17 8 12 3 7 8"></polyline><line x1="12" y1="3" x2="12" y2="15"></line></svg>
            Exportar
          </button>

          {showExportMenu && (
            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden z-20">
              <button onClick={handleExportLink} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#eaf1f8] hover:text-[#2A6EBB] font-medium transition-colors border-b border-gray-50 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>
                Copiar Enlace
              </button>
              <button onClick={handleExportZip} className="w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-[#eaf1f8] hover:text-[#2A6EBB] font-medium transition-colors flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                Descargar ZIP
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function Home() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-white p-6 py-16 font-sans">

      <div className="text-center mb-12 max-w-2xl relative w-full flex flex-col items-center">
        <Link
          href="/simulador"
          className="absolute right-0 top-0 bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-md flex items-center gap-2"
        >
          <span className="text-lg">🧪</span>
          Probar Simulador
        </Link>
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-[#1F4E79] mb-4 mt-8 md:mt-0">
          Actividades
        </h1>
        <p className="text-[#222222] text-lg leading-relaxed font-medium">
          {selectedCategory
            ? `Actividades de ${selectedCategory}`
            : 'Selecciona una categoría para ver las actividades disponibles.'}
        </p>
      </div>

      {!selectedCategory ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-6xl">
          <button
            onClick={() => setSelectedCategory('Respiración')}
            className="group flex flex-col items-center justify-center p-12 h-64 rounded-[2rem] bg-[#ADD8E6] border border-transparent hover:border-[#2A6EBB] hover:shadow-lg transition-all shadow-sm"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🌬️</div>
            <h2 className="text-3xl font-extrabold text-[#333333] group-hover:text-[#2A6EBB] transition-colors">Respiración</h2>
            <p className="text-[#222222] mt-3 text-sm text-center">Ejercicios para controlar el ritmo cardíaco</p>
          </button>

          <button
            onClick={() => setSelectedCategory('Interactividad')}
            className="group flex flex-col items-center justify-center p-12 h-64 rounded-[2rem] bg-[#ADD8E6] border border-transparent hover:border-[#2A6EBB] hover:shadow-lg transition-all shadow-sm"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🎮</div>
            <h2 className="text-3xl font-extrabold text-[#333333] group-hover:text-[#2A6EBB] transition-colors">Interactividad</h2>
            <p className="text-[#222222] mt-3 text-sm text-center">Juegos y tareas para mejorar el enfoque</p>
          </button>

          <button
            onClick={() => setSelectedCategory('Meditación')}
            className="group flex flex-col items-center justify-center p-12 h-64 rounded-[2rem] bg-[#ADD8E6] border border-transparent hover:border-[#2A6EBB] hover:shadow-lg transition-all shadow-sm"
          >
            <div className="text-6xl mb-4 group-hover:scale-110 transition-transform duration-300">🧘‍♀️</div>
            <h2 className="text-3xl font-extrabold text-[#333333] group-hover:text-[#2A6EBB] transition-colors">Meditación</h2>
            <p className="text-[#222222] mt-3 text-sm text-center">Audios y guías visuales para relajar la mente</p>
          </button>
        </div>
      ) : (
        <div className="w-full max-w-3xl flex flex-col items-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className="self-start mb-8 flex items-center gap-2 text-[#2A6EBB] hover:text-[#1F4E79] hover:bg-[#eaf1f8] px-5 py-2.5 rounded-full transition-colors font-bold border border-transparent hover:border-[#2A6EBB]/20"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Volver a Categorías
          </button>

          <div className="flex flex-col gap-6 w-full">
            {selectedCategory === 'Respiración' && (
              <>
                <ActivityWrapper title="Respiración Guiada" slug="respiracion-guia" category="Respiración"><RespiracionGuia /></ActivityWrapper>
                <ActivityWrapper title="Respiración Montaña" slug="respiracion-montana" category="Respiración"><RespiracionMontana /></ActivityWrapper>
                <ActivityWrapper title="Vela Breathe" slug="rollercoaster-breathe" category="Respiración"><RollercoasterBreathe /></ActivityWrapper>
                <ActivityWrapper title="Rollercoaster Zen" slug="rollercoaster-zen" category="Respiración"><RollercoasterZen /></ActivityWrapper>
              </>
            )}

            {selectedCategory === 'Interactividad' && (
              <>
                <ActivityWrapper title="Burbujas de Alivio" slug="burbujas-alivio" category="Interactividad"><BurbujasAlivio /></ActivityWrapper>
                <ActivityWrapper title="Trazo Zen" slug="trazo-zen" category="Interactividad"><TrazoZen /></ActivityWrapper>
                <ActivityWrapper title="Interacción Montaña" slug="interaccion-montana" category="Interactividad"><InteraccionMontana /></ActivityWrapper>
                <ActivityWrapper title="Globos" slug="globos" category="Interactividad"><Globos /></ActivityWrapper>
                <ActivityWrapper title="Registro de Pensamientos" slug="pensamientos" category="Interactividad"><Pensamientos /></ActivityWrapper>
                <ActivityWrapper title="Burbujas Emocionales IA" slug="burbujas-emocionales" category="Interactividad"><BurbujasEmocionales /></ActivityWrapper>
              </>
            )}

            {selectedCategory === 'Meditación' && (
              <>
                <ActivityWrapper title="Meditación Guiada en Video" slug="meditacion-guiada" category="Meditación"><MeditacionGuiada /></ActivityWrapper>
                <ActivityWrapper title="Árbol de Bienestar IA" slug="arbol-bienestar" category="Meditación"><ArbolBienestar /></ActivityWrapper>
              </>
            )}
          </div>
        </div>
      )}

    </main>
  );
}
