"use client"
import React, { useState } from 'react';
import {tabs} from '@/app/assets/assets';
import { useTranslations } from 'next-intl';
import {TabMenuProps} from '@/types/types';
import {Link} from '@/i18n/navigation';
import Image from 'next/image'
const TabMenu: React.FC = () => {
  const [activeTab, setActiveTab] = useState(tabs[0].id);
const t = useTranslations('tab_menu');
  return (
    <div id="how" className="w-full mx-auto min-h-screen ">

      <div className="flex flex-col sm:flex-row border-b border-gray-200 ">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`px-4 py-2 text-lg font-medium transition-colors duration-200 ${
              activeTab === tab.id
                ? 'border-b-2 border-white-500 text-white-600'
                : 'text-gray-600 hover:text-gray-200'
            }`}
            onClick={() => setActiveTab(tab.id)}
          >
            {t(tab.label)}
          </button>
        ))}
      </div>
      <div className="">
        {tabs.map((tab) => (
          <div
            key={tab.id}
            className={` className="w-1/2 h-full flex items-center justify-center" p-4 ${activeTab === tab.id ? 'block' : 'hidden'}`}
          >
<div className="w-1/2 h-full bg-white">
<Image src={tab.img} alt='' className='mx-auto' />
</div>
   <div className='p-20'>
     <h3 className="text-xl md:text-2xl mb-3">{t(tab.title)}</h3>
          <h1 className="text-3xl sm:text-6xl lg:text-[66px]">{t(tab.call_to_action)}</h1> 
          <p className="max-w-2xl">{t(tab.description)}</p>
            {t(tab.link) && (
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
              <Link
                href="#show"
                className="px-10 py-3 border border-white  bg-black text-white flex items-center gap-2 dark:bg-transparent hover:bg-gray-800 transition-colors"
              >
                {t(tab.link)}
              </Link>
              </div>
            )}
   </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TabMenu;