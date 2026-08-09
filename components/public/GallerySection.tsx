'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { GalleryItem } from '@/types/site';
import { ArrowLeft, ArrowRight, CloseMark } from './EditorialIcons';

interface GallerySectionProps {
  gallery: GalleryItem[];
}

export default function GallerySection({ gallery }: GallerySectionProps) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const visibleGallery = gallery
    .filter((item) => item.visible)
    .sort((a, b) => a.order - b.order);

  if (visibleGallery.length === 0) return null;

  const currentItem = lightboxIndex !== null ? visibleGallery[lightboxIndex] : null;

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex + 1) % visibleGallery.length);
    }
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIndex !== null) {
      setLightboxIndex((lightboxIndex - 1 + visibleGallery.length) % visibleGallery.length);
    }
  };

  return (
    <section id="collection" className="w-screen bg-black text-white select-none py-12 md:py-24 m-0 p-0">
      {/* Editorial Header */}
      <div className="w-full max-w-[1920px] mx-auto px-6 md:px-12 flex justify-between items-end border-b border-white/15 pb-6 mb-2 text-right">
        <span className="text-xs font-mono tracking-[0.3em] uppercase text-tom-muted">
          LOOKBOOK — {visibleGallery.length} LOOKS
        </span>
        <h2 className="text-2xl md:text-4xl font-serif text-white font-normal tracking-wide">
          التشكيلـة
        </h2>
      </div>

      {/* Edge-to-Edge Grid (0px - 2px gap, No white cards) */}
      <div className="w-screen grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-1 md:gap-2 bg-black m-0 p-0">
        {visibleGallery.map((item, index) => {
          const desktopPos = item.focalPoint
            ? `${item.focalPoint.desktop.x}% ${item.focalPoint.desktop.y}%`
            : '50% 35%';

          return (
            <div
              key={item.id}
              onClick={() => setLightboxIndex(index)}
              className="group relative cursor-pointer overflow-hidden bg-black aspect-[3/4] block m-0 p-0"
            >
              <Image
                src={item.src}
                alt={item.alt || `TOM Look ${index + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                quality={95}
                style={{ objectFit: 'cover', objectPosition: desktopPos }}
                className="block transition-transform duration-700 ease-out group-hover:scale-[1.02]"
              />
            </div>
          );
        })}
      </div>

      {/* Pure Typographical Lightbox Overlay */}
      {currentItem && (
        <div
          onClick={() => setLightboxIndex(null)}
          className="fixed inset-0 z-50 bg-black/98 text-white flex flex-col justify-between p-6 md:p-10 animate-in fade-in duration-300 select-none"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between z-10 font-sans">
            <span className="text-xs tracking-widest uppercase text-white/60">
              TOM LOOKBOOK — {lightboxIndex! + 1} / {visibleGallery.length}
            </span>
            <button
              onClick={() => setLightboxIndex(null)}
              className="text-xs tracking-widest text-white/80 hover:text-white uppercase py-1.5 px-4 border border-white/30 hover:border-white transition-colors"
              aria-label="أغلق"
            >
              <span className="inline-flex items-center gap-2">إغـلاق <CloseMark className="h-3.5 w-3.5" /></span>
            </button>
          </div>

          {/* Lightbox Image Container */}
          <div className="relative flex-1 flex items-center justify-center my-4 overflow-hidden">
            <div className="relative w-full h-full max-h-[88vh] max-w-5xl">
              <Image
                src={currentItem.src}
                alt={currentItem.alt || 'TOM Look'}
                fill
                quality={95}
                sizes="100vw"
                className="object-contain"
              />
            </div>

            {/* Navigation Text Controls */}
            <button
              onClick={handlePrev}
              className="absolute left-2 md:left-8 px-4 py-2 bg-black/80 hover:bg-black text-white text-xs tracking-widest transition-colors font-sans border border-white/30"
              aria-label="السابقة"
            >
              <span className="inline-flex items-center gap-2"><ArrowLeft /> السابقة</span>
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 md:right-8 px-4 py-2 bg-black/80 hover:bg-black text-white text-xs tracking-widest transition-colors font-sans border border-white/30"
              aria-label="التالية"
            >
              <span className="inline-flex items-center gap-2">التالية <ArrowRight /></span>
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
