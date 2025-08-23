import React from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl'
import {Link} from '@/i18n/navigation';
import {assets} from '@/app/assets/assets';

const Navbar = () => {
    const t = useTranslations('navbar');
return (
    <nav className="flex items-center justify-between px-6 py-4 shadow-md bg-white ">
      <Link href="#top" className='w-28 cursor-pointer mr-14 text-black' >
        {/* <Image
          src={assets.logo}
className='w-28 cursor-pointer mr-14' alt='logo'
        /> */}
        LOGO
      </Link>
      <ul className="flex gap-6 text-gray-800 font-medium">
        <li>
          <Link href="#top">{t("home")}</Link>
        </li>
        <li>
          <Link href="#how">{t("how_it_works")}</Link>
        </li>
        <li>
          <Link href="#catalog">{t("catalog")}</Link>
        </li>
        <li>
          <Link href="#reserve">{t("reserve")}</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Navbar
