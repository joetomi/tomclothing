'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NavItem, BrandInfo } from '@/types/site';
import { ArrowUpLeft, CloseMark } from './EditorialIcons';

interface HeaderProps {
  brand: BrandInfo;
  navigation: NavItem[];
}

export default function Header({ brand, navigation }: HeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 80) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const visibleNavs = navigation.filter((item) => item.visible);

  return (
    <>
      {/* Desktop Header Navigation */}
      <header
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 py-4 px-6 md:px-12 select-none pointer-events-none hidden md:block ${
          isScrolled
            ? 'bg-black/90 backdrop-blur-md border-b border-white/10 text-white shadow-lg pointer-events-auto'
            : 'bg-transparent text-white'
        }`}
      >
        <div className="w-full max-w-[1920px] mx-auto flex items-center justify-between pointer-events-auto">
          {/* Desktop Logo */}
          <Link href="/" className="group flex items-center gap-3">
            <div className="relative h-8 w-32 md:h-9 md:w-36 transition-transform duration-300 group-hover:scale-[1.02]">
              <Image
                src="/brand/logo-white.svg"
                alt={brand.name}
                fill
                priority
                className="object-contain"
              />
            </div>
            <span className="sr-only">{brand.arabicName}</span>
          </Link>

          {/* Desktop Navigation Text Links (15-17px) */}
          <nav className="flex items-center gap-8 lg:gap-12">
            {visibleNavs.map((nav) => (
              <Link
                key={nav.id}
                href={nav.href}
                className="text-base font-sans tracking-widest text-white/90 hover:text-white transition-opacity relative py-1 after:content-[''] after:absolute after:bottom-0 after:right-0 after:w-0 after:h-[1.5px] after:bg-white after:transition-all after:duration-300 hover:after:w-full"
              >
                {nav.label}
              </Link>
            ))}
          </nav>

          {/* Quiet Phone Utility Link */}
          <div className="text-xs font-mono tracking-widest text-white/80">
            <a href="tel:0913335999" className="hover:text-white transition-colors">
              0913335999
            </a>
          </div>
        </div>
      </header>

      {/* Mobile Hamburger Menu Icon — Positioned at FAR TOP-LEFT (top: 20px, left: 20px) */}
      <button
        onClick={() => setMobileMenuOpen(true)}
        className="fixed left-3.5 top-3.5 z-50 flex h-11 w-11 items-center justify-center focus:outline-none md:hidden"
        aria-label="القائمة"
      >
        <span className="relative block h-[10px] w-[27px] drop-shadow-[0_1px_3px_rgba(0,0,0,1)]">
          <span className="absolute left-0 top-0 block h-[2px] w-full bg-black" />
          <span className="absolute bottom-0 left-0 block h-[2px] w-full bg-black" />
        </span>
      </button>

      {/* Full-Screen Mobile Editorial Navigation Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 bg-black text-white flex flex-col justify-between p-8 md:hidden animate-in fade-in duration-300 select-none">
          <div className="flex items-center justify-between border-b border-tom-charcoal pb-6">
            <div className="relative h-8 w-28">
              <Image
                src="/brand/logo-white.svg"
                alt={brand.name}
                fill
                className="object-contain"
              />
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="p-2 text-white text-2xl font-sans focus:outline-none"
              aria-label="إغلاق"
            >
              <CloseMark className="h-5 w-5" />
            </button>
          </div>

          <nav className="flex flex-col gap-8 my-auto py-10">
            {visibleNavs.map((nav) => (
              <Link
                key={nav.id}
                href={nav.href}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-between text-3xl font-serif tracking-wide border-b border-tom-charcoal pb-4 text-white/90 hover:text-white transition-colors"
              >
                <span>{nav.label}</span>
                <ArrowUpLeft className="h-5 w-5 text-white/55" />
              </Link>
            ))}
          </nav>

          <div className="border-t border-tom-charcoal pt-6 space-y-2 text-xs text-tom-muted font-sans">
            <div className="flex justify-between items-center text-white font-medium">
              <span>مصراتة - المقاوبة مقابل نادي السويحلي</span>
              <a href="tel:0913335999" className="underline font-mono">
                0913335999
              </a>
            </div>
            <p className="tracking-wider uppercase text-tom-muted">
              TOM FEMALE FASHION © 2026
            </p>
          </div>
        </div>
      )}
    </>
  );
}
