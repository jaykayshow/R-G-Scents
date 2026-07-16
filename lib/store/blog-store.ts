import { create } from "zustand";
import { persist } from "zustand/middleware";
import { blogPosts as seedPosts, BlogPost } from "@/lib/mock-data/blog";

interface BlogState {
  posts: BlogPost[];
  addPost: (post: BlogPost) => void;
  updatePost: (slug: string, patch: Partial<BlogPost>) => void;
  deletePost: (slug: string) => void;
  getBySlug: (slug: string) => BlogPost | undefined;
}

export const useBlogStore = create<BlogState>()(
  persist(
    (set, get) => ({
      posts: seedPosts,
      addPost: (post) => set((state) => ({ posts: [post, ...state.posts] })),
      updatePost: (slug, patch) =>
        set((state) => ({
          posts: state.posts.map((p) => (p.slug === slug ? { ...p, ...patch } : p)),
        })),
      deletePost: (slug) => set((state) => ({ posts: state.posts.filter((p) => p.slug !== slug) })),
      getBySlug: (slug) => get().posts.find((p) => p.slug === slug),
    }),
    { name: "rg-scents-blog" }
  )
);
