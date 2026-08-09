import React from 'react';
import { AboutSection as AboutType } from '@/types/site';

interface AboutSectionProps {
  about: AboutType;
}

export default function AboutSection({ about }: AboutSectionProps) {
  return (
    <section id="about" className="w-full bg-black py-16 text-white md:py-24">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h2 className="font-latin text-6xl font-light tracking-[-0.05em] text-white md:text-8xl">
          TOM
        </h2>
        {about.text && <p className="mx-auto mt-4 max-w-sm text-base font-light leading-8 text-white/70 md:text-lg">{about.text}</p>}
      </div>
    </section>
  );
}
