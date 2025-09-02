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
      { name: "navbar.home", href: "#top" },
      { name: "navbar.how_it_works", href: "#about" },
      { name: "navbar.catalog", href: "#catalog" },
      { name: "navbar.reserve", href: "#reserve" },
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
      { name: "footer.contact", href: "#contact" },
      { name: "footer.privacy_policy", href: "/policies" },
      { name: "footer.terms", href: "/terms" },
    ],
  },
];
