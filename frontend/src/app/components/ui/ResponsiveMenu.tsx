"use client";
import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { LinkItem } from "@/app/components/ui/LinkItem";
import { ResponsiveMenuProps } from "@/types/index";

export const ResponsiveMenu = ({ isOpen, setIsOpen }: ResponsiveMenuProps) => {
  const t = useTranslations("navbar");
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLDivElement;
      if (isOpen && menuRef.current && !menuRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleClickOutside);
    };
  }, [isOpen, setIsOpen]);

  return (
    <nav ref={menuRef} className="md:hidden z-50">
      {isOpen && (
        <ul className="absolute top-16 left-0 w-full bg-background-light shadow-lg flex flex-col gap-4 p-6">
          <li><LinkItem href="#top" onClick={() => setIsOpen(false)}>{t("home")}</LinkItem></li>
          <li><LinkItem href="/#how" onClick={() => setIsOpen(false)}>{t("how_it_works")}</LinkItem></li>
          <li><LinkItem href="/#catalog" onClick={() => setIsOpen(false)}>{t("catalog")}</LinkItem></li>
          <li><LinkItem variant="secondary" href="/#reserve" onClick={() => setIsOpen(false)}>{t("reserve")}</LinkItem></li>
        </ul>
      )}
    </nav>
  );
};
