import { createNavigation } from "next-intl/navigation";
import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ["es","en"],

  // Used when no locale matches
  defaultLocale: "es",
pathnames: {
  "/policies": {
    es: "/politicas",
    en: "/policies"
  },
  "/terms": {
    es: "/terminos",
    en: "/terms"
  },
                   "/#top": {
    es: "/%23top",
    en: "/%23top"
  },
  "#how": {
    es: "#como-funciona",
    en: "#how"
  },
  "#catalog": {
    es: "#catalogo",
    en: "#catalog"
  },
  "#reserve": {
    es: "#reservar",
    en: "#reserve"
  }
}
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export type Locale = (typeof routing.locales)[number];
export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);