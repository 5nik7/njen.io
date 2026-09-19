export const profile = {
  name: 'Nick Jensen',
  domain: 'njen.io',
  links: [
    { id: 'github', label: 'GitHub', href: 'https://github.com/5nik7' },
    { id: 'linkedin', label: 'LinkedIn', href: 'https://www.linkedin.com/in/5nik7' },
    { id: 'email', label: 'Email Nick', href: 'mailto:contact@njen.io' },
  ],
} as const

export type SocialId = typeof profile.links[number]['id']
