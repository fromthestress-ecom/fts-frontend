"use client";

import { useState, useRef, useEffect } from "react";
import LoadingIcon from "@/components/icons/LoadingIcon";

type ImageWithSkeletonProps = React.ImgHTMLAttributes<HTMLImageElement> & {
  skeletonClassName?: string;
  priority?: boolean;
};

export function ImageWithSkeleton({
  src,
  alt = "",
  className = "",
  skeletonClassName = "",
  priority = false, // defaults to false
  ...rest
}: ImageWithSkeletonProps) {
  const [loaded, setLoaded] = useState(false);
  const imgRef = useRef<HTMLImageElement>(null);

  // If the image is already cached / complete, set loaded immediately
  useEffect(() => {
    if (imgRef.current?.complete) {
      setLoaded(true);
    }
  }, []);

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
        ref={imgRef}
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        onLoad={() => setLoaded(true)}
        className={`block h-full w-full object-cover transition-opacity duration-300 ${
          loaded ? "opacity-100" : "opacity-0"
        } ${className}`}
        {...rest}
      />
    </span>
  );
}
