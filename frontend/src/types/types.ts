import Image, { StaticImageData } from 'next/image';
import { UseFormRegister, UseFormHandleSubmit } from 'react-hook-form';
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
 img: StaticImageData | string;
}

export interface FormData {
    access_key: string;
  name: string;
  email: string;
  furnitureType: string;
  message: string;
  formType: string;
}

export interface ContactFormProps {
  register: UseFormRegister<FormData>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  onSubmit: (formData: FormData) => Promise<void>;
  result: string;
  isSuccess: boolean;
  formType: 'client' | 'provider'; // Restrict formType to specific values
}