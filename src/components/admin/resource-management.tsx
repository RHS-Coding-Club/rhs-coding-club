import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Plus, Edit, Trash2, ExternalLink, Search, Database } from 'lucide-react';
import { Resource } from '@/lib/firebase-collections';
import { resourceService, CreateResourceData } from '@/lib/services/resources';
import { ResourceForm } from '@/components/resources';
import { useAuth } from '@/contexts/auth-context';

export function ResourceManagement() {
  const { user } = useAuth();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [resourceToDelete, setResourceToDelete] = useState<Resource | null>(null);
  const [seeding, setSeeding] = useState(false);

  const fetchResources = async () => {
    try {
      setLoading(true);
      const fetchedResources = await resourceService.getResources();
      setResources(fetchedResources);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleCreateResource = async (data: CreateResourceData) => {
    if (!user) return;
    
    try {
      await resourceService.createResource(data, user.uid);
      await fetchResources();
    } catch (error) {
      console.error('Error creating resource:', error);
      throw error;
    }
  };

  const handleUpdateResource = async (data: CreateResourceData, resourceId: string) => {
    try {
      await resourceService.updateResource({ ...data, id: resourceId });
      await fetchResources();
    } catch (error) {
      console.error('Error updating resource:', error);
      throw error;
    }
  };

  const handleDeleteResource = async () => {
    if (!resourceToDelete) return;

    try {
      await resourceService.deleteResource(resourceToDelete.id);
      await fetchResources();
      setDeleteDialogOpen(false);
      setResourceToDelete(null);
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const handleSeedResources = async () => {
    if (!user) return;
    
    try {
      setSeeding(true);
      await fetchResources();
    } catch (error) {
      console.error('Error seeding resources:', error);
    } finally {
      setSeeding(false);
    }
  };

  const filteredResources = resources.filter(resource =>
    resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'intermediate':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'advanced':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Resource Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading resources...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Resource Management</CardTitle>
          <div className="flex gap-2">
            {resources.length === 0 && (
              <Button
                variant="outline"
                onClick={handleSeedResources}
                disabled={seeding}
              >
                <Database className="h-4 w-4 mr-2" />
                {seeding ? 'Seeding...' : 'Add Sample Data'}
              </Button>
            )}
            <ResourceForm onSubmit={handleCreateResource}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Resource
              </Button>
            </ResourceForm>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Resources Grid */}
          <div className="space-y-4">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold">{resource.title}</h3>
                      <Badge className={getLevelColor(resource.level)}>
                        {resource.level.charAt(0).toUpperCase() + resource.level.slice(1)}
                      </Badge>
                    </div>
                    
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {resource.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      {resource.tags.slice(0, 4).map((tag, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {resource.tags.length > 4 && (
                        <Badge variant="outline" className="text-xs">
                          +{resource.tags.length - 4}
                        </Badge>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => window.open(resource.url, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-1" />
                        View Resource
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 ml-4">
                    <ResourceForm
                      resource={resource}
                      onSubmit={(data) => handleUpdateResource(data, resource.id)}
                    >
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                    </ResourceForm>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setResourceToDelete(resource);
                        setDeleteDialogOpen(true);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
            
            {filteredResources.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                {searchQuery ? 'No resources found matching your search.' : 'No resources found.'}
              </div>
            )}
          </div>
        </div>
      </CardContent>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Resource</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{resourceToDelete?.title}&quot;? 
              This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteResource}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
