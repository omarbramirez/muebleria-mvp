
import Image from "next/image";
import { assets } from "../assets/assets";
import { useTranslations } from "next-intl";
import { UseFormRegister, UseFormHandleSubmit } from "react-hook-form";
import { FormData } from "@/types/index";
import { motion } from 'motion/react'
import {ContactFormProps} from '@/types/index';
import { Button } from '@/app/components/ui/Button';
import { Paragraph } from '@/app/components/ui/Paragraph';

export const ContactForm: React.FC<ContactFormProps> = ({ register, handleSubmit, onSubmit, result, isSuccess }) => {
const t = useTranslations("contact");
  return (<motion.form

    className="max-w-2xl mx-auto" onSubmit={handleSubmit(onSubmit)}>
    <input
    type="hidden" {...register("access_key")} value={process.env.NEXT_PUBLIC_ACCESS_KEY!} />

    <div className="grid grid-cols-(--grid-cols-auto) gap-6 mt-10 mb-8">
      <motion.input 
     type="text" placeholder={t('form.name')} {...register("name", { required: true })} className="flex-1 p-3 outline-none border-[0.5px] border-secondary rounded-md bg-background-light text-foreground" />
      <motion.input 
 type="email" placeholder={t('form.email')} {...register("email", { required: true })} className="flex-1 p-3 outline-none border-[0.5px] border-secondary rounded-md bg-background-light text-foreground" />
    </div>
    <motion.textarea 
    rows={6} placeholder={t('form.message')} {...register("message", { required: true })} className="w-full h-40 p-4 outline-none border-[0.5px] border-secondary rounded-md bg-background-light text-foreground"></motion.textarea>



 <div className="w-auto flex flex-col sm:flex-row items-center my-4 mb-10 justify-center">
            <Button
            type="submit"
              variant='secondary'
            >
                {t('form.submit')} 
            </Button>
          </div>






    {/* <p
      className={`mt-4 px-4 py-2 rounded-md text-center transition-opacity duration-500 opacity-100 bg-emerald-100 text-emerald-800
  ${isSuccess ? "opacity-100 bg-emerald-100 text-emerald-800" : "opacity-0 pointer-events-none"}`}
    >
      El mensaje se envió
    </p> */}
{result && result.trim() !== "" && (
  isSuccess ? (
    <Paragraph variant="success" size="sm" className={`transition-opacity duration-500 opacity-100  ${isSuccess ? "opacity-100":  "opacity-0 pointer-events-none"}`}>
      {result}
    </Paragraph>
  ) : (
    <Paragraph variant="danger" size="sm" className={`transition-opacity duration-500 opacity-100  ${isSuccess ? "opacity-100":  "opacity-0 pointer-events-none"}`}>
      {result}
    </Paragraph>
  )
)}
  </motion.form>)
};