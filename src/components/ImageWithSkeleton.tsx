"use client";

import { useState } from "react";

type ImageWithSkeletonProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  skeletonClassName?: string;
};

export function ImageWithSkeleton({
  src,
  alt = "",
  className = "",
  skeletonClassName = "",
  loading = "lazy",
  ...rest
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);

  return (
    <span className="relative block h-full w-full">
      {!loaded && (
        <span
          className={`absolute inset-0 block animate-pulse bg-border ${skeletonClassName}`}
          aria-hidden
        />
      )}
      <img
        src={src}
        alt={alt}
        loading={loading}
        onLoad={() => setLoaded(true)}
        className={`block h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...rest}
      />
    </span>
  );
}
