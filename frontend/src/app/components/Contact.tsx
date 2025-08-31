"use client"
import React, { useEffect } from 'react'
import { useTranslations } from "next-intl";
import { useContactForm } from "../hooks/useContactForm";
import { ContactForm } from "./ContactForm";
import { motion } from 'motion/react'
import { div } from 'motion/react-client';
import { useState } from 'react';
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';

const Contact = () => {
  const t = useTranslations("contact");
  const { register, handleSubmit, submit, result,isSuccess, setIsSuccess, reset } = useContactForm();

useEffect(() => {
  if (isSuccess) {
    reset()
    const timer = setTimeout(() => setIsSuccess(false), 3000);
    return () => clearTimeout(timer);
  }
}, [isSuccess, setIsSuccess]);


  
  const [activeTab, setActiveTab] = useState('clients');

  const tabs = [
    { id: 'clients', label: t('tabs.clients'), formType: 'client' },
    { id: 'providers', label: t('tabs.providers'), formType: 'provider' },
  ];

  return (
    <div className="w-full mx-auto h-full bg-primary">
      <motion.section
        id="contact"
        className="w-full px-[12%] py-10 scroll-mt-20 bg-[url('/footer-bg-color.png')] bg-no-repeat bg-center bg-[length:90%_auto] dark:bg-none"
      >
        <div className="max-w-3xl flex flex-col gap-4 mx-auto">
          <Heading as="h1" variant="primaryLight" size='lg' hierarchy='forSection'>{t('title')}</Heading>
          {/* <h1 className="text-3xl sm:text-6xl lg:text-[66px] text-center mx-auto">
            {t('title')}
          </h1> */}
              <Heading as='h3' variant='secondary' size='md' className='!text-center my-1'>{t('subtitle')}</Heading>
          <Paragraph variant="primaryWhite" size="md" className='!text-center'>
                 {t('description')}
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
                onClick={() => setActiveTab(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="max-w-3xl mx-auto">
          {activeTab === 'clients' && (
            <ContactForm
              register={register}
              handleSubmit={handleSubmit}
              onSubmit={submit}
              result={result}
              isSuccess={isSuccess}
              formType="client"
            />
          )}
          {activeTab === 'providers' && (
            <ContactForm
              register={register}
              handleSubmit={handleSubmit}
              onSubmit={submit}
              result={result}
              isSuccess={isSuccess}
              formType="provider"
            />
          )}
        </div>
      </motion.section>
    </div>
  );
};

export default Contact