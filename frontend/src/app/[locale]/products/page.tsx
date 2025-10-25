'use client'
import React, { useState }  from 'react'
import PageLayout from "@/app/components/ui/PageLayout";
import { useTranslations } from "next-intl";
import { PREFERENCE_WIZARD_ITEMS } from "@/config/assets";
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { LinkItem } from "@/app/components/ui/LinkItem";

const Products = () => {
  const t = useTranslations("explore.wizard");
  const [activeSection, setActiveSection] = useState(PREFERENCE_WIZARD_ITEMS[0]?.key); 

return (
    <PageLayout>
      <div className="w-full min-h-screen flex flex-row items-start justify-between gap-12">
        {/* MÓDULO IZQUIERDO: contenido dinámico */}
        <div className="flex-1 pt-10">
          {PREFERENCE_WIZARD_ITEMS.filter(
            (section) => section.key === activeSection
          ).map((section) => (
            <section
              key={`module-${section.key}`}
              className="animate-fadeIn transition-all duration-500"
            >
              <Heading
                as="h3"
                variant="primary"
                size="md"
                hierarchy="forContent"
              >
                {t(`${section.key}.title`)}
              </Heading>

              <Paragraph variant="primary" size="md" className="mb-6">
                {t(`${section.key}.description`)}
              </Paragraph>

              <ul className="space-y-4">
                {section.options.map((option, index) => (
                  <li
                    key={`option-${index}`}
                    className="p-4 rounded-2xl hover:bg-neutral-200 cursor-pointer transition-all"
                  >
                    <Heading
                      as="h4"
                      variant="primary"
                      size="sm"
                      hierarchy="forContent"
                    >
                      {t(`${section.key}.options.${option.key}.title`)}
                    </Heading>
                    <Paragraph variant="primary" size="sm">
                      {t(`${section.key}.options.${option.key}.description`)}
                    </Paragraph>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <section id="ia-model-creator"
              className="animate-fadeIn transition-all duration-500"
            >
              <Heading
                as="h3"
                variant="primary"
                size="md"
                hierarchy="forContent"
              >
               Crea tu espacio ideal con IA
              </Heading>
                <textarea placeholder="Cuéntanos más..."> </textarea>
            </section>
        </div>

        {/* MÓDULO DERECHO: navegación de secciones */}
        <aside className="w-64 sticky top-20 flex flex-col gap-4">
          {PREFERENCE_WIZARD_ITEMS.map((section) => {
            const isActive = activeSection === section.key;
            return (
              <LinkItem
                key={`nav-${section.key}`}
                as="button"
                size="lg"
                variant={isActive ? "secondary" : "primary"}
                onClick={() => setActiveSection(section.key)}
                className={`text-left transition-all 

                `}
              >
                {t(`${section.key}.tag`)}
              </LinkItem>
            );
          })}
        </aside>
      </div>
    </PageLayout>
  );
}

export default Products;

