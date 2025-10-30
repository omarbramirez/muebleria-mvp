'use client'
import React, { useState } from 'react'
import PageLayout from "@/app/components/ui/PageLayout";
import { useTranslations } from "next-intl";
import { PREFERENCE_WIZARD_ITEMS } from "@/app/assets/assets";
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { LinkItem } from "@/app/components/ui/LinkItem";
import { Button } from '@/app/components/ui/Button';

const Generation = () => {
  const t = useTranslations("pop_ups.wizard");
  const [activeSection, setActiveSection] = useState(PREFERENCE_WIZARD_ITEMS[0]?.key);
  const [openWizardSections, setWizardSections] = useState(false)

  function wizardSectionActivator (){
    openWizardSections ? setWizardSections(false) : setWizardSections(true)
    console.log(openWizardSections)
  }
  
  return (
    <PageLayout>
      <div className="w-full min-h-screen flex flex-row items-start justify-between gap-12 relative overflow-hidden px-10 pr-20">
        <div className=" w-full min-h-screen flex-1 pt-10 text-left">
          {PREFERENCE_WIZARD_ITEMS.filter(
            (section) => section.key === activeSection
          ).map((section, index) => (
            <section
              key={`module-${section.key}`}
              className="animate-fadeIn transition-all duration-500 pt-20 " 
            >
              <Heading
                as="h2"
                variant="primary"
                size="lg"
                hierarchy="forContent"
                className='text-left'
              >
                {t(`${section.key}.title`)}
              </Heading>
              <Paragraph variant="primary" size="md" className="mb-6 text-left">
                {t(`${section.key}.description`)}
              </Paragraph>

              <ul className="space-y-4">
                {section.options.map((option, index) => (
                  <li
                    key={`option-${index}`}
                    className="p-4 rounded-2xl hover:bg-neutral-200 cursor-pointer transition-all"
                  >
                    <input type="checkbox" id={section.key} value="second_checkbox" />
                    <label htmlFor='cbox2' >{t(`${section.key}.options.${option.key}.title`)}</label>



                    {/* <Button
                      variant="primary"
                      size="sm"
                    >
                      {t(`${section.key}.options.${option.key}.title`)}
                    </Button> */}


                    <Paragraph variant="primary" size="sm" className='text-left' >
                      {t(`${section.key}.options.${option.key}.description`)}
                    </Paragraph>
                  </li>
                ))}
              </ul>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setActiveSection(`${PREFERENCE_WIZARD_ITEMS[PREFERENCE_WIZARD_ITEMS.indexOf(section) + 1].key}`)}
              >
                Siguiente
              </Button>
            </section>
          ))}
          {/* <section id="ia-model-creator"
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
                <textarea defaultValue="Cuéntanos más..."> </textarea>
            </section> */}

        </div>

        {/* MÓDULO DERECHO: navegación de secciones */}
        
        
        <aside id="wizard-sections" className={`w-64 h-full flex flex-col gap-4 bg-red-500 absolute top-0 py-20 drop-shadow-xl  ${openWizardSections ? 'right-0' : 'right-[-50%]'}`} onClick={()=>wizardSectionActivator()}>
            {PREFERENCE_WIZARD_ITEMS.map((section) => {
              const isActive = activeSection === section.key;
              return (
                <LinkItem
                  key={`nav-${section.key}`}
                  as="button"
                  size="lg"
                  variant={isActive ? "secondary" : "primary"}
                  onClick={() => setActiveSection(section.key)}
                  className={`text-left transition-all `}
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

export default Generation;

