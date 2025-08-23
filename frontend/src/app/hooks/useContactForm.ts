
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import { useTranslations } from 'next-intl';
import { FormData } from "@/types/types";

export const useContactForm = () => {
  const t = useTranslations('Contact')

  const [result, setResult] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);

  const accessKey = process.env.NEXT_PUBLIC_ACCESS_KEY!;
  const { register, handleSubmit, reset } = useForm<FormData>();

  const { submit } = useWeb3Forms({
    access_key: accessKey,
    settings: {
      from_name: "omarbramirez.com",
      subject: "Nuevo mensaje de contacto desde su sitio web",
    },
    onSuccess: () => {
      setIsSuccess(true);
      setResult(t("form.msgOnSuccess"));
    },
    onError: (msg) => {
      setIsSuccess(false);
      setResult(t("form.msgOnError"));
    },
  });

  return { register, handleSubmit, submit, result, isSuccess, setIsSuccess,reset };
};
