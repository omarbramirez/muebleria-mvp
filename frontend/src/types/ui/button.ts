import { ButtonHTMLAttributes, ComponentProps } from "react";
import { Link } from "@/i18n/navigation";
import { Size } from "@/types/ui/common";

export type ButtonVariant = "primary" | "secondary" | "outline";

export type CommonProps = {
  variant?: ButtonVariant;
  size?: Size;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  children?: React.ReactNode;
};

/**
 * Botón real <button>
 */
export type ButtonAsButton = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    as?: "button";
    href?: undefined; // opcional: evitas confusión con anchor
  };

/**
 * Link interno <Link> (de next-intl / next-link)
 */
export type ButtonAsLink = CommonProps &
  ComponentProps<typeof Link> & {
    as: "link";
  };

/**
 * Anchor nativo <a>
 */
export type ButtonAsAnchor = CommonProps &
  React.AnchorHTMLAttributes<HTMLAnchorElement> & {
    as: "a";
  };

/**
 * Union type: soporta link interno, <a> nativo y <button>
 */
export type ButtonProps = ButtonAsButton | ButtonAsLink | ButtonAsAnchor;
