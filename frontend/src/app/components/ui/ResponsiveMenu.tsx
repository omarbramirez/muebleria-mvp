"use client";
import React, { useState } from "react";

import { useTranslations } from "next-intl";
import { LinkItem } from "@/app/components/ui/LinkItem";

export const ResponsiveMenu = ({ isOpen }: { isOpen: boolean }) => {
  const t = useTranslations("navbar");
  

  return (
    <div className="w-auto md:hidden z-50">
      {isOpen && (
        <ul className="w-auto absolute top-16 left-0 w-full bg-background-light shadow-lg flex flex-col gap-4 p-6">
          <li><LinkItem href="#top">{t("home")}</LinkItem></li>
          <li><LinkItem href="#how">{t("how_it_works")}</LinkItem></li>
          <li><LinkItem href="#catalog">{t("catalog")}</LinkItem></li>
          <li><LinkItem variant="secondary" href="#reserve">{t("reserve")}</LinkItem></li>
        </ul>
      )}
    </div>
  );
};