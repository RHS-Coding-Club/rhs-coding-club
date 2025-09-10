"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import rehypeHighlight from "rehype-highlight";

type MarkdownSize = "sm" | "base" | "lg";

export interface MarkdownProps {
  content: string;
  size?: MarkdownSize;
  className?: string;
}

/**
 * Markdown renderer with sensible defaults:
 * - GFM (tables, task lists)
 * - Soft line breaks
 * - Safe raw HTML (sanitized)
 * - Heading slugs + auto-linked anchors
 * - Syntax highlighting for code fences
 */
export function Markdown({ content, size = "base", className = "" }: MarkdownProps) {
  const proseSize =
    size === "sm" ? "prose-sm" : size === "lg" ? "prose-lg" : "prose";

  // Uppercase component so we can use hooks without lint errors
  const CodeBlock: React.FC<React.ComponentPropsWithoutRef<'pre'>> = ({ children, ...props }) => {
    const preRef = React.useRef<HTMLPreElement | null>(null);
    const [copied, setCopied] = React.useState(false);
    const onCopy = async () => {
      try {
        const text = preRef.current?.textContent ?? "";
        await navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      } catch {
        // ignore
      }
    };
    return (
      <div className="relative group">
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-2 top-2 z-10 rounded border border-border bg-background/70 px-2 py-1 text-xs text-muted-foreground hover:text-foreground backdrop-blur transition-opacity opacity-0 group-hover:opacity-100"
          aria-label="Copy code"
        >
          {copied ? "Copied" : "Copy"}
        </button>
        <pre
          ref={preRef}
          className="bg-muted p-4 rounded-lg overflow-x-auto border border-border"
          {...props}
        >
          {children}
        </pre>
      </div>
    );
  };

  return (
    <article className={["prose dark:prose-invert max-w-none", proseSize, className]
      .filter(Boolean)
      .join(" ")}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkBreaks]}
        rehypePlugins={[
          rehypeRaw,
          rehypeSanitize,
          rehypeSlug,
          [
            // Add anchor links to headings
            rehypeAutolinkHeadings,
            {
              behavior: "append",
              properties: {
                className: [
                  "no-underline",
                  "ml-2",
                  "text-muted-foreground",
                  "hover:text-foreground",
                ],
                ariaLabel: "Link to section",
              },
              content: {
                type: "text",
                value: "#",
              },
            },
          ],
          // Highlight code blocks automatically via highlight.js
          [rehypeHighlight, { detect: true, ignoreMissing: true }],
        ]}
        components={{
          // prettier code blocks with copy button
          pre: ({ children, ...props }) => <CodeBlock {...props}>{children}</CodeBlock>,
          code: ({ children, className, ...props }) => {
            const isInline = !className;
            return isInline ? (
              <code className="bg-muted px-1.5 py-0.5 rounded text-sm" {...props}>
                {children}
              </code>
            ) : (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
          table: ({ children, ...props }) => (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-border" {...props}>
                {children}
              </table>
            </div>
          ),
          th: ({ children, ...props }) => (
            <th className="border border-border bg-muted p-2 text-left font-semibold" {...props}>
              {children}
            </th>
          ),
          td: ({ children, ...props }) => (
            <td className="border border-border p-2 align-top" {...props}>
              {children}
            </td>
          ),
          blockquote: ({ children, ...props }) => (
            <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground" {...props}>
              {children}
            </blockquote>
          ),
          img: ({ alt, ...props }) => (
            // Images responsive by default
            // eslint-disable-next-line @next/next/no-img-element
            <img alt={typeof alt === 'string' ? alt : ''} {...props} className="rounded-lg border border-border max-w-full h-auto" />
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </article>
  );
}

export default Markdown;
