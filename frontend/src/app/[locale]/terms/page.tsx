// app/[locale]/terms/page.tsx
import LegalLayout from "@/app/components/ui/LegalLayout";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/app/components/ui/Paragraph";

const TermsPage = () => {
  const t = useTranslations("terms");

  const content = t("content", {
    empresa: "Mi Empresa",
    empresaLegal: "Mi Empresa S.A. de C.V.",
    domicilioEmpresa: "Ciudad de México, México",
    sitioWeb: "https://mienlace.com",
    correoContacto: "contacto@mipagina.com",
  }).replace(/\n/g, " ");

  return (
    <LegalLayout title={t("title")}>
             <Paragraph
               variant="primary"
               size="md"
               className="!text-center"
             >
               {content}
             </Paragraph>
    </LegalLayout>
  );
};

export default TermsPage;
