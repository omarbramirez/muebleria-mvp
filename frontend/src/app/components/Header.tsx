import React from 'react';
import { useTranslations } from 'next-intl';
import Chair from './Chair';


const Header = () => {
    const t = useTranslations('header');
  return (
    <div id="top" className="relative w-full h-screen flex">
      {/* Left half: Chair component */}
      {/* Right half: Text content */}
      <div className="w-1/2 h-full flex items-center justify-center">
        <div className="w-11/12 max-w-3xl text-left flex flex-col gap-4">
          <h3 className="text-xl md:text-2xl mb-3">{t('call_to_action')}</h3>
          <h1 className="text-3xl sm:text-6xl lg:text-[66px]">{t('punchline')}</h1>
          <p className="max-w-2xl font-IBM_Plex_Sans">{t('description')}</p>
          <button>Reservar</button>
        </div>
      </div>
            <div className="w-1/2 h-full">
        <Chair />
      </div>
    </div>
  );
}

export default Header
