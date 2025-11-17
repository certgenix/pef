import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, Handshake, Building2, MapPin, Calendar, Mail } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Opportunity, JobDetails } from "@shared/schema";

const opportunityTypes = [
  {
    icon: Briefcase,
    title: "Job Openings",
    description: "Employment opportunities across various sectors and experience levels",
    color: "bg-blue-500",
  },
  {
    icon: TrendingUp,
    title: "Investment Opportunities",
    description: "Funding and investment prospects for growth-ready businesses",
    color: "bg-green-500",
  },
  {
    icon: Handshake,
    title: "Sponsorship",
    description: "Strategic collaborations and business partnerships",
    color: "bg-purple-500",
  },
  {
    icon: Building2,
    title: "Expansion Projects",
    description: "Business growth and market expansion initiatives",
    color: "bg-orange-500",
  },
];

export default function Opportunities() {
  const { data: opportunities = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/opportunities"],
    queryFn: async () => {
      const response = await fetch("/api/opportunities?type=job");
      if (!response.ok) throw new Error("Failed to fetch opportunities");
      return response.json();
    },
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary to-[hsl(213,58%,35%)] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Discover Opportunities
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Across Sectors and Countries
            </p>
            <p className="text-lg text-white/80 max-w-2xl mx-auto mt-4">
              The Opportunity Board connects members with curated, high-quality listings created by approved users.
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
              Types of Opportunities
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto text-lg">
              Every listing is reviewed to ensure clarity, relevance, and professionalism.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {opportunityTypes.map((type) => {
                const Icon = type.icon;
                return (
                  <Card key={type.title} className="border-2 hover:border-primary/30 transition-all hover-elevate" data-testid={`card-opportunity-type-${type.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    <CardContent className="p-6 text-center">
                      <div className={`w-16 h-16 ${type.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{type.title}</h3>
                      <p className="text-sm text-muted-foreground">{type.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 text-center mb-16">
              <p className="text-muted-foreground">
                Plus: <strong>Collaborative initiatives</strong> and other professional opportunities
              </p>
            </div>

            <h3 className="text-2xl md:text-3xl font-display font-bold mb-8 text-center">
              Available Job Opportunities
            </h3>

            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading opportunities...</p>
              </div>
            ) : opportunities.length === 0 ? (
              <div className="text-center py-12">
                <Briefcase className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-xl font-semibold mb-2">No opportunities available yet</h4>
                <p className="text-muted-foreground mb-6">
                  Check back soon for new job postings and other opportunities
                </p>
                <Button onClick={() => window.location.href = "/login"} data-testid="button-post-opportunity">
                  Login to Post an Opportunity
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
                {opportunities.map((opportunity, idx) => {
                  const details = (opportunity.details as JobDetails | null) || {};
                  
                  return (
                    <Card key={opportunity.id} className="hover:border-primary/30 transition-all hover-elevate" data-testid={`card-opportunity-${idx}`}>
                      <CardHeader>
                        <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                          <Badge variant="secondary" className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100">
                            Job Opening
                          </Badge>
                          <Badge variant="secondary" className="text-xs">
                            {opportunity.status === "open" ? "Open" : "Closed"}
                          </Badge>
                        </div>
                        <CardTitle className="text-xl">{opportunity.title}</CardTitle>
                        <CardDescription className="flex items-center gap-1 text-sm">
                          <MapPin className="w-3 h-3" />
                          {opportunity.city ? `${opportunity.city}, ` : ""}{opportunity.country}
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <p className="text-sm text-muted-foreground line-clamp-3">
                          {opportunity.description}
                        </p>
                        
                        {details.employmentType && (
                          <Badge variant="outline" className="capitalize">
                            {details.employmentType}
                          </Badge>
                        )}
                        
                        {opportunity.budgetOrSalary && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Salary:</span>
                            <span className="text-sm text-muted-foreground">{opportunity.budgetOrSalary}</span>
                          </div>
                        )}
                        
                        {details.experienceRequired && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">Experience:</span>
                            <span className="text-sm text-muted-foreground">{details.experienceRequired}</span>
                          </div>
                        )}
                        
                        {opportunity.sector && (
                          <Badge variant="secondary" className="text-xs">
                            {opportunity.sector}
                          </Badge>
                        )}
                        
                        {details.applicationEmail && (
                          <div className="pt-3 border-t">
                            <Button 
                              size="sm" 
                              className="w-full"
                              onClick={() => window.location.href = `mailto:${details.applicationEmail}`}
                              data-testid={`button-apply-${idx}`}
                            >
                              <Mail className="w-4 h-4 mr-2" />
                              Apply Now
                            </Button>
                          </div>
                        )}
                        
                        {details.skills && Array.isArray(details.skills) && details.skills.length > 0 && (
                          <div>
                            <p className="text-xs font-medium mb-2">Required Skills:</p>
                            <div className="flex flex-wrap gap-1">
                              {details.skills.slice(0, 4).map((skill, i) => (
                                <Badge key={i} variant="outline" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {details.skills.length > 4 && (
                                <Badge variant="outline" className="text-xs">
                                  +{details.skills.length - 4} more
                                </Badge>
                              )}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            <div className="text-center">
              <p className="text-sm text-muted-foreground mt-4">
                Login required to post or view full opportunity details
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
