"use client";

export function FooterAttribution() {
  const year = new Date().getFullYear();

  const handleClick = () => {
    window.open(
      "https://www.linkedin.com/in/danghoangdainghia/",
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className="mx-auto mt-6 w-full max-w-[1280px] border-none bg-transparent pt-6 text-center text-sm text-muted outline-none cursor-pointer sm:text-base"
    >
      Copyright © {year} FROM THE STRESS. Powered by Nghĩa Đặng.
    </button>
  );
}
