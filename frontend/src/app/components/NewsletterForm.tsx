"use client";

import React from "react";
import * as Yup from "yup";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useNewsletter } from "@/app/hooks/useNewsletter";
import { Heading } from "@/app/components/ui/Heading";
import { Paragraph } from "@/app/components/ui/Paragraph";
import { Button } from "@/app/components/ui/Button";
import { useTranslations } from "next-intl";

type Props = Record<string, never>;

const requiredSchema = Yup.object({
  email: Yup.string()
    .email("Invalid email") // <- este también puedes internacionalizarlo
    .required("Email is required"),
});

function NewsletterForm({}: Props) {
  const t = useTranslations("news_letter_form");

  // Hook personalizado
  const { status, message, loading, subscribe } = useNewsletter();

  return (
    <div
      id="reserve"
      className="w-full h-screen px-8 mx-auto bg-primary flex items-center justify-center flex-col"
    >
      <div className="max-w-3xl flex flex-col gap-4 mx-auto">
        <Heading
          as="h1"
          variant="primaryLight"
          size="lg"
          hierarchy="forSection"
        >
          {t("title")}
        </Heading>

        <Heading
          as="h3"
          variant="secondary"
          size="md"
          className="!text-center my-1"
        >
          {t("call_to_action")}
        </Heading>

        <Paragraph
          variant="primaryWhite"
          size="md"
          className="!text-center"
        >
          {t("description")}
        </Paragraph>
      </div>

      <Formik
        initialValues={{ email: "" }}
        validationSchema={requiredSchema}
        onSubmit={async (values, { resetForm }) => {
          await subscribe(values.email);

          // reset solo si éxito
          if (status === 200) {
            resetForm();
          }
        }}
      >
        {() => (
          <Form className="flex flex-col items-center">
            {/* Campo email */}
            <Field
              type="email"
              placeholder={t("email")}
              name="email"
              className="flex-1 p-3 outline-none border-[0.5px] border-secondary rounded-md bg-background-light text-foreground text-center mt-10 mb-2"
            />

            {/* Errores de validación Yup */}
            <ErrorMessage
              name="email"
              render={(msg) => (
                <Paragraph
                  variant="danger"
                  size="sm"
                  className="mt-1 text-center"
                >
                  {msg}
                </Paragraph>
              )}
            />

            {/* Botón */}
            <div className="w-auto flex flex-col sm:flex-row items-center my-4 mb-10 justify-center">
              <Button type="submit" variant="secondary">
                {loading ? t("button.loading") : t("button.idle")}
              </Button>
            </div>

            {/* Mensaje de API */}
            {message && (
              <Paragraph
                variant={status === 200 ? "success" : "danger"}
                size="sm"
                className={`transition-opacity duration-500 ${
                  status ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
              >
                {message}
              </Paragraph>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
}

export default NewsletterForm;
