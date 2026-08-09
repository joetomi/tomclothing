import Image from 'next/image';

export default function MobileMasthead() {
  return (
    <div
      id="mobile-masthead"
      className="absolute inset-x-0 top-0 z-40 flex h-[72px] items-center justify-center border-b border-black/5 bg-white md:hidden"
    >
      <Image
        src="/brand/logo-black-trimmed.png"
        alt="TOM"
        width={4109}
        height={1383}
        priority
        className="h-auto w-[132px]"
      />
    </div>
  );
}
