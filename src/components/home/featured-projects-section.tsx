'use client';

import Link from 'next/link';
import { ExternalLink, Github } from 'lucide-react';

import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useHomepageData } from '@/hooks/useHomepageData';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export function FeaturedProjectsSection() {
  const { featuredProjects, loading } = useHomepageData();

  return (
    <section className="py-24">
      <Container>
        <div className="space-y-12">
          <div className="text-center animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold">Featured Projects</h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Discover the amazing projects built by our talented members.
            </p>
          </div>

          <div className="animate-fade-in animation-delay-200">
            {loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Card key={i} className="h-full">
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-2/3" />
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <Skeleton className="h-4 w-20 mb-2" />
                          <div className="flex flex-wrap gap-1">
                            <Skeleton className="h-6 w-16" />
                            <Skeleton className="h-6 w-20" />
                            <Skeleton className="h-6 w-14" />
                          </div>
                        </div>
                        <div className="flex items-center justify-between pt-2">
                          <Skeleton className="h-4 w-24" />
                          <div className="flex gap-2">
                            <Skeleton className="h-8 w-8 rounded" />
                            <Skeleton className="h-8 w-8 rounded" />
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : featuredProjects.length > 0 ? (
              <Carousel
                opts={{
                  align: 'start',
                  loop: true,
                }}
                className="w-full max-w-6xl mx-auto"
              >
                <CarouselContent className="-ml-2 md:-ml-4">
                  {featuredProjects.map((project, index) => (
                    <CarouselItem key={index} className="pl-2 md:pl-4 md:basis-1/2 lg:basis-1/3">
                      <Card className="h-full">
                        <CardHeader>
                          <CardTitle className="text-xl">{project.title}</CardTitle>
                          <p className="text-muted-foreground line-clamp-3">{project.description}</p>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <h4 className="text-sm font-medium mb-2">Technologies</h4>
                            <div className="flex flex-wrap gap-1">
                              {project.technologies.slice(0, 3).map(tech => (
                                <Badge key={tech} variant="outline" className="text-xs">
                                  {tech}
                                </Badge>
                              ))}
                              {project.technologies.length > 3 && (
                                <Badge variant="outline" className="text-xs">
                                  +{project.technologies.length - 3}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-muted-foreground">
                              By {project.authorName}
                            </span>
                            <div className="flex gap-2">
                              {project.github && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={project.github} target="_blank">
                                    <Github className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                              {project.demo && (
                                <Button variant="ghost" size="sm" asChild>
                                  <Link href={project.demo} target="_blank">
                                    <ExternalLink className="h-4 w-4" />
                                  </Link>
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
              </Carousel>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No featured projects available yet.</p>
                <Button asChild className="mt-4">
                  <Link href="/projects">Browse All Projects</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}