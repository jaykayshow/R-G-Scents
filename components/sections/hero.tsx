"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import { ButtonLink } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="relative flex min-h-[92vh] items-center overflow-hidden bg-matte-black">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_20%,rgba(201,162,75,0.14),transparent_60%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(10,10,10,0.2)_0%,rgba(10,10,10,0.85)_85%)]" />
        {Array.from({ length: 18 }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute h-1 w-1 rounded-full bg-gold"
            style={{
              left: `${(i * 37) % 100}%`,
              top: `${(i * 53) % 100}%`,
            }}
            animate={{ opacity: [0.15, 0.9, 0.15], scale: [1, 1.6, 1] }}
            transition={{
              duration: 3 + (i % 5),
              repeat: Infinity,
              delay: i * 0.3,
              ease: "easeInOut",
            }}
          />
        ))}
      </div>

      <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-24 sm:px-6 lg:grid-cols-2 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <span className="mb-6 inline-block text-xs font-semibold uppercase tracking-[0.35em] text-gold">
            The Billionaire Collection
          </span>
          <h1 className="text-balance font-serif text-4xl font-bold leading-[1.1] text-brand-white sm:text-5xl lg:text-6xl">
            Luxury is not worn.
            <br />
            <span className="text-gold">It is remembered.</span>
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/60 sm:text-lg">
            Discover timeless fragrances crafted for men who leave a legacy.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <ButtonLink href="/shop" size="lg">
              Shop Now
            </ButtonLink>
            <ButtonLink href="#featured-collection" variant="outline-light" size="lg">
              Explore Collection
            </ButtonLink>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          className="relative mx-auto aspect-square w-full max-w-md"
        >
          <div className="absolute inset-0 rounded-full bg-gold/10 blur-3xl" />
          <Image
            src="/products/noir.svg"
            alt="R&G Scents — Noir, The Billionaire Collection"
            fill
            priority
            className="relative object-contain drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
          />
        </motion.div>
      </div>
    </section>
  );
}
