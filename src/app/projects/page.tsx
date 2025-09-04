'use client';

import { useState } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Loader2, AlertCircle } from 'lucide-react';
import { ProjectCard, ProjectFilters, ProjectForm } from '@/components/projects';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/auth-context';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  
  const { projects, loading, error, refetch } = useProjects({
    approved: true,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    year: selectedYear || undefined
  });

  const { projects: featuredProjects } = useProjects({
    approved: true,
    featured: true
  });

  const handleFiltersReset = () => {
    setSelectedTags([]);
    setSelectedYear(null);
  };

  const handleSubmissionSuccess = () => {
    setShowSubmissionForm(false);
    refetch();
  };

  if (showSubmissionForm) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-4xl mx-auto">
            <ProjectForm 
              onSuccess={handleSubmissionSuccess}
              onCancel={() => setShowSubmissionForm(false)}
            />
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-6xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Projects</h1>
            <p className="text-lg text-muted-foreground">
              Explore the innovative projects built by our club members.
            </p>
            {user && (
              <Button onClick={() => setShowSubmissionForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Your Project
              </Button>
            )}
          </div>

          <Tabs defaultValue="all" className="space-y-8">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="all">All Projects</TabsTrigger>
              <TabsTrigger value="featured">Featured</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-8">
              {/* Filters */}
              <ProjectFilters
                selectedTags={selectedTags}
                selectedYear={selectedYear}
                onTagsChange={setSelectedTags}
                onYearChange={setSelectedYear}
                onReset={handleFiltersReset}
              />

              {/* Projects Grid */}
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin" />
                  <span className="ml-2">Loading projects...</span>
                </div>
              ) : error ? (
                <div className="flex items-center justify-center py-12 text-red-600">
                  <AlertCircle className="h-8 w-8 mr-2" />
                  <span>{error}</span>
                </div>
              ) : projects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground mb-4">
                    {selectedTags.length > 0 || selectedYear 
                      ? 'No projects found matching your filters.' 
                      : 'No projects available yet.'
                    }
                  </p>
                  {(selectedTags.length > 0 || selectedYear) && (
                    <Button variant="outline" onClick={handleFiltersReset}>
                      Clear Filters
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {projects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="featured" className="space-y-8">
              {featuredProjects.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-muted-foreground">No featured projects yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {featuredProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                  ))}
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Call to Action */}
          <Card>
            <CardHeader>
              <CardTitle>Want to Contribute?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">
                Share your amazing projects with the RHS Coding Club community! 
                Whether it&apos;s a school assignment, personal project, or collaborative work, 
                we&apos;d love to see what you&apos;ve built.
              </p>
              <div className="flex gap-4">
                {user ? (
                  <Button onClick={() => setShowSubmissionForm(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Submit Project
                  </Button>
                ) : (
                  <Button asChild>
                    <a href="/join">Join the Club</a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </Container>
    </div>
  );
}
