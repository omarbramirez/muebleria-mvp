import React from 'react';
import { useTranslations } from "next-intl";
const ProductGrid: React.FC = () => {
    const t = useTranslations('header');
  return (
    <div className='w-auto mx-20'>
        <div className='py-20'>
              <h3 className="text-xl md:text-2xl mb-3 text-center">{t('call_to_action')}</h3>
          <h1 className="text-3xl sm:text-6xl lg:text-[66px] text-center">{t('title')}</h1>
          <p className="max-w-2xl mx-auto text-center" >{t('description')}</p>
        </div>
    <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[600px] p-4">
      {/* Vertical rectangle covering full height */}
      <div className="col-span-1 row-span-2 bg-blue-200 flex items-center justify-center rounded-lg">
        <span className="text-lg font-semibold">Vertical Product</span>
      </div>
      {/* Horizontal rectangle covering half height (top) */}
      <div className="col-span-3 row-span-1 bg-green-200 flex items-center justify-center rounded-lg">
        <span className="text-lg font-semibold">Horizontal Product</span>
      </div>
      {/* Two square boxes covering half height (bottom) */}
      <div className="col-span-2 row-span-1 bg-red-200 flex items-center justify-center rounded-lg">
        <span className="text-lg font-semibold">Square Product 1</span>
      </div>
      <div className="col-span-1 row-span-1 bg-yellow-200 flex items-center justify-center rounded-lg">
        <span className="text-lg font-semibold">Square Product 2</span>
      </div>
    </div>
    </div>
  );
};

export default ProductGrid;