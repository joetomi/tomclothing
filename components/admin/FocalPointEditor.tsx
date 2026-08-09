'use client';

import React, { useState, useRef } from 'react';
import Image from 'next/image';
import { FocalPoints, SceneType } from '@/types/site';
import { Monitor, Smartphone } from 'lucide-react';

export type DesktopPreset = '1440x900' | '1920x1080';
export type MobilePreset = '360x800' | '390x844' | '430x932';

interface FocalPointEditorProps {
  imageSrc: string;
  focalPoints: FocalPoints;
  onChange: (newFocalPoints: FocalPoints) => void;
  optionalMobileImage?: string;
  sceneType?: SceneType;
  splitRatio?: string;
}

export default function FocalPointEditor({
  imageSrc,
  focalPoints,
  onChange,
  optionalMobileImage,
  sceneType = 'split-screen',
  splitRatio = '50/50',
}: FocalPointEditorProps) {
  const [activeTab, setActiveTab] = useState<'desktop' | 'mobile'>('desktop');
  const [desktopPreset, setDesktopPreset] = useState<DesktopPreset>('1440x900');
  const [mobilePreset, setMobilePreset] = useState<MobilePreset>('390x844');

  const imageRef = useRef<HTMLDivElement>(null);

  const currentFocal = activeTab === 'desktop' ? focalPoints.desktop : focalPoints.mobile;

  const handlePointerClick = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const rect = imageRef.current.getBoundingClientRect();
    const xPx = e.clientX - rect.left;
    const yPx = e.clientY - rect.top;

    const x = Math.min(100, Math.max(0, Math.round((xPx / rect.width) * 100)));
    const y = Math.min(100, Math.max(0, Math.round((yPx / rect.height) * 100)));

    if (activeTab === 'desktop') {
      onChange({ ...focalPoints, desktop: { x, y } });
    } else {
      onChange({ ...focalPoints, mobile: { x, y } });
    }
  };

  const desktopPositionCss = `${focalPoints.desktop.x}% ${focalPoints.desktop.y}%`;
  const mobilePositionCss = `${focalPoints.mobile.x}% ${focalPoints.mobile.y}%`;

  // Calculate actual viewport container aspect ratios
  const getViewportDimensions = () => {
    if (activeTab === 'desktop') {
      const [w, h] = desktopPreset.split('x').map(Number);
      return { width: w, height: h, ratio: w / h };
    } else {
      const [w, h] = mobilePreset.split('x').map(Number);
      return { width: w, height: h, ratio: w / h };
    }
  };

  const currentVp = getViewportDimensions();

  // Compute exact scene aspect ratio inside selected viewport preset
  const getSceneBoxStyle = (mode: 'desktop' | 'mobile') => {
    const vp = mode === 'desktop'
      ? { w: Number(desktopPreset.split('x')[0]), h: Number(desktopPreset.split('x')[1]) }
      : { w: Number(mobilePreset.split('x')[0]), h: Number(mobilePreset.split('x')[1]) };

    const vpRatio = vp.w / vp.h;

    let containerAspect = vpRatio;

    if (sceneType === 'full-screen') {
      // 100svh viewport filling
      containerAspect = vpRatio;
    } else if (sceneType === 'full-width') {
      containerAspect = mode === 'desktop' ? 21 / 9 : 16 / 9;
    } else if (sceneType === 'split-screen') {
      // Stacked on mobile (3/4), side-by-side on desktop
      containerAspect = mode === 'desktop' ? 3 / 4 : 3 / 4;
    } else if (sceneType === 'asymmetric') {
      containerAspect = splitRatio.startsWith('65') ? 4 / 5 : 3 / 4;
    }

    return {
      aspectRatio: `${containerAspect}`,
    };
  };

  return (
    <div className="bg-tom-paper border border-tom-stone p-6 space-y-6 text-right">
      {/* Header & Viewport Presets Bar */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 border-b border-tom-stone pb-4">
        <div>
          <h4 className="text-lg font-serif text-tom-black font-semibold">
            محرر مركز التركيز البصري (True Viewport WYSIWYG Editor)
          </h4>
          <p className="text-xs text-tom-darkMuted">
            انقري على النقطة الأساسية المعنية بالتركيز. المعاينة أدناه تستخدم أبعاد الشاشات الحقيقية بالضبط.
          </p>
        </div>

        {/* Viewport & Preset Selectors */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Tab Switcher */}
          <div className="flex items-center bg-tom-stone/50 p-1 border border-tom-stone">
            <button
              type="button"
              onClick={() => setActiveTab('desktop')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'desktop' ? 'bg-tom-black text-white' : 'text-tom-darkMuted hover:text-tom-black'
              }`}
            >
              <Monitor className="w-3.5 h-3.5" />
              <span>Desktop</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('mobile')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium transition-colors ${
                activeTab === 'mobile' ? 'bg-tom-black text-white' : 'text-tom-darkMuted hover:text-tom-black'
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Mobile</span>
            </button>
          </div>

          {/* Exact Viewport Preset Buttons */}
          {activeTab === 'desktop' ? (
            <div className="flex items-center gap-1 bg-white p-1 border border-tom-stone text-xs font-mono">
              <button
                type="button"
                onClick={() => setDesktopPreset('1440x900')}
                className={`px-2 py-1 ${desktopPreset === '1440x900' ? 'bg-tom-black text-white' : 'text-tom-black hover:bg-tom-sand'}`}
              >
                1440×900
              </button>
              <button
                type="button"
                onClick={() => setDesktopPreset('1920x1080')}
                className={`px-2 py-1 ${desktopPreset === '1920x1080' ? 'bg-tom-black text-white' : 'text-tom-black hover:bg-tom-sand'}`}
              >
                1920×1080
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1 bg-white p-1 border border-tom-stone text-xs font-mono">
              <button
                type="button"
                onClick={() => setMobilePreset('360x800')}
                className={`px-2 py-1 ${mobilePreset === '360x800' ? 'bg-tom-black text-white' : 'text-tom-black hover:bg-tom-sand'}`}
              >
                360×800
              </button>
              <button
                type="button"
                onClick={() => setMobilePreset('390x844')}
                className={`px-2 py-1 ${mobilePreset === '390x844' ? 'bg-tom-black text-white' : 'text-tom-black hover:bg-tom-sand'}`}
              >
                390×844
              </button>
              <button
                type="button"
                onClick={() => setMobilePreset('430x932')}
                className={`px-2 py-1 ${mobilePreset === '430x932' ? 'bg-tom-black text-white' : 'text-tom-black hover:bg-tom-sand'}`}
              >
                430×932
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Interactive Click Target */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-tom-muted">
            <span>X={currentFocal.x}% | Y={currentFocal.y}%</span>
            <span className="font-semibold text-tom-black">
              انقري لتحديد النقطة ({activeTab === 'desktop' ? `Desktop ${desktopPreset}` : `Mobile ${mobilePreset}`})
            </span>
          </div>

          <div
            ref={imageRef}
            onPointerDown={handlePointerClick}
            className="relative w-full aspect-[4/3] bg-tom-sand cursor-crosshair overflow-hidden border-2 border-dashed border-tom-black/40 hover:border-tom-black transition-colors"
          >
            <Image
              src={imageSrc}
              alt="Focal target canvas"
              fill
              className="object-contain pointer-events-none select-none"
            />
            <div
              className="absolute w-6 h-6 -ml-3 -mt-3 rounded-full border-2 border-white bg-black/80 shadow-lg pointer-events-none flex items-center justify-center transition-all duration-150"
              style={{
                left: `${currentFocal.x}%`,
                top: `${currentFocal.y}%`,
              }}
            >
              <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
            </div>
          </div>
        </div>

        {/* Real Viewport Preset Previews */}
        <div className="space-y-4">
          <span className="text-xs uppercase tracking-widest text-tom-muted block">
            معاينة أبعاد الشاشة الحقيقية بالضبط [{sceneType.toUpperCase()}]
          </span>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-start">
            {/* Desktop Viewport Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-tom-darkMuted font-mono">
                <span>Desktop: {desktopPreset}</span>
                <span>{sceneType}</span>
              </div>
              <div
                className="relative bg-tom-black overflow-hidden border border-tom-stone w-full shadow-sm"
                style={getSceneBoxStyle('desktop')}
              >
                <Image
                  src={imageSrc}
                  alt="Desktop preset crop"
                  fill
                  style={{
                    objectFit: 'cover',
                    objectPosition: desktopPositionCss,
                  }}
                />
              </div>
            </div>

            {/* Mobile Viewport Card */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-tom-darkMuted font-mono">
                <span>Mobile: {mobilePreset}</span>
                <span>{sceneType}</span>
              </div>
              <div
                className="relative bg-tom-black overflow-hidden border border-tom-stone w-full max-w-[240px] mx-auto shadow-sm"
                style={getSceneBoxStyle('mobile')}
              >
                <Image
                  src={optionalMobileImage || imageSrc}
                  alt="Mobile preset crop"
                  fill
                  style={{
                    objectFit: 'cover',
                    objectPosition: mobilePositionCss,
                  }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
