'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Calendar, ExternalLink, Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/container';
import { StructuredData } from '@/components/structured-data';
import { Skeleton } from '@/components/ui/skeleton';
import { HomepageLoading } from '@/components/homepage-loading';
import { NextEventBanner } from '@/components/next-event-banner';
import { useHomepageData } from '@/hooks/useHomepageData';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

export default function Home() {
  const { stats, featuredProjects, featuredPosts, loading, error } = useHomepageData();

  // Show loading state while data is being fetched
  if (loading) {
    return (
      <>
        <StructuredData />
        <HomepageLoading />
      </>
    );
  }

  // Log error but don't prevent page from rendering
  if (error) {
    console.error('Homepage data error:', error);
  }

  return (
    <>
      <StructuredData />
      <div className="min-h-screen">
        {/* Hero Section - Full Height */}
        <section className="h-screen flex items-center justify-center relative overflow-hidden">
          <Container>
            <div className="text-center space-y-8 max-w-4xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h1 className="text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold tracking-tight">
                  <span className="gradient-text">RHS Coding Club</span>
                </h1>
                <p className="mt-6 md:mt-8 text-lg md:text-xl lg:text-2xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Empowering student developers through collaboration, innovation, and hands-on learning. 
                  Join our community and take your coding skills to the next level.
                </p>
              </motion.div>

              {/* Next Event Banner */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 }}
              >
                <NextEventBanner />
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-6 md:pt-8"
              >
                <Button size="lg" className="px-8 sm:px-10 w-full sm:w-auto min-h-[48px] text-lg" asChild>
                  <Link href="/join">
                    Join the Club
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-8 sm:px-10 w-full sm:w-auto min-h-[48px] text-lg" asChild>
                  <Link href="/about">
                    Learn More
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </motion.div>
            </div>
          </Container>
          
          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1 }}
            className="absolute bottom-24 md:bottom-20 lg:bottom-24 left-1/2 transform -translate-x-1/2 cursor-pointer group"
            onClick={() => {
              const nextSection = document.querySelector('#stats-section');
              nextSection?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <div className="flex flex-col items-center space-y-2 text-muted-foreground group-hover:text-foreground transition-colors duration-300">
              <span className="text-sm">Scroll to explore</span>
              <div className="w-6 h-10 rounded-full border-2 border-muted-foreground flex justify-center items-start pt-2 group-hover:border-foreground transition-colors duration-300">
                <motion.div
                  className="w-1 h-2 rounded-full bg-muted-foreground group-hover:bg-foreground transition-colors duration-300"
                  animate={{ y: [0, 8, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: 'loop',
                    ease: 'easeInOut',
                  }}
                />
              </div>
            </div>
          </motion.div>
        </section>

        {/* Quick Stats Section */}
        <section id="stats-section" className="py-20 bg-muted/30">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Our Community</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join a thriving community of passionate developers and innovators
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              viewport={{ once: true, margin: "-100px" }}
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {loading ? (
                    <Skeleton className="h-16 w-24 mx-auto mb-2" />
                  ) : (
                    <div className="text-5xl md:text-6xl font-bold text-primary">
                      {stats.memberCount}+
                    </div>
                  )}
                  <div className="text-muted-foreground text-lg">Active Members</div>
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {loading ? (
                    <Skeleton className="h-16 w-24 mx-auto mb-2" />
                  ) : (
                    <div className="text-5xl md:text-6xl font-bold text-primary">
                      {stats.eventCount}
                    </div>
                  )}
                  <div className="text-muted-foreground text-lg">Events This Semester</div>
                </motion.div>
                <motion.div 
                  className="space-y-2"
                  whileHover={{ scale: 1.05 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  {loading ? (
                    <Skeleton className="h-16 w-24 mx-auto mb-2" />
                  ) : (
                    <div className="text-5xl md:text-6xl font-bold text-primary">
                      {stats.projectCount}
                    </div>
                  )}
                  <div className="text-muted-foreground text-lg">Projects Submitted</div>
                </motion.div>
              </div>
            </motion.div>
          </Container>
        </section>

        {/* Featured Projects Carousel */}
        <section className="py-24">
          <Container>
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center"
              >
                <h2 className="text-3xl md:text-4xl font-bold">Featured Projects</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Discover the amazing projects built by our talented members.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
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
            </motion.div>
          </div>
        </Container>
      </section>

        {/* Featured Posts Section */}
        <section className="py-24 bg-muted/30">
          <Container>
            <div className="space-y-12">
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                viewport={{ once: true, margin: "-100px" }}
                className="text-center"
              >
                <h2 className="text-3xl md:text-4xl font-bold">Latest Posts</h2>
                <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                  Read insights, tutorials, and stories from our community.
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                viewport={{ once: true, margin: "-100px" }}
              >
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
            </motion.div>
          </div>
        </Container>
      </section>

        {/* CTA Section */}
        <section className="py-24">
          <Container>
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true, margin: "-100px" }}
              className="text-center space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Start Your Journey?
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Join our community today and take your first step toward becoming
                a skilled developer.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="px-6 sm:px-8 w-full sm:w-auto min-h-[44px] min-w-[44px]" asChild>
                  <Link href="/events">
                    <Calendar className="mr-2 h-5 w-5" />
                    View Events
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="px-6 sm:px-8 w-full sm:w-auto min-h-[44px] min-w-[44px]" asChild>
                  <Link href="/join">
                    Join the Club
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
              </div>
            </motion.div>
          </Container>
        </section>
      </div>
    </>
  );
}
