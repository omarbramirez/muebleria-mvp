import React from 'react';
import { useTranslations } from 'next-intl';
import Chair from '@/components/features/planner/Chair';
import { Button } from '@/components/ui/Button';
import { Heading } from '@/components/ui/Heading';
import { Paragraph } from '@/components/ui/Paragraph';
import { SlidingUpAnimation, RevealingAnimation } from '@/components/ui/animations/animations'

const Header = () => {
  const t = useTranslations('header');
  return (
    <div id="top" className="static w-full h-screen grid grid-rows-2 sm:grid-cols-2 bg-primary">
      {/* Columna de texto */}
      <div className="flex flex-col sm:h-screen sm:items-center justify-center z-10 px-10">
            <Heading as='h3' variant='secondary' size='md'>{t('call_to_action')}</Heading>
          <SlidingUpAnimation>
            <Heading as="h1" variant="primaryLight" size='lg' hierarchy='forContent'>{t('title')}</Heading>
          </SlidingUpAnimation>
          <Paragraph variant="primaryWhite" size="md" className="max-w-2xl">
            {t('description')}
          </Paragraph>
          <Button as="a"
            href="/explore"
            variant='secondary'
          >
            {t("link")}
          </Button>
      </div>
      <div className="min-h-0 sm:h-screen flex items-center justify-center">
        <Chair />
      </div>
    </div>
  );
};

export default Header;
