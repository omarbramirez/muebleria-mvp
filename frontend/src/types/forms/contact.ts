import { UseFormRegister, UseFormHandleSubmit, UseFormSetValue } from 'react-hook-form';

export interface FormData {
  access_key: string;
  name: string;
  email: string;
  message: string;
  formType: string;
}

export interface ContactFormProps {
  register: UseFormRegister<FormData>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  onSubmit: (formData: FormData) => void | Promise<void>;
  result: string;
  isSuccess: boolean;
  formType: string;
  setValue: UseFormSetValue<FormData>;
}