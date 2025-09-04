import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Github, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const projects = [
  {
    title: 'Club Website',
    description: 'The official RHS Coding Club website built with Next.js, TypeScript, and Tailwind CSS.',
    technologies: ['Next.js', 'TypeScript', 'Tailwind CSS', 'Vercel'],
    status: 'Active',
    github: 'https://github.com/rhscodingclub/website',
    demo: 'https://rhscodingclub.vercel.app',
    contributors: 5,
  },
  {
    title: 'Student Grade Calculator',
    description: 'A web application to help students calculate their GPA and track academic progress.',
    technologies: ['React', 'JavaScript', 'CSS'],
    status: 'Completed',
    github: 'https://github.com/rhscodingclub/grade-calculator',
    demo: 'https://rhs-grade-calc.netlify.app',
    contributors: 3,
  },
  {
    title: 'Event Management System',
    description: 'Internal tool for managing club events, RSVPs, and member communications.',
    technologies: ['Node.js', 'Express', 'MongoDB', 'React'],
    status: 'In Progress',
    github: 'https://github.com/rhscodingclub/event-manager',
    contributors: 8,
  },
  {
    title: 'Coding Challenge Platform',
    description: 'Platform for hosting weekly coding challenges with automated testing and leaderboards.',
    technologies: ['Python', 'Django', 'PostgreSQL', 'Docker'],
    status: 'Planning',
    github: 'https://github.com/rhscodingclub/challenges',
    contributors: 2,
  },
];

const getStatusColor = (status: string) => {
  switch (status) {
    case 'Active':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'Completed':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'In Progress':
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
    case 'Planning':
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

export default function ProjectsPage() {
  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Projects</h1>
            <p className="text-lg text-muted-foreground">
              Explore the innovative projects built by our club members.
            </p>
          </div>

          <div className="grid gap-8">
            {projects.map((project, index) => (
              <Card key={index}>
                <CardHeader>
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{project.title}</CardTitle>
                      <p className="text-muted-foreground">{project.description}</p>
                    </div>
                    <Badge className={getStatusColor(project.status)}>
                      {project.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium mb-2">Technologies</h4>
                      <div className="flex flex-wrap gap-2">
                        {project.technologies.map(tech => (
                          <Badge key={tech} variant="outline">
                            {tech}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-muted-foreground">
                        {project.contributors} contributors
                      </span>
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={project.github} target="_blank">
                            <Github className="h-4 w-4 mr-2" />
                            GitHub
                          </Link>
                        </Button>
                        {project.demo && (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={project.demo} target="_blank">
                              <ExternalLink className="h-4 w-4 mr-2" />
                              Demo
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Want to Contribute?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                All our projects are open source and welcome contributions from club members. 
                Whether you&apos;re fixing bugs, adding features, or improving documentation, 
                every contribution helps make our projects better.
              </p>
              <Button asChild>
                <Link href="/join">Join the Club</Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
