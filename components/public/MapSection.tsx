'use client';

import React from 'react';
import { Branch } from '@/types/site';
import { ArrowUpRight } from './EditorialIcons';

interface MapSectionProps {
  branch?: Branch;
}

export default function MapSection({ branch }: MapSectionProps) {
  if (!branch || branch.status !== 'open') return null;

  return (
    <section className="w-full bg-tom-white py-12 text-tom-black md:py-20">
      <div className="max-w-7xl mx-auto px-6 md:px-12 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 text-right">
          <div>
            <span className="text-xs uppercase tracking-[0.25em] text-tom-muted block">
              LOCATION & MAP
            </span>
            <h3 className="text-2xl md:text-4xl font-serif text-tom-black font-normal mt-1">
              موقع فرع مصراتة
            </h3>
          </div>
          {branch.mapsUrl && (
            <a
              href={branch.mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-xs tracking-widest uppercase text-tom-black border-b border-tom-black pb-1 hover:text-tom-muted hover:border-tom-muted transition-colors w-fit font-sans"
            >
              <span className="inline-flex items-center gap-1.5">فتح في خرائط Google <ArrowUpRight /></span>
            </a>
          )}
        </div>

        {/* Map Container */}
        <div className="relative h-[52svh] min-h-[340px] w-full overflow-hidden bg-tom-sand grayscale contrast-125 transition-all duration-700 hover:grayscale-0 md:h-[500px]">
          {branch.mapEmbedUrl ? (
            <iframe
              src={branch.mapEmbedUrl}
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="موقع توم للملابس مصراتة"
            />
          ) : (
            <div className="w-full h-full flex flex-col items-center justify-center p-8 text-center space-y-4">
              <div className="space-y-2">
                <p className="text-2xl font-serif text-tom-black">{branch.name}</p>
                <p className="text-sm text-tom-darkMuted font-light">{branch.address}</p>
              </div>
              {branch.mapsUrl && (
                <a
                  href={branch.mapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 px-6 py-3 bg-tom-black text-white text-xs uppercase tracking-widest hover:bg-tom-charcoal transition-colors font-sans"
                >
                  <span className="inline-flex items-center gap-1.5">افتح اتجاهات الخريطة <ArrowUpRight /></span>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
