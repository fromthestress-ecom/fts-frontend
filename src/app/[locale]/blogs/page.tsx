import { Metadata } from "next";
import { fetchApi, type BlogCategory, type Tag } from "@/lib/api";
import { BlogGrid } from "@/components/BlogGrid";
import { getTranslations } from 'next-intl/server';

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('blogs');
  return {
    title: t('title'),
    description: t('desc'),
    openGraph: {
      images: [{ url: "/images/og_blogs.jpg", alt: t('title') }],
    },
  };
}

async function getCategories() {
  try {
    return await fetchApi<BlogCategory[]>("/blogs/categories");
  } catch {
    return [];
  }
}

async function getTags() {
  try {
    return await fetchApi<Tag[]>("/blogs/tags");
  } catch {
    return [];
  }
}

async function getBlogs(
  searchParams: Record<string, string | string[] | undefined>,
) {
  const query = new URLSearchParams();

  if (typeof searchParams.category === "string")
    query.set("category", searchParams.category);
  if (typeof searchParams.tag === "string") query.set("tag", searchParams.tag);
  if (typeof searchParams.search === "string")
    query.set("search", searchParams.search);
  if (typeof searchParams.page === "string")
    query.set("page", searchParams.page);

  try {
    return await fetchApi<any>(`/blogs?${query.toString()}`);
  } catch {
    return { blogs: [], total: 0, page: 1, totalPages: 0 };
  }
}

export default async function BlogsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedParams = await searchParams;
  const currentParams: Record<string, string | undefined> = {};
  for (const [k, v] of Object.entries(resolvedParams)) {
    if (typeof v === "string") currentParams[k] = v;
  }

  const [categories, tags, blogsData] = await Promise.all([
    getCategories(),
    getTags(),
    getBlogs(currentParams),
  ]);
  const t = await getTranslations('blogs');

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6 sm:py-12 min-h-[70vh]">
      <div className="mb-10 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-border pb-8">
        <div className="max-w-2xl">
          <h1 className="font-display text-4xl sm:text-5xl md:text-6xl tracking-tight uppercase m-0 leading-none">
            {t('h1')}
          </h1>
          <p className="mt-4 text-muted sm:text-lg">
            {t('subtitle')}
          </p>
        </div>
      </div>

      <BlogGrid
        initialData={blogsData}
        categories={categories}
        tags={tags}
        currentParams={currentParams}
        basePath="/blogs"
      />
    </div>
  );
}
