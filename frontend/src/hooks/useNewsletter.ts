import { useState, useRef, useEffect } from "react";
import { useTranslations } from "next-intl";
import type { SubscribeResponse } from "@/types/index"; // <- exportado desde el server

export function useNewsletter() {
  const t = useTranslations("news_letter_form");

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const [status, setStatus] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);

  async function subscribe(email: string) {
    setLoading(true);
    try {
      const response = await fetch("/api/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as SubscribeResponse;

      if (!data.success) {
        // usamos el code tipado para traducción
        setStatus(data.status);
        setMessage(t(`errors.${data.code}`));
      } else {
        setStatus(200);
        setMessage(t("success"));
      }
    } catch (err) {
      setStatus(500);
      setMessage(t("errors.SERVER_ERROR"));
    } finally {
      setLoading(false);
      timeoutRef.current = setTimeout(() => {
        setStatus(null);
        setMessage("");
      }, 3000);
    }
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  return { status, message, loading, subscribe };
}
