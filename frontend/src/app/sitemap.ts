// app/sitemap.ts
import { MetadataRoute } from "next";
import { sitemap } from "@/config/sitemap.config";

export default function sitemapRoute(): MetadataRoute.Sitemap {
  const baseUrl = "https://tu-dominio.com"; // Cambia esto por tu dominio real

  const urls = sitemap.flatMap((section) =>
    section.links.map((link) => ({
      url: `${baseUrl}${link.href}`,
      lastModified: new Date(),
    }))
  );

  return urls;
}
