'use client';

import React from 'react';
import Image from 'next/image';
import { HeroConfig, BrandInfo } from '@/types/site';

interface HeroProps {
  hero: HeroConfig;
  brand: BrandInfo;
  previewMode?: boolean;
  editorControls?: React.ReactNode;
}

export default function Hero({ hero, brand, previewMode = false, editorControls }: HeroProps) {
  if (!hero.visible) return null;

  const desktopPos = `${hero.focalPoint.desktop.x}% ${hero.focalPoint.desktop.y}%`;
  const mobilePos = `${hero.focalPoint.mobile.x}% ${hero.focalPoint.mobile.y}%`;

  return (
    <section className={`relative w-full m-0 overflow-hidden bg-tom-black p-0 select-none ${previewMode ? 'h-[760px]' : 'h-[100svh]'}`}>
      {/* Desktop Full-Bleed Opening Campaign Image */}
      <div className="absolute inset-0 hidden md:block">
        <Image
          src={hero.image}
          alt={brand.name}
          fill
          priority
          sizes="100vw"
          quality={95}
          style={{ objectFit: 'cover', objectPosition: desktopPos }}
        />
      </div>

      {/* Mobile Opening Campaign Image */}
      <div className="absolute inset-0 block md:hidden">
        <Image
          src={hero.mobileImage || hero.image}
          alt={brand.name}
          fill
          priority
          sizes="100vw"
          quality={95}
          style={{ objectFit: 'cover', objectPosition: mobilePos }}
        />
      </div>
      {editorControls}
    </section>
  );
}
