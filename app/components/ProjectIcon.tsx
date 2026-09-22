"use client";

import Image from "next/image";
import { useState } from "react";

export default function ProjectIcon({ src, fallback, compact = false }: { src?: string; fallback: string; compact?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string>();
  const imageSrc = src && src !== failedSrc ? src : fallback;

  return <Image
    src={imageSrc}
    alt=""
    width={compact ? 40 : 56}
    height={compact ? 40 : 56}
    unoptimized
    onError={() => { if (imageSrc !== fallback) setFailedSrc(src); }}
    className={`${compact ? "size-10 rounded-lg" : "size-14 rounded-xl"} shrink-0 object-contain`}
  />;
}
