'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function FloatingLogo({ brandName }: { brandName: string }) {
  const [pastMasthead, setPastMasthead] = useState(false);
  const [utilityVisible, setUtilityVisible] = useState(false);

  useEffect(() => {
    const masthead = document.getElementById('mobile-masthead');
    const utility = document.getElementById('utility-start');
    if (!masthead || !utility) return;

    const mastheadObserver = new IntersectionObserver(
      ([entry]) => setPastMasthead(!entry.isIntersecting),
      { threshold: 0 }
    );

    const utilityObserver = new IntersectionObserver(
      ([entry]) => setUtilityVisible(entry.isIntersecting),
      { threshold: 0 }
    );

    mastheadObserver.observe(masthead);
    utilityObserver.observe(utility);

    return () => {
      mastheadObserver.disconnect();
      utilityObserver.disconnect();
    };
  }, []);

  const visible = pastMasthead && !utilityVisible;

  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-30 w-[clamp(260px,74vw,350px)] -translate-x-1/2 transition-[opacity,transform] duration-500 ease-out md:hidden ${
        visible
          ? 'translate-y-0 scale-100 opacity-100'
          : 'translate-y-4 scale-[0.97] opacity-0'
      }`}
    >
      <Image
        src="/brand/logo-white-trimmed.png"
        alt={brandName}
        width={4109}
        height={1383}
        priority
        className="h-auto w-full drop-shadow-[0_2px_8px_rgba(0,0,0,.45)]"
      />
    </div>
  );
}
