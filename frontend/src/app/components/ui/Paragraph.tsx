import { cn } from '@/app/lib/cn';
import { ParagraphProps, ParagraphVariant, ParagraphSize } from '@/types/index';

const base = 'w-auto font-body block m-0 ' +
'tracking-tight leading-none ' +
'text-center sm:text-left ';

const byVariant: Record<ParagraphVariant, string> = {
  primary: 'text-foreground',
  primaryWhite: 'text-foreground-white',
  secondary: 'text-secondary',
  muted: 'text-gray-500',
  danger: 'text-rose-800 bg-rose-100 px-4 py-2 rounded-md  px-4 py-2 rounded-md !text-center',
  success: 'text-emerald-800 bg-emerald-100 px-4 py-2 rounded-md text-center px-4 py-2 rounded-md !text-center',
};




const bySize: Record<ParagraphSize, string> = {
  sm: 'text-sm leading-snug',
  md: 'text-base sm:text-lg leading-relaxed',
  lg: 'text-lg sm:text-xl leading-relaxed',
};


export function Paragraph({
  as: Tag = 'p',
  variant = 'primary',
  size = 'md',
  className,
  children
}: ParagraphProps) {
  const classes = cn(
    base,
    byVariant[variant],
    bySize[size],
    className
  );

  return <Tag className={classes}>{children}</Tag>;
}
