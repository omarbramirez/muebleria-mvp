// app/[locale]/policies/page.tsx
import LegalLayout from "@/app/components/ui/LegalLayout";
import { useTranslations } from "next-intl";
import { Paragraph } from "@/app/components/ui/Paragraph";
const PrivacyPolicyPage = () => {
  const t = useTranslations("policies");

  // Pasamos las variables directamente al t("content")
  const content = t("content", {
    empresa: "Empresa",
    empresaLegal: "Empresa Legal S.A. de C.V.",
    domicilioEmpresa: "Ciudad de México, México",
    sitioWeb: "Sitio Web",
    correoDatosPersonales: "contacto@misitio.com",
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

export default PrivacyPolicyPage;
