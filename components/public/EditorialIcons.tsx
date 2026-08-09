import type { SVGProps } from 'react';

type IconProps = SVGProps<SVGSVGElement>;

const baseProps = {
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.5,
  strokeLinecap: 'square' as const,
  strokeLinejoin: 'miter' as const,
  'aria-hidden': true,
};

export function ArrowUpLeft({ className = 'h-4 w-4', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...baseProps} {...props}>
      <path d="M15.5 15.5 4.5 4.5M4.5 12.5v-8h8" />
    </svg>
  );
}

export function ArrowUpRight({ className = 'h-3.5 w-3.5', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...baseProps} {...props}>
      <path d="M4.5 15.5 15.5 4.5M7.5 4.5h8v8" />
    </svg>
  );
}

export function ArrowLeft({ className = 'h-4 w-4', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...baseProps} {...props}>
      <path d="M16.5 10h-13M9 3.5 2.5 10 9 16.5" />
    </svg>
  );
}

export function ArrowRight({ className = 'h-4 w-4', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...baseProps} {...props}>
      <path d="M3.5 10h13M11 3.5l6.5 6.5-6.5 6.5" />
    </svg>
  );
}

export function CloseMark({ className = 'h-5 w-5', ...props }: IconProps) {
  return (
    <svg viewBox="0 0 20 20" className={className} {...baseProps} {...props}>
      <path d="m3.5 3.5 13 13M16.5 3.5l-13 13" />
    </svg>
  );
}
