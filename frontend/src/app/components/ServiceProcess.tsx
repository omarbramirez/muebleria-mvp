"use client"
import { serviceProcess } from '@/app/assets/assets';
import { useTranslations } from 'next-intl';
import { Heading } from '@/app/components/ui/Heading';
import Image from 'next/image'
import { Paragraph } from '@/app/components/ui/Paragraph';
import { Button } from '@/app/components/ui/Button';

const ProcessMenu: React.FC = () => {
  const t = useTranslations('process_menu');
  return (
    <div id="how" className="w-full h-auto py-20  px-8 sm:px-20 !bg-background-light">
        <Heading as="h1" variant="primary" size='lg' hierarchy='forSection'>{t('title')}</Heading>
      <div className="flex gap-3 flex-col sm:flex-row w-full items-center justify-center mb-20">
      </div>
      {serviceProcess.map((process) => (
        <div
          id={process.id}
          key={process.id}
          className={`w-full flex flex-col sm:flex-row items-center justify-center sm:p-4 block`}
        >
          <div className="sm:w-2/5 h-1/2 sm:h-full sm:mx-auto my-10">
            <Image src={process.img} alt='' className='w-full h-full object-cover rounded-2xl' />
          </div>
            <Heading as='h4' variant='secondary' size='sm'>{t(process.call_to_action)}</Heading>
            <Heading as='h1' variant='primary' size='lg' hierarchy='forContent'>{t(process.title)}</Heading>
            <Paragraph variant="primary" size="md">
              {t(process.description)}
            </Paragraph>
        </div>
      ))}
                <Button as="a"
                  href="/#reserve"
                  variant='secondary'
                >
                  {t("link")}
                </Button>
    </div>
  );
};

export default ProcessMenu;