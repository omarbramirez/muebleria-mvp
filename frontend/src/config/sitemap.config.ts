// sitemap.config.ts
export interface SitemapLink {
  name: string; 
  href: string;
}

export interface SitemapSection {
  section: string;
  links: SitemapLink[];
}

export const sitemap: SitemapSection[] = [
  {
    section: "sitemap.main_pages",
    links: [
      { name: "navbar.home", href: "/#top" },
      { name: "navbar.how_it_works", href: "/#how" },
      { name: "navbar.search", href: "/products" },
      { name: "navbar.explore", href: "/explore" },
    ],
  },
  // {
  //   section: "Productos",
  //   links: [
  //     { name: "product_grid.categories.desks.name", href: "#catalog" },
  //     { name: "product_grid.categories.chairs.name", href: "#catalog" },
  //     { name: "product_grid.categories.stools.name", href: "#catalog" },
  //     { name: "product_grid.categories.shelves.name", href: "#catalog" },
  //   ],
  // },
  {
    section: "sitemap.resources",
    links: [
      { name: "footer.contact", href: "/#contact" },
      { name: "footer.privacy_policy", href: "/policies" },
      { name: "footer.terms", href: "/terms" },
    ],
  },
];
