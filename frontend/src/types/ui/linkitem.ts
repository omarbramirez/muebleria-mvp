import {ComponentProps } from 'react';
import { Size } from '@/types/ui/common';
import { Link } from '@/i18n/navigation';

export type LinkVariant = 'primary' | 'secondary' | 'muted';

export interface LinkItemProps extends ComponentProps<typeof Link> {
  variant?: LinkVariant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}