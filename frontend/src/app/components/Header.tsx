import React from 'react';
import { useTranslations } from 'next-intl';
import Chair from './Chair';
import { Button } from '@/app/components/ui/Button';
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import {SlidingUpAnimation,RevealingAnimation, HoveringAnimation} from '@/app/components/animations/animations'

const Header = () => {
  const t = useTranslations('header');

  return (
<div id="top" className="static w-full h-screen grid grid-rows-2 sm:grid-cols-2 bg-primary">
      {/* Columna de texto */}
     <div className="flex min-h-0 sm:h-screen items-end  sm:items-center justify-center z-10 sm:p-10">
        <SlidingUpAnimation className="w-11/12 max-w-3xl flex flex-col gap-4 ">

        <RevealingAnimation>
          <Heading as='h3' variant='secondary'  size='md'>{t('call_to_action')}</Heading>
          </RevealingAnimation>
          <Heading as="h1" variant="primaryLight" size='lg' hierarchy='forContent'>{t('title')}</Heading>
<Paragraph variant="primaryWhite" size="md" className="max-w-2xl">
  {t('description')}
</Paragraph>

            <Button
              href="#reserve"
              variant='secondary'
            >
              {t("link")}
            </Button>
        </SlidingUpAnimation>
      </div>

      {/* Columna de imagen */}
      <div  className="min-h-0 sm:h-screen flex items-center justify-center">
        <Chair />
      </div>
    </div>
  );
};

export default Header;
