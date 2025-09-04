'use client';

import { useState, useMemo } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BookOpen, Download } from 'lucide-react';
import Link from 'next/link';
import { useResources } from '@/hooks/useResources';
import { ResourceCard, ResourceFilters } from '@/components/resources';
import { Resource } from '@/lib/firebase-collections';

export default function ResourcesPage() {
  const { resources, loading, error } = useResources();
  const [selectedLevel, setSelectedLevel] = useState<string>('all');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');

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
          <div className="max-w-6xl mx-auto">
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
          <div className="max-w-6xl mx-auto">
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
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold">Learning Resources</h1>
            <p className="text-lg text-muted-foreground">
              Curated collection of tutorials, guides, and tools to help you learn programming.
            </p>
          </div>

          {/* Filters */}
          <ResourceFilters
            onLevelChange={setSelectedLevel}
            onTagsChange={setSelectedTags}
            onSearchChange={setSearchQuery}
            selectedLevel={selectedLevel}
            selectedTags={selectedTags}
            searchQuery={searchQuery}
            availableTags={availableTags}
          />

          {/* Resources by Level */}
          <div className="space-y-12">
            {Object.entries(resourcesByLevel).map(([level, levelResources]) => {
              if (levelResources.length === 0) return null;
              
              return (
                <div key={level} className="space-y-6">
                  <h2 className="text-2xl font-semibold flex items-center gap-2 capitalize">
                    <BookOpen className="h-6 w-6" />
                    {level} Resources
                  </h2>
                  
                  <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {levelResources.map((resource) => (
                      <ResourceCard key={resource.id} resource={resource} />
                    ))}
                  </div>
                </div>
              );
            })}

            {filteredResources.length === 0 && (
              <div className="text-center py-12">
                <p className="text-lg text-muted-foreground">
                  No resources found matching your criteria.
                </p>
              </div>
            )}
          </div>

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
      </Container>
    </div>
  );
}
