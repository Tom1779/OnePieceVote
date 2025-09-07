export default function sitemap() {
  const baseUrl = "https://www.onepiecevoting.com";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily", // Homepage changes frequently with votes
      priority: 1,
    },
    {
      url: `${baseUrl}/rankings`,
      lastModified: new Date(),
      changeFrequency: "hourly", // Rankings update frequently
      priority: 0.9,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date("2024-01-01"), // Set actual last update date
      changeFrequency: "monthly", // Privacy policy changes rarely
      priority: 0.3,
    },
  ];
}
