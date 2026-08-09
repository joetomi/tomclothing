import Image from 'next/image';
import type { ReactNode } from 'react';
import { EditorialScene as SceneType, MediaItem } from '@/types/site';

interface EditorialSceneProps {
  scene: SceneType;
  index: number;
  renderControls?: (image: MediaItem, imageIndex: number) => ReactNode;
}

const ratioClasses: Record<string, string> = {
  '50/50': 'md:grid-cols-[1fr_1fr]',
  '60/40': 'md:grid-cols-[3fr_2fr]',
  '40/60': 'md:grid-cols-[2fr_3fr]',
  '65/35': 'md:grid-cols-[13fr_7fr]',
  '35/65': 'md:grid-cols-[7fr_13fr]',
};

function NaturalImage({ image, sizes = '100vw', priority = false, controls }: { image: MediaItem; sizes?: string; priority?: boolean; controls?: ReactNode }) {
  const width = image.width || 1440;
  const height = image.height || 1920;

  return <div className="relative w-full">
    <Image src={image.src} alt={image.alt || 'TOM fashion editorial'} width={width} height={height} sizes={sizes} quality={95} priority={priority} className="block h-auto w-full" />
    {controls}
  </div>;
}

function CoverImage({ image, sizes = '100vw' }: { image: MediaItem; sizes?: string }) {
  const desktopPosition = `${image.focalPoint.desktop.x}% ${image.focalPoint.desktop.y}%`;
  const mobilePosition = `${image.focalPoint.mobile.x}% ${image.focalPoint.mobile.y}%`;

  return (
    <>
      <Image
        src={image.src}
        alt={image.alt || 'TOM fashion editorial'}
        fill
        sizes={sizes}
        quality={95}
        style={{ objectFit: 'cover', objectPosition: desktopPosition }}
        className="hidden md:block"
      />
      <Image
        src={image.mobileImage || image.src}
        alt={image.alt || 'TOM fashion editorial'}
        fill
        sizes="100vw"
        quality={95}
        style={{ objectFit: 'cover', objectPosition: mobilePosition }}
        className="block md:hidden"
      />
    </>
  );
}

export default function EditorialScene({ scene, index, renderControls }: EditorialSceneProps) {
  if (!scene.visible || scene.images.length === 0) return null;

  const first = scene.images[0];
  const second = scene.images[1];
  const ratio = ratioClasses[scene.splitRatio || '50/50'];

  if (scene.type === 'full-screen-cover' || scene.type === 'full-screen') {
    return (
      <section className="relative h-[100svh] w-full overflow-hidden bg-black" data-scene={index}>
        <CoverImage image={first} />
        {renderControls?.(first, 0)}
      </section>
    );
  }

  if (scene.type === 'full-width-natural' || scene.type === 'full-width' || scene.type === 'portrait-natural') {
    return (
      <section className="w-full bg-black" data-scene={index}>
        <NaturalImage image={first} controls={renderControls?.(first, 0)} />
      </section>
    );
  }

  if (scene.type === 'split' || scene.type === 'split-screen') {
    return (
      <section className={`grid w-full grid-cols-1 gap-px bg-black ${ratio}`} data-scene={index}>
        <NaturalImage image={first} sizes="(max-width: 767px) 100vw, 50vw" controls={renderControls?.(first, 0)} />
        {second && <NaturalImage image={second} sizes="(max-width: 767px) 100vw, 50vw" controls={renderControls?.(second, 1)} />}
      </section>
    );
  }

  if (scene.type === 'asymmetric') {
    return (
      <section className="w-full bg-[#f2f0eb] py-[12vw] md:py-[7vw]" data-scene={index}>
        <div className={`grid w-full grid-cols-1 items-center gap-[10vw] px-0 md:gap-[3vw] md:px-[4vw] ${ratio}`}>
          <NaturalImage image={first} sizes="(max-width: 767px) 100vw, 62vw" controls={renderControls?.(first, 0)} />
          {second && (
            <div className="mx-[6.25vw] md:mx-0 md:translate-y-[5vw]">
              <NaturalImage image={second} sizes="(max-width: 767px) 87.5vw, 38vw" controls={renderControls?.(second, 1)} />
            </div>
          )}
        </div>
      </section>
    );
  }

  if (scene.type === 'inset-editorial') {
    return (
      <section className="bg-[#f2f0eb] py-[12vw] md:py-[7vw]" data-scene={index}>
        <div className="mx-[6.25vw] md:mx-[14vw]">
          <NaturalImage image={first} sizes="(max-width: 767px) 87.5vw, 72vw" controls={renderControls?.(first, 0)} />
        </div>
      </section>
    );
  }

  if (scene.type === 'brand-overlay') {
    return (
      <section className="relative w-full bg-black" data-scene={index}>
        <NaturalImage image={first} controls={renderControls?.(first, 0)} />
        <div className="pointer-events-none absolute inset-x-0 bottom-[5%] hidden justify-center md:flex">
          <Image src="/brand/logo-white-trimmed.png" alt="" width={4109} height={1383} className="h-auto w-[54vw]" />
        </div>
      </section>
    );
  }

  return (
    <section className="w-full bg-black" data-scene={index}>
      {scene.images.map((image, imageIndex) => <NaturalImage key={image.id} image={image} controls={renderControls?.(image, imageIndex)} />)}
    </section>
  );
}
