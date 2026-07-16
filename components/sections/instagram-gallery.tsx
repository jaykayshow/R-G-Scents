"use client";

import Image from "next/image";
import { Camera, Heart } from "lucide-react";
import { galleryPosts } from "@/lib/mock-data/misc";
import { SectionHeading } from "@/components/ui/typography";
import { useToastStore } from "@/lib/store/toast-store";

export function InstagramGallery() {
  const showToast = useToastStore((s) => s.show);

  return (
    <section className="bg-surface py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <SectionHeading eyebrow="@rgscents" title="Follow the Collection" />
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
          {galleryPosts.map((post) => (
            <button
              key={post.id}
              type="button"
              onClick={() => showToast(post.caption, "info")}
              className="group relative aspect-square overflow-hidden rounded-md bg-bg"
            >
              <Image
                src={post.image}
                alt={post.caption}
                fill
                className="object-contain p-6 transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/0 opacity-0 transition-all duration-300 group-hover:bg-black/70 group-hover:opacity-100">
                <Heart size={18} className="fill-gold text-gold" />
                <span className="text-xs text-fg">{post.likes}</span>
              </div>
            </button>
          ))}
        </div>
        <div className="mt-8 text-center">
          <button
            type="button"
            onClick={() => showToast("Instagram integration coming soon.", "info")}
            className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-gold hover:text-gold-light"
          >
            <Camera size={16} /> View on Instagram
          </button>
        </div>
      </div>
    </section>
  );
}
