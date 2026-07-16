"use client";

import { use } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBlogStore } from "@/lib/store/blog-store";
import { Eyebrow } from "@/components/ui/typography";
import { formatDate } from "@/lib/utils";

export default function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const post = useBlogStore((s) => s.posts.find((p) => p.slug === slug && p.published));

  if (!post) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-4 px-4 py-32 text-center">
        <h1 className="font-serif text-3xl text-brand-white">Article Not Found</h1>
        <Link href="/blog" className="text-xs uppercase tracking-widest text-gold hover:underline">
          &larr; Back to Journal
        </Link>
      </div>
    );
  }

  return (
    <article className="mx-auto max-w-3xl px-4 py-20 sm:px-6">
      <nav className="mb-8 text-xs text-white/40">
        <Link href="/blog" className="hover:text-gold">Journal</Link> / <span className="text-white/60">{post.title}</span>
      </nav>
      <Eyebrow>{post.category}</Eyebrow>
      <h1 className="mt-3 font-serif text-3xl font-semibold text-brand-white sm:text-4xl">{post.title}</h1>
      <p className="mt-3 text-xs text-white/40">{post.author} · {formatDate(post.date)}</p>

      <div className="relative mt-10 aspect-video overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
        <Image src={post.image} alt={post.title} fill className="object-contain p-16" />
      </div>

      <div className="mt-10 space-y-6 text-sm leading-relaxed text-white/70 sm:text-base">
        {post.content.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </div>

      <div className="mt-14 border-t border-white/10 pt-8">
        <Link href="/blog" className="text-xs uppercase tracking-widest text-gold hover:underline">
          &larr; Back to Journal
        </Link>
      </div>
    </article>
  );
}
