import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["es", "en"],

  // Used when no locale matches
  defaultLocale: "es",
  pathnames: {
  "/#top": {
    es: "/#top",
    en: "/#top"
  },
  "/#how": {
    es: "/#how",
    en: "/#how"
  },
  "/#catalog": {
    es: "/#catalog",
    en: "/#catalog"
  },
  "/#reserve": {
    es: "/#reserve",
    en: "/#reserve"
  },
  "/politicas": {
    es: "/politicas",
    en: "/policies"
  },
  "/terminos": {
    es: "/terminos",
    en: "/terms"
  }
}
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);