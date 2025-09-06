import {ComponentProps } from 'react';
import { Size } from '@/types/ui/common';
import { Link } from '@/i18n/navigation';

export type LinkVariant = 'primary' | 'secondary' | 'muted';

export interface LinkItemProps
  extends Omit<ComponentProps<typeof Link>, "href"> {
  href: string; // <- forzamos a string
  variant?: LinkVariant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}