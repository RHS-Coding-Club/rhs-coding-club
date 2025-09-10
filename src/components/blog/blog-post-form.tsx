import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Post } from '@/lib/firebase-collections';
import { generateSlug } from '@/lib/services/posts';
import { useAuth } from '@/contexts/auth-context';
import { X, Eye, FileText } from 'lucide-react';
import Markdown from './markdown';

interface BlogPostFormProps {
  post?: Post;
  onSubmit: (data: Omit<Post, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  onCancel: () => void;
  loading?: boolean;
}

interface FormData {
  title: string;
  summary: string;
  content: string;
  tags: string;
  author: string;
  published: boolean;
  slug: string;
}

export function BlogPostForm({ post, onSubmit, onCancel, loading }: BlogPostFormProps) {
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(post?.tags || []);
  const [activeTab, setActiveTab] = useState('edit');
  const { user, userProfile } = useAuth();

  const defaultAuthor = post?.author || userProfile?.displayName || user?.displayName || '';

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm<FormData>({
    defaultValues: {
      title: post?.title || '',
      summary: post?.summary || '',
      content: post?.content || '',
      tags: '',
      author: defaultAuthor,
      published: post?.published || false,
      slug: post?.slug || '',
    },
  });

  const watchedTitle = watch('title');
  const watchedContent = watch('content');

  // Auto-generate slug from title
  useEffect(() => {
    if (watchedTitle && !post) {
      setValue('slug', generateSlug(watchedTitle));
    }
  }, [watchedTitle, setValue, post]);

  // Update tags when post changes
  useEffect(() => {
    if (post?.tags) {
      setTags(post.tags);
    }
  }, [post]);

  const handleAddTag = () => {
    const trimmedTag = tagInput.trim();
    if (trimmedTag && !tags.includes(trimmedTag)) {
      setTags([...tags, trimmedTag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  const onFormSubmit = async (data: FormData) => {
    try {
      await onSubmit({
        title: data.title,
        summary: data.summary,
        content: data.content,
        tags,
        author: data.author,
        authorId: '', // This should be set by the calling component
        published: data.published,
        slug: data.slug,
      });
    } catch (error) {
      console.error('Failed to submit form:', error);
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>{post ? 'Edit Post' : 'Create New Post'}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title *</Label>
              <Input
                id="title"
                {...register('title', { required: 'Title is required' })}
                placeholder="Enter post title"
              />
              {errors.title && (
                <p className="text-sm text-destructive">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="author">Author *</Label>
              <Input
                id="author"
                {...register('author', { required: 'Author is required' })}
                placeholder="Author name"
              />
              {errors.author && (
                <p className="text-sm text-destructive">{errors.author.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug">URL Slug</Label>
            <Input
              id="slug"
              {...register('slug')}
              placeholder="url-friendly-title"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to auto-generate from title
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="summary">Summary *</Label>
            <Textarea
              id="summary"
              {...register('summary', { required: 'Summary is required' })}
              placeholder="Brief summary of the post"
              rows={3}
            />
            {errors.summary && (
              <p className="text-sm text-destructive">{errors.summary.message}</p>
            )}
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex gap-2">
              <Input
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Add a tag and press Enter"
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Add
              </Button>
            </div>
            {tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) => (
                  <Badge key={tag} variant="secondary" className="cursor-pointer">
                    {tag}
                    <X
                      className="h-3 w-3 ml-1"
                      onClick={() => handleRemoveTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Content with Tabs */}
          <div className="space-y-2">
            <Label>Content *</Label>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList>
                <TabsTrigger value="edit" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Edit
                </TabsTrigger>
                <TabsTrigger value="preview" className="flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview
                </TabsTrigger>
              </TabsList>

              <TabsContent value="edit" className="mt-4">
                <Textarea
                  {...register('content', { required: 'Content is required' })}
                  placeholder="Write your post content in Markdown..."
                  rows={15}
                  className="font-mono"
                />
                {errors.content && (
                  <p className="text-sm text-destructive mt-2">{errors.content.message}</p>
                )}
                <p className="text-xs text-muted-foreground mt-2">
                  Supports Markdown formatting including tables, code blocks, and more.
                </p>
              </TabsContent>

              <TabsContent value="preview" className="mt-4">
                <div className="border rounded-md p-4 min-h-[300px] max-h-[500px] overflow-y-auto">
                  {watchedContent ? (
                    <Markdown content={watchedContent} size="sm" />
                  ) : (
                    <p className="text-muted-foreground italic">No content to preview</p>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>

          {/* Published Status */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="published"
              {...register('published')}
              className="rounded"
            />
            <Label htmlFor="published">Publish immediately</Label>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Saving...' : post ? 'Update Post' : 'Create Post'}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
