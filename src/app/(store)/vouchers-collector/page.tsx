import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Vouchers Collector | STREETWEAR",
  description: "Chơi mini game để nhận thêm voucher ưu đãi mua hàng.",
  openGraph: {
    images: [{ url: "/images/og_voucher.jpg", alt: "Vouchers Collector" }],
  },
};

export default function VouchersCollectorPage() {
  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 sm:px-6">
      <div className="mb-8 text-center">
        <h1 className="font-display mb-4 text-3xl font-bold tracking-widest sm:text-4xl">
          VOUCHERS COLLECTOR
        </h1>
        <p className="text-muted">
          Tham gia các mini game của chúng tôi để tích điểm và đổi lấy nhiều
          voucher mua sắm hấp dẫn.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Blockerino Game Card */}
        <div className="group relative flex flex-col overflow-hidden rounded-xl border border-border bg-surface shadow-sm transition-all hover:shadow-md">
          <div className="relative aspect-[16/9] w-full bg-[#111] p-6 flex flex-col items-center justify-center border-b border-border">
            <span className="font-display text-4xl font-black tracking-widest text-[#00ffcc] [text-shadow:0_0_10px_rgba(0,255,204,0.5)]">
              BLOCKERINO
            </span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent pointer-events-none" />
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3 className="mb-2 text-xl font-semibold">Blockerino</h3>
            <p className="mb-4 text-sm text-muted">
              Bảo vệ căn cứ của bạn khỏi các khối vuông rơi xuống! Đạt điểm cao
              để nhận voucher giảm giá lên tới 20%.
            </p>
            <div className="mt-auto">
              <a
                href="http://localhost:8081"
                rel="noopener noreferrer"
                className="flex w-full items-center justify-center rounded-lg bg-text px-4 py-3 text-sm font-semibold text-bg transition-transform active:scale-95 group-hover:bg-accent"
              >
                Chơi Ngay
                <svg
                  className="ml-2 h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Coming Soon Placeholder */}
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface/50 p-8 text-center opacity-60">
          <svg
            className="mb-4 h-12 w-12 text-muted"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="text-lg font-semibold text-muted">Coming Soon</h3>
          <p className="mt-2 text-sm text-muted">
            Sắp có thêm nhiều trò chơi thú vị.
          </p>
        </div>
      </div>
    </div>
  );
}
