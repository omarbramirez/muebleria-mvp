
import { useState } from "react";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import { useTranslations } from 'next-intl';
import { FormData } from "@/types/index";

export const useContactForm = () => {
  const t = useTranslations('contact')

  const [result, setResult] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const accessKey = process.env.NEXT_PUBLIC_ACCESS_KEY!;
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  const { submit } = useWeb3Forms({
    access_key: accessKey,
    settings: {
      from_name: "muebleria.com",
      subject: "Nuevo mensaje de contacto desde su sitio web",
    },
    onSuccess: () => {
      setIsSuccess(true);
      setResult(t("form.msgOnSuccess"));
      reset();
    },
    onError: () => {
      setIsSuccess(false);
      setResult(t("form.msgOnError"));
    },
  });

  const onSubmit = async (data: FormData) => {
    await submit(data);
  };

  return { register, handleSubmit, onSubmit, result, isSuccess, setResult, reset, setValue };
};