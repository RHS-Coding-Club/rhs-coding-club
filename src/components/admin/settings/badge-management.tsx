'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useAuth } from '@/contexts/auth-context';
import {
  getAllBadges,
  createBadge,
  updateBadge,
  deleteBadge,
  reorderBadges,
  Badge,
} from '@/lib/services/badges';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from '@/lib/firebase';
import {
  Award,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  Upload,
  Loader2,
  GripVertical,
  Sparkles,
  Star,
  Crown,
  Gem,
  ChevronUp,
  ChevronDown,
  Eye,
  EyeOff,
} from 'lucide-react';
import Image from 'next/image';

interface BadgeFormData {
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  criteriaType: 'points' | 'challenges' | 'events' | 'projects' | 'custom';
  threshold: string;
  condition: string;
  autoAward: boolean;
  isActive: boolean;
}

const RARITY_CONFIG = {
  common: {
    label: 'Common',
    color: 'bg-slate-500',
    icon: Star,
    border: 'border-slate-500',
  },
  rare: {
    label: 'Rare',
    color: 'bg-blue-500',
    icon: Sparkles,
    border: 'border-blue-500',
  },
  epic: {
    label: 'Epic',
    color: 'bg-purple-500',
    icon: Gem,
    border: 'border-purple-500',
  },
  legendary: {
    label: 'Legendary',
    color: 'bg-amber-500',
    icon: Crown,
    border: 'border-amber-500',
  },
};

export function BadgeManagement() {
  const { userProfile } = useAuth();
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingBadge, setEditingBadge] = useState<Badge | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const [formData, setFormData] = useState<BadgeFormData>({
    name: '',
    description: '',
    imageUrl: '',
    rarity: 'common',
    criteriaType: 'points',
    threshold: '',
    condition: '',
    autoAward: true,
    isActive: true,
  });

  useEffect(() => {
    loadBadges();
  }, []);

  const loadBadges = async () => {
    try {
      setLoading(true);
      const data = await getAllBadges(true); // Include inactive
      setBadges(data);
    } catch (error) {
      console.error('Error loading badges:', error);
      alert('Failed to load badges. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      imageUrl: '',
      rarity: 'common',
      criteriaType: 'points',
      threshold: '',
      condition: '',
      autoAward: true,
      isActive: true,
    });
    setEditingBadge(null);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleEdit = (badge: Badge) => {
    setEditingBadge(badge);
    setFormData({
      name: badge.name,
      description: badge.description,
      imageUrl: badge.imageUrl,
      rarity: badge.rarity,
      criteriaType: badge.criteria.type,
      threshold: badge.criteria.threshold?.toString() || '',
      condition: badge.criteria.condition || '',
      autoAward: badge.autoAward,
      isActive: badge.isActive,
    });
    setPreviewUrl(badge.imageUrl);
    setIsDialogOpen(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      if (file.size > 2 * 1024 * 1024) {
        alert('File size must be less than 2MB');
        return;
      }

      setSelectedFile(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (file: File): Promise<string> => {
    setUploading(true);
    try {
      const timestamp = Date.now();
      const filename = `badges/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const imageRef = ref(storage, filename);

      await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(imageRef);

      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userProfile?.uid) {
      alert('You must be logged in.');
      return;
    }

    if (!formData.name.trim()) {
      alert('Please enter a badge name.');
      return;
    }

    if (!formData.description.trim()) {
      alert('Please enter a badge description.');
      return;
    }

    if (formData.criteriaType !== 'custom' && !formData.threshold) {
      alert('Please enter a threshold value.');
      return;
    }

    try {
      setSaving(true);

      let imageUrl = formData.imageUrl;

      // Upload new image if selected
      if (selectedFile) {
        imageUrl = await uploadImage(selectedFile);

        // Delete old image if editing
        if (editingBadge?.imageUrl && editingBadge.imageUrl !== imageUrl) {
          try {
            const decodedUrl = decodeURIComponent(editingBadge.imageUrl);
            const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
            if (pathMatch) {
              const filePath = pathMatch[1];
              const imageRef = ref(storage, filePath);
              await deleteObject(imageRef);
            }
          } catch (err) {
            console.error('Error deleting old image:', err);
          }
        }
      }

      if (!imageUrl) {
        alert('Please upload a badge image.');
        setSaving(false);
        return;
      }

      // Build criteria object without undefined values
      const criteria: Badge['criteria'] = {
        type: formData.criteriaType,
      };

      // Only add threshold if it exists and is not for custom type
      if (formData.criteriaType !== 'custom' && formData.threshold) {
        criteria.threshold = parseInt(formData.threshold);
      }

      // Only add condition if it exists
      if (formData.condition.trim()) {
        criteria.condition = formData.condition.trim();
      }

      const badgeData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        imageUrl,
        rarity: formData.rarity,
        criteria,
        autoAward: formData.autoAward,
        displayOrder: editingBadge?.displayOrder ?? badges.length,
        isActive: formData.isActive,
      };

      if (editingBadge) {
        await updateBadge(editingBadge.id, badgeData, userProfile.uid);
      } else {
        await createBadge(
          {
            ...badgeData,
            createdBy: userProfile.uid,
            updatedBy: userProfile.uid,
          },
          userProfile.uid
        );
      }

      setIsDialogOpen(false);
      resetForm();
      await loadBadges();
    } catch (error) {
      console.error('Error saving badge:', error);
      alert('Failed to save badge. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (badge: Badge) => {
    if (!confirm(`Are you sure you want to delete "${badge.name}"? This will also remove it from all users.`)) {
      return;
    }

    try {
      setDeleting(badge.id);

      // Delete image from storage
      if (badge.imageUrl) {
        try {
          const decodedUrl = decodeURIComponent(badge.imageUrl);
          const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
          if (pathMatch) {
            const filePath = pathMatch[1];
            const imageRef = ref(storage, filePath);
            await deleteObject(imageRef);
          }
        } catch (err) {
          console.error('Error deleting badge image:', err);
        }
      }

      await deleteBadge(badge.id);
      await loadBadges();
    } catch (error) {
      console.error('Error deleting badge:', error);
      alert('Failed to delete badge. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  const handleMoveUp = async (index: number) => {
    if (index === 0 || !userProfile?.uid) return;

    const newBadges = [...badges];
    [newBadges[index - 1], newBadges[index]] = [newBadges[index], newBadges[index - 1]];

    const orders = newBadges.map((badge, idx) => ({
      id: badge.id,
      order: idx,
    }));

    try {
      await reorderBadges(orders, userProfile.uid);
      setBadges(newBadges);
    } catch (error) {
      console.error('Error reordering badges:', error);
      alert('Failed to reorder badges. Please try again.');
    }
  };

  const handleMoveDown = async (index: number) => {
    if (index === badges.length - 1 || !userProfile?.uid) return;

    const newBadges = [...badges];
    [newBadges[index], newBadges[index + 1]] = [newBadges[index + 1], newBadges[index]];

    const orders = newBadges.map((badge, idx) => ({
      id: badge.id,
      order: idx,
    }));

    try {
      await reorderBadges(orders, userProfile.uid);
      setBadges(newBadges);
    } catch (error) {
      console.error('Error reordering badges:', error);
      alert('Failed to reorder badges. Please try again.');
    }
  };

  const RarityIcon = ({ rarity }: { rarity: Badge['rarity'] }) => {
    const Icon = RARITY_CONFIG[rarity].icon;
    return <Icon className="h-4 w-4" />;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Badge Management
            </CardTitle>
            <CardDescription className="mt-2">
              Create and manage achievement badges. Badges can be automatically awarded based on criteria or manually assigned to users.
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={resetForm} className="gap-2">
                <Plus className="h-4 w-4" />
                Create Badge
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingBadge ? 'Edit Badge' : 'Create New Badge'}
                </DialogTitle>
                <DialogDescription>
                  {editingBadge
                    ? 'Update the badge details below.'
                    : 'Fill in the details to create a new achievement badge.'}
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Badge Preview */}
                <div className="flex justify-center">
                  <div className="relative">
                    {previewUrl ? (
                      <div className={`relative w-32 h-32 rounded-full border-4 ${RARITY_CONFIG[formData.rarity].border} overflow-hidden bg-background`}>
                        <Image
                          src={previewUrl}
                          alt="Badge preview"
                          fill
                          className="object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-full border-4 border-dashed border-muted-foreground/25 flex items-center justify-center bg-muted">
                        <Award className="h-12 w-12 text-muted-foreground/50" />
                      </div>
                    )}
                  </div>
                </div>

                {/* Image Upload */}
                <div>
                  <Label htmlFor="badge-image">Badge Image</Label>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="badge-image"
                      type="file"
                      accept="image/*"
                      onChange={handleFileSelect}
                      className="flex-1"
                    />
                    {previewUrl && (
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => {
                          setSelectedFile(null);
                          setPreviewUrl(editingBadge?.imageUrl || '');
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Recommended: Square image, max 2MB
                  </p>
                </div>

                {/* Name */}
                <div>
                  <Label htmlFor="name">Badge Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g., First Challenge"
                    className="mt-2"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Describe how to earn this badge..."
                    className="mt-2 min-h-[80px]"
                    required
                  />
                </div>

                {/* Rarity */}
                <div>
                  <Label htmlFor="rarity">Rarity</Label>
                  <Select
                    value={formData.rarity}
                    onValueChange={(value: Badge['rarity']) =>
                      setFormData({ ...formData, rarity: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(RARITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${config.color}`} />
                            {config.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Criteria Type */}
                <div>
                  <Label htmlFor="criteriaType">Award Criteria</Label>
                  <Select
                    value={formData.criteriaType}
                    onValueChange={(value: Badge['criteria']['type']) =>
                      setFormData({ ...formData, criteriaType: value })
                    }
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="points">Total Points</SelectItem>
                      <SelectItem value="challenges">Challenges Completed</SelectItem>
                      <SelectItem value="events">Events Attended</SelectItem>
                      <SelectItem value="projects">Projects Submitted</SelectItem>
                      <SelectItem value="custom">Custom (Manual Award)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Threshold */}
                {formData.criteriaType !== 'custom' && (
                  <div>
                    <Label htmlFor="threshold">Threshold</Label>
                    <Input
                      id="threshold"
                      type="number"
                      min="1"
                      value={formData.threshold}
                      onChange={(e) => setFormData({ ...formData, threshold: e.target.value })}
                      placeholder="e.g., 100"
                      className="mt-2"
                      required
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      {formData.criteriaType === 'points' && 'Minimum points required'}
                      {formData.criteriaType === 'challenges' && 'Number of challenges to complete'}
                      {formData.criteriaType === 'events' && 'Number of events to attend'}
                      {formData.criteriaType === 'projects' && 'Number of projects to submit'}
                    </p>
                  </div>
                )}

                {/* Custom Condition */}
                {formData.criteriaType === 'custom' && (
                  <div>
                    <Label htmlFor="condition">Custom Condition (Optional)</Label>
                    <Textarea
                      id="condition"
                      value={formData.condition}
                      onChange={(e) => setFormData({ ...formData, condition: e.target.value })}
                      placeholder="Describe the custom criteria..."
                      className="mt-2"
                    />
                  </div>
                )}

                {/* Auto Award */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="autoAward"
                    checked={formData.autoAward}
                    onChange={(e) => setFormData({ ...formData, autoAward: e.target.checked })}
                    className="rounded"
                    disabled={formData.criteriaType === 'custom'}
                  />
                  <Label htmlFor="autoAward" className="cursor-pointer">
                    Automatically award when criteria is met
                  </Label>
                </div>

                {/* Active Status */}
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="isActive"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="isActive" className="cursor-pointer">
                    Badge is active and visible
                  </Label>
                </div>

                {/* Actions */}
                <div className="flex gap-3 justify-end pt-4 border-t">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setIsDialogOpen(false);
                      resetForm();
                    }}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={saving || uploading} className="gap-2">
                    {saving || uploading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {uploading ? 'Uploading...' : 'Saving...'}
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4" />
                        {editingBadge ? 'Update Badge' : 'Create Badge'}
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>

      <CardContent>
        {loading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-muted-foreground">Loading badges...</p>
          </div>
        ) : badges.length === 0 ? (
          <div className="text-center py-12">
            <Award className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <h3 className="font-semibold mb-2">No badges yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first achievement badge to get started.
            </p>
            <Button onClick={() => setIsDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Create Badge
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {badges.map((badge, index) => (
              <div
                key={badge.id}
                className={`relative border rounded-lg p-4 transition-all ${
                  badge.isActive ? 'bg-card' : 'bg-muted/50 opacity-75'
                }`}
              >
                {/* Status Badge */}
                {!badge.isActive && (
                  <div className="absolute top-2 right-2">
                    <div className="flex items-center gap-1 text-xs bg-background border rounded-full px-2 py-1">
                      <EyeOff className="h-3 w-3" />
                      Inactive
                    </div>
                  </div>
                )}

                <div className="flex gap-4">
                  {/* Badge Image */}
                  <div className={`relative w-20 h-20 flex-shrink-0 rounded-full border-3 ${RARITY_CONFIG[badge.rarity].border} overflow-hidden bg-background`}>
                    <Image
                      src={badge.imageUrl}
                      alt={badge.name}
                      fill
                      className="object-cover"
                    />
                  </div>

                  {/* Badge Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold truncate">{badge.name}</h3>
                        <div className="flex items-center gap-1 mt-1">
                          <div className={`w-2 h-2 rounded-full ${RARITY_CONFIG[badge.rarity].color}`} />
                          <span className="text-xs text-muted-foreground">
                            {RARITY_CONFIG[badge.rarity].label}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                      {badge.description}
                    </p>

                    {/* Criteria */}
                    <div className="mt-2 text-xs text-muted-foreground">
                      {badge.criteria.type === 'custom' ? (
                        <span>Manual award only</span>
                      ) : (
                        <span>
                          {badge.criteria.threshold}{' '}
                          {badge.criteria.type === 'points' && 'points'}
                          {badge.criteria.type === 'challenges' && 'challenges'}
                          {badge.criteria.type === 'events' && 'events'}
                          {badge.criteria.type === 'projects' && 'projects'}
                        </span>
                      )}
                      {badge.autoAward && (
                        <span className="ml-2 text-green-600 dark:text-green-400">
                          • Auto-award
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  {/* Reorder Buttons */}
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveUp(index)}
                      disabled={index === 0}
                    >
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => handleMoveDown(index)}
                      disabled={index === badges.length - 1}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Edit/Delete */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(badge)}
                      className="gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleDelete(badge)}
                      disabled={deleting === badge.id}
                      className="gap-2"
                    >
                      {deleting === badge.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
