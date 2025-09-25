'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { challengesService } from '@/lib/services/challenges';
import { useAuth } from '@/contexts/auth-context';
import { Challenge, Submission } from '@/lib/firebase-collections';
import { toast } from 'sonner';
import { Upload, Link2, Code2, FileText, X } from 'lucide-react';

interface SubmissionFormProps {
  challenge: Challenge;
  existingSubmission?: Submission | null;
  onSubmissionSuccess: () => void;
}

const PROGRAMMING_LANGUAGES = [
  'python',
  'javascript',
  'typescript',
  'java',
  'cpp',
  'c',
  'csharp',
  'php',
  'ruby',
  'go',
  'rust',
  'kotlin',
  'swift',
  'other'
];

const PLATFORM_OPTIONS = [
  { value: 'replit', label: 'Repl.it' },
  { value: 'codepen', label: 'CodePen' },
  { value: 'jsfiddle', label: 'JSFiddle' },
  { value: 'codesandbox', label: 'CodeSandbox' },
  { value: 'stackblitz', label: 'StackBlitz' },
  { value: 'glitch', label: 'Glitch' },
  { value: 'github', label: 'GitHub Repository' },
  { value: 'other', label: 'Other' }
];

export function SubmissionForm({ challenge, existingSubmission, onSubmissionSuccess }: SubmissionFormProps) {
  const { userProfile } = useAuth();
  
  // Form state
  const [submissionType, setSubmissionType] = useState<'code' | 'file' | 'link'>(
    existingSubmission?.submissionType || 'code'
  );
  const [code, setCode] = useState(existingSubmission?.code || '');
  const [language, setLanguage] = useState(existingSubmission?.language || '');
  const [projectUrl, setProjectUrl] = useState(existingSubmission?.projectUrl || '');
  const [platformType, setPlatformType] = useState(existingSubmission?.platformType || '');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize existing files if present
  useState(() => {
    if (existingSubmission?.fileNames && existingSubmission.fileNames.length > 0) {
      // For existing submissions, we'll show the file names but can't recreate File objects
      // The actual files will be shown in a different way
    }
  });

  // Handle multiple file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const validFiles: File[] = [];
    
    for (const file of files) {
      // Validate file size (10MB limit per file)
      if (file.size > 10 * 1024 * 1024) {
        toast.error(`File "${file.name}" is too large. Maximum size is 10MB per file.`);
        continue;
      }
      
      // Validate file type (code files only)
      const allowedExtensions = ['.py', '.js', '.ts', '.java', '.cpp', '.c', '.cs', '.php', '.rb', '.go', '.rs', '.kt', '.swift', '.txt', '.html', '.css', '.json', '.xml', '.yml', '.yaml'];
      const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
      
      if (!allowedExtensions.includes(fileExtension)) {
        toast.error(`File "${file.name}" has an unsupported format. Please upload code files only.`);
        continue;
      }
      
      // Check if file already exists
      if (selectedFiles.some(existingFile => existingFile.name === file.name)) {
        toast.error(`File "${file.name}" is already selected.`);
        continue;
      }
      
      validFiles.push(file);
    }
    
    if (validFiles.length > 0) {
      setSelectedFiles(prev => [...prev, ...validFiles]);
      // Clear the input to allow selecting the same file again if needed
      e.target.value = '';
    }
  };

  // Remove a selected file
  const removeFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const validateSubmission = () => {
    if (!userProfile) {
      toast.error('You must be logged in to submit a solution');
      return false;
    }

    if (!language) {
      toast.error('Please select a programming language');
      return false;
    }

    switch (submissionType) {
      case 'code':
        if (!code.trim()) {
          toast.error('Please enter your code solution');
          return false;
        }
        break;
      case 'file':
        if (selectedFiles.length === 0 && (!existingSubmission?.fileNames || existingSubmission.fileNames.length === 0) && !existingSubmission?.fileName) {
          toast.error('Please select at least one file to upload');
          return false;
        }
        break;
      case 'link':
        if (!projectUrl.trim()) {
          toast.error('Please enter a project URL');
          return false;
        }
        if (!platformType) {
          toast.error('Please select the platform type');
          return false;
        }
        // Basic URL validation
        try {
          new URL(projectUrl);
        } catch {
          toast.error('Please enter a valid URL');
          return false;
        }
        break;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateSubmission()) {
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare submission data based on type
      let submissionData: Omit<Submission, 'id' | 'submittedAt'>;

      if (submissionType === 'file' && selectedFiles.length > 0) {
        // For multiple file uploads, we'll concatenate all file contents
        let combinedContent = '';
        const fileNames: string[] = [];
        
        for (const file of selectedFiles) {
          const fileContent = await file.text();
          combinedContent += `// File: ${file.name}\n${fileContent}\n\n`;
          fileNames.push(file.name);
        }
        
        submissionData = {
          challengeId: challenge.id,
          userId: userProfile!.uid,
          code: combinedContent,
          language,
          points: challenge.points,
          status: 'pending' as const,
          submissionType: 'file',
          fileNames: fileNames,
          // For backward compatibility, also set single file fields with the first file
          fileName: fileNames[0],
        };
      } else if (submissionType === 'link') {
        submissionData = {
          challengeId: challenge.id,
          userId: userProfile!.uid,
          code: `Project URL: ${projectUrl}`, // Store URL in code field for now
          language,
          points: challenge.points,
          status: 'pending' as const,
          submissionType: 'link',
          projectUrl,
          platformType,
        };
      } else {
        // Traditional code submission
        submissionData = {
          challengeId: challenge.id,
          userId: userProfile!.uid,
          code,
          language,
          points: challenge.points,
          status: 'pending' as const,
          submissionType: 'code',
        };
      }

      await challengesService.submitSolution(submissionData);

      toast.success('Solution submitted successfully! It will be reviewed by an officer.');
      onSubmissionSuccess();
    } catch (error) {
      console.error('Error submitting solution:', error);
      toast.error('Failed to submit solution. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getStatusBadge = () => {
    if (!existingSubmission) return null;
    
    switch (existingSubmission.status) {
      case 'pass':
        return <Badge variant="default" className="bg-green-500">Passed</Badge>;
      case 'fail':
        return <Badge variant="destructive">Failed</Badge>;
      case 'pending':
        return <Badge variant="secondary">Under Review</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Submit Your Solution</CardTitle>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Programming Language Selection */}
          <div className="space-y-2">
            <Label htmlFor="language">Programming Language</Label>
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger>
                <SelectValue placeholder="Select a programming language" />
              </SelectTrigger>
              <SelectContent>
                {PROGRAMMING_LANGUAGES.map((lang) => (
                  <SelectItem key={lang} value={lang}>
                    {lang.charAt(0).toUpperCase() + lang.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Submission Type Tabs */}
          <div className="space-y-4">
            <Label>Submission Method</Label>
            <Tabs value={submissionType} onValueChange={(value) => setSubmissionType(value as 'code' | 'file' | 'link')}>
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="code" className="flex items-center gap-2">
                  <Code2 className="h-4 w-4" />
                  Code
                </TabsTrigger>
                <TabsTrigger value="file" className="flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  File Upload
                </TabsTrigger>
                <TabsTrigger value="link" className="flex items-center gap-2">
                  <Link2 className="h-4 w-4" />
                  Project Link
                </TabsTrigger>
              </TabsList>

              {/* Code Submission Tab */}
              <TabsContent value="code" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Your Solution</Label>
                  <Textarea
                    id="code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Paste your code solution here..."
                    className="min-h-[300px] font-mono text-sm"
                  />
                  <p className="text-xs text-muted-foreground">
                    Copy and paste your complete code solution above.
                  </p>
                </div>
              </TabsContent>

              {/* File Upload Tab */}
              <TabsContent value="file" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file-upload">Upload Code Files</Label>
                  <Input
                    id="file-upload"
                    type="file"
                    onChange={handleFileChange}
                    accept=".py,.js,.ts,.java,.cpp,.c,.cs,.php,.rb,.go,.rs,.kt,.swift,.txt,.html,.css,.json,.xml,.yml,.yaml"
                    multiple
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload your code files (max 10MB each). Supported formats: .py, .js, .ts, .java, .cpp, .c, .cs, .php, .rb, .go, .rs, .kt, .swift, .txt, .html, .css, .json, .xml, .yml, .yaml
                  </p>
                </div>

                {/* Selected Files Display */}
                {selectedFiles.length > 0 && (
                  <div className="space-y-2">
                    <Label>Selected Files ({selectedFiles.length})</Label>
                    <div className="space-y-2">
                      {selectedFiles.map((file, index) => (
                        <div key={`${file.name}-${index}`} className="flex items-center justify-between p-3 bg-muted rounded-md">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="text-sm font-medium">{file.name}</span>
                            <span className="text-xs text-muted-foreground">
                              ({(file.size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeFile(index)}
                            className="h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Existing Files Display (for updates) */}
                {existingSubmission?.fileNames && existingSubmission.fileNames.length > 0 && selectedFiles.length === 0 && (
                  <div className="space-y-2">
                    <Label>Previously Uploaded Files</Label>
                    <div className="space-y-2">
                      {existingSubmission.fileNames.map((fileName, index) => (
                        <div key={`existing-${fileName}-${index}`} className="flex items-center gap-2 p-3 bg-muted rounded-md">
                          <FileText className="h-4 w-4" />
                          <span className="text-sm font-medium">{fileName}</span>
                          <span className="text-xs text-muted-foreground">(Previously uploaded)</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Legacy single file support */}
                {existingSubmission?.fileName && !existingSubmission?.fileNames && selectedFiles.length === 0 && (
                  <div className="flex items-center gap-2 p-3 bg-muted rounded-md">
                    <FileText className="h-4 w-4" />
                    <span className="text-sm font-medium">{existingSubmission.fileName}</span>
                    <span className="text-xs text-muted-foreground">(Previously uploaded)</span>
                  </div>
                )}
              </TabsContent>

              {/* Project Link Tab */}
              <TabsContent value="link" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="platform-type">Platform Type</Label>
                  <Select value={platformType} onValueChange={setPlatformType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select the platform you're using" />
                    </SelectTrigger>
                    <SelectContent>
                      {PLATFORM_OPTIONS.map((platform) => (
                        <SelectItem key={platform.value} value={platform.value}>
                          {platform.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="project-url">Project URL</Label>
                  <Input
                    id="project-url"
                    type="url"
                    value={projectUrl}
                    onChange={(e) => setProjectUrl(e.target.value)}
                    placeholder="https://replit.com/@username/project-name or https://github.com/username/repo-name"
                  />
                  <p className="text-xs text-muted-foreground">
                    Share a link to your project on an online coding platform. Make sure the project is publicly accessible.
                  </p>
                </div>

                {existingSubmission?.projectUrl && (
                  <div className="p-3 bg-muted rounded-md">
                    <Label className="text-sm font-medium">Current Project URL:</Label>
                    <p className="text-sm">
                      <a 
                        href={existingSubmission.projectUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {existingSubmission.projectUrl}
                      </a>
                    </p>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>

          {existingSubmission?.feedback && (
            <div className="space-y-2">
              <Label>Feedback from Officer</Label>
              <div className="p-3 bg-muted rounded-md">
                <p className="text-sm">{existingSubmission.feedback}</p>
              </div>
            </div>
          )}

          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full"
          >
            {isSubmitting ? 'Submitting...' : existingSubmission ? 'Update Submission' : 'Submit Solution'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
