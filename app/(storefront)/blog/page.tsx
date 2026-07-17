"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useBlogStore } from "@/lib/store/blog-store";
import { SectionHeading } from "@/components/ui/typography";
import { Eyebrow } from "@/components/ui/typography";
import { formatDate } from "@/lib/utils";

export default function BlogPage() {
  const posts = useBlogStore((s) => s.posts).filter((p) => p.published);
  const fetchPosts = useBlogStore((s) => s.fetchPosts);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="The Journal" title="Fragrance, Lifestyle & Legacy" />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-overlay/[0.03] border border-overlay/10">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-contain p-10 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <Eyebrow className="mt-4 block">{post.category}</Eyebrow>
            <h3 className="mt-2 font-serif text-xl text-fg group-hover:text-gold">{post.title}</h3>
            <p className="mt-2 text-sm text-overlay/50">{post.excerpt}</p>
            <p className="mt-3 text-xs text-overlay/30">{formatDate(post.date)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
