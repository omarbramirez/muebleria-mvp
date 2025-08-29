import { UseFormRegister, UseFormHandleSubmit } from 'react-hook-form';

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