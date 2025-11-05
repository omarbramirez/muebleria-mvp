"use client";
import React, { useEffect, useRef } from "react";
import { NAVBAR_ITEMS } from "@/app/assets/assets";
import { useTranslations } from "next-intl";
import { LinkItem } from "@/app/components/ui/LinkItem";
import {ResponsiveMenuProps } from '@/types/index';
import { LinkVariant } from "@/types/index";


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
        <ul className="w-auto absolute top-14 left-0 w-full bg-background-light shadow-lg flex flex-col gap-4 p-6 opacity-95 " >
  
                   {NAVBAR_ITEMS.map((item) => (
                     <li key={item.key}>
                       <LinkItem as="a" href={item.href} variant={item.variant as LinkVariant}>
                         {t(item.key)}
                       </LinkItem>
                     </li>
                   )
                   )}
        </ul>
      )}
    </div>
  );
};