'use client';

import { use } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Github, ExternalLink, ArrowLeft, Calendar, User, Star, Loader2, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { useProject } from '@/hooks/useProjects';
import { formatDistanceToNow } from 'date-fns';
import { notFound } from 'next/navigation';

interface ProjectDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const { id } = use(params);
  const { project, loading, error } = useProject(id);

  if (loading) {
    return (
      <div className="py-20">
        <Container>
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mr-2" />
            <span>Loading project...</span>
          </div>
        </Container>
      </div>
    );
  }

  if (error || !project) {
    if (!project) {
      notFound();
    }
    
    return (
      <div className="py-20">
        <Container>
          <div className="flex items-center justify-center py-12 text-red-600">
            <AlertCircle className="h-8 w-8 mr-2" />
            <span>{error || 'Project not found'}</span>
          </div>
        </Container>
      </div>
    );
  }

  const createdDate = project.createdAt.toDate();

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Navigation */}
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </div>

          {/* Header */}
          <div className="space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2 flex-1">
                <h1 className="text-4xl md:text-5xl font-bold">{project.title}</h1>
                <div className="flex items-center gap-4 text-muted-foreground">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {project.authorName}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDistanceToNow(createdDate, { addSuffix: true })}
                  </div>
                  {project.year && (
                    <Badge variant="outline">{project.year}</Badge>
                  )}
                </div>
              </div>
              
              {project.featured && (
                <Badge className="bg-yellow-500 text-yellow-50">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {project.repoUrl && (
                <Button asChild>
                  <Link href={project.repoUrl} target="_blank">
                    <Github className="h-4 w-4 mr-2" />
                    View Repository
                  </Link>
                </Button>
              )}
              {project.demoUrl && (
                <Button variant="outline" asChild>
                  <Link href={project.demoUrl} target="_blank">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Live Demo
                  </Link>
                </Button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Project Images */}
              {project.images && project.images.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Screenshots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {project.images.map((image, index) => (
                        <div key={index} className="relative aspect-video overflow-hidden rounded-lg border">
                          <Image
                            src={image}
                            alt={`${project.title} screenshot ${index + 1}`}
                            fill
                            className="object-cover hover:scale-105 transition-transform duration-300"
                          />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Description */}
              <Card>
                <CardHeader>
                  <CardTitle>About This Project</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-neutral dark:prose-invert max-w-none">
                    {project.description.split('\n').map((paragraph, index) => (
                      <p key={index} className="mb-4 last:mb-0">
                        {paragraph}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Technologies */}
              <Card>
                <CardHeader>
                  <CardTitle>Technologies Used</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {project.tech.map(tech => (
                      <Badge key={tech} variant="secondary">
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Project Info */}
              <Card>
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Author</label>
                    <p className="text-sm">{project.authorName}</p>
                  </div>
                  
                  <Separator />
                  
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Created</label>
                    <p className="text-sm">{createdDate.toLocaleDateString()}</p>
                  </div>

                  {project.year && (
                    <>
                      <Separator />
                      <div>
                        <label className="text-sm font-medium text-muted-foreground">Year</label>
                        <p className="text-sm">{project.year}</p>
                      </div>
                    </>
                  )}

                  {project.featured && (
                    <>
                      <Separator />
                      <div className="flex items-center gap-2 text-yellow-600">
                        <Star className="h-4 w-4" />
                        <span className="text-sm font-medium">Featured Project</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Links */}
              <Card>
                <CardHeader>
                  <CardTitle>Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {project.repoUrl && (
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                      <Link href={project.repoUrl} target="_blank">
                        <Github className="h-4 w-4 mr-2" />
                        Source Code
                      </Link>
                    </Button>
                  )}
                  {project.demoUrl && (
                    <Button variant="outline" size="sm" asChild className="w-full justify-start">
                      <Link href={project.demoUrl} target="_blank">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Live Demo
                      </Link>
                    </Button>
                  )}
                  {!project.repoUrl && !project.demoUrl && (
                    <p className="text-sm text-muted-foreground">No external links available</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* More Projects CTA */}
          <Card>
            <CardContent className="flex items-center justify-between p-6">
              <div>
                <h3 className="font-semibold mb-1">Explore More Projects</h3>
                <p className="text-sm text-muted-foreground">
                  Check out other amazing projects from our community
                </p>
              </div>
              <Button asChild>
                <Link href="/projects">View All Projects</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
