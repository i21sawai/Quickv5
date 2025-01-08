export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: '精密採点Web試験',
  description: 'Web試験のためのサイトです。',
  mainNav: [
    {
      title: '回答',
      href: '/',
    },
    {
      title: '作成',
      href: '/editor',
    },
  ],
  links: {
    twitter: 'https://twitter.com/zbeyens',
    github: 'https://github.com/udecode/plate',
    docs: 'https://platejs.org',
  },
};
