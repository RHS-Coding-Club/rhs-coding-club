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
import Markdown from '@/components/blog/markdown';

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
              The post you&apos;re looking for doesn&apos;t exist or has been removed.
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
              <Markdown content={post.content} size="lg" />
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
