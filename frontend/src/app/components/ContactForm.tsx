
import Image from "next/image";
import { assets } from "../assets/assets";
import { useTranslations } from "next-intl";
import { UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import { FormData } from "@/types/types";
import { motion } from 'motion/react'
import {ContactFormProps} from '@/types/types';


export const ContactForm: React.FC<ContactFormProps> = ({ register, handleSubmit, onSubmit, result, isSuccess }) => {
const t = useTranslations("contact");
  return (<motion.form

    className="max-w-2xl mx-auto" onSubmit={handleSubmit(onSubmit)}>
    <input
    type="hidden" {...register("access_key")} value={process.env.NEXT_PUBLIC_ACCESS_KEY!} />

    <div className="grid grid-cols-(--grid-cols-auto) gap-6 mt-10 mb-8">
      <motion.input 
     type="text" placeholder={t('form.name')} {...register("name", { required: true })} className="flex-1 p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90" />
      <motion.input 
 type="email" placeholder={t('form.email')} {...register("email", { required: true })} className="flex-1 p-3 outline-none border-[0.5px] border-gray-400 rounded-md bg-white mb-6 dark:bg-darkHover/30 dark:border-white/90" />
    </div>
    <motion.textarea 
    rows={6} placeholder={t('form.message')} {...register("message", { required: true })} className="w-full h-40 p-4 outline-none border-[0.5px] border-gray-400 rounded-md bg-white dark:bg-darkHover/30 dark:border-white/90"></motion.textarea>

    <motion.button 
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