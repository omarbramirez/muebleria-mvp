import React, { ComponentProps } from "react";
import { Size } from "@/types/ui/common";
import { Link } from "@/i18n/navigation";

export type LinkVariant = "primary" | "secondary" | "muted";

interface CommonProps {
  variant?: LinkVariant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}

export type LinkItemProps =
  // Caso Next-Intl Link
  | ({ as: "link" } & ComponentProps<typeof Link> & CommonProps)

  // Caso <a> nativo con href
  | ({ as: "a" } & React.JSX.IntrinsicElements["a"] & CommonProps)

  // Caso <button> con href opcional (extra)
  | ({ as: "button"; href?: string } & React.JSX.IntrinsicElements["button"] & CommonProps);
