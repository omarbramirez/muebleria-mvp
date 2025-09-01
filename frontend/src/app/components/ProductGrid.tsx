import React from 'react';
import { useTranslations } from "next-intl";
import { Heading } from '@/app/components/ui/Heading';
import { Paragraph } from '@/app/components/ui/Paragraph';
import { categories } from '@/app/assets/assets';

const ProductGrid: React.FC = () => {
  const t = useTranslations('product_grid');

  return (
    <div id="catalog" className="w-full px-8 mx-auto h-full bg-primary">
      <div className="max-w-3xl flex flex-col gap-4 mx-auto">
        <Heading as="h1" variant="primaryLight" size='lg' hierarchy='forSection'>
          {t('title')}
        </Heading>
        <Heading as='h3' variant='secondary' size='md' className='!text-center my-1'>
          {t('call_to_action')}
        </Heading>
        <Paragraph variant="primaryWhite" size="md" className='!text-center'>
          {t('description')}
        </Paragraph>
      </div>

      {/* GRID */}
      <div className=" w-full sm:w-10/12 mx-auto grid grid-cols-1 grid-rows-4 sm:grid-cols-4 sm:grid-rows-2 gap-4 h-screen p-4 pt-20">
        
        {/* Card genérica */}
        {categories.map((cat, idx) => (
<div
  key={cat.id}
  className={`
    group relative rounded-2xl overflow-hidden flex items-center justify-center
    transition-all duration-500
    ${idx === 0 ? "col-span-1 row-span-1 sm:row-span-2 sm:col-span-1" : ""}
    ${idx === 1 ? "col-span-1 row-span-1 sm:col-span-3 sm:row-span-1" : ""}
    ${idx === 2 ? "col-span-1 row-span-1 sm:col-span-2 sm:row-span-1" : ""}
    ${idx === 3 ? "col-span-1 row-span-1 sm:col-span-1 sm:row-span-1" : ""}
  `}
>
  {/* Background */}
  <div
    className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
    style={{ backgroundImage: `url(${cat.cover.src})` }}
  />
  {/* Overlay */}
  <div className="absolute inset-0 bg-black/40 group-hover:bg-black/60 transition-colors duration-500" />

  {/* Content */}
  <div className="relative z-10 flex flex-col items-center justify-center text-white transition-transform duration-500 group-hover:scale-105 group-hover:-translate-y-1">
    <cat.icon className="w-10 h-10 mb-2 transition-transform duration-500 group-hover:scale-110  " />
    <Heading as='h4' variant='secondary' size='md' className='!text-center !cursor-pointer group-hover:text-foreground-white'>
      {t(cat.name)}
    </Heading>
  </div>
</div>

        ))}
      </div>
    </div>
  );
};

export default ProductGrid;
