
import Image from "next/image";
import { assets } from "../assets/assets";
import { useTranslations } from "next-intl";
import { UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import { FormData } from "@/types/types";
import { motion } from 'motion/react'

export interface ContactFormProps {
  register: UseFormRegister<FormData>;
  handleSubmit: UseFormHandleSubmit<FormData>;
  onSubmit: (data: FormData) => void;
  result: string;
  isSuccess: boolean;
}

export const ContactForm: React.FC<ContactFormProps> = ({ register, handleSubmit, onSubmit, result, isSuccess }) => {
const t = useTranslations("Contact");
  return (<motion.form
    initial={{ opacity: 0 }}
    whileInView={{ opacity: 1 }}
    transition={{ delay: 0.9, duration: 0.5 }}
    className="max-w-2xl mx-auto" onSubmit={handleSubmit(onSubmit)}>
    <input
    type="hidden" {...register("access_key")} value={process.env.NEXT_PUBLIC_ACCESS_KEY!} />

    <div className="grid grid-cols-(--grid-cols-auto) gap-6 mt-10 mb-8">
      <motion.input 
    initial={{ x: -50, opacity: 0 }}
    whileInView={{x: 0, opacity: 1 }}
    transition={{ delay: 1.1, duration: 0.6 }}
     type="text" placeholder={t('form.name')} {...register("name", { required: true })} className="flex-1 p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90" />
      <motion.input 
    initial={{ x: 50, opacity: 0 }}
    whileInView={{x: 0, opacity: 1 }}
    transition={{ delay: 1.2, duration: 0.6 }} type="email" placeholder={t('form.email')} {...register("email", { required: true })} className="flex-1 p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white mb-6 dark:bg-darkHover/30 dark:border-white/90" />
    </div>

    <motion.textarea 
    initial={{ y:100, opacity: 0 }}
    whileInView={{ y:0, opacity: 1 }}
    transition={{ delay: 0.9, duration: 0.6 }}
    rows={6} placeholder={t('form.message')} {...register("message", { required: true })} className="w-full h-40 p-4 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90"></motion.textarea>

    <motion.button 
initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ delay: 1.3, duration: 0.6 }}
    type="submit" className="py-3 px-8 w-max flex items-center justify-between gap-2 bg-black/80 text-white rounded-full mx-auto hover:bg-black duration-500 dark:bg-transparent dark:border-[0.5px] dark:hover:bg-darkHover my-10">
      {t('form.submit')} <Image src={assets.right_arrow_white} alt="" />
    </motion.button>
    <p
      className={`mt-4 px-4 py-2 rounded-md text-center transition-opacity duration-500
  ${isSuccess ? "opacity-100 bg-emerald-100 text-emerald-800" : "opacity-0 pointer-events-none"}`}
    >
      {result}
    </p>

  </motion.form>)
};