export interface Article {
  name: string;
  kind: string;
  text: string;
  prev: string;
  next: string;
}

interface PublicArticle extends Article {
  id: string;
}

export type ArticleBean = Partial<PublicArticle>;
