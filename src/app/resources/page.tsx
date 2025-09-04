import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { BookOpen, ExternalLink, Download } from 'lucide-react';
import Link from 'next/link';

const resourceCategories = [
  {
    title: 'Programming Languages',
    resources: [
      {
        name: 'JavaScript Fundamentals',
        description: 'Complete guide to JavaScript basics and ES6+ features',
        type: 'Tutorial',
        difficulty: 'Beginner',
        link: 'https://javascript.info',
      },
      {
        name: 'Python for Beginners',
        description: 'Learn Python programming from scratch',
        type: 'Course',
        difficulty: 'Beginner',
        link: 'https://python.org/about/gettingstarted/',
      },
      {
        name: 'Java Documentation',
        description: 'Official Oracle Java documentation and tutorials',
        type: 'Documentation',
        difficulty: 'Intermediate',
        link: 'https://docs.oracle.com/javase/',
      },
    ],
  },
  {
    title: 'Web Development',
    resources: [
      {
        name: 'HTML & CSS Guide',
        description: 'Comprehensive guide to modern HTML and CSS',
        type: 'Tutorial',
        difficulty: 'Beginner',
        link: 'https://web.dev/learn/',
      },
      {
        name: 'React Documentation',
        description: 'Official React documentation with examples',
        type: 'Documentation',
        difficulty: 'Intermediate',
        link: 'https://reactjs.org/docs/',
      },
      {
        name: 'Node.js Best Practices',
        description: 'Collection of Node.js best practices and guidelines',
        type: 'Guide',
        difficulty: 'Advanced',
        link: 'https://nodejs.org/en/docs/',
      },
    ],
  },
  {
    title: 'Tools & Platforms',
    resources: [
      {
        name: 'Git Version Control',
        description: 'Learn Git fundamentals and collaboration workflows',
        type: 'Tutorial',
        difficulty: 'Beginner',
        link: 'https://git-scm.com/docs',
      },
      {
        name: 'VS Code Tips',
        description: 'Productivity tips and extensions for VS Code',
        type: 'Guide',
        difficulty: 'Beginner',
        link: 'https://code.visualstudio.com/docs',
      },
      {
        name: 'Docker Fundamentals',
        description: 'Introduction to containerization with Docker',
        type: 'Course',
        difficulty: 'Intermediate',
        link: 'https://docs.docker.com/get-started/',
      },
    ],
  },
];

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'Beginner':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Intermediate':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Advanced':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export default function ResourcesPage() {
  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Learning Resources</h1>
            <p className="text-lg text-muted-foreground">
              Curated collection of tutorials, guides, and tools to help you learn programming.
            </p>
          </div>

          <div className="space-y-12">
            {resourceCategories.map((category, categoryIndex) => (
              <div key={categoryIndex} className="space-y-6">
                <h2 className="text-2xl font-semibold flex items-center gap-2">
                  <BookOpen className="h-6 w-6" />
                  {category.title}
                </h2>
                
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {category.resources.map((resource, resourceIndex) => (
                    <Card key={resourceIndex}>
                      <CardHeader>
                        <div className="space-y-2">
                          <CardTitle className="text-lg">{resource.name}</CardTitle>
                          <div className="flex gap-2">
                            <Badge variant="outline">{resource.type}</Badge>
                            <Badge className={getDifficultyColor(resource.difficulty)}>
                              {resource.difficulty}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <p className="text-sm text-muted-foreground">
                            {resource.description}
                          </p>
                          <Button variant="outline" size="sm" className="w-full" asChild>
                            <Link href={resource.link} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              View Resource
                            </Link>
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Club Library</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Access our collection of programming books, project templates, 
                  and exclusive member resources.
                </p>
                <Button asChild>
                  <Link href="/dashboard">
                    <Download className="h-4 w-4 mr-2" />
                    Access Library
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Request Resources</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-4">
                  Can&apos;t find what you&apos;re looking for? Let us know what resources 
                  would help you learn better.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/contact">Submit Request</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </div>
  );
}
