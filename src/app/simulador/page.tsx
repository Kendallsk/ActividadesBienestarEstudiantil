"use client";

import { useEffect, useState, useRef } from 'react';
import JSZip from 'jszip';
import Link from 'next/link';

type ImportedManifest = {
  titulo?: string;
  title?: string;
  slug?: string;
  categoria?: string;
  category?: string;
  descripcion?: string;
  description?: string;
  embed_url?: string;
};

type BienestarEvent = {
  type?: string;
  actividad?: string;
  timestamp?: string;
  asignacionId?: string | null;
  intentoId?: string | null;
  estudianteId?: string | null;
  duracion_segundos?: number;
  culmino?: boolean;
  datos?: Record<string, unknown>;
};

const BIENESTAR_EVENT_TYPES = [
  "BIENESTAR_ACTIVIDAD_INTERACCION",
  "BIENESTAR_ACTIVIDAD_COMPLETADA",
];

export default function SimuladorPage() {
  const [importedUrl, setImportedUrl] = useState<string | null>(null);
  const [importedManifest, setImportedManifest] = useState<ImportedManifest | null>(null);
  const [receivedEvents, setReceivedEvents] = useState<BienestarEvent[]>([]);
  const [linkInput, setLinkInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      const payload = event.data as BienestarEvent;

      if (!payload || !BIENESTAR_EVENT_TYPES.includes(payload.type ?? "")) {
        return;
      }

      console.log("[Simulador] Evento recibido desde actividad:", payload);
      setReceivedEvents((current) => [payload, ...current].slice(0, 10));

      // En el otro proyecto, aqui se debe llamar al backend para persistir:
      // - BIENESTAR_ACTIVIDAD_INTERACCION -> crear registro en bienestar_interacciones
      // - BIENESTAR_ACTIVIDAD_COMPLETADA -> actualizar bienestar_intentos como completado
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const handleImportLink = () => {
    if (!linkInput.trim()) {
      setError("Por favor ingresa un enlace válido.");
      return;
    }
    setImportedUrl(linkInput);
    setImportedManifest(null);
    setReceivedEvents([]);
    setError(null);
  };

  const handleImportZip = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      const zip = new JSZip();
      const loadedZip = await zip.loadAsync(file);

      // 1. Intentar leer el manifest.json primero (método recomendado)
      const manifestFile = loadedZip.file("manifest.json");
      if (manifestFile) {
        const manifestContent = await manifestFile.async("string");
        const manifest = JSON.parse(manifestContent) as ImportedManifest;
        if (manifest.embed_url) {
          setImportedUrl(manifest.embed_url);
          setImportedManifest(manifest);
          setReceivedEvents([]);
          return;
        }
      }

      // 2. Fallback: leer el index.html y extraer la URL con regex
      const htmlFile = loadedZip.file("index.html");
      if (!htmlFile) {
        setError("El archivo ZIP no tiene el formato correcto.");
        return;
      }
      const htmlContent = await htmlFile.async("string");
      const match = htmlContent.match(/<iframe[^>]+src=["']([^"']+)["']/i);
      const extractedUrl = match?.[1] ?? null;

      if (!extractedUrl) {
        setError("No se pudo extraer la URL de la actividad del archivo ZIP.");
        return;
      }
      setImportedUrl(extractedUrl);
      setImportedManifest(null);
      setReceivedEvents([]);

    } catch (err) {
      console.error(err);
      setError("Hubo un error al intentar leer el archivo ZIP.");
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClose = () => {
    if (importedUrl && importedUrl.startsWith('blob:')) {
      URL.revokeObjectURL(importedUrl);
    }
    setImportedUrl(null);
    setImportedManifest(null);
    setReceivedEvents([]);
    setLinkInput('');
    setError(null);
  };

  return (
    <main className="min-h-screen bg-gray-50 font-sans">
      {/* Header Falso del "Otro Proyecto" */}
      <header className="bg-slate-900 text-white p-4 shadow-md flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center font-bold">P</div>
          <h1 className="text-xl font-bold">Plataforma Educativa (Simulador)</h1>
        </div>
        <Link href="/" className="text-sm text-slate-300 hover:text-white transition-colors">
          Volver a la Fábrica
        </Link>
      </header>

      <div className="max-w-5xl mx-auto p-8">
        
        {!importedUrl ? (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-6">Importar Nueva Actividad</h2>
            
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 text-sm font-medium border border-red-100">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Opción 1: Enlace */}
              <div className="flex flex-col gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-lg mb-2">
                  <span className="text-2xl">🔗</span> Por Enlace
                </div>
                <p className="text-sm text-slate-500">Pega el enlace web de la actividad.</p>
                <input
                  type="text"
                  placeholder="https://..."
                  value={linkInput}
                  onChange={(e) => setLinkInput(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <button 
                  onClick={handleImportLink}
                  className="mt-auto bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                >
                  Importar Enlace
                </button>
              </div>

              {/* Opción 2: Archivo ZIP */}
              <div className="flex flex-col gap-4 p-6 bg-slate-50 rounded-xl border border-slate-100">
                <div className="flex items-center gap-3 text-slate-800 font-bold text-lg mb-2">
                  <span className="text-2xl">📦</span> Por Archivo ZIP
                </div>
                <p className="text-sm text-slate-500">Sube el paquete .zip de la actividad.</p>
                
                <div className="flex-1 flex items-center justify-center border-2 border-dashed border-slate-300 rounded-lg bg-white hover:bg-slate-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept=".zip"
                    onChange={handleImportZip}
                    ref={fileInputRef}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="text-center p-4">
                    <svg className="mx-auto h-12 w-12 text-slate-400 mb-2" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                      <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span className="text-sm font-medium text-blue-600">Haz clic para buscar el archivo</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden flex flex-col" style={{ height: '70vh' }}>
            <div className="bg-slate-100 p-4 border-b border-gray-200 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-slate-700 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span> Actividad en ejecución
                </h3>
                {importedManifest && (
                  <p className="text-xs text-slate-500 mt-1">
                    Categoría leída del ZIP:{" "}
                    <span className="font-bold text-slate-700">
                      {importedManifest.categoria ?? importedManifest.category ?? "Sin categoría"}
                    </span>
                  </p>
                )}
              </div>
              <button 
                onClick={handleClose}
                className="text-sm bg-white border border-gray-300 hover:bg-red-50 hover:text-red-600 hover:border-red-200 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Cerrar Actividad
              </button>
            </div>
            <div className="flex-1 relative bg-black/5">
              {/* El iframe que renderiza la actividad importada */}
              <iframe 
                src={importedUrl} 
                className="absolute inset-0 w-full h-full border-none"
                allow="autoplay; fullscreen"
                title="Actividad Importada"
              />
            </div>
            <div className="border-t border-gray-200 bg-white p-4">
              <h4 className="text-sm font-bold text-slate-700">
                Eventos recibidos por la plataforma padre
              </h4>
              {receivedEvents.length === 0 ? (
                <p className="mt-1 text-xs text-slate-500">
                  Todavía no se recibió ningún evento. Al finalizar o interactuar con IA aparecerá aquí.
                </p>
              ) : (
                <div className="mt-3 max-h-32 overflow-auto rounded-lg bg-slate-950 p-3 text-xs text-slate-100">
                  <pre>{JSON.stringify(receivedEvents, null, 2)}</pre>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </main>
  );
}
