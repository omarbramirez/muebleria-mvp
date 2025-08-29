import { cn } from '@/app/lib/cn';
import { ParagraphProps, ParagraphVariant, ParagraphSize } from '@/types/index';

const base = 'font-body block m-0 ' +
'tracking-tight leading-none ';

const byVariant: Record<ParagraphVariant, string> = {
  primary: 'text-foreground',
  primaryWhite: 'text-foreground-white',
  secondary: 'text-secondary',
  muted: 'text-gray-500 dark:text-gray-400',
  danger: 'text-red-600 dark:text-red-400',
  success: 'text-green-600 dark:text-green-400',
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
