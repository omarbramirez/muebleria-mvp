
import React, {FC} from 'react';
import { useTranslations } from 'next-intl';
import Chair from './Chair';
import { Button } from '@/app/components/ui/Button';
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { SlidingUpAnimation, RevealingAnimation } from '@/app/components/animations/animations'


interface IntroductionProps {
  page: string;
}
const Introduction: FC<IntroductionProps> = ({page}) => {
    const t = useTranslations(`${page}`);
  return (

      <div className="static w-full h-screen flex flex-col sm:h-screen sm:items-center justify-center z-10 px-10 bg-primary">
            <Heading as='h3' variant='secondary' size='md'>{t('call_to_action')}</Heading>
          <SlidingUpAnimation>
            <Heading as="h1" variant="primaryLight" size='lg' hierarchy='forContent'>{t('title')}</Heading>
          </SlidingUpAnimation>
          <Paragraph variant="primaryWhite" size="md" className="max-w-2xl">
            {t('description')}
          </Paragraph>
          <Button as="a"
            href="/preferences"
            variant='secondary'
          >
            {t("link")}
          </Button>
      </div>
  )
}

export default Introduction
