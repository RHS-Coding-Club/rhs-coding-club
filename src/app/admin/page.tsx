'use client';

import { useState, useEffect } from 'react';
import { Container } from '@/components/container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ProtectedRoute } from '@/components/auth/protected-route';
import { useAuth, UserRole } from '@/contexts/auth-context';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  addDoc,
  deleteDoc,
  query,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { db, storage } from '@/lib/firebase';
import { Users, Shield, Settings, UserCheck, Plus, Edit, Trash2, Save, Upload, X, Mail, Github, Calendar, Eye, FolderOpen } from 'lucide-react';
import Image from 'next/image';
import { Officer } from '@/lib/firebase-collections';
import { ProjectManagement } from '@/components/admin/project-management';
import { ResourceManagement } from '@/components/admin/resource-management';
import { BlogManagement } from '@/components/admin/blog-management';
import { NewsletterManagement } from '@/components/admin/newsletter-management';
import { SubmissionReview } from '@/components/admin/submission-review';
import { projectService } from '@/lib/services/projects';
import { GitHubMembershipManagement } from '@/components/admin/github-membership-management';
import { MembershipApplicationReview } from '@/components/admin/membership-application-review';
import { ClubInfoSettings } from '@/components/admin/settings/club-info-settings';

// Predefined officer roles
const OFFICER_ROLES = [
  'President',
  'Vice President',
  'Secretary',
  'Treasurer',
  'Technical Lead',
  'Events Coordinator',
  'Outreach Officer',
  'Social Media Manager',
  'Project Manager',
  'Mentor Coordinator',
  'Workshop Lead',
  'Community Liaison'
];

interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  createdAt: Date | null;
  lastLoginAt: Date | null;
  photoURL?: string;
}

interface OfficerFormData {
  name: string;
  role: string;
  bio: string;
  email: string;
  githubUrl: string;
  imageUrl: string;
  order: number;
}

export default function AdminPage() {
  const { userProfile } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [officers, setOfficers] = useState<Officer[]>([]);
  const [projectStats, setProjectStats] = useState({ total: 0, pending: 0, featured: 0 });
  const [loading, setLoading] = useState(true);
  const [officersLoading, setOfficersLoading] = useState(true);
  const [updating, setUpdating] = useState<string | null>(null);
  const [isOfficerDialogOpen, setIsOfficerDialogOpen] = useState(false);
  const [editingOfficer, setEditingOfficer] = useState<Officer | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [activeSection, setActiveSection] = useState<string>('users');
  const [userSearch, setUserSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<UserRole | 'all'>('all');
  const [officerForm, setOfficerForm] = useState<OfficerFormData>({
    name: '',
    role: '',
    bio: '',
    email: '',
    githubUrl: '',
    imageUrl: '',
    order: 0,
  });

  const fetchUsers = async () => {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc')
      );
      const querySnapshot = await getDocs(usersQuery);
      const usersData = querySnapshot.docs.map(doc => ({
        uid: doc.id,
        ...doc.data(),
      })) as User[];
      setUsers(usersData);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOfficers = async () => {
    try {
      const officersQuery = query(
        collection(db, 'officers'),
        orderBy('order', 'asc')
      );
      const querySnapshot = await getDocs(officersQuery);
      const officersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Officer[];
      setOfficers(officersData);
    } catch (error) {
      console.error('Error fetching officers:', error);
    } finally {
      setOfficersLoading(false);
    }
  };

  const fetchProjectStats = async () => {
    try {
      const [allProjects, pendingProjects, featuredProjects] = await Promise.all([
        projectService.getProjects({}),
        projectService.getPendingProjects(),
        projectService.getFeaturedProjects()
      ]);
      
      setProjectStats({
        total: allProjects.length,
        pending: pendingProjects.length,
        featured: featuredProjects.length
      });
    } catch (error) {
      console.error('Error fetching project stats:', error);
    }
  };

  const resetOfficerForm = () => {
    setOfficerForm({
      name: '',
      role: '',
      bio: '',
      email: '',
      githubUrl: '',
      imageUrl: '',
      order: officers.length,
    });
    setEditingOfficer(null);
    setSelectedFile(null);
    setPreviewUrl('');
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }

      setSelectedFile(file);
      
      // Create preview URL
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
      // Create a unique filename
      const timestamp = Date.now();
      const filename = `officers/${timestamp}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      const imageRef = ref(storage, filename);
      
      // Upload the file
      await uploadBytes(imageRef, file);
      
      // Get the download URL
      const downloadURL = await getDownloadURL(imageRef);
      
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setUploading(false);
    }
  };

  const deleteImage = async (imageUrl: string) => {
    try {
      // Extract the file path from the URL
      const decodedUrl = decodeURIComponent(imageUrl);
      const pathMatch = decodedUrl.match(/\/o\/(.+?)\?/);
      if (pathMatch) {
        const filePath = pathMatch[1];
        const imageRef = ref(storage, filePath);
        await deleteObject(imageRef);
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      // Don't throw error as the document update is more important
    }
  };

  const handleOfficerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdating('officer-form');
    
    try {
      let imageUrl = officerForm.imageUrl;
      
      // Handle image upload if a new file is selected
      if (selectedFile) {
        // If editing and there's an existing image, delete it first
        if (editingOfficer && editingOfficer.imageUrl) {
          await deleteImage(editingOfficer.imageUrl);
        }
        
        imageUrl = await uploadImage(selectedFile);
      }
      
      const officerData = {
        ...officerForm,
        imageUrl,
        isActive: true,
        updatedAt: Timestamp.now(),
      };

      if (editingOfficer) {
        // Update existing officer
        await updateDoc(doc(db, 'officers', editingOfficer.id), officerData);
      } else {
        // Create new officer
        await addDoc(collection(db, 'officers'), {
          ...officerData,
          createdAt: Timestamp.now(),
        });
      }

      await fetchOfficers();
      setIsOfficerDialogOpen(false);
      resetOfficerForm();
    } catch (error) {
      console.error('Error saving officer:', error);
      alert('Error saving officer. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const handleEditOfficer = (officer: Officer) => {
    setEditingOfficer(officer);
    setOfficerForm({
      name: officer.name,
      role: officer.role,
      bio: officer.bio,
      email: officer.email,
      githubUrl: officer.githubUrl || '',
      imageUrl: officer.imageUrl || '',
      order: officer.order,
    });
    setSelectedFile(null);
    setPreviewUrl(officer.imageUrl || '');
    setIsOfficerDialogOpen(true);
  };

  const handleDeleteOfficer = async (officerId: string) => {
    if (!confirm('Are you sure you want to delete this officer?')) return;
    
    setUpdating(officerId);
    try {
      const officer = officers.find(o => o.id === officerId);
      
      // Delete the image from storage if it exists
      if (officer && officer.imageUrl) {
        await deleteImage(officer.imageUrl);
      }
      
      await deleteDoc(doc(db, 'officers', officerId));
      await fetchOfficers();
    } catch (error) {
      console.error('Error deleting officer:', error);
      alert('Error deleting officer. Please try again.');
    } finally {
      setUpdating(null);
    }
  };

  const updateUserRole = async (uid: string, newRole: UserRole) => {
    if (uid === userProfile?.uid && newRole !== userProfile.role) {
      alert("You cannot change your own role!");
      return;
    }

    const targetUser = users.find(u => u.uid === uid);
    if (userProfile?.role === 'officer' && targetUser?.role === 'admin') {
        alert("Officers cannot change the role of an admin.");
        return;
    }

    setUpdating(uid);
    try {
      const userRef = doc(db, 'users', uid);
      await updateDoc(userRef, { role: newRole });
      
      // Update local state
      setUsers(prev => prev.map(user => 
        user.uid === uid ? { ...user, role: newRole } : user
      ));
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role');
    } finally {
      setUpdating(null);
    }
  };

  const canEditRole = (target: User) => {
    if (!userProfile) return false;
    if (target.uid === userProfile.uid) return false; // no self-edit
    if (userProfile.role === 'officer' && target.role === 'admin') return false; // officers cannot change admins
    return true;
  };

  const getUserInitials = (name?: string, email?: string) => {
    const source = (name && name.trim()) || (email && email.trim()) || '';
    if (!source) return 'U';
    const parts = source.split(/\s|\.|@|_/).filter(Boolean);
    const first = parts[0]?.[0] || '';
    const second = parts[1]?.[0] || '';
    return (first + second).toUpperCase() || 'U';
  };

  const filteredUsers = users.filter((u) => {
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    const q = userSearch.toLowerCase().trim();
    const matchesQuery = !q ||
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q));
    return matchesRole && matchesQuery;
  });

  useEffect(() => {
    fetchUsers();
    fetchOfficers();
    fetchProjectStats();
  }, []);

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'officer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'member':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getRoleStats = () => {
    const stats = {
      admin: users.filter(u => u.role === 'admin').length,
      officer: users.filter(u => u.role === 'officer').length,
      member: users.filter(u => u.role === 'member').length,
      guest: users.filter(u => u.role === 'guest').length,
    };
    return stats;
  };

  const stats = getRoleStats();

  return (
    <ProtectedRoute requiredRoles={['admin', 'officer']}>
      <div className="py-20">
        <Container>
          <div className="max-w-7xl mx-auto space-y-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold flex items-center gap-2">
                  <Shield className="h-8 w-8" />
                  Admin Panel
                </h1>
                <p className="text-muted-foreground mt-2">
                  Manage users and club settings
                </p>
              </div>
              <Badge 
                variant="outline" 
                className={getRoleColor(userProfile?.role || 'guest')}
              >
                {userProfile?.role ? userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1) : 'Guest'}
              </Badge>
            </div>

            {/* Stats Cards - modernized */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="relative overflow-hidden">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-primary/10" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Total Users</CardTitle>
                    <div className="p-2 rounded-md bg-primary/10 text-primary"><Users className="h-4 w-4" /></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{users.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Across all roles</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-red-500/10" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Admins</CardTitle>
                    <div className="p-2 rounded-md bg-red-500/10 text-red-600 dark:text-red-400"><Shield className="h-4 w-4" /></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{stats.admin}</div>
                  <p className="text-xs text-muted-foreground mt-1">Full access</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-blue-500/10" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Officers</CardTitle>
                    <div className="p-2 rounded-md bg-blue-500/10 text-blue-600 dark:text-blue-400"><UserCheck className="h-4 w-4" /></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{stats.officer}</div>
                  <p className="text-xs text-muted-foreground mt-1">Operational team</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden">
                <div className="absolute -right-6 -top-6 h-24 w-24 rounded-full bg-green-500/10" />
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm text-muted-foreground">Members</CardTitle>
                    <div className="p-2 rounded-md bg-green-500/10 text-green-600 dark:text-green-400"><Users className="h-4 w-4" /></div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-semibold">{stats.member}</div>
                  <p className="text-xs text-muted-foreground mt-1">Active participants</p>
                </CardContent>
              </Card>

              <Card className="relative overflow-hidden sm:col-span-2 lg:col-span-4">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400"><FolderOpen className="h-4 w-4" /></div>
                      <CardTitle className="text-sm text-muted-foreground">Projects</CardTitle>
                    </div>
                    <span className="text-xs text-muted-foreground">featured & pending</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-6">
                    <div className="text-3xl font-semibold">{projectStats.total}</div>
                    <div className="text-xs text-muted-foreground">{projectStats.pending} pending • {projectStats.featured} featured</div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Responsive navigation: Tabs on mobile, sidebar on desktop */}
            <div className="lg:grid lg:grid-cols-12 lg:gap-6">
              {/* Mobile Tabs */}
              <div className="lg:hidden">
                <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
                  <TabsList className="flex-wrap">
                    <TabsTrigger value="users">User Management</TabsTrigger>
                    <TabsTrigger value="applications">Applications</TabsTrigger>
                    <TabsTrigger value="github">GitHub Org</TabsTrigger>
                    <TabsTrigger value="officers">Officers</TabsTrigger>
                    <TabsTrigger value="submissions">Submissions</TabsTrigger>
                    <TabsTrigger value="blog">Blog</TabsTrigger>
                    <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
                    <TabsTrigger value="projects">Projects</TabsTrigger>
                    <TabsTrigger value="resources">Resources</TabsTrigger>
                    <TabsTrigger value="events">Events</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                  </TabsList>
                </Tabs>
              </div>

              {/* Sidebar */}
              <aside className="hidden lg:block lg:col-span-3 xl:col-span-2">
                <Card className="sticky top-24">
                  <CardContent className="p-3">
                    <nav className="space-y-1">
                      {[
                        { key: 'users', label: 'User Management', icon: Users },
                        { key: 'applications', label: 'Applications', icon: UserCheck },
                        { key: 'github', label: 'GitHub Org', icon: Github },
                        { key: 'officers', label: 'Officers', icon: Users },
                        { key: 'submissions', label: 'Submissions', icon: Eye },
                        { key: 'blog', label: 'Blog', icon: Edit },
                        { key: 'newsletter', label: 'Newsletter', icon: Mail },
                        { key: 'projects', label: 'Projects', icon: FolderOpen },
                        { key: 'resources', label: 'Resources', icon: FolderOpen },
                        { key: 'events', label: 'Events', icon: Calendar },
                        { key: 'settings', label: 'Settings', icon: Settings },
                      ].map(({ key, label, icon: Icon }) => (
                        <button
                          key={key}
                          onClick={() => setActiveSection(key)}
                          className={`w-full flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                            activeSection === key
                              ? 'bg-primary/10 text-primary'
                              : 'hover:bg-muted text-foreground'
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

              {/* Content area */}
              <div className="lg:col-span-9 xl:col-span-10 space-y-6 mt-6 lg:mt-0">
                <Tabs value={activeSection} onValueChange={setActiveSection} className="space-y-6">
                  <TabsList className="lg:hidden" />

              <TabsContent value="users" className="space-y-6">
                <Card>
                  <CardHeader>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <CardTitle>User Management</CardTitle>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <div className="md:col-span-2">
                          <Input
                            placeholder="Search by name or email..."
                            value={userSearch}
                            onChange={(e) => setUserSearch(e.target.value)}
                          />
                        </div>
                        <Select value={roleFilter} onValueChange={(v) => setRoleFilter(v as UserRole | 'all')}>
                          <SelectTrigger>
                            <SelectValue placeholder="Filter by role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="all">All Roles</SelectItem>
                            <SelectItem value="guest">Guest</SelectItem>
                            <SelectItem value="member">Member</SelectItem>
                            <SelectItem value="officer">Officer</SelectItem>
                            {userProfile?.role === 'admin' && (
                              <SelectItem value="admin">Admin</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                        <p>Loading users...</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {filteredUsers.map((user) => (
                          <div
                            key={user.uid}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg bg-card"
                          >
                            <div className="flex-1">
                              <div className="flex items-center gap-4">
                                {/* Avatar */}
                                {user.photoURL ? (
                                  <Image src={user.photoURL} alt={user.displayName} width={40} height={40} className="h-10 w-10 rounded-full object-cover border" />
                                ) : (
                                  <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center border">
                                    <span className="text-sm font-semibold">
                                      {getUserInitials(user.displayName, user.email)}
                                    </span>
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="font-medium truncate">{user.displayName || 'Unnamed User'}</p>
                                  <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                </div>
                                <Badge className={getRoleColor(user.role)}>
                                  {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </Badge>
                              </div>
                            </div>
                            <div className="flex w-full sm:w-auto items-center gap-2 mt-3 sm:mt-0">
                              <Label htmlFor={`role-${user.uid}`} className="text-sm">
                                Role:
                              </Label>
                              <Select
                                value={user.role}
                                onValueChange={(value: UserRole) => updateUserRole(user.uid, value)}
                                disabled={updating === user.uid || !canEditRole(user)}
                              >
                                <SelectTrigger className="w-full sm:w-36">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="guest">Guest</SelectItem>
                                  <SelectItem value="member">Member</SelectItem>
                                  <SelectItem value="officer">Officer</SelectItem>
                                  {userProfile?.role === 'admin' && (
                                    <SelectItem value="admin">Admin</SelectItem>
                                  )}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="applications" className="space-y-6">
                <MembershipApplicationReview />
              </TabsContent>

              <TabsContent value="github" className="space-y-6">
                <GitHubMembershipManagement />
              </TabsContent>

              <TabsContent value="officers" className="space-y-6">
                <Card className="shadow-sm border-0 bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50">
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                          <CardTitle className="text-xl">Officers Management</CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            Manage club officers displayed on the About page
                          </p>
                        </div>
                      </div>
                    </div>
                    <Dialog open={isOfficerDialogOpen} onOpenChange={setIsOfficerDialogOpen}>
                      <DialogTrigger asChild>
                        <Button 
                          onClick={resetOfficerForm}
                          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-500/25 transition-all duration-200"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add New Officer
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-2xl max-h-[95vh] overflow-hidden">
                        <DialogHeader className="pb-6">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-primary/10 rounded-lg">
                              {editingOfficer ? (
                                <Edit className="h-5 w-5 text-primary" />
                              ) : (
                                <Plus className="h-5 w-5 text-primary" />
                              )}
                            </div>
                            <div>
                              <DialogTitle className="text-xl font-semibold">
                                {editingOfficer ? 'Edit Officer Profile' : 'Add New Officer'}
                              </DialogTitle>
                              <DialogDescription className="text-sm text-muted-foreground">
                                {editingOfficer ? 'Update the officer information below' : 'Create a new officer profile for the club leadership team'}
                              </DialogDescription>
                            </div>
                          </div>
                        </DialogHeader>
                        
                        <div className="overflow-y-auto max-h-[calc(95vh-180px)] pr-2">
                          <form onSubmit={handleOfficerSubmit} className="space-y-6">
                            {/* Profile Picture Section */}
                            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-xl p-6 border">
                              <div className="flex items-center gap-4 mb-4">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                  <Upload className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                  <Label className="text-base font-medium">Profile Picture</Label>
                                  <p className="text-sm text-muted-foreground">Upload a professional headshot (optional)</p>
                                </div>
                              </div>
                              
                              <div className="flex items-start gap-6">
                                {/* Image Preview */}
                                <div className="flex-shrink-0">
                                  {(previewUrl || officerForm.imageUrl) ? (
                                    <div className="relative group">
                                      <Image 
                                        src={previewUrl || officerForm.imageUrl} 
                                        alt="Profile preview" 
                                        width={80}
                                        height={80}
                                        className="w-20 h-20 rounded-xl object-cover border-2 border-gray-200 dark:border-gray-700 shadow-sm"
                                      />
                                      <Button
                                        type="button"
                                        variant="destructive"
                                        size="sm"
                                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                        onClick={() => {
                                          setSelectedFile(null);
                                          setPreviewUrl('');
                                          setOfficerForm({...officerForm, imageUrl: ''});
                                        }}
                                      >
                                        <X className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  ) : (
                                    <div className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                      <Upload className="h-6 w-6 text-gray-400" />
                                    </div>
                                  )}
                                </div>
                                
                                {/* Upload Controls */}
                                <div className="flex-1 space-y-3">
                                  <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileSelect}
                                    className="hidden"
                                    id="imageUpload"
                                  />
                                  <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => document.getElementById('imageUpload')?.click()}
                                    disabled={uploading}
                                    className="w-full sm:w-auto"
                                  >
                                    {uploading ? (
                                      <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                        Uploading...
                                      </>
                                    ) : (
                                      <>
                                        <Upload className="h-4 w-4 mr-2" />
                                        Choose Image
                                      </>
                                    )}
                                  </Button>
                                  <div className="text-xs text-muted-foreground space-y-1">
                                    <p>• Maximum file size: 5MB</p>
                                    <p>• Supported formats: JPG, PNG, WebP</p>
                                    <p>• Recommended: Square aspect ratio (1:1)</p>
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* Basic Information */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="p-1 bg-green-100 dark:bg-green-900/30 rounded">
                                  <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <h3 className="font-medium text-base">Basic Information</h3>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="name" className="text-sm font-medium">Full Name *</Label>
                                  <Input
                                    id="name"
                                    value={officerForm.name}
                                    onChange={(e) => setOfficerForm({...officerForm, name: e.target.value})}
                                    placeholder="e.g. Sarah Johnson"
                                    className="transition-all focus:ring-2 focus:ring-primary/20"
                                    required
                                  />
                                </div>
                                
                                <div className="space-y-2">
                                  <Label htmlFor="role" className="text-sm font-medium">Position *</Label>
                                  <Select 
                                    value={officerForm.role} 
                                    onValueChange={(value) => setOfficerForm({...officerForm, role: value})}
                                  >
                                    <SelectTrigger className="transition-all focus:ring-2 focus:ring-primary/20">
                                      <SelectValue placeholder="Select a position" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      {OFFICER_ROLES.map((role) => (
                                        <SelectItem key={role} value={role} className="cursor-pointer">
                                          {role}
                                        </SelectItem>
                                      ))}
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium">Email Address *</Label>
                                <Input
                                  id="email"
                                  type="email"
                                  value={officerForm.email}
                                  onChange={(e) => setOfficerForm({...officerForm, email: e.target.value})}
                                  placeholder="sarah.johnson@student.rhs.edu"
                                  className="transition-all focus:ring-2 focus:ring-primary/20"
                                  required
                                />
                              </div>

                              <div className="space-y-2">
                                <Label htmlFor="bio" className="text-sm font-medium">Biography *</Label>
                                <Textarea
                                  id="bio"
                                  value={officerForm.bio}
                                  onChange={(e) => setOfficerForm({...officerForm, bio: e.target.value})}
                                  placeholder="Share the officer's background, interests, and role in the club..."
                                  className="min-h-[100px] transition-all focus:ring-2 focus:ring-primary/20 resize-none"
                                  required
                                />
                                <div className="text-xs text-muted-foreground flex justify-between">
                                  <span>{officerForm.bio.length}/500 characters</span>
                                  {officerForm.bio.length > 400 && (
                                    <span className="text-amber-500">Approaching limit</span>
                                  )}
                                </div>
                              </div>
                            </div>

                            {/* Additional Information */}
                            <div className="space-y-4">
                              <div className="flex items-center gap-2 mb-4">
                                <div className="p-1 bg-purple-100 dark:bg-purple-900/30 rounded">
                                  <Settings className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                                </div>
                                <h3 className="font-medium text-base">Additional Information</h3>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label htmlFor="githubUrl" className="text-sm font-medium">GitHub Profile</Label>
                                  <Input
                                    id="githubUrl"
                                    value={officerForm.githubUrl}
                                    onChange={(e) => setOfficerForm({...officerForm, githubUrl: e.target.value})}
                                    placeholder="https://github.com/username"
                                    className="transition-all focus:ring-2 focus:ring-primary/20"
                                  />
                                </div>

                                <div className="space-y-2">
                                  <Label htmlFor="order" className="text-sm font-medium">Display Order</Label>
                                  <Input
                                    id="order"
                                    type="number"
                                    value={officerForm.order}
                                    onChange={(e) => setOfficerForm({...officerForm, order: parseInt(e.target.value) || 0})}
                                    min="0"
                                    placeholder="0"
                                    className="transition-all focus:ring-2 focus:ring-primary/20"
                                  />
                                  <p className="text-xs text-muted-foreground">Lower numbers appear first</p>
                                </div>
                              </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-col-reverse sm:flex-row gap-3 pt-6 border-t">
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setIsOfficerDialogOpen(false)}
                                className="flex-1 sm:flex-initial"
                              >
                                Cancel
                              </Button>
                              <Button 
                                type="submit" 
                                disabled={updating === 'officer-form' || uploading}
                                className="flex-1 sm:flex-initial min-w-[140px]"
                              >
                                {updating === 'officer-form' ? (
                                  <>
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2" />
                                    Saving...
                                  </>
                                ) : (
                                  <>
                                    <Save className="h-4 w-4 mr-2" />
                                    {editingOfficer ? 'Update Officer' : 'Add Officer'}
                                  </>
                                )}
                              </Button>
                            </div>
                          </form>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </CardHeader>
                  <CardContent className="p-6">
                    {officersLoading ? (
                      <div className="text-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-muted-foreground">Loading officers...</p>
                      </div>
                    ) : officers.length === 0 ? (
                      <div className="text-center py-12">
                        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                          <Users className="h-8 w-8 text-gray-400" />
                        </div>
                        <h3 className="font-medium text-lg mb-2">No officers yet</h3>
                        <p className="text-muted-foreground mb-4">Get started by adding your first officer to the club leadership team.</p>
                        <Button onClick={resetOfficerForm} variant="outline">
                          <Plus className="h-4 w-4 mr-2" />
                          Add First Officer
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {officers.map((officer) => (
                          <div
                            key={officer.id}
                            className="group relative bg-white dark:bg-gray-900/50 border border-gray-200 dark:border-gray-700 rounded-xl p-6 shadow-sm hover:shadow-md transition-all duration-200 hover:border-blue-200 dark:hover:border-blue-700"
                          >
                            <div className="flex items-start gap-4">
                              {/* Profile Image */}
                              <div className="flex-shrink-0">
                                {officer.imageUrl ? (
                                  <Image 
                                    src={officer.imageUrl} 
                                    alt={officer.name}
                                    width={64}
                                    height={64}
                                    className="w-16 h-16 rounded-xl object-cover border-2 border-gray-100 dark:border-gray-700"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/50 dark:to-blue-800/50 flex items-center justify-center border-2 border-gray-100 dark:border-gray-700">
                                    <span className="text-xl font-semibold text-blue-600 dark:text-blue-400">
                                      {officer.name ? officer.name.split(' ').map(n => n[0]).join('') : 'O'}
                                    </span>
                                  </div>
                                )}
                              </div>

                              {/* Officer Info */}
                              <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between mb-3">
                                  <div>
                                    <h3 className="font-semibold text-lg text-gray-900 dark:text-gray-100">
                                      {officer.name}
                                    </h3>
                                    <div className="flex items-center gap-2 mt-1">
                                      <Badge 
                                        variant="secondary" 
                                        className="bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-700"
                                      >
                                        {officer.role}
                                      </Badge>
                                      <span className="text-sm text-muted-foreground">
                                        Order: {officer.order}
                                      </span>
                                    </div>
                                  </div>
                                  
                                  {/* Action Buttons */}
                                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleEditOfficer(officer)}
                                      disabled={updating === officer.id}
                                      className="h-8 w-8 p-0 hover:bg-blue-50 hover:text-blue-600 dark:hover:bg-blue-900/50"
                                    >
                                      <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => handleDeleteOfficer(officer.id)}
                                      disabled={updating === officer.id}
                                      className="h-8 w-8 p-0 hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/50"
                                    >
                                      {updating === officer.id ? (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
                                      ) : (
                                        <Trash2 className="h-4 w-4" />
                                      )}
                                    </Button>
                                  </div>
                                </div>

                                <p className="text-sm text-muted-foreground mb-3 overflow-hidden" style={{ 
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical' as const
                                }}>
                                  {officer.bio}
                                </p>

                                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                  <div className="flex items-center gap-1">
                                    <Mail className="h-4 w-4" />
                                    <span>{officer.email}</span>
                                  </div>
                                  {officer.githubUrl && (
                                    <div className="flex items-center gap-1">
                                      <Github className="h-4 w-4" />
                                      <a 
                                        href={officer.githubUrl} 
                                        target="_blank" 
                                        rel="noopener noreferrer"
                                        className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                      >
                                        GitHub
                                      </a>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="submissions" className="space-y-6">
                <SubmissionReview />
              </TabsContent>

              <TabsContent value="blog" className="space-y-6">
                <BlogManagement />
              </TabsContent>

              <TabsContent value="newsletter" className="space-y-6">
                <NewsletterManagement />
              </TabsContent>

              <TabsContent value="projects" className="space-y-6">
                <ProjectManagement />
              </TabsContent>

              <TabsContent value="resources" className="space-y-6">
                <ResourceManagement />
              </TabsContent>

              <TabsContent value="events" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Event Management</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <p className="text-muted-foreground">
                      Manage club events, workshops, and competitions.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <Button onClick={() => window.location.href = '/admin/events'} className="gap-2">
                        <Calendar className="h-4 w-4" />
                        Manage Events
                      </Button>
                      <Button variant="outline" onClick={() => window.location.href = '/events'} className="gap-2">
                        <Eye className="h-4 w-4" />
                        View Public Events
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <ClubInfoSettings />
              </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        </Container>
      </div>
    </ProtectedRoute>
  );
}
