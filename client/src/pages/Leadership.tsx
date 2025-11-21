import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Linkedin, Users2, Mail, X, Briefcase } from "lucide-react";
import type { Leader } from "@shared/schema";

export default function Leadership() {
  const [selectedLeader, setSelectedLeader] = useState<Leader | null>(null);
  
  const { data: leaders, isLoading } = useQuery<Leader[]>({
    queryKey: ["/api/leaders"],
  });

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
            <div className="flex items-center justify-center mb-6">
              <Users2 className="w-12 h-12 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Our Leadership
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Meet the visionaries driving innovation and excellence at Professional Executive Forum
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading leadership team...</p>
              </div>
            ) : leaders && leaders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {leaders.map((leader) => (
                  <Card 
                    key={leader.id} 
                    className="group hover:border-primary/50 transition-all hover-elevate cursor-pointer overflow-visible shadow-sm" 
                    onClick={() => setSelectedLeader(leader)}
                    data-testid={`card-leader-${leader.id}`}
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col items-center text-center">
                        <div className="mb-6 relative">
                          <div className="absolute inset-0 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-colors" />
                          <Avatar className="w-32 h-32 border-4 border-card shadow-lg relative transition-transform duration-300 group-hover:scale-105" data-testid={`avatar-leader-${leader.id}`}>
                            {leader.imageUrl && (
                              <AvatarImage src={leader.imageUrl} alt={leader.name} />
                            )}
                            <AvatarFallback className="text-3xl bg-primary/10 text-primary font-semibold">
                              {getInitials(leader.name)}
                            </AvatarFallback>
                          </Avatar>
                        </div>
                        
                        <div className="space-y-3 flex-1 w-full">
                          <div>
                            <h3 className="text-2xl font-display font-bold mb-2" data-testid={`text-leader-name-${leader.id}`}>
                              {leader.name}
                            </h3>
                            <div className="flex items-center justify-center gap-2">
                              <Briefcase className="w-4 h-4 text-primary" />
                              <p className="text-sm text-primary font-semibold" data-testid={`text-leader-title-${leader.id}`}>
                                {leader.title}
                              </p>
                            </div>
                          </div>
                          
                          {leader.bio && (
                            <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed" data-testid={`text-leader-bio-${leader.id}`}>
                              {leader.bio}
                            </p>
                          )}
                        </div>
                        
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-6 group-hover:bg-primary group-hover:text-primary-foreground transition-colors"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedLeader(leader);
                          }}
                          data-testid={`button-leader-view-${leader.id}`}
                        >
                          View Full Profile
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <Users2 className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg">No leadership team members to display at this time.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <Dialog open={!!selectedLeader} onOpenChange={() => setSelectedLeader(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" data-testid="dialog-leader-detail">
          {selectedLeader && (
            <div>
              <DialogHeader className="space-y-4 pb-6 border-b">
                <div className="flex flex-col sm:flex-row items-center gap-6">
                  <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-lg" data-testid="avatar-leader-full">
                    {selectedLeader.imageUrl && (
                      <AvatarImage src={selectedLeader.imageUrl} alt={selectedLeader.name} />
                    )}
                    <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                      {getInitials(selectedLeader.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 text-center sm:text-left">
                    <DialogTitle className="text-3xl font-display font-bold mb-2" data-testid="text-leader-full-name">
                      {selectedLeader.name}
                    </DialogTitle>
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-4">
                      <Briefcase className="w-5 h-5 text-primary" />
                      <p className="text-lg text-primary font-semibold" data-testid="text-leader-full-title">
                        {selectedLeader.title}
                      </p>
                    </div>
                    
                    {selectedLeader.linkedinUrl && (
                      <Button
                        variant="default"
                        size="sm"
                        asChild
                        data-testid="button-leader-full-linkedin"
                      >
                        <a href={selectedLeader.linkedinUrl} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="w-4 h-4 mr-2" />
                          Connect on LinkedIn
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </DialogHeader>

              <div className="py-6 space-y-6">
                {selectedLeader.bio && (
                  <div>
                    <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-3">
                      Biography
                    </h3>
                    <p className="text-base leading-relaxed whitespace-pre-wrap" data-testid="text-leader-full-bio">
                      {selectedLeader.bio}
                    </p>
                  </div>
                )}

                {!selectedLeader.bio && (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No additional information available for this leader.</p>
                  </div>
                )}
              </div>

              <div className="pt-6 border-t flex gap-3">
                {selectedLeader.linkedinUrl && (
                  <Button
                    variant="outline"
                    className="flex-1"
                    asChild
                    data-testid="button-leader-linkedin-footer"
                  >
                    <a href={selectedLeader.linkedinUrl} target="_blank" rel="noopener noreferrer">
                      <Linkedin className="w-4 h-4 mr-2" />
                      LinkedIn Profile
                    </a>
                  </Button>
                )}
                
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setSelectedLeader(null)}
                  data-testid="button-close-leader"
                >
                  <X className="w-4 h-4 mr-2" />
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
