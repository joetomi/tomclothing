'use client';

import React from 'react';
import { ContactInfo } from '@/types/site';
import { ArrowUpRight } from './EditorialIcons';

interface ContactSectionProps {
  contact: ContactInfo;
}

export default function ContactSection({ contact }: ContactSectionProps) {
  const whatsappUrl = contact.whatsappE164
    ? `https://wa.me/${contact.whatsappE164.replace(/[^0-9]/g, '')}`
    : `https://wa.me/218${contact.whatsappDisplay?.replace(/^0/, '') || '913335999'}`;

  return (
    <section id="contact" className="w-full border-t border-white/10 bg-black py-16 text-white md:py-24">
      <div className="mx-auto max-w-4xl space-y-7 px-6 text-center">
        <span className="text-xs uppercase tracking-[0.3em] text-tom-muted font-sans block">
          CONTACT
        </span>

        <h2 className="font-serif text-3xl font-normal text-white md:text-5xl">
          تواصل معنا
        </h2>

        <a
          href={`tel:${contact.phone}`}
          className="inline-block text-3xl font-light tracking-widest text-white transition-colors hover:text-tom-muted md:text-5xl"
        >
          {contact.phone}
        </a>

        <div className="flex justify-center items-center gap-8 pt-4 text-xs font-sans tracking-widest">
          <a
            href={`tel:${contact.phone}`}
            className="py-2 px-6 border border-white text-white hover:bg-white hover:text-black transition-colors uppercase"
          >
            CALL
          </a>
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="py-2 px-6 border border-white text-white hover:bg-white hover:text-black transition-colors uppercase"
          >
            WHATSAPP
          </a>
        </div>

        {/* Official Social Media Channels */}
        <div className="flex flex-wrap justify-center items-center gap-8 pt-8 text-xs font-sans tracking-widest text-white uppercase">
          {contact.instagram && <a href={contact.instagram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-tom-muted">INSTAGRAM <ArrowUpRight /></a>}
          {contact.tiktok && <a href={contact.tiktok} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-tom-muted">TIKTOK <ArrowUpRight /></a>}
          {contact.telegram && <a href={contact.telegram} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 transition-colors hover:text-tom-muted">TELEGRAM <ArrowUpRight /></a>}
        </div>
      </div>
    </section>
  );
}
