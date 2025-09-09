'use client';

import { useState, use } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import { Github, ExternalLink, ArrowLeft, Calendar, User, Star, Loader2, AlertCircle, Maximize } from 'lucide-react';
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
    <div className="py-12 md:py-20 bg-muted/20">
      <Container>
        <div className="max-w-6xl mx-auto">
          {/* Navigation */}
          <div className="mb-8">
            <Button variant="ghost" size="sm" asChild>
              <Link href="/projects">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Projects
              </Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Header */}
              <Card className="overflow-hidden">
                <CardContent className="p-6">
                  <div className="flex flex-col md:flex-row gap-6">
                    {project.images && project.images.length > 0 && (
                      <div className="md:w-1/3 flex-shrink-0">
                        <Dialog>
                          <DialogTrigger asChild>
                            <div className="relative aspect-video overflow-hidden rounded-lg border group cursor-pointer">
                              <Image
                                src={project.images[0]}
                                alt={`${project.title} main screenshot`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize className="h-8 w-8 text-white" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-0">
                            <VisuallyHidden>
                              <DialogTitle>Full-size image of {project.title}</DialogTitle>
                            </VisuallyHidden>
                            <Image
                              src={project.images[0]}
                              alt={`${project.title} main screenshot`}
                              width={1200}
                              height={675}
                              className="w-full h-auto rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      </div>
                    )}
                    <div className="flex-1 space-y-3">
                      {project.featured && (
                        <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-400/90">
                          <Star className="h-3 w-3 mr-1" />
                          Featured Project
                        </Badge>
                      )}
                      <h1 className="text-3xl md:text-4xl font-bold tracking-tight">{project.title}</h1>
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1.5">
                          <User className="h-4 w-4" />
                          <span>{project.authorName}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-4 w-4" />
                          <span>{formatDistanceToNow(createdDate, { addSuffix: true })}</span>
                        </div>
                        {project.year && (
                          <Badge variant="outline">{project.year}</Badge>
                        )}
                      </div>
                      <div className="flex gap-3 pt-2">
                        {project.repoUrl && (
                          <Button asChild size="sm">
                            <Link href={project.repoUrl} target="_blank">
                              <Github className="h-4 w-4 mr-2" />
                              Repository
                            </Link>
                          </Button>
                        )}
                        {project.demoUrl && (
                          <Button variant="outline" asChild size="sm">
                            <Link href={project.demoUrl} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Live Demo
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

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

              {/* Project Images */}
              {project.images && project.images.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Screenshots</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {project.images.slice(1).map((image, index) => (
                        <Dialog key={index}>
                          <DialogTrigger asChild>
                            <div className="relative aspect-video overflow-hidden rounded-lg border group cursor-pointer">
                              <Image
                                src={image}
                                alt={`${project.title} screenshot ${index + 2}`}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                              <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Maximize className="h-6 w-6 text-white" />
                              </div>
                            </div>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl p-0">
                            <VisuallyHidden>
                              <DialogTitle>Full-size screenshot of {project.title}</DialogTitle>
                            </VisuallyHidden>
                            <Image
                              src={image}
                              alt={`${project.title} screenshot ${index + 2}`}
                              width={1200}
                              height={675}
                              className="w-full h-auto rounded-lg"
                            />
                          </DialogContent>
                        </Dialog>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
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
                <CardContent className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Author</span>
                    <span className="font-medium">{project.authorName}</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Created</span>
                    <span className="font-medium">{createdDate.toLocaleDateString()}</span>
                  </div>

                  {project.year && (
                    <>
                      <Separator />
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Year</span>
                        <span className="font-medium">{project.year}</span>
                      </div>
                    </>
                  )}

                  {project.featured && (
                    <>
                      <Separator />
                      <div className="flex items-center justify-between text-yellow-600">
                        <span className="text-muted-foreground">Status</span>
                        <div className="flex items-center gap-2">
                          <Star className="h-4 w-4" />
                          <span className="font-medium">Featured Project</span>
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
