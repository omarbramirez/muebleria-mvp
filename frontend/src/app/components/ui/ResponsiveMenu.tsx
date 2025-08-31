"use client";
import React, { useEffect, useRef } from "react";

import { useTranslations } from "next-intl";
import { LinkItem } from "@/app/components/ui/LinkItem";
import {ResponsiveMenuProps } from '@/types/index';


export const ResponsiveMenu = ({ isOpen, setIsOpen }: ResponsiveMenuProps) => {
  const t = useTranslations("navbar");
  
 // 1. Ref para el contenedor
  const menuRef = useRef<HTMLDivElement>(null);

  // 2. Listener global
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Si el menú está abierto y el click NO ocurrió dentro de menuRef → cerramos
      if (isOpen && menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);






  return (
    <div ref={menuRef} className="w-auto md:hidden z-50">
      {isOpen && (
        <ul className="w-auto absolute top-16 left-0 w-full bg-background-light shadow-lg flex flex-col gap-4 p-6" onClick={() => setIsOpen(false)}>
          <li><LinkItem href="#top">{t("home")}</LinkItem></li>
          <li><LinkItem href="#how">{t("how_it_works")}</LinkItem></li>
          <li><LinkItem href="#catalog">{t("catalog")}</LinkItem></li>
          <li><LinkItem variant="secondary" href="#reserve">{t("reserve")}</LinkItem></li>
        </ul>
      )}
    </div>
  );
};