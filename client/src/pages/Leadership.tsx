import { useQuery } from "@tanstack/react-query";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Linkedin, Users2 } from "lucide-react";
import type { Leader } from "@shared/schema";

export default function Leadership() {
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
              Meet the visionaries behind Professional Executive Forum
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading leadership team...</p>
              </div>
            ) : leaders && leaders.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {leaders.map((leader) => (
                  <Card key={leader.id} className="border-2 hover:border-primary/30 transition-all hover-elevate" data-testid={`card-leader-${leader.id}`}>
                    <CardContent className="p-6 text-center">
                      <Avatar className="w-32 h-32 mx-auto mb-4" data-testid={`avatar-leader-${leader.id}`}>
                        {leader.imageUrl && (
                          <AvatarImage src={leader.imageUrl} alt={leader.name} />
                        )}
                        <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                          {getInitials(leader.name)}
                        </AvatarFallback>
                      </Avatar>
                      
                      <h3 className="text-xl font-display font-bold mb-1" data-testid={`text-leader-name-${leader.id}`}>
                        {leader.name}
                      </h3>
                      <p className="text-sm text-primary font-semibold mb-4" data-testid={`text-leader-title-${leader.id}`}>
                        {leader.title}
                      </p>
                      
                      {leader.bio && (
                        <p className="text-sm text-muted-foreground mb-4 line-clamp-4" data-testid={`text-leader-bio-${leader.id}`}>
                          {leader.bio}
                        </p>
                      )}
                      
                      {leader.linkedinUrl && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full"
                          asChild
                          data-testid={`button-leader-linkedin-${leader.id}`}
                        >
                          <a href={leader.linkedinUrl} target="_blank" rel="noopener noreferrer">
                            <Linkedin className="w-4 h-4 mr-2" />
                            Connect on LinkedIn
                          </a>
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No leadership team members to display at this time.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
