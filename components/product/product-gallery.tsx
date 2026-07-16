"use client";

import Image from "next/image";
import { useState } from "react";
import { RotateCw } from "lucide-react";
import { motion } from "framer-motion";

export function ProductGallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const [rotation, setRotation] = useState(0);

  return (
    <div>
      <div className="group relative aspect-square overflow-hidden rounded-md border border-white/10 bg-white/[0.03]">
        <motion.div
          animate={{ rotate: rotation }}
          transition={{ duration: 0.8, ease: "easeInOut" }}
          className="relative h-full w-full"
        >
          <Image
            src={images[active]}
            alt={name}
            fill
            priority
            className="object-contain p-10 transition-transform duration-500 group-hover:scale-110"
          />
        </motion.div>
        <button
          onClick={() => setRotation((r) => r + 360)}
          className="absolute bottom-4 right-4 flex items-center gap-2 rounded-full bg-matte-black/70 px-3 py-2 text-xs text-white/80 backdrop-blur-sm transition-colors hover:text-gold"
        >
          <RotateCw size={14} /> 360°
        </button>
      </div>
      {images.length > 1 && (
        <div className="mt-4 flex gap-3">
          {images.map((img, i) => (
            <button
              key={img + i}
              onClick={() => setActive(i)}
              className={`relative h-20 w-20 overflow-hidden rounded-sm border transition-colors ${
                active === i ? "border-gold" : "border-white/10"
              }`}
            >
              <Image src={img} alt={`${name} view ${i + 1}`} fill className="object-contain p-2" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
