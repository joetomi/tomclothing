'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NavItem, BrandInfo } from '@/types/site';

interface MastheadProps {
  brand: BrandInfo;
  navigation: NavItem[];
}

export default function Masthead({ brand, navigation }: MastheadProps) {
  const visibleNavs = navigation.filter((item) => item.visible);

  return (
    <section className="w-full bg-white text-tom-black pt-12 pb-16 md:pt-16 md:pb-24 border-b border-tom-stone/30 flex flex-col items-center justify-center text-center select-none">
      {/* Utility Phone Link (Quiet Top Header Bar) */}
      <div className="w-full max-w-7xl px-6 md:px-12 flex justify-between items-center text-xs tracking-widest text-tom-muted uppercase mb-10 font-sans">
        <span>MISURATA — LIBYA</span>
        <a href="tel:0913335999" className="hover:text-tom-black transition-colors font-mono">
          0913335999
        </a>
      </div>

      {/* MAJOR BRAND LOGO MASTHEAD (Occupies ~45vw / 260px - 760px) */}
      <div className="relative my-4 w-[clamp(260px,45vw,760px)] aspect-[3/1] transition-transform duration-700 hover:scale-[1.01]">
        <Image
          src="/brand/logo-black.png"
          alt={brand.name}
          fill
          priority
          sizes="(max-width: 768px) 80vw, 50vw"
          className="object-contain"
        />
      </div>

      <p className="text-xs uppercase tracking-[0.35em] text-tom-muted font-light mt-3 mb-10">
        FEMALE FASHION LOOKBOOK
      </p>

      {/* MINIMAL RESTRAINED NAVIGATION */}
      <nav className="flex flex-wrap items-center justify-center gap-8 md:gap-14 pt-4 border-t border-tom-stone/40 w-full max-w-4xl px-6">
        {visibleNavs.map((nav) => (
          <Link
            key={nav.id}
            href={nav.href}
            className="text-base md:text-lg tracking-widest font-sans font-light text-tom-black/85 hover:text-tom-black transition-colors relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-[1.5px] after:bg-tom-black after:transition-all after:duration-300 hover:after:w-full"
          >
            {nav.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
