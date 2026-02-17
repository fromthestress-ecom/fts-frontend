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
      style={{
        maxWidth: "100%",
        margin: "0 auto",
        paddingTop: "1.5rem",
        color: "var(--muted)",
        fontSize: "0.875rem",
        textAlign: "center",
        cursor: "pointer",
        width: "100%",
        background: "transparent",
        outline: "none",
        border: "none",
      }}
    >
      Copyright © {year} FROM THE STRESS. Powered by Nghĩa Đặng.
    </button>
  );
}
