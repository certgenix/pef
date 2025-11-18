import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getJobPosts } from "@/lib/firestoreUtils";
import type { FirestoreJobPost } from "@shared/firestoreTypes";
import { Briefcase, MapPin, DollarSign, Clock, Search } from "lucide-react";
import { format } from "date-fns";

export default function BrowseJobs() {
  const [, setLocation] = useLocation();
  const [jobs, setJobs] = useState<FirestoreJobPost[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<FirestoreJobPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadJobs();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = jobs.filter(
        (job) =>
          job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.location.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredJobs(filtered);
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs]);

  const loadJobs = async () => {
    try {
      setLoading(true);
      const jobsData = await getJobPosts({ status: "open" });
      const approvedJobs = jobsData.filter((job) => job.approvalStatus === "approved");
      setJobs(approvedJobs);
      setFilteredJobs(approvedJobs);
    } catch (error) {
      console.error("Error loading jobs:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading jobs...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 md:pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Browse Jobs</h1>
            <p className="text-muted-foreground">Discover open job opportunities</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, description, or location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-jobs"
            />
          </div>

          {filteredJobs.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Briefcase className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No jobs found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "No open positions at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/job/${job.id}`)}
                  data-testid={`card-job-${job.id}`}
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{job.title}</CardTitle>
                          {job.employmentType && (
                            <Badge variant="outline" className="capitalize">
                              {job.employmentType.replace("-", " ")}
                            </Badge>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span>{job.location}</span>
                          </div>
                          {(job.salaryMin || job.salaryMax) && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                {job.salaryCurrency} {job.salaryMin?.toLocaleString()}
                                {job.salaryMax && ` - ${job.salaryMax.toLocaleString()}`}
                              </span>
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            <span>Posted {format(new Date(job.createdAt), "MMM d, yyyy")}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>
                    {job.skills && job.skills.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-4">
                        {job.skills.slice(0, 5).map((skill, index) => (
                          <Badge key={index} variant="secondary">
                            {skill}
                          </Badge>
                        ))}
                        {job.skills.length > 5 && <Badge variant="secondary">+{job.skills.length - 5} more</Badge>}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
