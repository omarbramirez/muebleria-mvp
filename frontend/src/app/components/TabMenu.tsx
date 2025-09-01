"use client"
import React, { useState } from 'react';
import {tabs} from '@/app/assets/assets';
import { useTranslations } from 'next-intl';
import { Heading } from '@/app/components/ui/Heading';
import Image from 'next/image'
import { Paragraph } from '@/app/components/ui/Paragraph';
import { Button } from '@/app/components/ui/Button';

const TabMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
const t = useTranslations('tab_menu');
  return (
    <div id="how" className="w-full h-auto py-20  px-8 sm:px-20 !bg-background-light">
                <Heading as="h1" variant="primary" size='lg' hierarchy='forSection'>{t('title')}</Heading>
      <div className="flex gap-3 flex-col sm:flex-row w-full items-center justify-center mb-20">
{tabs.map((tab) => {
  const isActive = activeTab === tab.id;
  const Icon = tab.icon;

  return (
    <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex flex-col items-center justify-center p-4 w-54 h-34 rounded-lg shadow-md transition-colors duration-200a text-foreground hover:text-foreground-white ${isActive ? " text-foreground-white bg-secondary" : "  hover:bg-primary border border-primary "}`} >



                 




      <Icon className={isActive ? "text-primary" : "text-secondary"} />
      {t(tab.label)}
    </button>
  )
})}

      </div>
        {tabs.map((tab) => (
          <div
          id={tab.id}
            key={tab.id}
            className={`w-full h-screen flex flex-col sm:flex-row items-center justify-center sm:p-4 ${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
<div className="sm:w-2/5 h-1/2 sm:h-full sm:mx-auto my-10">
<Image src={tab.img} alt='' className='w-full h-full object-cover rounded-2xl' />
</div>
   <div className=' sm:w-2/5 h-1/2 sm:h-full flex flex-col justify-center  items-left !sm:items-center p-4'>
    <Heading as='h4' variant='secondary' size='sm'>{t(tab.call_to_action)}</Heading>
     <Heading as='h1' variant='primary' size='lg' hierarchy='forContent'>{t(tab.title)}</Heading>
     <Paragraph variant="primary" size="md">
       {t(tab.description)}
     </Paragraph>
          
            {t(tab.link) && (



 <div className="w-auto flex flex-col sm:flex-row items-center my-4 mb-10 gap-3">
            <Button
              href="#reserve"
              variant='primary'
            >
              {t(tab.button)}
            </Button>
          </div>

            )}
   </div>
          </div>
        ))}
      </div>
  );
};

export default TabMenu;