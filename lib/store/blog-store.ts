import { create } from "zustand";
import { BlogPost } from "@/lib/mock-data/blog";
import { apiClient } from "@/lib/api-client";

interface BlogState {
  posts: BlogPost[];
  loading: boolean;
  error: string | null;
  fetchPosts: () => Promise<void>;
  fetchAllForAdmin: () => Promise<void>;
  addPost: (post: BlogPost) => Promise<void>;
  updatePost: (slug: string, patch: BlogPost) => Promise<void>;
  deletePost: (slug: string) => Promise<void>;
}

export const useBlogStore = create<BlogState>()((set) => ({
  posts: [],
  loading: false,
  error: null,

  fetchPosts: async () => {
    set({ loading: true, error: null });
    try {
      const posts = await apiClient.blog.list();
      set({ posts, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load articles.", loading: false });
    }
  },

  fetchAllForAdmin: async () => {
    set({ loading: true, error: null });
    try {
      const posts = await apiClient.adminBlog.list();
      set({ posts, loading: false });
    } catch (err) {
      set({ error: err instanceof Error ? err.message : "Failed to load articles.", loading: false });
    }
  },

  addPost: async (post) => {
    const created = await apiClient.adminBlog.create(post);
    set((state) => ({ posts: [created, ...state.posts] }));
  },

  updatePost: async (slug, patch) => {
    const updated = await apiClient.adminBlog.update(slug, patch);
    set((state) => ({
      posts: state.posts.map((p) => (p.slug === slug ? updated : p)),
    }));
  },

  deletePost: async (slug) => {
    await apiClient.adminBlog.delete(slug);
    set((state) => ({ posts: state.posts.filter((p) => p.slug !== slug) }));
  },
}));
