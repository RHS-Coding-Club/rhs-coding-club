'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { 
  Check, 
  Star, 
  StarOff, 
  Eye, 
  Edit, 
  Trash2, 
  ExternalLink, 
  Github, 
  Calendar,
  User,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { projectService, ProjectWithAuthor, UpdateProjectData } from '@/lib/services/projects';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import Image from 'next/image';

export function ProjectManagement() {
  const [pendingProjects, setPendingProjects] = useState<ProjectWithAuthor[]>([]);
  const [allProjects, setAllProjects] = useState<ProjectWithAuthor[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProject, setSelectedProject] = useState<ProjectWithAuthor | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const [pending, approved] = await Promise.all([
        projectService.getPendingProjects(),
        projectService.getProjects({ approved: true })
      ]);
      setPendingProjects(pending);
      setAllProjects(approved);
    } catch (error) {
      console.error('Error loading projects:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  const handleApprove = async (projectId: string) => {
    try {
      setActionLoading(projectId);
      await projectService.approveProject(projectId);
      await loadProjects();
    } catch (error) {
      console.error('Error approving project:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleFeature = async (projectId: string, featured: boolean) => {
    try {
      setActionLoading(projectId);
      await projectService.toggleFeatureProject(projectId, featured);
      await loadProjects();
    } catch (error) {
      console.error('Error updating project feature status:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleDelete = async (projectId: string) => {
    try {
      setActionLoading(projectId);
      await projectService.deleteProject(projectId);
      await loadProjects();
    } catch (error) {
      console.error('Error deleting project:', error);
    } finally {
      setActionLoading(null);
    }
  };

  const handleUpdate = async (projectId: string, data: Partial<UpdateProjectData>) => {
    try {
      await projectService.updateProject({ id: projectId, ...data });
      await loadProjects();
      setShowEditDialog(false);
      setSelectedProject(null);
    } catch (error) {
      console.error('Error updating project:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin mr-2" />
        <span>Loading projects...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Pending Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-orange-500" />
            Pending Approval ({pendingProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pendingProjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No projects pending approval
            </p>
          ) : (
            <div className="space-y-4">
              {pendingProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isPending
                  onApprove={() => handleApprove(project.id)}
                  onDelete={() => handleDelete(project.id)}
                  onEdit={() => {
                    setSelectedProject(project);
                    setShowEditDialog(true);
                  }}
                  actionLoading={actionLoading === project.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Approved Projects */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Check className="h-5 w-5 text-green-500" />
            Approved Projects ({allProjects.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {allProjects.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">
              No approved projects yet
            </p>
          ) : (
            <div className="space-y-4">
              {allProjects.map(project => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  isPending={false}
                  onFeature={() => handleFeature(project.id, !project.featured)}
                  onDelete={() => handleDelete(project.id)}
                  onEdit={() => {
                    setSelectedProject(project);
                    setShowEditDialog(true);
                  }}
                  actionLoading={actionLoading === project.id}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Project Dialog */}
      {selectedProject && (
        <EditProjectDialog
          project={selectedProject}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
          onSave={(data) => handleUpdate(selectedProject.id, data)}
        />
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: ProjectWithAuthor;
  isPending: boolean;
  onApprove?: () => void;
  onFeature?: () => void;
  onDelete: () => void;
  onEdit: () => void;
  actionLoading: boolean;
}

function ProjectCard({ 
  project, 
  isPending, 
  onApprove, 
  onFeature, 
  onDelete, 
  onEdit,
  actionLoading 
}: ProjectCardProps) {
  const createdDate = project.createdAt.toDate();

  return (
    <Card className="p-4">
      <div className="flex gap-4">
        {/* Project Image */}
        {project.images && project.images.length > 0 && (
          <div className="flex-shrink-0">
            <div className="relative w-24 h-24 rounded-lg overflow-hidden">
              <Image
                src={project.images[0]}
                alt={project.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
        )}

        {/* Project Info */}
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="font-semibold text-lg">{project.title}</h3>
              <p className="text-sm text-muted-foreground line-clamp-2">
                {project.description}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {project.featured && (
                <Badge className="bg-yellow-500 text-yellow-50">
                  <Star className="h-3 w-3 mr-1" />
                  Featured
                </Badge>
              )}
              {isPending ? (
                <Badge variant="secondary">Pending</Badge>
              ) : (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  Approved
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-wrap gap-1">
            {project.tech.slice(0, 5).map(tech => (
              <Badge key={tech} variant="outline" className="text-xs">
                {tech}
              </Badge>
            ))}
            {project.tech.length > 5 && (
              <Badge variant="outline" className="text-xs">
                +{project.tech.length - 5} more
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <div className="flex items-center gap-1">
              <User className="h-3 w-3" />
              {project.authorName}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDistanceToNow(createdDate, { addSuffix: true })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2 pt-2">
            <Button variant="outline" size="sm" asChild>
              <Link href={`/projects/${project.id}`} target="_blank">
                <Eye className="h-3 w-3 mr-1" />
                View
              </Link>
            </Button>

            {project.repoUrl && (
              <Button variant="outline" size="sm" asChild>
                <Link href={project.repoUrl} target="_blank">
                  <Github className="h-3 w-3 mr-1" />
                  Code
                </Link>
              </Button>
            )}

            {project.demoUrl && (
              <Button variant="outline" size="sm" asChild>
                <Link href={project.demoUrl} target="_blank">
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Demo
                </Link>
              </Button>
            )}

            <Separator orientation="vertical" className="h-4" />

            <Button 
              variant="outline" 
              size="sm" 
              onClick={onEdit}
              disabled={actionLoading}
            >
              <Edit className="h-3 w-3 mr-1" />
              Edit
            </Button>

            {isPending && onApprove && (
              <Button 
                size="sm" 
                onClick={onApprove}
                disabled={actionLoading}
                className="bg-green-600 hover:bg-green-700"
              >
                {actionLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : (
                  <Check className="h-3 w-3 mr-1" />
                )}
                Approve
              </Button>
            )}

            {!isPending && onFeature && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onFeature}
                disabled={actionLoading}
                className={project.featured ? "text-yellow-600 border-yellow-600" : ""}
              >
                {actionLoading ? (
                  <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                ) : project.featured ? (
                  <StarOff className="h-3 w-3 mr-1" />
                ) : (
                  <Star className="h-3 w-3 mr-1" />
                )}
                {project.featured ? 'Unfeature' : 'Feature'}
              </Button>
            )}

            <Button 
              variant="outline" 
              size="sm" 
              disabled={actionLoading}
              className="text-red-600 border-red-600 hover:bg-red-50"
              onClick={() => {
                if (confirm(`Are you sure you want to delete "${project.title}"? This action cannot be undone.`)) {
                  onDelete();
                }
              }}
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Delete
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
}

interface EditProjectDialogProps {
  project: ProjectWithAuthor;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: Partial<UpdateProjectData>) => void;
}

function EditProjectDialog({ project, open, onOpenChange, onSave }: EditProjectDialogProps) {
  const [formData, setFormData] = useState({
    title: project.title,
    description: project.description,
    year: project.year || new Date().getFullYear(),
    repoUrl: project.repoUrl || '',
    demoUrl: project.demoUrl || '',
  });

  const handleSave = () => {
    onSave(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Project</DialogTitle>
          <DialogDescription>
            Make changes to the project information.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div>
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="edit-description">Description</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={4}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="edit-year">Year</Label>
              <Input
                id="edit-year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="edit-repo">Repository URL</Label>
            <Input
              id="edit-repo"
              type="url"
              value={formData.repoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, repoUrl: e.target.value }))}
            />
          </div>

          <div>
            <Label htmlFor="edit-demo">Demo URL</Label>
            <Input
              id="edit-demo"
              type="url"
              value={formData.demoUrl}
              onChange={(e) => setFormData(prev => ({ ...prev, demoUrl: e.target.value }))}
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
