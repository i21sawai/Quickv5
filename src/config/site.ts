export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: '精密採点Web試験',
  description: 'Web試験のためのサイトです。',
  mainNav: [
    {
      title: '作成',
      href: '/edit',
    },
    {
      title: '共有',
      href: '/exam',
    },
  ],
  links: {
    twitter: 'https://twitter.com/zbeyens',
    github: 'https://github.com/udecode/plate',
    docs: 'https://platejs.org',
  },
};
