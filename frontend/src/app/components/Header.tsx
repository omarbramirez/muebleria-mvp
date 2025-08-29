import React from 'react';
import { useTranslations } from 'next-intl';
import Chair from './Chair';
import { Button } from '@/app/components/ui/Button';
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';

const Header = () => {
  const t = useTranslations('header');

  return (
    <div id="top" className="relative w-full h-screen flex bg-background-dark ">
      {/* Columna de texto */}
      <div className="w-1/2 h-full flex items-center justify-center z-10 shadow-xl">
        <div className="w-11/12 max-w-3xl flex flex-col gap-4 ">
          <Heading as='h3' variant='secondary' className="text-left " size='md'>{t('call_to_action')}</Heading>
          <Heading as="h1" variant="primaryLight" className="text-left" size='lg'>{t('title')}</Heading>
<Paragraph variant="primaryWhite" size="md" className="max-w-2xl">
  {t('description')}
</Paragraph>

          <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
            <Button
              href="#reserve"
            >
              {t("link")}
            </Button>
          </div>
        </div>
      </div>

      {/* Columna de imagen */}
      <div className="w-1/2 h-full">
        <Chair />
      </div>
    </div>
  );
};

export default Header;
