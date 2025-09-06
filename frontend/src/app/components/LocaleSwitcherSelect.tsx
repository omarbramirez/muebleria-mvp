"use client";


import { Locale, routing, usePathname, useRouter } from "@/i18n/routing";
import { useParams } from "next/navigation";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  defaultValue: string;
  label: string;
};

export default function LocaleSwitcherSelect({ defaultValue, label }: Props) {
  const router = useRouter();

  const pathname = usePathname();
  const params = useParams();

  function onSelectChange(nextLocale: string) {
    router.replace(
      // @ts-expect-error -- TypeScript will validate that only known `params`
      { pathname, params },
      { locale: nextLocale as Locale }
    );
  }

  return (
   <label>
  {label}
  <select
    defaultValue={defaultValue}
    onChange={(e) => onSelectChange(e.target.value)}
    className=" border-none bg-transparent focus:ring-0 focus:ring-offset-0 text-primary text-sm font-body"
  >
    {routing.locales.map((locale) => (
      <option key={locale} value={locale} className="text-primary !text-[0.5rem] sm:!text-[1rem] !font-body">
        {locale.toUpperCase()}
      </option>
    ))}
  </select>
</label>

  );
}