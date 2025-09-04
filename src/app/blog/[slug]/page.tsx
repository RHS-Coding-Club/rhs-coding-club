'use client';

import { useParams } from 'next/navigation';
import { formatDistance } from 'date-fns';
import { Container } from '@/components/container';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { usePost } from '@/hooks/usePosts';
import { CalendarDays, User, ArrowLeft, Clock, Loader2 } from 'lucide-react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize from 'rehype-sanitize';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  
  const { post, loading, error } = usePost(undefined, slug);

  if (loading) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto flex justify-center items-center min-h-[400px]">
            <Loader2 className="h-8 w-8 animate-spin" />
          </div>
        </Container>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-2xl font-bold">Post Not Found</h1>
            <p className="text-muted-foreground">
              The post you're looking for doesn't exist or has been removed.
            </p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  // Don't show unpublished posts to regular users
  if (!post.published) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center space-y-4">
            <h1 className="text-2xl font-bold">Post Not Available</h1>
            <p className="text-muted-foreground">
              This post is not yet published.
            </p>
            <Button asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  const publishedDate = post.createdAt.toDate();
  const timeAgo = formatDistance(publishedDate, new Date(), { addSuffix: true });
  const readingTime = Math.ceil(post.content.split(/\s+/).length / 200); // ~200 words per minute

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/blog">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Blog
              </Link>
            </Button>
          </div>

          {/* Article Header */}
          <header className="space-y-6 mb-8">
            {/* Tags */}
            {post.tags && post.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <Badge key={tag} variant="outline">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Title */}
            <h1 className="text-4xl md:text-5xl font-bold leading-tight">
              {post.title}
            </h1>

            {/* Summary */}
            <p className="text-xl text-muted-foreground leading-relaxed">
              {post.summary}
            </p>

            {/* Meta Information */}
            <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground border-t border-b py-4">
              <div className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span>{post.author}</span>
              </div>
              <div className="flex items-center gap-2">
                <CalendarDays className="h-4 w-4" />
                <span>{timeAgo}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                <span>{readingTime} min read</span>
              </div>
            </div>
          </header>

          {/* Article Content */}
          <Card>
            <CardContent className="p-8">
              <article className="prose prose-lg dark:prose-invert max-w-none">
                <ReactMarkdown
                  remarkPlugins={[remarkGfm]}
                  rehypePlugins={[rehypeRaw, rehypeSanitize]}
                  components={{
                    // Custom styling for code blocks
                    pre: ({ children, ...props }) => (
                      <pre className="bg-muted p-4 rounded-lg overflow-x-auto" {...props}>
                        {children}
                      </pre>
                    ),
                    // Custom styling for inline code
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
                    // Custom styling for tables
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
                      <td className="border border-border p-2" {...props}>
                        {children}
                      </td>
                    ),
                    // Custom styling for blockquotes
                    blockquote: ({ children, ...props }) => (
                      <blockquote className="border-l-4 border-primary pl-4 italic text-muted-foreground" {...props}>
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {post.content}
                </ReactMarkdown>
              </article>
            </CardContent>
          </Card>

          {/* Footer */}
          <div className="mt-8 pt-6 border-t">
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Published {timeAgo} by {post.author}
              </div>
              <Button variant="outline" size="sm" asChild>
                <Link href="/blog">
                  More Posts
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
