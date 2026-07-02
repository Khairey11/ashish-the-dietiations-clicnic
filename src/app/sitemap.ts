import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://thedietitiansclinic.health";
  const now = new Date();

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${baseUrl}/`, lastModified: now, changeFrequency: "weekly", priority: 1.0 },
    { url: `${baseUrl}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.8 },
    { url: `${baseUrl}/services`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/programs`, lastModified: now, changeFrequency: "monthly", priority: 0.9 },
    { url: `${baseUrl}/booking`, lastModified: now, changeFrequency: "weekly", priority: 0.9 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${baseUrl}/testimonials`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/dietitians`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: "yearly", priority: 0.6 },
    { url: `${baseUrl}/faq`, lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: `${baseUrl}/login`, lastModified: now, changeFrequency: "yearly", priority: 0.4 },
    { url: `${baseUrl}/dashboard`, lastModified: now, changeFrequency: "weekly", priority: 0.3 },
    { url: `${baseUrl}/admin`, lastModified: now, changeFrequency: "weekly", priority: 0.3 },
  ];

  // Service detail pages
  const serviceSlugs = [
    "weight-loss", "weight-gain", "pcos-diet", "diabetes-diet", "thyroid-diet",
    "pregnancy-nutrition", "child-nutrition", "sports-nutrition", "corporate-wellness",
    "body-composition", "medical-nutrition-therapy", "lifestyle-modification",
  ];
  const serviceRoutes: MetadataRoute.Sitemap = serviceSlugs.map((slug) => ({
    url: `${baseUrl}/services/${slug}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  // Blog detail pages
  const blogIds = ["b1", "b2", "b3", "b4"];
  const blogRoutes: MetadataRoute.Sitemap = blogIds.map((id) => ({
    url: `${baseUrl}/blog/${id}`,
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...serviceRoutes, ...blogRoutes];
}
