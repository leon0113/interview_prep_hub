import type { ButtonHTMLAttributes, Ref } from 'react';
import { cn } from '@/lib/cn';

type Variant = 'ghost' | 'outline' | 'solid' | 'soft';
type Size = 'sm' | 'md' | 'icon';

const base =
  'inline-flex shrink-0 items-center justify-center gap-2 rounded-lg text-sm font-medium whitespace-nowrap transition-colors select-none disabled:pointer-events-none disabled:opacity-50';

const variants: Record<Variant, string> = {
  ghost: 'text-muted hover:bg-surface-2 hover:text-fg',
  outline: 'border border-border bg-surface text-fg shadow-card hover:border-border-strong',
  solid: 'bg-accent text-accent-fg hover:opacity-90',
  soft: 'bg-accent-soft text-accent-text hover:brightness-[0.97] dark:hover:brightness-125',
};

// `icon` keeps a 44px tap target on touch screens and tightens up on desktop.
const sizes: Record<Size, string> = {
  sm: 'h-9 px-3',
  md: 'h-11 px-4 lg:h-10',
  icon: 'size-11 lg:size-9',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  ref?: Ref<HTMLButtonElement>;
}

export function Button({
  variant = 'ghost',
  size = 'md',
  className,
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cn(base, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
