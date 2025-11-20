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
  visible: boolean;
}

export default function AdminDashboard() {
  const { currentUser, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filterUsers = (userList: UserData[]) => {
    if (!searchQuery.trim()) return userList;
    const query = searchQuery.toLowerCase();
    return userList.filter(
      (user) =>
        (user.name || "").toLowerCase().includes(query) ||
        (user.email || "").toLowerCase().includes(query)
    );
  };

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

          <div className="mb-4">
            <div className="relative max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
                data-testid="input-search-users"
              />
            </div>
          </div>

          <TabsContent value="pending" className="space-y-4">
            {filterUsers(pendingUsers).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? "No users found" : "No pending user registrations"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <UsersTable
                users={filterUsers(pendingUsers)}
                onUserClick={setSelectedUser}
              />
            )}
          </TabsContent>

          <TabsContent value="approved" className="space-y-4">
            {filterUsers(approvedUsers).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? "No users found" : "No approved users"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <UsersTable
                users={filterUsers(approvedUsers)}
                onUserClick={setSelectedUser}
              />
            )}
          </TabsContent>

          <TabsContent value="rejected" className="space-y-4">
            {filterUsers(rejectedUsers).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">
                    {searchQuery ? "No users found" : "No rejected users"}
                  </p>
                </CardContent>
              </Card>
            ) : (
              <UsersTable
                users={filterUsers(rejectedUsers)}
                onUserClick={setSelectedUser}
              />
            )}
          </TabsContent>

          <TabsContent value="all" className="space-y-4">
            {filterUsers(users).length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No users found</p>
                </CardContent>
              </Card>
            ) : (
              <UsersTable
                users={filterUsers(users)}
                onUserClick={setSelectedUser}
              />
            )}
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
        <UserManagementDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onApprove={() => {
            handleUpdateStatus(selectedUser.uid, "approved");
            setSelectedUser(null);
          }}
          onReject={() => {
            handleUpdateStatus(selectedUser.uid, "rejected");
            setSelectedUser(null);
          }}
          onUpdateRoles={(roles) => handleUpdateRoles(selectedUser.uid, roles)}
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

function UsersTable({
  users,
  onUserClick,
}: {
  users: UserData[];
  onUserClick: (user: UserData) => void;
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
    <Card>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Name</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Email</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Status</th>
              <th className="text-left p-4 font-medium text-sm text-muted-foreground">Roles</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr
                key={user.uid}
                onClick={() => onUserClick(user)}
                className="border-b last:border-0 hover-elevate cursor-pointer"
                data-testid={`row-user-${user.uid}`}
              >
                <td className="p-4">
                  <div className="font-medium" data-testid={`text-user-name-${user.uid}`}>
                    {user.name}
                  </div>
                </td>
                <td className="p-4">
                  <div className="text-sm text-muted-foreground" data-testid={`text-user-email-${user.uid}`}>
                    {user.email}
                  </div>
                </td>
                <td className="p-4">
                  <div data-testid={`badge-user-status-${user.uid}`}>
                    {getStatusBadge(user.status)}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex flex-wrap gap-1">
                    {user.roles?.isProfessional && (
                      <Badge variant="outline" className="text-xs">
                        Professional
                      </Badge>
                    )}
                    {user.roles?.isJobSeeker && (
                      <Badge variant="outline" className="text-xs">
                        Job Seeker
                      </Badge>
                    )}
                    {user.roles?.isEmployer && (
                      <Badge variant="outline" className="text-xs">
                        Employer
                      </Badge>
                    )}
                    {user.roles?.isBusinessOwner && (
                      <Badge variant="outline" className="text-xs">
                        Business
                      </Badge>
                    )}
                    {user.roles?.isInvestor && (
                      <Badge variant="outline" className="text-xs">
                        Investor
                      </Badge>
                    )}
                    {user.roles?.isAdmin && (
                      <Badge variant="default" className="text-xs">
                        Admin
                      </Badge>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function UserManagementDialog({
  user,
  onClose,
  onApprove,
  onReject,
  onUpdateRoles,
}: {
  user: UserData;
  onClose: () => void;
  onApprove: () => void;
  onReject: () => void;
  onUpdateRoles: (roles: any) => void;
}) {
  const [roles, setRoles] = useState({
    professional: user.roles?.isProfessional || false,
    jobSeeker: user.roles?.isJobSeeker || false,
    employer: user.roles?.isEmployer || false,
    businessOwner: user.roles?.isBusinessOwner || false,
    investor: user.roles?.isInvestor || false,
    admin: user.roles?.isAdmin || false,
  });

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
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-user-management">
        <DialogHeader>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <DialogTitle>Manage User</DialogTitle>
            {getStatusBadge(user.status)}
          </div>
          <DialogDescription>
            <div className="space-y-1 mt-2">
              <div className="font-medium text-foreground">{user.name}</div>
              <div className="text-sm">{user.email}</div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <h3 className="font-medium mb-3">Profile Information</h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground mb-1">Country</p>
                <p className="font-medium">{user.profile?.country || "Not provided"}</p>
              </div>
              <div>
                <p className="text-muted-foreground mb-1">City</p>
                <p className="font-medium">{user.profile?.city || "Not provided"}</p>
              </div>
              <div className="col-span-2">
                <p className="text-muted-foreground mb-1">Headline</p>
                <p className="font-medium">{user.profile?.headline || "Not provided"}</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="font-medium mb-3">User Roles</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="professional"
                  checked={roles.professional}
                  onCheckedChange={(checked) =>
                    setRoles({ ...roles, professional: checked as boolean })
                  }
                  data-testid="checkbox-role-professional"
                />
                <Label htmlFor="professional" className="flex items-center gap-2 cursor-pointer">
                  <Briefcase className="w-4 h-4" />
                  Professional
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="jobSeeker"
                  checked={roles.jobSeeker}
                  onCheckedChange={(checked) =>
                    setRoles({ ...roles, jobSeeker: checked as boolean })
                  }
                  data-testid="checkbox-role-jobseeker"
                />
                <Label htmlFor="jobSeeker" className="flex items-center gap-2 cursor-pointer">
                  <Search className="w-4 h-4" />
                  Job Seeker
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="employer"
                  checked={roles.employer}
                  onCheckedChange={(checked) =>
                    setRoles({ ...roles, employer: checked as boolean })
                  }
                  data-testid="checkbox-role-employer"
                />
                <Label htmlFor="employer" className="flex items-center gap-2 cursor-pointer">
                  <Building2 className="w-4 h-4" />
                  Employer
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="businessOwner"
                  checked={roles.businessOwner}
                  onCheckedChange={(checked) =>
                    setRoles({ ...roles, businessOwner: checked as boolean })
                  }
                  data-testid="checkbox-role-businessowner"
                />
                <Label htmlFor="businessOwner" className="flex items-center gap-2 cursor-pointer">
                  <Handshake className="w-4 h-4" />
                  Business Owner
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="investor"
                  checked={roles.investor}
                  onCheckedChange={(checked) =>
                    setRoles({ ...roles, investor: checked as boolean })
                  }
                  data-testid="checkbox-role-investor"
                />
                <Label htmlFor="investor" className="flex items-center gap-2 cursor-pointer">
                  <TrendingUp className="w-4 h-4" />
                  Investor
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="admin"
                  checked={roles.admin}
                  onCheckedChange={(checked) =>
                    setRoles({ ...roles, admin: checked as boolean })
                  }
                  data-testid="checkbox-role-admin"
                />
                <Label htmlFor="admin" className="flex items-center gap-2 cursor-pointer">
                  <Shield className="w-4 h-4" />
                  Admin
                </Label>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <div className="flex flex-wrap gap-2 flex-1">
            {user.status !== "approved" && (
              <Button onClick={onApprove} variant="default" data-testid="button-approve-user">
                <CheckCircle2 className="w-4 h-4 mr-2" />
                Approve
              </Button>
            )}
            {user.status !== "rejected" && (
              <Button onClick={onReject} variant="destructive" data-testid="button-reject-user">
                <XCircle className="w-4 h-4 mr-2" />
                {user.status === "approved" ? "Suspend" : "Reject"}
              </Button>
            )}
          </div>
          <div className="flex gap-2">
            <Button onClick={onClose} variant="outline" data-testid="button-cancel-user">
              Cancel
            </Button>
            <Button onClick={() => onUpdateRoles(roles)} data-testid="button-save-roles">
              Save Roles
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper function to extract YouTube video ID from various URL formats
function extractYouTubeId(input: string): string {
  const trimmed = input.trim();
  
  // If it's already just an ID (11 characters, alphanumeric with dashes and underscores)
  if (/^[a-zA-Z0-9_-]{11}$/.test(trimmed)) {
    return trimmed;
  }
  
  // Match various YouTube URL formats
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/watch\?.*v=([a-zA-Z0-9_-]{11})/,
  ];
  
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }
  
  // Return the original input if no pattern matches
  return trimmed;
}

// Helper function to generate YouTube thumbnail URL
function generateYouTubeThumbnail(videoId: string): string {
  if (!videoId || videoId.length !== 11) return "";
  return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
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
    title: video?.title || "",
    description: video?.description || "",
    youtubeId: video?.youtubeId || "",
    thumbnailUrl: video?.thumbnailUrl || "",
    publishedAt: video?.publishedAt 
      ? (typeof video.publishedAt === 'string' ? video.publishedAt : new Date(video.publishedAt).toISOString().split('T')[0])
      : new Date().toISOString().split('T')[0],
    featured: video?.featured || false,
    visible: video?.visible ?? true,
  });

  const createVideoMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      return apiRequest('POST', '/api/videos', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video added successfully",
      });
      onSuccess();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add video",
        variant: "destructive",
      });
    },
  });

  const updateVideoMutation = useMutation({
    mutationFn: async (data: VideoFormData) => {
      return apiRequest('PATCH', `/api/videos/${video?.id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Video updated successfully",
      });
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
    if (video) {
      updateVideoMutation.mutate(formData);
    } else {
      createVideoMutation.mutate(formData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" data-testid="dialog-video-form">
        <DialogHeader>
          <DialogTitle>{video ? "Edit Video" : "Add New Video"}</DialogTitle>
          <DialogDescription>
            {video ? "Update video information" : "Add a new video to the media gallery"}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
              data-testid="input-video-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              data-testid="input-video-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="youtubeId">YouTube Video ID</Label>
            <Input
              id="youtubeId"
              value={formData.youtubeId}
              onChange={(e) => {
                const extractedId = extractYouTubeId(e.target.value);
                const autoThumbnail = generateYouTubeThumbnail(extractedId);
                setFormData({ 
                  ...formData, 
                  youtubeId: extractedId,
                  thumbnailUrl: autoThumbnail || formData.thumbnailUrl
                });
              }}
              placeholder="Paste YouTube URL or video ID (e.g., dQw4w9WgXcQ)"
              required
              data-testid="input-video-youtubeid"
            />
            <p className="text-sm text-muted-foreground">
              You can paste a full YouTube URL or just the video ID
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="thumbnailUrl">Thumbnail URL</Label>
            <Input
              id="thumbnailUrl"
              value={formData.thumbnailUrl}
              onChange={(e) => setFormData({ ...formData, thumbnailUrl: e.target.value })}
              placeholder="Auto-generated from YouTube ID"
              data-testid="input-video-thumbnail"
            />
            {formData.thumbnailUrl && (
              <div className="mt-2 border rounded-md overflow-hidden">
                <img 
                  src={formData.thumbnailUrl} 
                  alt="Video thumbnail preview" 
                  className="w-full h-auto"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
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
              id="visible"
              checked={formData.visible}
              onCheckedChange={(checked) => setFormData({ ...formData, visible: checked })}
              data-testid="switch-video-visible"
            />
            <Label htmlFor="visible" className="cursor-pointer">
              Visible on Media page
            </Label>
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
