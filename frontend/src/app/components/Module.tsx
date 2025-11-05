"use client"
import { useTranslations } from 'next-intl';
import { Heading } from '@/app/components/ui/Heading';
import Image from 'next/image'
import { Paragraph } from '@/app/components/ui/Paragraph';
import { Button } from '@/app/components/ui/Button';
import { SetCategory  } from '@/types/index';


interface moduleProps {
    section: string;
    asset: SetCategory[];
    id?: string;
}

const Module: React.FC<moduleProps> = ({section, asset, id}) => {
  const t = useTranslations(`${section}`);
  return (
    <div id={`${id}`} className="w-full h-auto py-20  px-8 sm:px-20 !bg-background-light">
        <Heading as="h1" variant="primary" size='lg' hierarchy='forSection'>{t('title')}</Heading>
      <div className="flex gap-3 flex-col sm:flex-row w-full items-center justify-center mb-20">
      </div>
      {asset.map((asset) => (
        <div
          id={asset.id}
          key={asset.id}
          className={`w-full flex flex-col sm:flex-row items-center justify-center sm:p-4 block`}
        >
          <div className="sm:w-2/5 h-1/2 sm:h-full sm:mx-auto my-10">
            <Image src={asset.img} alt='' className='w-full h-full object-cover rounded-2xl' />
          </div>
            <Heading as='h4' variant='secondary' size='sm'>{t(asset.call_to_action)}</Heading>
            <Heading as='h1' variant='primary' size='lg' hierarchy='forContent'>{t(asset.title)}</Heading>
            <Paragraph variant="primary" size="md">
              {t(asset.description)}
            </Paragraph>
            <div className='flex flex-row justify-between w-full'>
                            <Button as="a"
                  href={asset.link_generate}
                  variant='secondary'
                  >
                  {t(asset.button_generate)}
                </Button>

                            <Button as="a"
                  href={asset.link_create}
                  variant='secondary'
                  >
                  {t(asset.button_create)}
                </Button>
                  </div>
        </div>
      ))}
    </div>
  );
};

export default Module;