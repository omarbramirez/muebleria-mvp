import { ButtonHTMLAttributes, ComponentProps } from 'react';
import { Link } from '@/i18n/navigation';
import { Size } from '@/types/ui/common';

export type ButtonVariant = 'primary' | 'secondary' | 'outline';

export  type CommonProps = {
  variant?: ButtonVariant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

// Botón real <button>
export type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

// Link interno <Link href="/...">
// Extraemos los props del Link customizado
export type ButtonAsLink = ComponentProps<typeof Link>;

export type ButtonProps =
  | (ButtonAsLink & CommonProps & { variant?: ButtonVariant; size?: Size; loading?: boolean })
  | (ButtonAsButton & CommonProps & { variant?: ButtonVariant; size?: Size; loading?: boolean });