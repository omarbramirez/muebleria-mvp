import { routing } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useLocale } from "next-intl";
import LocaleSwitcherSelect from "./LocaleSwitcherSelect";


export default function LocaleSwitcher() {
  const locale = useLocale();

  return (
    <div className='flex items-center gap-2 mx-2'>
      <Globe className='text-primary' />
      <LocaleSwitcherSelect defaultValue={locale} label=''>
        {routing.locales.map((cur) => (
          <option key={cur} value={cur}>
            {cur}
          </option>
        ))}
      </LocaleSwitcherSelect>
    </div>
  );
}