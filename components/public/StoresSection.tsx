'use client';

import React from 'react';
import { Branch } from '@/types/site';
import { ArrowUpRight } from './EditorialIcons';

interface StoresSectionProps {
  branches: Branch[];
}

export default function StoresSection({ branches }: StoresSectionProps) {
  const visibleBranches = branches.filter((b) => b.status !== 'hidden');

  return (
    <section id="stores" className="w-full bg-black py-16 text-white md:py-24">
      <div className="mx-auto max-w-5xl space-y-12 px-6 md:px-12">
        {/* Header */}
        <div className="flex justify-between items-end border-b border-white/15 pb-4 text-right">
          <span className="text-xs uppercase tracking-[0.25em] text-tom-muted font-sans">
            BOUTIQUES
          </span>
          <h2 className="text-2xl md:text-4xl font-serif text-white font-normal tracking-wide">
            الـفـروع
          </h2>
        </div>

        {/* Store Items */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20 text-right">
          {visibleBranches.map((branch) => {
            const isOpen = branch.status === 'open';

            return (
              <div key={branch.id} className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-mono tracking-widest text-tom-muted uppercase">
                    {isOpen ? 'STORE OPEN' : 'COMING SOON'}
                  </span>
                  <h3 className="text-2xl md:text-3xl font-serif text-white">
                    {branch.city}
                  </h3>
                </div>

                <p className="text-base text-white/90 font-sans font-light">
                  {branch.address}
                </p>

                {isOpen ? (
                  <div className="pt-2 flex items-center justify-between text-sm font-sans border-t border-white/15">
                    {branch.mapsUrl && (
                      <a
                        href={branch.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs tracking-widest uppercase text-white hover:text-tom-muted transition-colors underline"
                      >
                        <span className="inline-flex items-center gap-1.5">الاتجاهات <ArrowUpRight /></span>
                      </a>
                    )}
                    {branch.phone && (
                      <a href={`tel:${branch.phone}`} className="font-mono text-white">
                        {branch.phone}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="pt-2 border-t border-white/15">
                    <span className="text-xs text-tom-muted tracking-widest uppercase">
                      قـريـبـاً
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
