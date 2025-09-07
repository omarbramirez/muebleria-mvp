"use client";
import React, { useEffect, useRef } from "react";

import { useTranslations } from "next-intl";
import { LinkItem } from "@/app/components/ui/LinkItem";
import {ResponsiveMenuProps } from '@/types/index';


export const ResponsiveMenu = ({ isOpen, setIsOpen }: ResponsiveMenuProps) => {
  const t = useTranslations("navbar");
  
 // 1. Ref para el contenedor
  const menuRef = useRef<HTMLDivElement>(null);

useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLDivElement;
      if (isOpen && menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll);

    // return () => {
    //   document.removeEventListener("mousedown", handleClickOutside);
    //   window.removeEventListener("scroll", handleScroll);
    // };
  }, [isOpen, setIsOpen]);




  return (
    <div ref={menuRef} className="w-auto md:hidden z-50" onClick={() => setIsOpen(false)}>
      {isOpen && (
        <ul className="w-auto absolute top-16 left-0 w-full bg-background-light shadow-lg flex flex-col gap-4 p-6" >
          <li><LinkItem  as="a" href="/#top" >{t("home")}</LinkItem></li>
          <li><LinkItem as="a" href="/#how">{t("how_it_works")}</LinkItem></li>
          <li><LinkItem as="a" href="/#catalog">{t("catalog")}</LinkItem></li>
          <li><LinkItem as="a" variant="secondary" href="/#reserve">{t("reserve")}</LinkItem></li>
        </ul>
      )}
    </div>
  );
};