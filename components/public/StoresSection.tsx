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
      <div className="mx-auto max-w-5xl px-4 md:px-12">
        <div className="mb-8 text-center md:mb-12">
          <span className="font-sans text-[10px] uppercase tracking-[0.32em] text-white/45">
            TOM BOUTIQUES
          </span>
          <h2 className="mt-3 font-serif text-4xl font-normal text-white md:text-5xl">
            المتاجر
          </h2>
          <span className="mx-auto mt-5 block h-px w-12 bg-white/35" />
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-6" dir="rtl">
          {visibleBranches.map((branch, index) => {
            const isOpen = branch.status === 'open';

            return (
              <article key={branch.id} className="flex min-h-[260px] flex-col border border-white/15 bg-white/[0.025] p-5 text-right md:min-h-[300px] md:p-7">
                <div className="flex items-start justify-between gap-5">
                  <div>
                    <span className="font-mono text-[10px] tracking-[0.24em] text-white/35" dir="ltr">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="mt-3 font-serif text-3xl text-white md:text-4xl">
                      {branch.city}
                    </h3>
                  </div>
                  <span className={`shrink-0 border px-3 py-1.5 text-[10px] font-medium tracking-wide ${isOpen ? 'border-white/35 text-white' : 'border-white/15 text-white/45'}`}>
                    {isOpen ? 'مفتوح الآن' : 'قريباً'}
                  </span>
                </div>

                <p className="mt-6 max-w-sm font-sans text-sm font-light leading-7 text-white/70 md:text-base">
                  {branch.address}
                </p>

                {branch.workingHours && (
                  <div className="mt-5 border-t border-white/10 pt-4">
                    <span className="block text-[10px] tracking-[0.18em] text-white/35">
                      ساعات العمل
                    </span>
                    <p className="mt-2 whitespace-pre-line text-xs leading-6 text-white/70 md:text-sm">
                      {branch.workingHours}
                    </p>
                  </div>
                )}

                {isOpen ? (
                  <div className="mt-auto grid grid-cols-2 gap-2 border-t border-white/15 pt-5 font-sans">
                    {branch.mapsUrl && (
                      <a
                        href={branch.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex min-h-11 items-center justify-center gap-2 bg-white px-3 text-xs font-semibold text-black transition-colors hover:bg-white/85"
                      >
                        <span>الاتجاهات</span>
                        <ArrowUpRight className="h-4 w-4" />
                      </a>
                    )}
                    {branch.phone && (
                      <a href={`tel:${branch.phone}`} className="inline-flex min-h-11 items-center justify-center border border-white/25 px-3 font-mono text-sm text-white transition-colors hover:border-white/60">
                        {branch.phone}
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="mt-auto border-t border-white/10 pt-5">
                    <span className="text-xs text-white/35">
                      سيتم الإعلان عن الافتتاح قريباً
                    </span>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
