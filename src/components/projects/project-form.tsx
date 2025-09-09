'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Plus, Upload, AlertCircle, CheckCircle2 } from 'lucide-react';
import { projectService, CreateProjectData } from '@/lib/services/projects';
import { storage } from '@/lib/firebase';
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
import { useAuth } from '@/contexts/auth-context';

interface ProjectFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectForm({ onSuccess, onCancel }: ProjectFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const [formData, setFormData] = useState<CreateProjectData & { newTech: string }>({
    title: '',
    description: '',
    tech: [],
    repoUrl: '',
    demoUrl: '',
    images: [],
    year: new Date().getFullYear(),
    newTech: ''
  });
  const [imageFiles, setImageFiles] = useState<File[]>([]);

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  const commonTechnologies = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C++', 'C#', 'Go', 'Rust',
    'React', 'Next.js', 'Vue.js', 'Angular', 'Svelte', 'Node.js', 'Express',
    'Django', 'Flask', 'Spring Boot', 'Laravel', 'Rails',
    'MongoDB', 'PostgreSQL', 'MySQL', 'Redis', 'Firebase',
    'AWS', 'Google Cloud', 'Azure', 'Vercel', 'Netlify',
    'Docker', 'Kubernetes', 'Git', 'GitHub Actions', 'Jenkins',
    'HTML', 'CSS', 'Tailwind CSS', 'Bootstrap', 'SCSS',
    'GraphQL', 'REST API', 'WebSocket', 'PWA', 'Electron'
  ];

  const handleInputChange = (field: keyof CreateProjectData, value: string | number | File | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddTechnology = (tech: string) => {
    if (tech && !formData.tech.includes(tech)) {
      setFormData(prev => ({
        ...prev,
        tech: [...prev.tech, tech],
        newTech: ''
      }));
    }
  };

  const handleRemoveTechnology = (tech: string) => {
    setFormData(prev => ({
      ...prev,
      tech: prev.tech.filter(t => t !== tech)
    }));
  };

  const handleAddCustomTech = () => {
    if (formData.newTech.trim()) {
      handleAddTechnology(formData.newTech.trim());
    }
  };

  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      const validFiles = files.filter(file => {
        const isImage = file.type.startsWith('image/');
        const isNotTooLarge = file.size <= 5 * 1024 * 1024; // 5MB
        if (!isImage) toast.error('Please select image files only.');
        if (!isNotTooLarge) toast.error('File size must be less than 5MB.');
        return isImage && isNotTooLarge;
      });
      setImageFiles(prev => [...prev, ...validFiles]);
    }
  };

  const handleImageFileRemove = (fileToRemove: File) => {
    setImageFiles(prev => prev.filter(file => file !== fileToRemove));
  };

  const validateForm = (): string | null => {
    if (!formData.title.trim()) return 'Title is required';
    if (!formData.description.trim()) return 'Description is required';
    if (formData.tech.length === 0) return 'At least one technology is required';
    if (formData.repoUrl && !isValidUrl(formData.repoUrl)) return 'Invalid repository URL';
    if (formData.demoUrl && !isValidUrl(formData.demoUrl)) return 'Invalid demo URL';
    return null;
  };

  const isValidUrl = (url: string): boolean => {
    try {
      new URL(url);
      return true;
    } catch {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) {
      setErrorMessage('You must be logged in to submit a project');
      setSubmitStatus('error');
      return;
    }

    const validationError = validateForm();
    if (validationError) {
      setErrorMessage(validationError);
      setSubmitStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      setIsUploading(true);
      const uploadedImageUrls = await Promise.all(
        imageFiles.map(async (file) => {
          const storageRef = ref(storage, `project-images/${user.uid}/${Date.now()}-${file.name}`);
          await uploadBytes(storageRef, file);
          return getDownloadURL(storageRef);
        })
      );
      setIsUploading(false);

      const finalImages = [...(formData.images || []), ...uploadedImageUrls];
      
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { newTech: _, ...projectData } = { ...formData, images: finalImages };
      await projectService.createProject(projectData, user.uid);
      
      setSubmitStatus('success');
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      console.error('Error submitting project:', error);
      setErrorMessage('Failed to submit project. Please try again.');
      setSubmitStatus('error');
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
    }
  };

  if (submitStatus === 'success') {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12 space-y-4">
          <CheckCircle2 className="h-16 w-16 text-green-500" />
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-2">Project Submitted Successfully!</h3>
            <p className="text-muted-foreground">
              Your project has been submitted for review. It will appear on the projects page once approved by an admin.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Submit Your Project</CardTitle>
        <p className="text-sm text-muted-foreground">
          Share your amazing project with the RHS Coding Club community!
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {submitStatus === 'error' && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-800">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Project Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleInputChange('title', e.target.value)}
              placeholder="My Amazing Project"
              required
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Describe what your project does, what problems it solves, and what makes it special..."
              rows={4}
              required
            />
          </div>

          {/* Year */}
          <div className="space-y-2">
            <Label htmlFor="year">Year</Label>
            <Select value={formData.year?.toString()} onValueChange={(value) => handleInputChange('year', parseInt(value))}>
              <SelectTrigger>
                <SelectValue placeholder="Select year" />
              </SelectTrigger>
              <SelectContent>
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()}>
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Technologies */}
          <div className="space-y-2">
            <Label>Technologies Used *</Label>
            <div className="space-y-3">
              {/* Selected Technologies */}
              {formData.tech.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.tech.map(tech => (
                    <Badge key={tech} variant="default" className="cursor-pointer">
                      {tech}
                      <X 
                        className="h-3 w-3 ml-1" 
                        onClick={() => handleRemoveTechnology(tech)}
                      />
                    </Badge>
                  ))}
                </div>
              )}

              {/* Common Technologies */}
              <div>
                <p className="text-sm text-muted-foreground mb-2">Popular technologies:</p>
                <div className="flex flex-wrap gap-2">
                  {commonTechnologies
                    .filter(tech => !formData.tech.includes(tech))
                    .slice(0, 15)
                    .map(tech => (
                    <Badge 
                      key={tech} 
                      variant="outline" 
                      className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                      onClick={() => handleAddTechnology(tech)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {tech}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Custom Technology Input */}
              <div className="flex gap-2">
                <Input
                  value={formData.newTech}
                  onChange={(e) => setFormData(prev => ({ ...prev, newTech: e.target.value }))}
                  placeholder="Add custom technology..."
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCustomTech())}
                />
                <Button type="button" variant="outline" onClick={handleAddCustomTech}>
                  Add
                </Button>
              </div>
            </div>
          </div>

          {/* Repository URL */}
          <div className="space-y-2">
            <Label htmlFor="repoUrl">Repository URL</Label>
            <Input
              id="repoUrl"
              type="url"
              value={formData.repoUrl}
              onChange={(e) => handleInputChange('repoUrl', e.target.value)}
              placeholder="https://github.com/username/project"
            />
          </div>

          {/* Demo URL */}
          <div className="space-y-2">
            <Label htmlFor="demoUrl">Demo URL</Label>
            <Input
              id="demoUrl"
              type="url"
              value={formData.demoUrl}
              onChange={(e) => handleInputChange('demoUrl', e.target.value)}
              placeholder="https://myproject.vercel.app"
            />
          </div>

          {/* Images */}
          <div className="space-y-2">
            <Label>Project Images</Label>
            <div className="space-y-3">
              {(imageFiles.length > 0) && (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {imageFiles.map((file, index) => (
                    <div key={index} className="relative group">
                      <img 
                        src={URL.createObjectURL(file)} 
                        alt={`Preview ${file.name}`}
                        className="w-full h-24 object-cover rounded-md"
                      />
                      <Button
                        type="button"
                        variant="destructive"
                        size="sm"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleImageFileRemove(file)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-center w-full">
                <Label htmlFor="image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-muted hover:bg-muted/80">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-4 text-muted-foreground" />
                        <p className="mb-2 text-sm text-muted-foreground"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                        <p className="text-xs text-muted-foreground">PNG, JPG, GIF up to 5MB</p>
                    </div>
                    <Input id="image-upload" type="file" className="hidden" multiple onChange={handleImageFileChange} accept="image/png, image/jpeg, image/gif" />
                </Label>
              </div>
              <p className="text-xs text-muted-foreground">
                Screenshots, logos, or demo GIFs work great!
              </p>
            </div>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              type="submit"
              disabled={isSubmitting || !user || isUploading}
              className="flex-1"
            >
              {isUploading ? 'Uploading images...' : isSubmitting ? 'Submitting...' : 'Submit Project'}
            </Button>
            {onCancel && (
              <Button type="button" variant="outline" onClick={onCancel}>
                Cancel
              </Button>
            )}
          </div>

          {!user && (
            <p className="text-sm text-muted-foreground text-center">
              You need to be logged in to submit a project.
            </p>
          )}
        </form>
      </CardContent>
    </Card>
  );
}