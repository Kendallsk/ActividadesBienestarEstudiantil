"use client";
import React from 'react';

export default function MeditacionGuiada() {
  return (
    <div 
      className="relative w-full max-w-4xl mx-auto h-[600px] rounded-3xl overflow-hidden shadow-2xl border border-gray-200 font-sans"
      style={{
        backgroundImage: 'url("https://cdn.shopify.com/s/files/1/1301/7189/files/Que_es_la_meditacion_1024x1024.jpg?v=1662032470")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Overlay translúcido para fondo legible */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-[2px] flex flex-col justify-center items-center p-6">
        
        <h2 className="text-white text-3xl md:text-4xl font-bold mb-6 text-center drop-shadow-md">
          Meditación Guiada
        </h2>
        
        <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-md border border-white/30 shadow-2xl overflow-hidden transform transition-all hover:scale-[1.02]">
          <iframe 
            width="315" 
            height="560" 
            src="https://www.youtube.com/embed/pUzUa4pDym0" 
            title="YouTube video player" 
            frameBorder="0" 
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
            referrerPolicy="strict-origin-when-cross-origin"
            allowFullScreen
            className="rounded-2xl"
          ></iframe>
        </div>
        
        <div className="mt-8 text-center max-w-md bg-white/80 p-4 rounded-2xl backdrop-blur-sm border border-white/50 shadow-sm">
          <p className="text-[#1F4E79] font-bold text-lg mb-1">
            Instrucciones
          </p>
          <p className="text-[#333333] text-sm font-medium">
            Toma una postura cómoda, reproduce el video para escuchar el audio de meditación y observa esta imagen de paz para centrar tu respiración.
          </p>
        </div>

      </div>
    </div>
  );
}
