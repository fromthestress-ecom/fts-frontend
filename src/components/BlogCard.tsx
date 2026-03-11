import Link from "next/link";
import type { BlogItem } from "@/lib/api";
import { ImageWithSkeleton } from "@/components/ImageWithSkeleton";

type BlogCardProps = {
  blog: BlogItem;
  headingLevel?: "h2" | "h3";
};

export function BlogCard({ blog, headingLevel = "h2" }: BlogCardProps) {
  const Heading = headingLevel;
  const dateStr = new Date(
    blog.publishedAt || blog.createdAt,
  ).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  const categoryName =
    typeof blog.categoryId === "object" && "name" in blog.categoryId
      ? blog.categoryId.name
      : null;

  return (
    <div className="product-card overflow-hidden rounded-lg border border-border bg-surface flex flex-col h-full transition-transform duration-300">
      <Link href={`/blogs/${blog.slug}`} className="block flex-1 group pb-4">
        <div className="relative aspect-4/3 overflow-hidden bg-border">
          {blog.thumbnail ? (
            <ImageWithSkeleton
              src={blog.thumbnail}
              alt={blog.title}
              className="product-card__image-inner block"
            />
          ) : (
            <div className="w-full h-full product-card__image-inner flex items-center justify-center bg-border text-muted">
              No Image
            </div>
          )}
          {/* Tag overlay */}
          {categoryName && (
            <span className="absolute top-3 left-3 bg-bg text-text text-[10px] md:text-xs font-bold px-2 py-1 uppercase tracking-wider rounded">
              {categoryName}
            </span>
          )}
          {/* Dark hover overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center p-4">
            <span className="text-white border border-white px-4 py-2 text-xs md:text-sm font-semibold tracking-wide uppercase rounded-full whitespace-nowrap">
              Read More
            </span>
          </div>
        </div>

        <div className="p-4 pb-0 flex flex-col gap-2 grow">
          <Heading className="text-base md:text-lg font-bold uppercase leading-tight text-text line-clamp-2 m-0 mt-1">
            {blog.title}
          </Heading>
          <p className="text-sm text-muted line-clamp-3 mt-1 mb-2 leading-relaxed">
            {blog.excerpt}
          </p>
          <div className="mt-auto pt-2 text-[10px] md:text-[11px] font-semibold text-accent uppercase tracking-widest flex items-center gap-2">
            <span>{dateStr}</span>
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span>{blog.readingTime || 1} MIN READ</span>
          </div>
        </div>
      </Link>
    </div>
  );
}
