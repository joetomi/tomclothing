'use client';

import React from 'react';
import Image from 'next/image';
import { BrandInfo, NavItem } from '@/types/site';

interface FooterProps {
  brand: BrandInfo;
  navigation: NavItem[];
}

export default function Footer({ brand, navigation }: FooterProps) {
  return (
    <footer className="w-full border-t border-white/10 bg-black py-10 text-white">
      <div className="mx-auto max-w-4xl space-y-6 px-6 text-center">
        {/* White TOM Logo */}
        <div className="relative h-8 w-28 mx-auto">
          <Image
            src="/brand/logo-white.svg"
            alt={brand.name}
            fill
            className="object-contain"
          />
        </div>

        {/* Address & Phone */}
        <div className="space-y-1 text-xs text-tom-muted font-sans tracking-wider">
          <p>مصراتة — المقاوبة مقابل نادي السويحلي</p>
          <p className="font-mono">0913335999</p>
        </div>

        <div className="border-t border-white/10 pt-5 text-[11px] font-sans tracking-wider text-tom-muted">
          <p>© {new Date().getFullYear()} TOM. ALL RIGHTS RESERVED.</p>
        </div>
      </div>
    </footer>
  );
}
