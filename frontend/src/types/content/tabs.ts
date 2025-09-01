import { StaticImageData } from 'next/image';
import { LucideIcon } from "lucide-react";
export interface TabMenuProps {
  t: (key: string) => string; // t returns a string for translation keys
}


export interface Tabs {
  id: string;
  label: string; // Translation key for tab navigation text
  call_to_action: string; // Translation key for call to action
  title: string; // Translation key for content title
  description: string; // Translation key for content description
  link: string; // Translation key for content link
  button: string;
  img: StaticImageData | string;
  icon: LucideIcon; // 👈 cualquier componente React válido (ej: un ícono)
}

export type ResponsiveMenuProps = {
  isOpen: boolean;
  setIsOpen: React.Dispatch<React.SetStateAction<boolean>>;
};