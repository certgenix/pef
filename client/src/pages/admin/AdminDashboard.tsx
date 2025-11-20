import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BarChart3,
  Shield,
} from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { auth } from "@/lib/firebase";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

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

export default function AdminDashboard() {
  const { currentUser, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
      return;
    }

    // Check if user has admin role
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
        {/* Statistics Cards */}
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
                <CardTitle className="text-sm font-medium">Rejected</CardTitle>
                <XCircle className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.rejected}</div>
                <p className="text-xs text-muted-foreground">Denied access</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Professionals</CardTitle>
                <Briefcase className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.professionals}</div>
                <p className="text-xs text-muted-foreground">Professional users</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Job Seekers</CardTitle>
                <Search className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.jobSeekers}</div>
                <p className="text-xs text-muted-foreground">Looking for jobs</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Employers</CardTitle>
                <Building2 className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.employers}</div>
                <p className="text-xs text-muted-foreground">Hiring companies</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Business Owners</CardTitle>
                <Handshake className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.businessOwners}</div>
                <p className="text-xs text-muted-foreground">Business owners</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Investors</CardTitle>
                <TrendingUp className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.investors}</div>
                <p className="text-xs text-muted-foreground">Investor accounts</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Admins</CardTitle>
                <Shield className="w-4 h-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.admins}</div>
                <p className="text-xs text-muted-foreground">Administrator accounts</p>
              </CardContent>
            </Card>
          </div>
        )}

        {/* User Management Tabs */}
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
        </Tabs>
      </main>
      <Footer />

      {/* Role Edit Dialog */}
      {selectedUser && (
        <RoleEditDialog
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onSave={(roles) => handleUpdateRoles(selectedUser.uid, roles)}
        />
      )}
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
