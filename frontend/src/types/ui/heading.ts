import { Size } from '@/types/ui/common';

export type HeadingVariant = 'primary' |'primaryLight' | 'secondary' | 'muted';
export type HeadingTag = 'h1' | 'h2' | 'h3' | 'h4';

export type HeadingProps = {
  as?: HeadingTag;
  variant?: HeadingVariant;
  className?: string;
  children: React.ReactNode;
  size?: Size;
};


