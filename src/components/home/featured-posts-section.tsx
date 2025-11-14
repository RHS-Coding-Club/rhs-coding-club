'use client';

import Link from 'next/link';

import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomepageData } from '@/hooks/useHomepageData';

export function FeaturedPostsSection() {
  const { featuredPosts, loading } = useHomepageData();

  return (
    <section className="py-24 bg-muted/30">
      <Container>
        <div className="space-y-12">
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold">Latest Posts</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Read insights, tutorials, and stories from our community.
            </p>
          </div>

          <div className="animate-fade-in animation-delay-200">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {Array.from({ length: 3 }).map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-6 w-20" />
                          <Skeleton className="h-4 w-16" />
                        </div>
                        <Skeleton className="h-6 w-full" />
                        <Skeleton className="h-6 w-3/4" />
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-2/3 mb-4" />
                      <Skeleton className="h-4 w-24" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredPosts.length > 0 ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {featuredPosts.map((post, index) => (
                  <Card key={index} className="h-full">
                    <CardHeader>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{post.category}</Badge>
                          <span className="text-sm text-muted-foreground">{post.readTime}</span>
                        </div>
                        <CardTitle className="text-lg leading-tight">
                          <Link
                            href={`/blog/${post.slug}`}
                            className="hover:text-primary transition-colors"
                          >
                            {post.title}
                          </Link>
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4 line-clamp-3">{post.excerpt}</p>
                      <div className="text-sm text-muted-foreground">
                        By {post.author}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No blog posts available yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/blog">Browse All Posts</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}