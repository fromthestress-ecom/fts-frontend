"use client";

import { useMemo } from "react";

type AIService = {
  key: string;
  name: string;
  /** Brand color used for icon background */
  bg: string;
  /** Inline SVG for icon */
  icon: React.ReactNode;
  /** Builds the target URL with prefilled prompt */
  buildUrl: (prompt: string) => string;
};

const AI_SERVICES: AIService[] = [
  {
    key: "chatgpt",
    name: "ChatGPT",
    bg: "#10a37f",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="#ffffff"
        aria-hidden="true"
      >
        <path d="M22.282 9.821a5.985 5.985 0 0 0-.516-4.91 6.046 6.046 0 0 0-6.51-2.9A6.065 6.065 0 0 0 4.981 4.18a5.985 5.985 0 0 0-3.998 2.9 6.046 6.046 0 0 0 .743 7.097 5.98 5.98 0 0 0 .51 4.911 6.051 6.051 0 0 0 6.515 2.9A5.985 5.985 0 0 0 13.26 24a6.056 6.056 0 0 0 5.772-4.206 5.99 5.99 0 0 0 3.997-2.9 6.056 6.056 0 0 0-.747-7.073zM13.26 22.43a4.476 4.476 0 0 1-2.876-1.04l.141-.081 4.779-2.758a.795.795 0 0 0 .392-.681v-6.737l2.02 1.168a.071.071 0 0 1 .038.052v5.583a4.504 4.504 0 0 1-4.494 4.494zM3.6 18.304a4.47 4.47 0 0 1-.535-3.014l.142.085 4.783 2.759a.771.771 0 0 0 .78 0l5.843-3.369v2.332a.08.08 0 0 1-.033.062L9.74 19.95a4.5 4.5 0 0 1-6.14-1.646zM2.34 7.896a4.485 4.485 0 0 1 2.366-1.973l-.001.142v5.516a.775.775 0 0 0 .388.676l5.815 3.355-2.02 1.168a.076.076 0 0 1-.071 0l-4.83-2.786A4.504 4.504 0 0 1 2.34 7.872zm16.597 3.855-5.833-3.387L15.119 7.2a.076.076 0 0 1 .071 0l4.83 2.791a4.494 4.494 0 0 1-.676 8.105v-5.678a.79.79 0 0 0-.407-.667zm2.01-3.023-.141-.085-4.774-2.782a.776.776 0 0 0-.785 0L9.409 9.23V6.897a.066.066 0 0 1 .028-.061l4.83-2.787a4.5 4.5 0 0 1 6.68 4.66zm-12.64 4.135-2.02-1.164a.08.08 0 0 1-.038-.057V6.075a4.5 4.5 0 0 1 7.375-3.453l-.142.08-4.778 2.758a.795.795 0 0 0-.393.681zm1.097-2.365 2.602-1.5 2.607 1.5v2.999l-2.597 1.5-2.607-1.5z" />
      </svg>
    ),
    buildUrl: (p) => `https://chatgpt.com/?q=${encodeURIComponent(p)}`,
  },
  {
    key: "claude",
    name: "Claude",
    bg: "#cc785c",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="#ffffff"
        aria-hidden="true"
      >
        <path d="M4.709 15.955l4.72-2.647.08-.23-.08-.128H9.2l-.79-.048-2.698-.073-2.339-.097-2.266-.122-.571-.121L0 11.784l.055-.352.48-.321.686.06 1.52.103 2.278.158 1.652.097 2.449.255h.389l.055-.157-.134-.098-.103-.097-2.358-1.596-2.552-1.688-1.336-.972-.724-.491-.364-.462-.158-1.008.656-.722.881.06.225.061.893.686 1.908 1.476 2.491 1.833.365.304.145-.103.019-.073-.164-.274-1.355-2.446-1.446-2.49-.644-1.032-.17-.619a2.97 2.97 0 01-.104-.729L6.283.134 6.696 0l.996.134.42.364.62 1.414 1.002 2.229 1.555 3.03.456.898.243.832.091.255h.158V9.01l.128-1.706.237-2.095.23-2.695.08-.76.376-.91.747-.492.584.28.48.685-.067.444-.286 1.851-.559 2.903-.364 1.942h.212l.243-.242.985-1.306 1.652-2.064.73-.82.85-.904.547-.431h1.033l.76 1.129-.34 1.166-1.064 1.347-.881 1.142-1.264 1.7-.79 1.36.073.11.188-.02 2.856-.606 1.543-.28 1.841-.315.833.388.091.395-.328.807-1.969.486-2.309.462-3.439.813-.042.03.049.061 1.549.146.662.036h1.622l3.02.225.79.522.474.638-.079.485-1.215.62-1.64-.389-3.829-.91-1.312-.329h-.182v.11l1.093 1.068 2.006 1.81 2.509 2.33.127.578-.322.455-.34-.049-2.205-1.657-.851-.747-1.926-1.62h-.128v.17l.444.649 2.345 3.521.122 1.08-.17.353-.608.213-.668-.122-1.374-1.925-1.415-2.167-1.142-1.943-.14.08-.674 7.254-.316.37-.729.28-.607-.461-.322-.747.322-1.476.389-1.924.315-1.53.286-1.9.17-.632-.012-.042-.14.018-1.434 1.967-2.18 2.945-1.726 1.845-.414.164-.717-.37.067-.662.401-.589 2.388-3.036 1.44-1.882.93-1.086-.006-.158h-.055L4.132 18.56l-1.13.146-.487-.456.061-.746.231-.243 1.908-1.312-.006.006z" />
      </svg>
    ),
    buildUrl: (p) => `https://claude.ai/new?q=${encodeURIComponent(p)}`,
  },
  {
    key: "grok",
    name: "Grok",
    bg: "#1c1c1c",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="#ffffff"
        aria-hidden="true"
      >
        <path d="M9.27 15.29 18.39 2.5h2.68L10.6 17.12zM20.92 21.5h-2.68l-4.72-6.66 1.34-1.88zM3.08 21.5l8.13-11.47 1.34 1.89L5.76 21.5zM2.93 8.98 7.2 2.5h2.68L4.28 10.87z" />
      </svg>
    ),
    buildUrl: (p) => `https://grok.com/?q=${encodeURIComponent(p)}`,
  },
  {
    key: "perplexity",
    name: "Perplexity",
    bg: "#20808d",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        fill="none"
        stroke="#ffffff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 3v18M3 7.5 12 3l9 4.5M3 16.5 12 21l9-4.5M3 7.5v9M21 7.5v9" />
      </svg>
    ),
    buildUrl: (p) =>
      `https://www.perplexity.ai/search?q=${encodeURIComponent(p)}`,
  },
  {
    key: "gemini",
    name: "Google AI",
    bg: "#ffffff",
    icon: (
      <svg
        viewBox="0 0 24 24"
        width="14"
        height="14"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="geminiGradientBtn" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#4285f4" />
            <stop offset="50%" stopColor="#9b72cb" />
            <stop offset="100%" stopColor="#d96570" />
          </linearGradient>
        </defs>
        <path
          fill="url(#geminiGradientBtn)"
          d="M12 2c.6 4.4 3.6 7.4 8 8-4.4.6-7.4 3.6-8 8-.6-4.4-3.6-7.4-8-8 4.4-.6 7.4-3.6 8-8z"
        />
      </svg>
    ),
    buildUrl: (p) =>
      `https://www.google.com/search?udm=50&aep=11&q=${encodeURIComponent(p)}`,
  },
];

interface AISummaryButtonsProps {
  articleUrl: string;
  label?: string;
  promptTemplate?: string;
}

export function AISummaryButtons({
  articleUrl,
  label = "Tóm tắt bài viết với:",
  promptTemplate = "Tóm tắt bài viết này:",
}: AISummaryButtonsProps) {
  const prompt = useMemo(
    () => `${promptTemplate} ${articleUrl}`,
    [promptTemplate, articleUrl],
  );

  const handleClick = (service: AIService) => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        navigator.clipboard.writeText(prompt).catch(() => {});
      }
    } catch {}
    const url = service.buildUrl(prompt);
    if (typeof window !== "undefined") {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-6">
      <span className="text-sm font-semibold text-muted mr-1">{label}</span>
      {AI_SERVICES.map((service) => (
        <button
          key={service.key}
          type="button"
          onClick={() => handleClick(service)}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border bg-surface hover:border-accent hover:text-accent transition-colors text-sm font-medium"
          title={`${service.name}: ${prompt}`}
          aria-label={`${label} ${service.name}`}
        >
          <span
            className="inline-flex items-center justify-center w-5 h-5 rounded-md"
            style={{ backgroundColor: service.bg }}
          >
            {service.icon}
          </span>
          <span>{service.name}</span>
        </button>
      ))}
    </div>
  );
}
