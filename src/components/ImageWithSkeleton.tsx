"use client";

import { useState } from "react";
import Image from "next/image";
import LoadingIcon from "@/components/icons/LoadingIcon";

type ImageWithSkeletonProps = Omit<
  React.ImgHTMLAttributes<HTMLImageElement>,
  "src"
> & {
  src: string;
  skeletonClassName?: string;
  priority?: boolean;
};

export function ImageWithSkeleton({
  src,
  alt = "",
  className = "",
  skeletonClassName = "",
  priority = false, // defaults to false
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
  ...rest
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className="relative block h-full w-full">
      {!loaded && (
        <span
          className={`absolute inset-0 flex items-center justify-center bg-border ${skeletonClassName}`}
          aria-hidden
        >
          <span
            style={{
              width: "40%",
              height: "40%",
              maxWidth: 80,
              maxHeight: 80,
              opacity: 0.5,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <LoadingIcon />
          </span>
        </span>
      )}
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        onLoad={() => setLoaded(true)}
        className={`object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...(rest as any)}
      />
    </span>
  );
}
