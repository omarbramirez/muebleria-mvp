'use client'
import { useTranslations } from "next-intl";
import { motion } from 'motion/react';
import { ContactFormProps } from '@/types/index';
import { Button } from '@/app/components/ui/Button';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { useEffect } from "react";
import {HoveringAnimation} from '@/app/components/animations/animations'


export const ContactForm: React.FC<ContactFormProps> = ({
  register,
  handleSubmit,
  onSubmit,
  result,
  formType,
  setValue,
  status,
}) => {
  const t = useTranslations("contact");

  // sincroniza el tipo de formulario
  useEffect(() => {
    setValue("formType", formType);
  }, [formType, setValue]);

  return (
    <motion.form
      className="w-1/2 mx-auto"
      onSubmit={handleSubmit(onSubmit)}
    >
      {/* hidden inputs */}
      <input
        type="hidden"
        {...register("access_key")}
        value={process.env.NEXT_PUBLIC_ACCESS_KEY!}
      />
      <input
        type="hidden"
        {...register("formType")}
        value={formType}
      />

      {/* campos */}
      <div className="grid grid-cols-(--grid-cols-auto) gap-6 mt-10 mb-8">
        <motion.input
          type="text"
          placeholder={t('form.name')}
          {...register("name", { required: true })}
          className="flex-1 p-3 outline-none border-[0.5px] border-secondary rounded-md bg-background-light text-foreground"
        />
        <motion.input
          type="email"
          placeholder={t('form.email')}
          {...register("email", { required: true })}
          className="flex-1 p-3 outline-none border-[0.5px] border-secondary rounded-md bg-background-light text-foreground"
        />
      </div>

      <motion.textarea
        rows={6}
        placeholder={t('form.message')}
        {...register("message", { required: true })}
        className="w-full h-40 p-4 outline-none border-[0.5px] border-secondary rounded-md bg-background-light text-foreground"
      />

      {/* submit button */}


        <Button
          type="submit"
          variant="secondary"
          >
          {t('form.submit')}
        </Button>
    
      {/* feedback */}
      {status && (
      <Paragraph
        variant={status === 201 ? "success" : "danger"}
        size="sm"
        className={`transition-opacity duration-500 ${
          status ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        {result}
      </Paragraph>
        )}
    </motion.form>
  );
};
