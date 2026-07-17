"use client";

import { use, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBlogStore } from "@/lib/store/blog-store";
import { Eyebrow } from "@/components/ui/typography";
import { formatDate } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = useBlogStore((s) => s.posts.find((p) => p.slug === slug && p.published));
  const fetchPosts = useBlogStore((s) => s.fetchPosts);
  const [checked, setChecked] = useState(false);
  const [fetchedPost, setFetchedPost] = useState(post);

  useEffect(() => {
    if (post) {
      setFetchedPost(post);
      setChecked(true);
      return;
    }
    fetchPosts();
    apiClient.blog
      .bySlug(slug)
      .then(setFetchedPost)
      .catch(() => {})
      .finally(() => setChecked(true));
  }, [post, slug, fetchPosts]);

  const displayPost = post ?? fetchedPost;

  if (!checked && !displayPost) {
    return <div className="min-h-[60vh]" />;
  }

  if (!displayPost) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
        <h1 className="font-serif text-3xl text-fg">Article Not Found</h1>
        <Link href="/blog" className="text-xs uppercase tracking-widest text-gold hover:underline">
          &larr; Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <nav className="mb-8 text-xs text-overlay/40">
        <Link href="/blog" className="hover:text-gold">Journal</Link> / <span className="text-overlay/60">{displayPost.title}</span>
      </nav>
      <Eyebrow>{displayPost.category}</Eyebrow>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-fg sm:text-4xl">{displayPost.title}</h1>
      <p className="mt-3 text-xs text-overlay/40">{displayPost.author} · {formatDate(displayPost.date)}</p>

      <div className="relative mt-10 aspect-video overflow-hidden rounded-md border border-overlay/10 bg-overlay/[0.03]">
        <Image src={displayPost.image} alt={displayPost.title} fill className="object-contain p-16" />
      </div>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-overlay/70 sm:text-base">
        {displayPost.content.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-14 border-t border-overlay/10 pt-8">
        <Link href="/blog" className="text-xs uppercase tracking-widest text-gold hover:underline">
          &larr; Back to Journal
        </Link>
      </div>
    </article>
  );
}
