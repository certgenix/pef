import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import {
  Users,
  Briefcase,
  Search,
  Building2,
  Handshake,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  Video,
  Plus,
  Pencil,
  Trash2,
  Star,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { auth } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import YouTubeEmbed from "@/components/YouTubeEmbed";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Video as VideoType } from "@shared/schema";

interface UserData {
  uid: string;
  name: string;
  email: string;
  status: "pending" | "approved" | "rejected";
  createdAt: Date;
  roles?: {
    isProfessional?: boolean;
    isJobSeeker?: boolean;
    isEmployer?: boolean;
    isBusinessOwner?: boolean;
    isInvestor?: boolean;
    isAdmin?: boolean;
  };
  profile?: {
    country?: string;
    city?: string;
    headline?: string;
  };
}

interface Stats {
  totalUsers: number;
  professionals: number;
  jobSeekers: number;
  employers: number;
  businessOwners: number;
  investors: number;
  admins: number;
  pendingApprovals: number;
  approved: number;
  rejected: number;
}

interface VideoFormData {
  title: string;
  description: string;
  youtubeId: string;
  thumbnailUrl: string;
  publishedAt: string;
  featured: boolean;
}

export default function AdminDashboard() {
  const { currentUser, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [videoDialogOpen, setVideoDialogOpen] = useState(false);
  const [editingVideo, setEditingVideo] = useState<VideoType | null>(null);
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);

  const { data: videos = [], refetch: refetchVideos } = useQuery<VideoType[]>({
    queryKey: ['/api/videos'],
  });

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
      return;
    }

    if (!userData?.roles?.admin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    loadData();
  }, [currentUser, userData]);

  async function loadData() {
    try {
      setLoading(true);
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const [usersResponse, statsResponse] = await Promise.all([
        fetch("/api/admin/users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        fetch("/api/admin/stats", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ]);

      if (usersResponse.ok && statsResponse.ok) {
        const usersData = await usersResponse.json();
        const statsData = await statsResponse.json();
        setUsers(usersData);
        setStats(statsData);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load admin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(userId: string, status: "approved" | "rejected") {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await fetch(`/api/admin/users/${userId}/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: `User ${status} successfully`,
        });
        await loadData();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${status} user`,
        variant: "destructive",
      });
    }
  }

  async function handleUpdateRoles(userId: string, roles: any) {
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) return;

      const response = await fetch(`/api/admin/users/${userId}/roles`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roles }),
      });

      if (response.ok) {
        toast({
          title: "Success",
          description: "User roles updated successfully",
        });
        await loadData();
        setSelectedUser(null);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update user roles",
        variant: "destructive",
      });
    }
  }

  const handleOpenVideoDialog = (video?: VideoType) => {
    if (video) {
      setEditingVideo(video);
    } else {
      setEditingVideo(null);
    }
    setVideoDialogOpen(true);
  };

  const handleCloseVideoDialog = () => {
    setVideoDialogOpen(false);
    setEditingVideo(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  const pendingUsers = users.filter((u) => u.status === "pending");
  const approvedUsers = users.filter((u) => u.status === "approved");
  const rejectedUsers = users.filter((u) => u.status === "rejected");

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 md:pt-28 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          </div>
          <p className="text-muted-foreground">Manage users, content, and platform settings</p>
        </div>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <Users className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.totalUsers}</div>
                <p className="text-xs text-muted-foreground">All registered users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
                <Clock className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.pendingApprovals}</div>
                <p className="text-xs text-muted-foreground">Awaiting review</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Approved</CardTitle>
                <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.approved}</div>
                <p className="text-xs text-muted-foreground">Active users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Videos</CardTitle>
                <Video className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{videos.length}</div>
                <p className="text-xs text-muted-foreground">Published content</p>
              </CardContent>
            </Card>
          </div>
        )}

        <Tabs defaultValue="pending" className="space-y-6">
          <TabsList>
            <TabsTrigger value="pending" data-testid="tab-pending">
              <Clock className="w-4 h-4 mr-2" />
              Pending ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="approved" data-testid="tab-approved">
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Approved ({approvedUsers.length})
            </TabsTrigger>
            <TabsTrigger value="rejected" data-testid="tab-rejected">
              <XCircle className="w-4 h-4 mr-2" />
              Rejected ({rejectedUsers.length})
            </TabsTrigger>
            <TabsTrigger value="all" data-testid="tab-all">
              <Users className="w-4 h-4 mr-2" />
              All Users ({users.length})
            </TabsTrigger>
            <TabsTrigger value="media" data-testid="tab-media">
              <Video className="w-4 h-4 mr-2" />
              Media ({videos.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {pendingUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No pending user registrations</p>
                </CardContent>
              </Card>
            ) : (
              pendingUsers.map((user) => (
                <UserCard
                  key={user.uid}
                  user={user}
                  onApprove={() => handleUpdateStatus(user.uid, "approved")}
                  onReject={() => handleUpdateStatus(user.uid, "rejected")}
                  onEditRoles={() => setSelectedUser(user)}
                  showActions={true}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {approvedUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No approved users</p>
                </CardContent>
              </Card>
            ) : (
              approvedUsers.map((user) => (
                <UserCard
                  key={user.uid}
                  user={user}
                  onEditRoles={() => setSelectedUser(user)}
                  onSuspend={() => handleUpdateStatus(user.uid, "rejected")}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {rejectedUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No rejected users</p>
                </CardContent>
              </Card>
            ) : (
              rejectedUsers.map((user) => (
                <UserCard
                  key={user.uid}
                  user={user}
                  onApprove={() => handleUpdateStatus(user.uid, "approved")}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {users.map((user) => (
              <UserCard
                key={user.uid}
                user={user}
                onEditRoles={() => setSelectedUser(user)}
                onApprove={
                  user.status !== "approved"
                    ? () => handleUpdateStatus(user.uid, "approved")
                    : undefined
                }
                onReject={
                  user.status !== "rejected"
                    ? () => handleUpdateStatus(user.uid, "rejected")
                    : undefined
                }
              />
            ))}
          </TabsContent>

          <TabsContent value="media" className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Video Management</h2>
              <Button onClick={() => handleOpenVideoDialog()} data-testid="button-add-video">
                <Plus className="w-4 h-4 mr-2" />
                Add Video
              </Button>
            </div>

            {videos.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Video className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground mb-2">No videos yet</p>
                  <p className="text-sm text-muted-foreground">Start by adding your first video</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {videos.map((video) => (
                  <Card key={video.id} data-testid={`card-admin-video-${video.id}`}>
                    <CardContent className="p-0">
                      <div className="relative">
                        <YouTubeEmbed videoId={video.youtubeId} title={video.title} />
                        {video.featured && (
                          <Badge 
                            className="absolute top-2 right-2 bg-orange-500"
                            data-testid={`badge-featured-${video.id}`}
                          >
                            <Star className="w-3 h-3 mr-1" />
                            Featured
                          </Badge>
                        )}
                      </div>
                      <div className="p-4 space-y-3">
                        <div>
                          <h3 className="font-bold text-lg mb-1" data-testid={`text-admin-video-title-${video.id}`}>
                            {video.title}
                          </h3>
                          {video.description && (
                            <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-admin-video-description-${video.id}`}>
                              {video.description}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenVideoDialog(video)}
                            data-testid={`button-edit-video-${video.id}`}
                          >
                            <Pencil className="w-3 h-3 mr-1" />
                            Edit
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => setDeleteVideoId(video.id)}
                            data-testid={`button-delete-video-${video.id}`}
                          >
                            <Trash2 className="w-3 h-3 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </main>
      <Footer />

      {selectedUser && (
        <RoleEditDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={(roles) => handleUpdateRoles(selectedUser.uid, roles)}
        />
      )}

      <VideoFormDialog
        open={videoDialogOpen}
        onClose={handleCloseVideoDialog}
        video={editingVideo}
        onSuccess={() => {
          refetchVideos();
          handleCloseVideoDialog();
        }}
      />

      <DeleteVideoDialog
        videoId={deleteVideoId}
        onClose={() => setDeleteVideoId(null)}
        onSuccess={() => {
          refetchVideos();
          setDeleteVideoId(null);
        }}
      />
    </div>
  );
}

function UserCard({
  user,
  onApprove,
  onReject,
  onSuspend,
  onEditRoles,
  showActions,
}: {
  user: UserData;
  onApprove?: () => void;
  onReject?: () => void;
  onSuspend?: () => void;
  onEditRoles?: () => void;
  showActions?: boolean;
}) {
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default">Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive">Rejected</Badge>;
      case "pending":
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <Card data-testid={`card-user-${user.uid}`}>
      <CardHeader>
        <div className="flex flex-wrap justify-between items-start gap-2">
          <div>
            <CardTitle>{user.name}</CardTitle>
            <CardDescription>{user.email}</CardDescription>
          </div>
          {getStatusBadge(user.status)}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Country</p>
            <p>{user.profile?.country || "Not provided"}</p>
          </div>
          <div>
            <p className="text-muted-foreground">City</p>
            <p>{user.profile?.city || "Not provided"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Headline</p>
            <p>{user.profile?.headline || "Not provided"}</p>
          </div>
          <div className="col-span-2">
            <p className="text-muted-foreground">Roles</p>
            <div className="flex flex-wrap gap-2 mt-1">
              {user.roles?.isProfessional && (
                <Badge variant="outline">
                  <Briefcase className="w-3 h-3 mr-1" />
                  Professional
                </Badge>
              )}
              {user.roles?.isJobSeeker && (
                <Badge variant="outline">
                  <Search className="w-3 h-3 mr-1" />
                  Job Seeker
                </Badge>
              )}
              {user.roles?.isEmployer && (
                <Badge variant="outline">
                  <Building2 className="w-3 h-3 mr-1" />
                  Employer
                </Badge>
              )}
              {user.roles?.isBusinessOwner && (
                <Badge variant="outline">
                  <Handshake className="w-3 h-3 mr-1" />
                  Business Owner
                </Badge>
              )}
              {user.roles?.isInvestor && (
                <Badge variant="outline">
                  <TrendingUp className="w-3 h-3 mr-1" />
                  Investor
                </Badge>
              )}
              {user.roles?.isAdmin && (
                <Badge variant="default">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          {showActions && onApprove && (
            <Button
              onClick={onApprove}
              variant="default"
              data-testid={`button-approve-${user.uid}`}
            >
              Approve
            </Button>
          )}
          {showActions && onReject && (
            <Button
              onClick={onReject}
              variant="destructive"
              data-testid={`button-reject-${user.uid}`}
            >
              Reject
            </Button>
          )}
          {onSuspend && (
            <Button onClick={onSuspend} variant="destructive" data-testid={`button-suspend-${user.uid}`}>
              Suspend
            </Button>
          )}
          {onEditRoles && (
            <Button onClick={onEditRoles} variant="outline" data-testid={`button-edit-roles-${user.uid}`}>
              Edit Roles
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function RoleEditDialog({
  user,
  onClose,
  onSave,
}: {
  user: UserData;
  onClose: () => void;
  onSave: (roles: any) => void;
}) {
  const [roles, setRoles] = useState({
    professional: user.roles?.isProfessional || false,
    jobSeeker: user.roles?.isJobSeeker || false,
    employer: user.roles?.isEmployer || false,
    businessOwner: user.roles?.isBusinessOwner || false,
    investor: user.roles?.isInvestor || false,
    admin: user.roles?.isAdmin || false,
  });

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="max-w-md w-full">
        <CardHeader>
          <CardTitle>Edit User Roles</CardTitle>
          <CardDescription>{user.name} ({user.email})</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: "professional", label: "Professional", icon: Briefcase },
            { key: "jobSeeker", label: "Job Seeker", icon: Search },
            { key: "employer", label: "Employer", icon: Building2 },
            { key: "businessOwner", label: "Business Owner", icon: Handshake },
            { key: "investor", label: "Investor", icon: TrendingUp },
            { key: "admin", label: "Admin", icon: Shield },
          ].map(({ key, label, icon: Icon }) => (
            <div key={key} className="flex items-center space-x-2">
              <Checkbox
                id={key}
                checked={roles[key as keyof typeof roles]}
                onCheckedChange={(checked) =>
                  setRoles({ ...roles, [key]: checked })
                }
                data-testid={`checkbox-role-${key}`}
              />
              <label
                htmlFor={key}
                className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
              >
                <Icon className="w-4 h-4" />
                {label}
              </label>
            </div>
          ))}
          <div className="flex gap-2 pt-4">
            <Button onClick={onClose} variant="outline" className="flex-1" data-testid="button-cancel-roles">
              Cancel
            </Button>
            <Button onClick={() => onSave(roles)} className="flex-1" data-testid="button-save-roles">
              Save Changes
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function VideoFormDialog({
  open,
  onClose,
  video,
  onSuccess,
}: {
  open: boolean;
  onClose: () => void;
  video: VideoType | null;
  onSuccess: () => void;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<VideoFormData>({
    title: "",
    description: "",
    youtubeId: "",
    thumbnailUrl: "",
    publishedAt: "",
    featured: false,
  });

  const extractYouTubeId = (input: string): string => {
    const trimmed = input.trim();
    
    // Already just an ID (11 characters, alphanumeric with dashes/underscores)
    if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
      return trimmed;
    }
    
    try {
      // Try parsing as URL
      const url = new URL(trimmed);
      
      // youtube.com/watch?v=ID (handles any query parameter order)
      if (url.hostname.includes('youtube.com') && url.pathname === '/watch') {
        const videoId = url.searchParams.get('v');
        if (videoId && /^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
          return videoId;
        }
      }
      
      // youtu.be/ID
      if (url.hostname === 'youtu.be' && url.pathname.length > 1) {
        const videoId = url.pathname.slice(1).split('?')[0];
        if (/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
          return videoId;
        }
      }
      
      // youtube.com/embed/ID, youtube.com/v/ID, youtube.com/shorts/ID, youtube.com/live/ID
      const pathMatch = url.pathname.match(/^\/(embed|v|shorts|live)\/([a-zA-Z0-9_-]{11})/);
      if (pathMatch && pathMatch[2]) {
        return pathMatch[2];
      }
    } catch (e) {
      // Not a valid URL, return trimmed input
    }
    
    return trimmed;
  };

  const generateThumbnailUrl = (videoId: string): string => {
    if (!videoId || videoId.length !== 11) return "";
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  };

  const handleYouTubeIdChange = (input: string) => {
    const extractedId = extractYouTubeId(input);
    const thumbnailUrl = generateThumbnailUrl(extractedId);
    
    setFormData({
      ...formData,
      youtubeId: extractedId,
      thumbnailUrl: thumbnailUrl,
    });
  };

  useEffect(() => {
    if (video) {
      setFormData({
        title: video.title,
        description: video.description || "",
        youtubeId: video.youtubeId,
        thumbnailUrl: video.thumbnailUrl || generateThumbnailUrl(video.youtubeId),
        publishedAt: video.publishedAt ? new Date(video.publishedAt).toISOString().split('T')[0] : "",
        featured: video.featured,
      });
    } else {
      setFormData({
        title: "",
        description: "",
        youtubeId: "",
        thumbnailUrl: "",
        publishedAt: "",
        featured: false,
      });
    }
  }, [video, open]);

  const createVideoMutation = useMutation({
    mutationFn: async (data: Partial<VideoFormData>) => {
      return apiRequest('POST', '/api/videos', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video created successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to create video",
        variant: "destructive",
      });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<VideoFormData> }) => {
      return apiRequest('PATCH', `/api/videos/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update video",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate YouTube ID is exactly 11 characters
    if (!formData.youtubeId || !/^[a-zA-Z0-9_-]{11}$/.test(formData.youtubeId)) {
      toast({
        title: "Invalid YouTube ID",
        description: "Please enter a valid YouTube URL or video ID. The video ID should be exactly 11 characters.",
        variant: "destructive",
      });
      return;
    }

    const submitData: any = {
      title: formData.title,
      description: formData.description || null,
      youtubeId: formData.youtubeId,
      thumbnailUrl: formData.thumbnailUrl || generateThumbnailUrl(formData.youtubeId),
      featured: formData.featured,
    };

    if (formData.publishedAt) {
      submitData.publishedAt = new Date(formData.publishedAt).toISOString();
    }

    if (video) {
      updateVideoMutation.mutate({ id: video.id, data: submitData });
    } else {
      createVideoMutation.mutate(submitData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-video-form">
        <DialogHeader>
          <DialogTitle>{video ? "Edit Video" : "Add New Video"}</DialogTitle>
          <DialogDescription>
            {video ? "Update video details below" : "Add a new video to the media library"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              data-testid="input-video-title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              data-testid="input-video-description"
            />
          </div>

          <div>
            <Label htmlFor="youtubeId">YouTube Video URL or ID *</Label>
            <Input
              id="youtubeId"
              value={formData.youtubeId}
              onChange={(e) => handleYouTubeIdChange(e.target.value)}
              placeholder="Paste full YouTube URL or just the video ID"
              required
              data-testid="input-video-youtubeid"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Paste the full YouTube URL (e.g., https://www.youtube.com/watch?v=kYV4OzMLVJg) or just the ID (kYV4OzMLVJg)
            </p>
          </div>

          {formData.youtubeId && formData.thumbnailUrl && (
            <div>
              <Label>Thumbnail Preview</Label>
              <div className="mt-2 rounded-md overflow-hidden border">
                <img
                  src={formData.thumbnailUrl}
                  alt="Video thumbnail"
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.src = `https://img.youtube.com/vi/${formData.youtubeId}/hqdefault.jpg`;
                  }}
                  data-testid="img-thumbnail-preview"
                />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Thumbnail automatically generated from YouTube
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="thumbnailUrl">Custom Thumbnail URL (optional)</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              placeholder="Leave blank to use YouTube's thumbnail"
              data-testid="input-video-thumbnail"
            />
            <p className="text-xs text-muted-foreground mt-1">
              Override the auto-generated thumbnail with a custom URL
            </p>
          </div>

          <div>
            <Label htmlFor="publishedAt">Published Date</Label>
            <Input
              id="publishedAt"
              type="date"
              value={formData.publishedAt}
              onChange={(e) => setFormData({ ...formData, publishedAt: e.target.value })}
              data-testid="input-video-publishedat"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="featured"
              checked={formData.featured}
              onCheckedChange={(checked) => setFormData({ ...formData, featured: checked })}
              data-testid="switch-video-featured"
            />
            <Label htmlFor="featured" className="cursor-pointer">
              Mark as featured
            </Label>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} data-testid="button-cancel-video">
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createVideoMutation.isPending || updateVideoMutation.isPending}
              data-testid="button-save-video"
            >
              {createVideoMutation.isPending || updateVideoMutation.isPending ? "Saving..." : video ? "Update Video" : "Add Video"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteVideoDialog({
  videoId,
  onClose,
  onSuccess,
}: {
  videoId: string | null;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { toast } = useToast();

  const deleteVideoMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest('DELETE', `/api/videos/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/videos'] });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete video",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (videoId) {
      deleteVideoMutation.mutate(videoId);
    }
  };

  return (
    <Dialog open={!!videoId} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-delete-video">
        <DialogHeader>
          <DialogTitle>Delete Video</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this video? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={onClose} data-testid="button-cancel-delete">
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleDelete}
            disabled={deleteVideoMutation.isPending}
            data-testid="button-confirm-delete"
          >
            {deleteVideoMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
