import Link from "next/link";
import { useTranslations } from "next-intl"; // si usas next-intl
import { sitemap } from "@/config/sitemap.config";
import { Heading } from "@/app/components/ui/Heading";
import { Paragraph } from "@/app/components/ui/Paragraph";
import { LinkItem } from "@/app/components/ui/LinkItem";
export default function Footer() {
  const t = useTranslations();

  return (
    <footer className="bg-background-dark text-white py-12">
      <nav aria-label="Mapa del sitio">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full h-auto px-8 mx-auto">
            {sitemap.map((section) => (
              <div key={section.section}>
                <Heading
                  as="h3"
                  variant="primaryLight"
                  size="sm"
                  hierarchy="forContent"
                  className=" !text-right my-1"
                >{t(section.section)}</Heading>
                <ul aria-labelledby={section.section} className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <LinkItem
                        href={link.href}
                      >
                        {t(link.name)} {/* label traducido */}
                      </LinkItem>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-8 pt-8 border-t border-primary text-center flex items-center justify-center">
            <p className="text-primary !text-center cursor-default">
              &copy; {new Date().getFullYear()}                       <a
                href="https://omarbramirez.com" className="!inline" target="_blank"
              >Omar B Ramírez.</a> Todos los derechos
              reservados.
            </p>
          </div>
        </div>
      </nav>
    </footer>
  );
}
