import { useEffect, useState } from "react";
import { useLocation } from "wouter";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getBusinessOpportunities } from "@/lib/firestoreUtils";
import type { FirestoreBusinessOpportunity } from "@shared/firestoreTypes";
import { Lightbulb, MapPin, DollarSign, Building2, Search } from "lucide-react";
import { format } from "date-fns";

export default function BrowseOpportunities() {
  const [, setLocation] = useLocation();
  const [opportunities, setOpportunities] = useState<FirestoreBusinessOpportunity[]>([]);
  const [filteredOpportunities, setFilteredOpportunities] = useState<FirestoreBusinessOpportunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    loadOpportunities();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      const filtered = opportunities.filter(
        (opp) =>
          opp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          opp.industry?.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredOpportunities(filtered);
    } else {
      setFilteredOpportunities(opportunities);
    }
  }, [searchTerm, opportunities]);

  const loadOpportunities = async () => {
    try {
      setLoading(true);
      const oppsData = await getBusinessOpportunities();
      const approvedOpps = oppsData.filter(
        (opp) => opp.status === "open" && opp.approvalStatus === "approved"
      );
      setOpportunities(approvedOpps);
      setFilteredOpportunities(approvedOpps);
    } catch (error) {
      console.error("Error loading opportunities:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading opportunities...</p>
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
            <h1 className="text-3xl font-bold mb-2">Browse Business Opportunities</h1>
            <p className="text-muted-foreground">Discover investment and partnership opportunities</p>
          </div>

          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search opportunities by title, description, or industry..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
              data-testid="input-search-opportunities"
            />
          </div>

          {filteredOpportunities.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">No opportunities found</h3>
                <p className="text-sm text-muted-foreground">
                  {searchTerm ? "Try adjusting your search terms" : "No open opportunities at the moment"}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {filteredOpportunities.map((opp) => (
                <Card
                  key={opp.id}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setLocation(`/business/${opp.id}`)}
                  data-testid={`card-opportunity-${opp.id}`}
                >
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <CardTitle className="text-xl">{opp.title}</CardTitle>
                          <Badge variant="outline" className="capitalize">
                            {opp.opportunityType}
                          </Badge>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <Building2 className="w-4 h-4" />
                            <span>{opp.industry}</span>
                          </div>
                          {opp.location && (
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              <span>{opp.location}</span>
                            </div>
                          )}
                          {opp.fundingRequired && (
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-4 h-4" />
                              <span>
                                {opp.currency} {opp.fundingRequired.toLocaleString()}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground line-clamp-2">{opp.description}</p>
                    {opp.keyHighlights && opp.keyHighlights.length > 0 && (
                      <div className="mt-4">
                        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                          {opp.keyHighlights.slice(0, 2).map((highlight, index) => (
                            <li key={index}>{highlight}</li>
                          ))}
                          {opp.keyHighlights.length > 2 && <li>+{opp.keyHighlights.length - 2} more highlights</li>}
                        </ul>
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
