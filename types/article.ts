import { typeArticleI } from './typearticle'

export interface ArticleI {
  id: number;
  label: string;
  description: string;
  stockQuantity: number;
  typeArticles?: typeArticleI[];
}
