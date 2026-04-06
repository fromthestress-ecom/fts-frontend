'use client';

import React, { useMemo } from 'react';
import dynamic from 'next/dynamic';
import 'react-quill-new/dist/quill.snow.css';

// Load Quill dynamically to avoid SSR document is not defined errors in Next.js
const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface RichTextEditorProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function RichTextEditor({ 
  value, 
  onChange, 
  placeholder = 'Viết nội dung bài blog của bạn ở đây...',
  className = ''
}: RichTextEditorProps) {
  
  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [2, 3, 4, false] }], 
        ['bold', 'italic', 'underline', 'strike'], 
        [{ align: [] }], 
        [{ list: 'ordered' }, { list: 'bullet' }], 
        [{ indent: '-1' }, { indent: '+1' }], 
        ['blockquote'], 
        ['link', 'image', 'video'], 
        ['clean'], 
      ],
    }),
    []
  );

  return (
    <div className={`rich-text-editor-container ${className}`}>
      <ReactQuill
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        placeholder={placeholder}
      />
      
      <style jsx global>{`
        /* ── Toolbar ── */
        .rich-text-editor-container .ql-toolbar.ql-snow {
          border: 1px solid var(--border) !important;
          border-bottom: none !important;
          border-radius: 6px 6px 0 0;
          padding: 10px 14px !important;
          background-color: var(--surface);
          flex-wrap: wrap;
        }

        /* ── Toolbar icons - default muted, hover/active accent ── */
        .rich-text-editor-container .ql-toolbar .ql-stroke {
          stroke: var(--muted) !important;
        }
        .rich-text-editor-container .ql-toolbar .ql-fill {
          fill: var(--muted) !important;
        }
        .rich-text-editor-container .ql-toolbar .ql-picker-label {
          color: var(--muted) !important;
        }
        .rich-text-editor-container .ql-toolbar button:hover .ql-stroke,
        .rich-text-editor-container .ql-toolbar button.ql-active .ql-stroke {
          stroke: var(--accent) !important;
        }
        .rich-text-editor-container .ql-toolbar button:hover .ql-fill,
        .rich-text-editor-container .ql-toolbar button.ql-active .ql-fill {
          fill: var(--accent) !important;
        }
        .rich-text-editor-container .ql-toolbar .ql-picker-label:hover,
        .rich-text-editor-container .ql-toolbar .ql-picker-item:hover {
          color: var(--accent) !important;
        }
        .rich-text-editor-container .ql-toolbar .ql-picker-options {
          background: var(--surface) !important;
          border: 1px solid var(--border) !important;
          border-radius: 6px;
        }
        .rich-text-editor-container .ql-toolbar .ql-picker-item {
          color: var(--text) !important;
        }

        /* ── Container (resizable like textarea) ── */
        .rich-text-editor-container .ql-container.ql-snow {
          border: 1px solid var(--border) !important;
          border-radius: 0 0 6px 6px;
          background: var(--bg);
          font-family: inherit;
          font-size: 15px;
          resize: vertical;
          overflow: auto;
          min-height: 340px;
        }

        /* ── Editor body ── */
        .rich-text-editor-container .ql-editor {
          min-height: 320px;
          padding: 1.25rem 1.5rem;
          color: var(--text);
          line-height: 1.75;
        }
        .rich-text-editor-container .ql-editor.ql-blank::before {
          color: var(--muted);
          font-style: normal;
          font-size: 0.95rem;
          left: 1.5rem;
        }

        /* ── Typography ── */
        .rich-text-editor-container .ql-editor p {
          margin-bottom: 0.65rem;
        }
        .rich-text-editor-container .ql-editor h2 {
          font-size: 1.45rem;
          font-weight: 700;
          margin: 1.5rem 0 0.6rem;
          color: var(--text);
          font-family: var(--font-display);
          text-transform: uppercase;
          letter-spacing: 0.02em;
        }
        .rich-text-editor-container .ql-editor h3 {
          font-size: 1.15rem;
          font-weight: 600;
          margin: 1.25rem 0 0.5rem;
          color: var(--text);
        }
        .rich-text-editor-container .ql-editor h4 {
          font-size: 1rem;
          font-weight: 600;
          margin: 1rem 0 0.4rem;
          color: var(--text);
        }
        .rich-text-editor-container .ql-editor a {
          color: var(--accent);
          text-decoration: underline;
        }
        .rich-text-editor-container .ql-editor img {
          border-radius: 6px;
          margin: 0.75rem 0;
          max-width: 100%;
        }
        .rich-text-editor-container .ql-editor blockquote {
          border-left: 3px solid var(--accent);
          padding: 0.5rem 0 0.5rem 1.1rem;
          margin: 1rem 0;
          font-style: italic;
          color: var(--muted);
          background: var(--surface);
          border-radius: 0 4px 4px 0;
        }
        .rich-text-editor-container .ql-editor pre {
          background: var(--surface);
          border: 1px solid var(--border);
          border-radius: 6px;
          padding: 0.75rem 1rem;
          font-size: 0.875rem;
          color: var(--text);
        }
        .rich-text-editor-container .ql-editor code {
          background: var(--surface);
          border-radius: 3px;
          padding: 0.1rem 0.35rem;
          font-size: 0.85em;
          color: var(--accent);
        }
        .rich-text-editor-container .ql-editor ul > li::before {
          color: var(--accent);
        }

        /* ── Link tooltip ── */
        .rich-text-editor-container .ql-tooltip {
          background: var(--surface) !important;
          border: 1px solid var(--border) !important;
          color: var(--text) !important;
          border-radius: 6px;
          box-shadow: 0 4px 16px rgba(0,0,0,0.3);
        }
        .rich-text-editor-container .ql-tooltip input[type="text"] {
          background: var(--bg) !important;
          border: 1px solid var(--border) !important;
          color: var(--text) !important;
          border-radius: 4px;
          outline: none;
        }
        .rich-text-editor-container .ql-tooltip a.ql-action,
        .rich-text-editor-container .ql-tooltip a.ql-remove {
          color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
}
