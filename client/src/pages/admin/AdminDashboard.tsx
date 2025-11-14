import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import {
  getAllPendingUsers,
  approveUserRegistration,
  rejectUserRegistration,
  getJobListings,
  approveJobListing,
  rejectJobListing,
} from "@/lib/firestoreHelpers";
import { Users, Briefcase, LogOut } from "lucide-react";

const ADMIN_EMAILS = ["admin@pef.com", "administrator@pef.com"];

export default function AdminDashboard() {
  const { currentUser, userData, logout } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [pendingUsers, setPendingUsers] = useState<any[]>([]);
  const [pendingJobs, setPendingJobs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
      return;
    }

    if (!ADMIN_EMAILS.includes(currentUser.email || "")) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }

    loadData();
  }, [currentUser]);

  async function loadData() {
    try {
      setLoading(true);
      const [users, jobs] = await Promise.all([
        getAllPendingUsers(),
        getJobListings("pending"),
      ]);
      setPendingUsers(users);
      setPendingJobs(jobs);
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

  async function handleApproveUser(userId: string) {
    try {
      await approveUserRegistration(userId);
      toast({
        title: "Success",
        description: "User approved successfully",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      });
    }
  }

  async function handleRejectUser(userId: string) {
    try {
      await rejectUserRegistration(userId);
      toast({
        title: "Success",
        description: "User rejected",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      });
    }
  }

  async function handleApproveJob(jobId: string) {
    try {
      await approveJobListing(jobId);
      toast({
        title: "Success",
        description: "Job listing approved",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve job listing",
        variant: "destructive",
      });
    }
  }

  async function handleRejectJob(jobId: string) {
    try {
      await rejectJobListing(jobId);
      toast({
        title: "Success",
        description: "Job listing rejected",
      });
      await loadData();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject job listing",
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Professional Executive Forum</p>
            </div>
            <Button onClick={logout} variant="outline" data-testid="button-logout">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList>
            <TabsTrigger value="users" data-testid="tab-users">
              <Users className="w-4 h-4 mr-2" />
              Pending Users ({pendingUsers.length})
            </TabsTrigger>
            <TabsTrigger value="jobs" data-testid="tab-jobs">
              <Briefcase className="w-4 h-4 mr-2" />
              Pending Jobs ({pendingJobs.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-4">
            {pendingUsers.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No pending user registrations</p>
                </CardContent>
              </Card>
            ) : (
              pendingUsers.map((user) => (
                <Card key={user.uid} data-testid={`card-user-${user.uid}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{user.name}</CardTitle>
                        <CardDescription>{user.email}</CardDescription>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Country</p>
                        <p>{user.country || "Not provided"}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">City</p>
                        <p>{user.city || "Not provided"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Headline</p>
                        <p>{user.headline || "Not provided"}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Selected Roles</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {Object.entries(user.roles || {})
                            .filter(([, isActive]) => isActive)
                            .map(([role]) => (
                              <Badge key={role} variant="outline">{role}</Badge>
                            ))}
                        </div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveUser(user.uid)}
                        variant="default"
                        className="flex-1"
                        data-testid={`button-approve-${user.uid}`}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectUser(user.uid)}
                        variant="destructive"
                        className="flex-1"
                        data-testid={`button-reject-${user.uid}`}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>

          <TabsContent value="jobs" className="space-y-4">
            {pendingJobs.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <p className="text-muted-foreground">No pending job listings</p>
                </CardContent>
              </Card>
            ) : (
              pendingJobs.map((job) => (
                <Card key={job.id} data-testid={`card-job-${job.id}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle>{job.title}</CardTitle>
                        <CardDescription>{job.company}</CardDescription>
                      </div>
                      <Badge variant="secondary">Pending</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p>{job.location}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p>{job.type}</p>
                      </div>
                      {job.salary && (
                        <div>
                          <p className="text-muted-foreground">Salary</p>
                          <p>{job.salary}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Description</p>
                        <p className="line-clamp-3">{job.description}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleApproveJob(job.id)}
                        variant="default"
                        className="flex-1"
                        data-testid={`button-approve-job-${job.id}`}
                      >
                        Approve
                      </Button>
                      <Button
                        onClick={() => handleRejectJob(job.id)}
                        variant="destructive"
                        className="flex-1"
                        data-testid={`button-reject-job-${job.id}`}
                      >
                        Reject
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
