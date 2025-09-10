'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Loader2, 
  AlertCircle, 
  FolderOpen, 
  Star, 
  Code, 
  Trophy,
  Clock,
  LayoutDashboard
} from 'lucide-react';
import { ProjectCard, ProjectFilters, ProjectForm } from '@/components/projects';
import { useProjects } from '@/hooks/useProjects';
import { useAuth } from '@/contexts/auth-context';

export default function ProjectsPage() {
  const { user } = useAuth();
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [showSubmissionForm, setShowSubmissionForm] = useState(false);
  const [activeSection, setActiveSection] = useState<string>('all');
  
  const { projects, loading, error, refetch } = useProjects({
    approved: true,
    tags: selectedTags.length > 0 ? selectedTags : undefined,
    year: selectedYear || undefined
  });

  const { projects: featuredProjects } = useProjects({
    approved: true,
    featured: true
  });

  const { projects: recentProjects } = useProjects({
    approved: true
  });

  const handleFiltersReset = () => {
    setSelectedTags([]);
    setSelectedYear(null);
  };

  const handleSubmissionSuccess = () => {
    setShowSubmissionForm(false);
    refetch();
  };

  // Calculate stats
  const totalProjects = projects.length;
  const uniqueTags = useMemo(() => {
    const tags = new Set<string>();
    projects.forEach(project => {
      // Check if project has a tags property and iterate over it
      if ('tags' in project && Array.isArray(project.tags)) {
        project.tags.forEach((tag: string) => tags.add(tag));
      }
    });
    return tags.size;
  }, [projects]);

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
        <div className="max-w-7xl mx-auto space-y-12">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Projects</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore the innovative projects built by our club members.
              From web apps to games, see what creativity looks like in code.
            </p>
            {user && (
              <Button onClick={() => setShowSubmissionForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Submit Your Project
              </Button>
            )}
          </div>

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Total Projects</CardTitle>
                  <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <FolderOpen className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{totalProjects}</div>
                <p className="text-xs text-muted-foreground mt-1">Community creations</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Featured</CardTitle>
                  <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Star className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{featuredProjects.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Showcase worthy</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Technologies</CardTitle>
                  <div className="p-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
                    <Code className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{uniqueTags}+</div>
                <p className="text-xs text-muted-foreground mt-1">Tools & frameworks</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">This Year</CardTitle>
                  <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Trophy className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{new Date().getFullYear()}</div>
                <p className="text-xs text-muted-foreground mt-1">Innovation year</p>
              </CardContent>
            </Card>
          </div>

          {/* Responsive navigation */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-6">
            <div className="lg:hidden mb-4">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="flex-wrap">
                  <TabsTrigger value="all">All ({projects.length})</TabsTrigger>
                  <TabsTrigger value="featured">Featured ({featuredProjects.length})</TabsTrigger>
                  <TabsTrigger value="recent">Recent ({recentProjects.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
              <Card className="sticky top-24">
                <CardContent className="p-3">
                  <nav className="space-y-1">
                    {[
                      { key: 'all', label: `All Projects (${projects.length})`, icon: LayoutDashboard },
                      { key: 'featured', label: `Featured (${featuredProjects.length})`, icon: Star },
                      { key: 'recent', label: `Recent (${recentProjects.length})`, icon: Clock },
                    ].map(({ key, label, icon: Icon }) => (
                      <button
                        key={key}
                        onClick={() => setActiveSection(key)}
                        className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                          activeSection === key ? 'bg-primary/10 text-primary' : 'hover:bg-muted text-foreground'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{label}</span>
                      </button>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            </aside>

            {/* Content */}
            <div className="lg:col-span-9 xl:col-span-10 space-y-6 mt-6 lg:mt-0">
              <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
                <TabsList className="lg:hidden" />

                <TabsContent value="all" className="space-y-8">
                  {/* Filters */}
                  <div className="bg-card p-6 rounded-lg border">
                    <ProjectFilters
                      selectedTags={selectedTags}
                      selectedYear={selectedYear}
                      onTagsChange={setSelectedTags}
                      onYearChange={setSelectedYear}
                      onReset={handleFiltersReset}
                    />
                  </div>

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
                    <Card>
                      <CardContent className="p-12 text-center">
                        <FolderOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No projects found</h3>
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
                      </CardContent>
                    </Card>
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
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Star className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No featured projects yet</h3>
                        <p className="text-muted-foreground">Featured projects will appear here when selected by our team.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {featuredProjects.map(project => (
                        <ProjectCard key={project.id} project={project} />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="recent" className="space-y-8">
                  {recentProjects.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Clock className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No recent projects</h3>
                        <p className="text-muted-foreground">Recent projects will appear here as they are submitted.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {recentProjects.map(project => (
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
          </div>
        </div>
      </Container>
    </div>
  );
}
