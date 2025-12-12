import { MetadataRoute } from 'next'
import { partners } from '@/data/partners'

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://waymaker-daycare.com'

  const partnerUrls = partners.map((partner) => ({
    url: `${baseUrl}/partners/${partner.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 1,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/book-tour`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    ...partnerUrls,
  ]
}
