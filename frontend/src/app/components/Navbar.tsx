"use client";
import React, { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LinkItem } from "@/app/components/ui/LinkItem";
import { ResponsiveMenu } from '@/app/components/ui/ResponsiveMenu';
import { Menu, X } from "lucide-react";

import LocaleSwitcher from "@/app/components/LocaleSwitcher";

const Navbar = () => {
  const t = useTranslations("navbar");
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 left-0 z-50 flex items-center justify-between px-6 py-4 shadow-md bg-background-light">
      <a href="/#top" className="w-1/2 flex cursor-pointer !text-black">
        LOGO
      </a>

      {/* Desktop Menu */}
      <div className="flex items-center justify-between">
      <ul className="hidden sm:flex flex-1 justify-end gap-4" >
        <li><LinkItem as="a" href="/#top">{t("home")}</LinkItem></li>
        <li><LinkItem as="a" href="/#how">{t("how_it_works")}</LinkItem></li>
        <li><LinkItem as="a" href="/#catalog">{t("catalog")}</LinkItem></li>
        <li><LinkItem as="a" variant="secondary" href="/#reserve">{t("reserve")}</LinkItem></li>
      </ul>
      <LocaleSwitcher />
      {/* Mobile Menu */}
      <ResponsiveMenu isOpen={isOpen} setIsOpen={setIsOpen} />
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle menu"
        className="sm:hidden"
      >
        {isOpen ? <X className="text-secondary" /> : <Menu className="text-secondary" />}
      </button>
      </div>
    </nav>
  );
};

export default Navbar;