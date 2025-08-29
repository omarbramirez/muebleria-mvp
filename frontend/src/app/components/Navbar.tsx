"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LinkItem } from "@/app/components/ui/LinkItem";
import { ResponsiveMenu } from '@/app/components/ui/ResponsiveMenu';
import { Menu, X } from "lucide-react"; 
const Navbar = () => {
  const t = useTranslations("navbar");
const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 start-0 z-49 flex items-center justify-between px-6 py-4 shadow-md bg-background-light ">
      <Link href="#top" className="w-28 flex cursor-pointer mr-14 text-black">
        LOGO
      </Link>

      {/* Desktop Menu */}
          
      <ul className="hidden md:flex w-2/3 gap-4">
        <li><LinkItem href="#top">{t("home")}</LinkItem></li>
        <li><LinkItem href="#how">{t("how_it_works")}</LinkItem></li>
        <li><LinkItem href="#catalog">{t("catalog")}</LinkItem></li>
        <li><LinkItem variant="secondary" href="#reserve">{t("reserve")}</LinkItem></li>
      </ul>

      {/* Mobile Menu */}
      <ResponsiveMenu isOpen={isOpen}/>
      <button
              onClick={() => setIsOpen(!isOpen)}
              aria-label="Toggle menu"
              className="w-auto md:hidden"
            >
              {isOpen ? <X className="text-secondary"/> : <Menu className="text-secondary"/>}
            </button>
    </nav>
  );
};

export default Navbar;