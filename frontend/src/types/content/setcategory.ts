

import { StaticImageData } from 'next/image';

export interface SetCategory {
  id: string;
  title: string;
  description: string;
  call_to_action: string;
  button: string;
  img: StaticImageData;
  icon: React.ElementType;
  link?: string;
}