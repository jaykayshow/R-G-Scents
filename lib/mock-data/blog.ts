export interface BlogPost {
  slug: string;
  title: string;
  excerpt: string;
  content: string[];
  category: string;
  author: string;
  date: string;
  image: string;
  published: boolean;
}
