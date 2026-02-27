"use client";

import { useState } from "react";
import LoadingIcon from "@/components/icons/LoadingIcon";

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
