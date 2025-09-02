import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import useWeb3Forms from "@web3forms/react";
import { useTranslations } from 'next-intl';
import { FormData } from "@/types/index";

export const useContactForm = () => {
  const t = useTranslations('contact');

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [result, setResult] = useState<string>("");
  const [status, setStatus] = useState<201 | 400 | 500 | null>(null);
  const accessKey = process.env.NEXT_PUBLIC_ACCESS_KEY!;
  const { register, handleSubmit, reset, setValue } = useForm<FormData>();

  const { submit } = useWeb3Forms({
    access_key: accessKey,
    settings: {
      from_name: "muebleria.com",
      subject: "Nuevo mensaje de contacto desde su sitio web",
    },
    onSuccess: () => {
      setStatus(201);
      setResult(t("form.msgOnSuccess"));
      reset();
    },
    onError: () => {
      setStatus(400);
      setResult(t("form.msgOnError"));
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      await submit(data);
    } catch (error) {
      setStatus(500);
      setResult(t("form.msgOnError"));
    } finally {
      timeoutRef.current = setTimeout(() => {
        setStatus(null);
        setResult("");
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return {
    register,
    handleSubmit,
    onSubmit,
    result,
    isSuccess: status === 201,
    setValue,
    status,
  };
};
