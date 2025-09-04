import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

const blogPosts = [
  {
    title: 'Getting Started with React: A Beginner\'s Guide',
    excerpt: 'Learn the fundamentals of React and build your first component.',
    author: 'Sarah Johnson',
    date: '2025-08-28',
    readTime: '5 min read',
    category: 'Tutorial',
    slug: 'getting-started-with-react',
  },
  {
    title: 'Building Your First API with Node.js',
    excerpt: 'Step-by-step guide to creating a RESTful API using Node.js and Express.',
    author: 'Mike Chen',
    date: '2025-08-25',
    readTime: '8 min read',
    category: 'Backend',
    slug: 'building-first-api-nodejs',
  },
  {
    title: 'The Importance of Version Control in Team Projects',
    excerpt: 'Why Git is essential for collaborative programming and how to use it effectively.',
    author: 'Alex Rivera',
    date: '2025-08-22',
    readTime: '6 min read',
    category: 'Best Practices',
    slug: 'importance-version-control',
  },
];

export default function BlogPage() {
  return (
    <div className="py-20">
      <Container>
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Blog</h1>
            <p className="text-lg text-muted-foreground">
              Insights, tutorials, and stories from our coding community.
            </p>
          </div>

          <div className="space-y-8">
            {blogPosts.map((post, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{post.category}</Badge>
                      <span className="text-sm text-muted-foreground">{post.readTime}</span>
                    </div>
                    <CardTitle className="text-2xl">
                      <Link href={`/blog/${post.slug}`} className="hover:underline">
                        {post.title}
                      </Link>
                    </CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{post.excerpt}</p>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>By {post.author}</span>
                    <span>{post.date}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
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
      </Container>
    </div>
  );
}
