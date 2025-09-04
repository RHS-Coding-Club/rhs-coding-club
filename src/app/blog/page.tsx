'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BlogPostCard, BlogFilters } from '@/components/blog';
import { usePosts } from '@/hooks/usePosts';
import { Loader2 } from 'lucide-react';

export default function BlogPage() {
  const { posts, loading, error, hasMore, loadMorePosts } = usePosts();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);

  // Filter posts based on search and tags
  const filteredPosts = useMemo(() => {
    return posts.filter(post => {
      const matchesSearch = searchQuery === '' || 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.author.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesTags = selectedTags.length === 0 ||
        selectedTags.some(tag => post.tags?.includes(tag));

      return matchesSearch && matchesTags;
    });
  }, [posts, searchQuery, selectedTags]);

  const handleTagToggle = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    );
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedTags([]);
  };

  if (error) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-2xl font-bold mb-4">Error Loading Posts</h1>
            <p className="text-muted-foreground">{error}</p>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto">
          <div className="text-center space-y-4 mb-12">
            <h1 className="text-4xl md:text-5xl font-bold">Blog & Announcements</h1>
            <p className="text-lg text-muted-foreground">
              Insights, tutorials, and stories from our coding community.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar - Filters */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <BlogFilters
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  selectedTags={selectedTags}
                  onTagToggle={handleTagToggle}
                  onClearFilters={handleClearFilters}
                />
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {loading && posts.length === 0 ? (
                <div className="flex justify-center items-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                </div>
              ) : filteredPosts.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <p className="text-muted-foreground">
                      {posts.length === 0 
                        ? "No posts published yet. Check back soon!"
                        : "No posts match your filters. Try adjusting your search or tags."
                      }
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <div className="grid gap-6">
                    {filteredPosts.map((post) => (
                      <BlogPostCard key={post.id} post={post} />
                    ))}
                  </div>

                  {/* Load More Button */}
                  {hasMore && filteredPosts.length === posts.length && (
                    <div className="text-center pt-6">
                      <Button
                        onClick={loadMorePosts}
                        disabled={loading}
                        variant="outline"
                      >
                        {loading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin mr-2" />
                            Loading...
                          </>
                        ) : (
                          'Load More Posts'
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* Write for Us Card */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Want to Write for Us?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Share your knowledge and experiences with the community. 
                    We welcome guest posts from club members on programming topics, 
                    project showcases, and learning experiences.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
