'use client';

import Image from 'next/image';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { Promotion } from '@/types/site';

const STORY_DURATION = 6500;
const TRANSITION_DURATION = 180;

export default function StoriesCarousel({ promotions }: { promotions: Promotion[] }) {
  const enabledPromotions = useMemo(
    () => promotions.filter((promotion) => promotion.enabled !== false),
    [promotions]
  );
  const [activeIndex, setActiveIndex] = useState(0);
  const [phase, setPhase] = useState<'visible' | 'exit' | 'enter'>('visible');
  const [cycle, setCycle] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);
  const transitionTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const transitioning = useRef(false);

  useEffect(() => {
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const updatePreference = () => setReducedMotion(media.matches);
    updatePreference();
    media.addEventListener('change', updatePreference);
    return () => media.removeEventListener('change', updatePreference);
  }, []);

  useEffect(() => {
    enabledPromotions.forEach((promotion) => {
      const image = new window.Image();
      image.src = promotion.image;
    });
  }, [enabledPromotions]);

  useEffect(() => {
    if (activeIndex >= enabledPromotions.length) {
      setActiveIndex(0);
      setCycle((value) => value + 1);
    }
  }, [activeIndex, enabledPromotions.length]);

  useEffect(() => () => {
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
  }, []);

  const showPromotion = useCallback((nextIndex: number) => {
    const count = enabledPromotions.length;
    if (count < 2 || transitioning.current) return;

    const normalizedIndex = (nextIndex + count) % count;
    if (reducedMotion) {
      setActiveIndex(normalizedIndex);
      setCycle((value) => value + 1);
      return;
    }

    transitioning.current = true;
    setPhase('exit');
    if (transitionTimer.current) clearTimeout(transitionTimer.current);
    transitionTimer.current = setTimeout(() => {
      setActiveIndex(normalizedIndex);
      setCycle((value) => value + 1);
      setPhase('enter');
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setPhase('visible');
          transitioning.current = false;
        });
      });
    }, TRANSITION_DURATION);
  }, [enabledPromotions.length, reducedMotion]);

  useEffect(() => {
    if (enabledPromotions.length < 2 || reducedMotion || phase !== 'visible') return;
    const autoplayTimer = setTimeout(
      () => showPromotion((activeIndex + 1) % enabledPromotions.length),
      STORY_DURATION
    );
    return () => clearTimeout(autoplayTimer);
  }, [activeIndex, cycle, enabledPromotions.length, phase, reducedMotion, showPromotion]);

  if (enabledPromotions.length === 0) return null;

  const activePromotion = enabledPromotions[activeIndex] || enabledPromotions[0];
  const transitionClass = reducedMotion
    ? 'opacity-100 scale-100'
    : phase === 'exit'
      ? 'opacity-0 scale-[0.99]'
      : phase === 'enter'
        ? 'opacity-0 scale-[1.015]'
        : 'opacity-100 scale-100';

  return (
    <section id="stories" className="relative z-[35] -mx-2 bg-white px-2 py-5 text-white sm:px-6 sm:py-7 md:mx-0">
      <div className="mx-auto w-full max-w-4xl">
        <div className="mb-5 text-center sm:mb-7">
          <h2 className="font-latin text-[26px] font-semibold uppercase tracking-[0.16em] text-black sm:text-[30px]">
            TOM STORIES
          </h2>
          <span className="mx-auto mt-4 block h-px w-12 bg-black/50" />
        </div>

        <div className="relative aspect-[4/5] overflow-hidden rounded-[28px] border border-white/10 bg-[#111] shadow-[0_24px_70px_rgba(0,0,0,0.38)] sm:aspect-[2/1]">
          <div
            key={`${activePromotion.id}-${cycle}`}
            className={`absolute inset-0 transition-[opacity,transform] ease-out ${transitionClass}`}
            style={{ transitionDuration: reducedMotion ? '0ms' : `${TRANSITION_DURATION}ms` }}
          >
            <Image
              src={activePromotion.image}
              alt={activePromotion.titleAr || activePromotion.titleEn}
              fill
              priority
              sizes="(max-width: 639px) 100vw, 896px"
              className="object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/25 to-black/10" />
          </div>

          <div aria-hidden="true" dir="ltr" className="pointer-events-none absolute inset-x-0 top-0 z-40 flex gap-1.5 px-4 pt-4 sm:px-5 sm:pt-5">
            {enabledPromotions.map((promotion, index) => {
              const completed = index < activeIndex;
              const active = index === activeIndex;
              return (
                <span key={promotion.id} className="h-1 flex-1 overflow-hidden rounded-full bg-white/25 shadow-sm">
                  <span
                    key={`${activeIndex}-${promotion.id}-${cycle}`}
                    className="block h-full w-full origin-left rounded-full bg-white"
                    style={{
                      transform: completed || (active && (reducedMotion || enabledPromotions.length === 1)) ? 'scaleX(1)' : 'scaleX(0)',
                      animation: active && !reducedMotion && enabledPromotions.length > 1
                        ? `tom-story-progress ${STORY_DURATION}ms linear forwards`
                        : 'none',
                    }}
                  />
                </span>
              );
            })}
          </div>

          {enabledPromotions.length > 1 && (
            <div className="absolute inset-0 z-20" dir="ltr">
              <button
                type="button"
                aria-label="المنشور السابق"
                onClick={() => showPromotion(activeIndex - 1)}
                className="absolute inset-y-0 left-0 w-1/2 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
              />
              <button
                type="button"
                aria-label="المنشور التالي"
                onClick={() => showPromotion(activeIndex + 1)}
                className="absolute inset-y-0 right-0 w-1/2 bg-transparent outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-white/70"
              />
            </div>
          )}

          <div className="pointer-events-none absolute inset-x-0 bottom-0 z-30 p-6 text-right sm:p-8 md:p-10" dir="rtl">
            <span className="mb-3 inline-flex rounded-full border border-white/15 bg-black/45 px-3 py-1.5 text-[10px] text-white/80 backdrop-blur-md">
              مختارات TOM
            </span>
            <h3 className="font-serif text-[30px] font-bold leading-tight text-white sm:text-4xl">
              {activePromotion.titleAr || activePromotion.titleEn}
            </h3>
            {(activePromotion.captionAr || activePromotion.captionEn) && (
              <p className="mt-2 max-w-xl text-sm leading-7 text-white/75 sm:text-base">
                {activePromotion.captionAr || activePromotion.captionEn}
              </p>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
