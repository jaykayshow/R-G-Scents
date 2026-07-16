import Image from "next/image";
import Link from "next/link";
import { blogPosts } from "@/lib/mock-data/blog";
import { SectionHeading } from "@/components/ui/typography";
import { Eyebrow } from "@/components/ui/typography";
import { formatDate } from "@/lib/utils";

export const metadata = {
  title: "Journal | R&G Scents",
  description: "Fragrance tips, lifestyle, and brand stories from R&G Scents.",
};

export default function BlogPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <SectionHeading eyebrow="The Journal" title="Fragrance, Lifestyle & Legacy" />
      <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="group">
            <div className="relative aspect-[4/3] overflow-hidden rounded-md bg-white/[0.03] border border-white/10">
              <Image
                src={post.image}
                alt={post.title}
                fill
                className="object-contain p-10 transition-transform duration-500 group-hover:scale-105"
              />
            </div>
            <Eyebrow className="mt-4 block">{post.category}</Eyebrow>
            <h3 className="mt-2 font-serif text-xl text-brand-white group-hover:text-gold">{post.title}</h3>
            <p className="mt-2 text-sm text-white/50">{post.excerpt}</p>
            <p className="mt-3 text-xs text-white/30">{formatDate(post.date)}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
