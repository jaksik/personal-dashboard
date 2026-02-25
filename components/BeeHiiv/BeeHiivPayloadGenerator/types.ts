export type PayloadNewsletter = {
  id: number;
  title: string | null;
  sub_title: string | null;
  cover_image: string | null;
  created_at: string;
};

export type PayloadArticle = {
  id: number;
  title: string | null;
  title_snippet: string | null;
  category: string | null;
  url: string | null;
  description: string | null;
  created_at: string;
};

export type PayloadContextResponse = {
  newsletter: PayloadNewsletter | null;
  articles: PayloadArticle[];
};

export type ArticleGroup = {
  category: string;
  articles: PayloadArticle[];
};
