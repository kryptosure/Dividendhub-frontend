const modules = import.meta.glob('./*.js', { eager: true });

export const articles = Object.values(modules)
  .filter((m) => m.article && m.article.slug)
  .map((m) => m.article)
  .sort((a, b) => new Date(b.date) - new Date(a.date));