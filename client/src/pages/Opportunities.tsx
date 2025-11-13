import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, TrendingUp, Handshake, Building2, MapPin, Calendar } from "lucide-react";

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
    title: "Partnership Proposals",
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

const sampleOpportunities = [
  {
    type: "Job Opening",
    title: "Senior Software Engineer",
    company: "Tech Solutions Inc.",
    location: "Riyadh, Saudi Arabia",
    posted: "2 days ago",
    badge: "Full-time",
  },
  {
    type: "Investment",
    title: "E-commerce Platform Seeking Series A",
    company: "ShopLocal Platform",
    location: "Dubai, UAE",
    posted: "1 week ago",
    badge: "$2M-5M",
  },
  {
    type: "Partnership",
    title: "Distribution Partner for MENA Region",
    company: "GlobalTech Manufacturing",
    location: "Multiple Locations",
    posted: "3 days ago",
    badge: "Strategic",
  },
];

export default function Opportunities() {
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
              Featured Opportunities
            </h3>

            <div className="space-y-6">
              {sampleOpportunities.map((opportunity, index) => (
                <Card key={index} className="border-2 hover:border-primary/30 transition-all" data-testid={`card-opportunity-${index}`}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge variant="secondary" data-testid={`badge-type-${index}`}>{opportunity.type}</Badge>
                          <Badge variant="outline" data-testid={`badge-status-${index}`}>{opportunity.badge}</Badge>
                        </div>
                        <CardTitle className="text-xl mb-2" data-testid={`text-opportunity-title-${index}`}>{opportunity.title}</CardTitle>
                        <p className="text-muted-foreground" data-testid={`text-company-${index}`}>{opportunity.company}</p>
                      </div>
                      <Button data-testid={`button-view-details-${index}`}>View Details</Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <span>{opportunity.location}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <span>Posted {opportunity.posted}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="min-h-12" data-testid="button-view-all">
                View All Opportunities
              </Button>
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
