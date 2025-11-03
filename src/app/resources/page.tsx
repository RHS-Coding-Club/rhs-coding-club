'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BookOpen, 
  Download, 
  GraduationCap, 
  Zap, 
  Trophy, 
  Tag,
  LayoutDashboard,
  User,
  Users,
  Target
} from 'lucide-react';
import Link from 'next/link';
import { useResources } from '@/hooks/useResources';
import { useResourceBookmarks } from '@/hooks/useResourceBookmarks';
import { useAuth } from '@/contexts/auth-context';
import { ResourceCard, ResourceFilters } from '@/components/resources';
import { Resource } from '@/lib/firebase-collections';

export default function ResourcesPage() {
  const { resources, loading, error } = useResources();
  const { user } = useAuth();
  const { toggleBookmark, isBookmarked } = useResourceBookmarks();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('all');

  // Get all unique tags from resources
  const availableTags = useMemo(() => {
    const tags = new Set<string>();
    resources.forEach(resource => {
      resource.tags.forEach(tag => tags.add(tag));
    });
    return Array.from(tags).sort();
  }, [resources]);

  // Filter resources based on selected filters
  const filteredResources = useMemo(() => {
    return resources.filter(resource => {
      // Level filter
      if (selectedLevel !== 'all' && resource.level !== selectedLevel) {
        return false;
      }

      // Tags filter
      if (selectedTags.length > 0) {
        const hasSelectedTag = selectedTags.some(tag => 
          resource.tags.includes(tag)
        );
        if (!hasSelectedTag) return false;
      }

      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        return (
          resource.title.toLowerCase().includes(query) ||
          resource.description.toLowerCase().includes(query) ||
          resource.tags.some(tag => tag.toLowerCase().includes(query))
        );
      }

      return true;
    });
  }, [resources, selectedLevel, selectedTags, searchQuery]);

  // Group resources by level for display
  const resourcesByLevel = useMemo(() => {
    const grouped: Record<string, Resource[]> = {
      beginner: [],
      intermediate: [],
      advanced: []
    };

    filteredResources.forEach(resource => {
      grouped[resource.level].push(resource);
    });

    return grouped;
  }, [filteredResources]);

  if (loading) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Learning Resources</h1>
              <p className="text-lg text-muted-foreground mb-8">Loading resources...</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-20">
        <Container>
          <div className="max-w-7xl mx-auto">
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Learning Resources</h1>
              <p className="text-lg text-red-600 mb-8">Error loading resources: {error}</p>
            </div>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="py-20">
      <Container>
        <div className="max-w-7xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Learning Resources</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Curated collection of tutorials, guides, and tools to help you learn programming.
              From beginner-friendly tutorials to advanced frameworks.
            </p>
          </div>

          {/* Modern Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Total Resources</CardTitle>
                  <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <BookOpen className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{resources.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Learning materials</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Beginner Friendly</CardTitle>
                  <div className="p-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400">
                    <User className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{resourcesByLevel.beginner.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Start here</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-amber-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Categories</CardTitle>
                  <div className="p-2 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400">
                    <Tag className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{availableTags.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Topics covered</p>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden">
              <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-purple-500/10" />
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm text-muted-foreground">Advanced</CardTitle>
                  <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400">
                    <Trophy className="h-4 w-4" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-semibold">{resourcesByLevel.advanced.length}</div>
                <p className="text-xs text-muted-foreground mt-1">Expert level</p>
              </CardContent>
            </Card>
          </div>

          {/* Responsive navigation */}
          <div className="lg:grid lg:grid-cols-12 lg:gap-6">
            <div className="lg:hidden mb-4">
              <Tabs value={activeSection} onValueChange={setActiveSection}>
                <TabsList className="flex-wrap">
                  <TabsTrigger value="all">All ({filteredResources.length})</TabsTrigger>
                  <TabsTrigger value="beginner">Beginner ({resourcesByLevel.beginner.length})</TabsTrigger>
                  <TabsTrigger value="intermediate">Intermediate ({resourcesByLevel.intermediate.length})</TabsTrigger>
                  <TabsTrigger value="advanced">Advanced ({resourcesByLevel.advanced.length})</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>

            {/* Sidebar */}
            <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
              <Card className="sticky top-24">
                <CardContent className="p-3">
                  <nav className="space-y-1">
                    {[
                      { key: 'all', label: `All Resources (${filteredResources.length})`, icon: LayoutDashboard },
                      { key: 'beginner', label: `Beginner (${resourcesByLevel.beginner.length})`, icon: User },
                      { key: 'intermediate', label: `Intermediate (${resourcesByLevel.intermediate.length})`, icon: Users },
                      { key: 'advanced', label: `Advanced (${resourcesByLevel.advanced.length})`, icon: Target },
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
              {/* Filters */}
              <div className="bg-card p-6 rounded-lg border">
                <ResourceFilters
                  onLevelChange={setSelectedLevel}
                  onTagsChange={setSelectedTags}
                  onSearchChange={setSearchQuery}
                  selectedLevel={selectedLevel}
                  selectedTags={selectedTags}
                  searchQuery={searchQuery}
                  availableTags={availableTags}
                />
              </div>

              <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
                <TabsList className="lg:hidden" />

                <TabsContent value="all" className="space-y-8">
                  {filteredResources.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No resources found</h3>
                        <p className="text-muted-foreground">
                          No resources found matching your criteria. Try adjusting your filters.
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="space-y-12">
                      {Object.entries(resourcesByLevel).map(([level, levelResources]) => {
                        if (levelResources.length === 0) return null;
                        
                        const levelIcons = {
                          beginner: GraduationCap,
                          intermediate: Zap,
                          advanced: Trophy
                        };
                        
                        const LevelIcon = levelIcons[level as keyof typeof levelIcons];
                        
                        return (
                          <div key={level} className="space-y-6">
                            <h2 className="text-2xl font-semibold flex items-center gap-2 capitalize">
                              <LevelIcon className="h-6 w-6" />
                              {level} Resources
                            </h2>
                            
                            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                              {levelResources.map((resource) => (
                                <ResourceCard
                                  key={resource.id}
                                  resource={resource}
                                  isBookmarked={isBookmarked(resource.id)}
                                  onToggleBookmark={user ? toggleBookmark : undefined}
                                />
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="beginner" className="space-y-6">
                  {resourcesByLevel.beginner.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <User className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No beginner resources found</h3>
                        <p className="text-muted-foreground">Check back soon for more beginner-friendly content.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {resourcesByLevel.beginner.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          isBookmarked={isBookmarked(resource.id)}
                          onToggleBookmark={user ? toggleBookmark : undefined}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="intermediate" className="space-y-6">
                  {resourcesByLevel.intermediate.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Users className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No intermediate resources found</h3>
                        <p className="text-muted-foreground">Intermediate resources will appear here as they&apos;re added.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {resourcesByLevel.intermediate.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          isBookmarked={isBookmarked(resource.id)}
                          onToggleBookmark={user ? toggleBookmark : undefined}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="advanced" className="space-y-6">
                  {resourcesByLevel.advanced.length === 0 ? (
                    <Card>
                      <CardContent className="p-12 text-center">
                        <Target className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <h3 className="text-lg font-semibold mb-2">No advanced resources found</h3>
                        <p className="text-muted-foreground">Advanced topics and expert-level content coming soon.</p>
                      </CardContent>
                    </Card>
                  ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                      {resourcesByLevel.advanced.map((resource) => (
                        <ResourceCard
                          key={resource.id}
                          resource={resource}
                          isBookmarked={isBookmarked(resource.id)}
                          onToggleBookmark={user ? toggleBookmark : undefined}
                        />
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>

              {/* Additional Sections */}
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
          </div>
        </div>
      </Container>
    </div>
  );
}
