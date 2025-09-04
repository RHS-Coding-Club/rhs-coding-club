'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { BlogPostForm } from '@/components/blog';
import { usePosts, usePostMutations } from '@/hooks/usePosts';
import { useAuth } from '@/contexts/auth-context';
import { Post } from '@/lib/firebase-collections';
import { 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Eye, 
  Loader2
} from 'lucide-react';
import { formatDistance } from 'date-fns';
import Link from 'next/link';
import { toast } from 'sonner';

export function BlogManagement() {
  const { posts, loading, error, refreshPosts } = usePosts(true); // Include unpublished posts
  const { create, update, remove, loading: mutationLoading } = usePostMutations();
  const { user, userProfile } = useAuth();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  // Filter posts based on search
  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.author.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (post.tags && post.tags.some(tag => 
      tag.toLowerCase().includes(searchQuery.toLowerCase())
    ))
  );

  const handleCreatePost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      await create({
        ...postData,
        authorId: user?.uid || '',
        author: userProfile?.displayName || user?.displayName || 'Unknown Author',
      });
      toast.success('Post created successfully');
      setIsCreateDialogOpen(false);
      refreshPosts();
    } catch {
      toast.error('Failed to create post');
    }
  };

  const handleUpdatePost = async (postData: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (!editingPost) return;
    
    try {
      await update(editingPost.id, postData);
      toast.success('Post updated successfully');
      setIsEditDialogOpen(false);
      setEditingPost(null);
      refreshPosts();
    } catch {
      toast.error('Failed to update post');
    }
  };

  const handleDeletePost = async (postId: string) => {
    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return;
    }

    try {
      await remove(postId);
      toast.success('Post deleted successfully');
      refreshPosts();
    } catch {
      toast.error('Failed to delete post');
    }
  };

  const handleEditClick = (post: Post) => {
    setEditingPost(post);
    setIsEditDialogOpen(true);
  };

  if (error) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-destructive">Error loading posts: {error}</p>
          <Button onClick={refreshPosts} className="mt-4">
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold">Blog Management</h2>
          <p className="text-muted-foreground">
            Manage blog posts and announcements
          </p>
        </div>
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Post
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
              <DialogDescription>
                Create a new blog post or announcement for the club.
              </DialogDescription>
            </DialogHeader>
            <BlogPostForm
              onSubmit={handleCreatePost}
              onCancel={() => setIsCreateDialogOpen(false)}
              loading={mutationLoading}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Posts Table */}
      <Card>
        <CardHeader>
          <CardTitle>Posts ({filteredPosts.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin" />
            </div>
          ) : filteredPosts.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {posts.length === 0 
                  ? "No posts yet. Create your first post!" 
                  : "No posts match your search."
                }
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Author</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Tags</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPosts.map((post) => (
                    <TableRow key={post.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium line-clamp-1">
                            {post.title}
                          </div>
                          <div className="text-sm text-muted-foreground line-clamp-2">
                            {post.summary}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{post.author}</TableCell>
                      <TableCell>
                        <Badge variant={post.published ? "default" : "secondary"}>
                          {post.published ? "Published" : "Draft"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {post.tags?.slice(0, 2).map((tag) => (
                            <Badge key={tag} variant="outline" className="text-xs">
                              {tag}
                            </Badge>
                          ))}
                          {post.tags && post.tags.length > 2 && (
                            <Badge variant="outline" className="text-xs">
                              +{post.tags.length - 2}
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {formatDistance(post.createdAt.toDate(), new Date(), { 
                            addSuffix: true 
                          })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {post.published && (
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <Link href={`/blog/${post.slug || post.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditClick(post)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePost(post.id)}
                            disabled={mutationLoading}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
            <DialogDescription>
              Make changes to the blog post.
            </DialogDescription>
          </DialogHeader>
          {editingPost && (
            <BlogPostForm
              post={editingPost}
              onSubmit={handleUpdatePost}
              onCancel={() => {
                setIsEditDialogOpen(false);
                setEditingPost(null);
              }}
              loading={mutationLoading}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
