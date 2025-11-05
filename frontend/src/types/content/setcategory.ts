

import { StaticImageData } from 'next/image';

export interface SetCategory {
  id: string;
  title: string;
  description: string;
  call_to_action: string;
  button_create: string;
  button_generate: string;
  img: StaticImageData;
  icon: React.ElementType;
  link_create?: string;
  link_generate?: string;
}