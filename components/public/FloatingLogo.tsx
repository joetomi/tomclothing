'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

export default function FloatingLogo({ brandName }: { brandName: string }) {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const utility = document.getElementById('utility-start');
    if (!utility) return;

    const observer = new IntersectionObserver(
      ([entry]) => setVisible(!entry.isIntersecting),
      { rootMargin: '0px 0px 18% 0px', threshold: 0 }
    );
    observer.observe(utility);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      aria-hidden={!visible}
      className={`pointer-events-none fixed bottom-[max(24px,env(safe-area-inset-bottom))] left-1/2 z-30 w-[clamp(260px,74vw,350px)] -translate-x-1/2 md:hidden motion-safe:transition-opacity motion-safe:duration-300 ${visible ? 'opacity-100' : 'opacity-0'}`}
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
