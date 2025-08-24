import React from 'react';
import { useTranslations } from 'next-intl';
import Chair from './Chair';
import {Link} from '@/i18n/navigation';

const Header = () => {
    const t = useTranslations('header');
  return (
    <div id="top" className="relative w-full min-h-screen flex">
      <div className="w-1/2 h-full flex items-center justify-center">
        <div className="w-11/12 max-w-3xl text-left flex flex-col gap-4">
          <h3 className="text-xl md:text-2xl mb-3">{t('call_to_action')}</h3>
          <h1 className="text-3xl sm:text-6xl lg:text-[66px]">{t('title')}</h1>
          <p className="max-w-2xl">{t('description')}</p>
          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">

         <Link href="#reserve" className="px-10 py-3 border border-white  bg-black text-white flex items-center gap-2 dark:bg-transparent hover:bg-gray-800 transition-colors">{t("link")}</Link>
          </div>
        </div>
      </div>
            <div className="w-1/2 h-full">
        <Chair />
      </div>
    </div>
  );
}

export default Header
