"use client"
import React, { useEffect } from 'react'
import { useTranslations } from "next-intl";
import { useContactForm } from "../hooks/useContactForm";
import { ContactForm } from "./ContactForm";
import { motion } from 'motion/react'
import { div } from 'motion/react-client';
import { useState } from 'react';

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
    <div className="w-full mx-auto min-h-screen py-30">
      <motion.section
        id="contact"
        className="w-full px-[12%] py-10 scroll-mt-20 bg-[url('/footer-bg-color.png')] bg-no-repeat bg-center bg-[length:90%_auto] dark:bg-none"
      >
        <div className="max-w-3xl flex flex-col gap-4 mx-auto">
          <h1 className="text-3xl sm:text-6xl lg:text-[66px] text-center mx-auto">
            {t('title')}
          </h1>
          <h3 className="text-xl md:text-2xl text-center mx-auto">
            {t('subtitle')}
          </h3>
          <motion.p className="max-w-2xl text-center mx-auto">
            {t('description')}
          </motion.p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mt-8 mb-6">
          <div className="inline-flex rounded-md shadow-sm" role="group">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={`px-4 py-2 text-sm font-medium border ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white border-blue-600'
                    : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
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