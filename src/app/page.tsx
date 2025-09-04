'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Calendar, ExternalLink, Github } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Container } from '@/components/container';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from '@/components/ui/carousel';

// Featured projects data
const featuredProjects = [
  {
    title: 'Club Website',
    description: 'The official RHS Coding Club website built with Next.js, TypeScript, and Tailwind CSS.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    github: 'https://github.com/rhscodingclub/website',
    demo: 'https://rhscodingclub.vercel.app',
    contributors: 5,
  },
  {
    title: 'Student Grade Calculator',
    description: 'A web application to help students calculate their GPA and track academic progress.',
    technologies: ['React', 'JavaScript', 'CSS'],
    github: 'https://github.com/rhscodingclub/grade-calculator',
    demo: 'https://rhs-grade-calc.netlify.app',
    contributors: 3,
  },
  {
    title: 'Event Management System',
    description: 'Internal tool for managing club events, RSVPs, and member communications.',
    technologies: ['Node.js', 'Express', 'MongoDB', 'React'],
    github: 'https://github.com/rhscodingclub/event-manager',
    contributors: 8,
  },
  {
    title: 'Coding Challenge Platform',
    description: 'Platform for hosting weekly coding challenges with automated testing and leaderboards.',
    technologies: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    github: 'https://github.com/rhscodingclub/challenges',
    contributors: 2,
  },
];

// Featured blog posts
const featuredPosts = [
  {
    title: 'Getting Started with React: A Beginner\'s Guide',
    excerpt: 'Learn the fundamentals of React and build your first component.',
    author: 'Sarah Johnson',
    readTime: '5 min read',
    category: 'Tutorial',
  },
  {
    title: 'Building Your First API with Node.js',
    excerpt: 'Step-by-step guide to creating a RESTful API using Node.js and Express.',
    author: 'Mike Chen',
    readTime: '8 min read',
    category: 'Backend',
  },
  {
    title: 'The Importance of Version Control in Team Projects',
    excerpt: 'Why Git is essential for collaborative development and how to get started.',
    author: 'Alex Rodriguez',
    readTime: '6 min read',
    category: 'Best Practices',
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="py-20 lg:py-32">
        <Container>
          <div className="text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight">
                <span className="text-primary">RHS Coding Club</span>
              </h1>
              <p className="mt-6 text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto">
                Empowering student developers through collaboration, innovation, and hands-on learning.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/join">
                  Join the Club
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Quick Stats Section */}
      <section className="py-16 bg-muted/30">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">45+</div>
                <div className="text-muted-foreground">Active Members</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">12</div>
                <div className="text-muted-foreground">Events This Semester</div>
              </div>
              <div className="space-y-2">
                <div className="text-4xl md:text-5xl font-bold text-primary">8</div>
                <div className="text-muted-foreground">Projects Submitted</div>
              </div>
            </div>
          </motion.div>
        </Container>
      </section>

      {/* Featured Projects Carousel */}
      <section className="py-20">
        <Container>
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold">Featured Projects</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Discover the amazing projects built by our talented members.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
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
                              {project.contributors} contributors
                            </span>
                            <div className="flex gap-2">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={project.github} target="_blank">
                                  <Github className="h-4 w-4" />
                                </Link>
                              </Button>
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
            </motion.div>
          </div>
        </Container>
      </section>

      {/* Featured Posts Section */}
      <section className="py-20 bg-muted/30">
        <Container>
          <div className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold">Latest Posts</h2>
              <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
                Read insights, tutorials, and stories from our community.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
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
                          {post.title}
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
            </motion.div>
          </div>
        </Container>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <Container>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
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
              <Button size="lg" className="text-lg px-8" asChild>
                <Link href="/events">
                  <Calendar className="mr-2 h-5 w-5" />
                  View Events
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8" asChild>
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
  );
}
