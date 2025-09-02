"use client"
import React from 'react'
import { useTranslations } from "next-intl";
import { useContactForm } from "@/app/hooks/useContactForm";
import { ContactForm } from "./ContactForm";
import { useState } from 'react';
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';

const Contact = () => {
  const t = useTranslations("contact");
  const { register, 
    handleSubmit, 
    onSubmit, 
    result,
    setValue, 
    status,  } = useContactForm();
  
  const [activeTab, setActiveTab] = useState<"clients" | "providers">("clients");

  const tabs = [
    { id: 'clients', label: t('tabs.clients.label') },
    { id: 'providers', label: t('tabs.providers.label') },
  ];

  return (
      <div
        id="contact"
        className="w-full px-8 mx-auto h-full bg-primary"
      >
        <div className="max-w-3xl flex flex-col gap-4 mx-auto">
          <Heading as="h1" variant="primaryLight" size='lg' hierarchy='forSection'>{t(`tabs.${activeTab}.title`)}</Heading>
         
              <Heading as='h3' variant='secondary' size='md' className='!text-center my-1'>{t(`tabs.${activeTab}.call_to_action`)}</Heading>
          <Paragraph variant="primaryWhite" size="md" className='!text-center'>
                 {t(`tabs.${activeTab}.description`)}
               </Paragraph>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mt-8 mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`px-4 py-2 text-sm font-medium  ${
                  activeTab === tab.id
                    ? 'bg-secondary text-white border-blue-600'
                    : 'bg-background-light text-foreground hover:opacity-90'
                } first:rounded-l-md last:rounded-r-md transition-colors duration-200`}
                 onClick={() => setActiveTab(tab.id as "clients" | "providers")}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
         <div className="max-w-3xl mx-auto">
          
           <ContactForm
              register={register}
              handleSubmit={handleSubmit}
              onSubmit={onSubmit}
              result={result}
              formType={activeTab}  
              setValue ={setValue }
              status={status}
            />
        </div>
      </div>
  );
};

export default Contact