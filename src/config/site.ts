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
    {
      title: '使い方ガイド',
      href: 'https://cat-form-2c7.notion.site/Web-183c8df8f8f98072a8e3fe0314e42e88?pvs=4',
    },
  ],
  links: {
    twitter: 'https://twitter.com/zbeyens',
    github: 'https://github.com/udecode/plate',
    docs: 'https://platejs.org',
  },
};
