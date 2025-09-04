'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit, Trash } from 'lucide-react';
import { challengesService } from '@/lib/services/challenges';
import { useAuth } from '@/contexts/auth-context';
import { Challenge } from '@/lib/firebase-collections';
import { toast } from 'sonner';

interface ChallengeManagementProps {
  challenges: Challenge[];
  onChallengeUpdate: () => void;
}

export function ChallengeManagement({ challenges, onChallengeUpdate }: ChallengeManagementProps) {
  const { userProfile } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingChallenge, setEditingChallenge] = useState<Challenge | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    prompt: '',
    difficulty: 'easy' as 'easy' | 'medium' | 'hard',
    sampleInput: '',
    sampleOutput: '',
    points: 100,
    weekNo: 1,
    published: false,
  });

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      prompt: '',
      difficulty: 'easy',
      sampleInput: '',
      sampleOutput: '',
      points: 100,
      weekNo: 1,
      published: false,
    });
  };

  const handleEdit = (challenge: Challenge) => {
    setFormData({
      title: challenge.title,
      description: challenge.description,
      prompt: challenge.prompt,
      difficulty: challenge.difficulty,
      sampleInput: challenge.sampleInput || '',
      sampleOutput: challenge.sampleOutput || '',
      points: challenge.points,
      weekNo: challenge.weekNo,
      published: challenge.published,
    });
    setEditingChallenge(challenge);
    setIsCreateDialogOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userProfile) {
      toast.error('You must be logged in');
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingChallenge) {
        await challengesService.updateChallenge(editingChallenge.id, formData);
        toast.success('Challenge updated successfully');
      } else {
        await challengesService.createChallenge({
          ...formData,
          createdBy: userProfile.uid,
        });
        toast.success('Challenge created successfully');
      }
      
      setIsCreateDialogOpen(false);
      setEditingChallenge(null);
      resetForm();
      onChallengeUpdate();
    } catch (error) {
      console.error('Error saving challenge:', error);
      toast.error('Failed to save challenge');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (challengeId: string) => {
    if (!confirm('Are you sure you want to delete this challenge?')) {
      return;
    }

    try {
      await challengesService.deleteChallenge(challengeId);
      toast.success('Challenge deleted successfully');
      onChallengeUpdate();
    } catch (error) {
      console.error('Error deleting challenge:', error);
      toast.error('Failed to delete challenge');
    }
  };

  const handleDialogClose = () => {
    setIsCreateDialogOpen(false);
    setEditingChallenge(null);
    resetForm();
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Challenge Management</CardTitle>
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Challenge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingChallenge ? 'Edit Challenge' : 'Create New Challenge'}
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="weekNo">Week Number</Label>
                    <Input
                      id="weekNo"
                      type="number"
                      min="1"
                      value={formData.weekNo}
                      onChange={(e) => setFormData({ ...formData, weekNo: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prompt">Problem Statement</Label>
                  <Textarea
                    id="prompt"
                    value={formData.prompt}
                    onChange={(e) => setFormData({ ...formData, prompt: e.target.value })}
                    className="min-h-[150px]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="sampleInput">Sample Input</Label>
                    <Textarea
                      id="sampleInput"
                      value={formData.sampleInput}
                      onChange={(e) => setFormData({ ...formData, sampleInput: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sampleOutput">Sample Output</Label>
                    <Textarea
                      id="sampleOutput"
                      value={formData.sampleOutput}
                      onChange={(e) => setFormData({ ...formData, sampleOutput: e.target.value })}
                      className="min-h-[100px]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="difficulty">Difficulty</Label>
                    <Select value={formData.difficulty} onValueChange={(value) => setFormData({ ...formData, difficulty: value as 'easy' | 'medium' | 'hard' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="points">Points</Label>
                    <Input
                      id="points"
                      type="number"
                      min="1"
                      value={formData.points}
                      onChange={(e) => setFormData({ ...formData, points: parseInt(e.target.value) })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="published">Status</Label>
                    <Select value={formData.published ? 'published' : 'draft'} onValueChange={(value) => setFormData({ ...formData, published: value === 'published' })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="draft">Draft</SelectItem>
                        <SelectItem value="published">Published</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-4">
                  <Button type="button" variant="outline" onClick={handleDialogClose}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Saving...' : (editingChallenge ? 'Update' : 'Create')}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {challenges.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No challenges created yet.
            </p>
          ) : (
            challenges.map((challenge) => (
              <div key={challenge.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold">{challenge.title}</h3>
                    <Badge variant={challenge.published ? 'default' : 'secondary'}>
                      {challenge.published ? 'Published' : 'Draft'}
                    </Badge>
                    <Badge variant={
                      challenge.difficulty === 'easy' ? 'default' : 
                      challenge.difficulty === 'medium' ? 'secondary' : 'destructive'
                    }>
                      {challenge.difficulty}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Week {challenge.weekNo} • {challenge.points} points
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => handleEdit(challenge)}>
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(challenge.id)}>
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
