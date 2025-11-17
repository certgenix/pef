import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Video, Mail, Calendar, ExternalLink, Play } from "lucide-react";
import { SiLinkedin } from "react-icons/si";

const mediaCategories = [
  {
    icon: Video,
    title: "Video Content",
    description: "Interviews, presentations, and event highlights",
    color: "bg-purple-500",
  },
  {
    icon: Newspaper,
    title: "News & Press",
    description: "Latest announcements and media coverage",
    color: "bg-blue-500",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Conferences, webinars, and networking events",
    color: "bg-orange-500",
  },
];

export default function Media() {
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
              Media Center
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Explore videos, interviews, and multimedia content from PEF
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="mb-16">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
                Featured Video
              </h2>
              
              <Card className="border-2 border-primary" data-testid="card-featured-video">
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden rounded-t-lg">
                    <iframe
                      className="w-full h-full"
                      src="https://www.youtube.com/embed/Z6qLKDD3T3c"
                      title="Professional Executive Forum Featured Video"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      allowFullScreen
                      data-testid="iframe-featured-video"
                    />
                  </div>
                  <div className="p-6">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <Badge variant="secondary" data-testid="badge-video-category">
                        Featured Content
                      </Badge>
                      <Badge className="bg-red-600 hover:bg-red-700" data-testid="badge-youtube">
                        <Video className="w-3 h-3 mr-1" />
                        YouTube
                      </Badge>
                    </div>
                    <h3 className="text-2xl font-bold mb-2" data-testid="text-video-title">
                      Professional Executive Forum Introduction
                    </h3>
                    <p className="text-muted-foreground mb-4" data-testid="text-video-description">
                      Learn about the Professional Executive Forum and how we're building a global network connecting professionals, employers, business owners, and investors through structured data and intelligent opportunity matching.
                    </p>
                    <a 
                      href="https://www.youtube.com/watch?v=Z6qLKDD3T3c"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-primary font-semibold hover:underline"
                      data-testid="link-watch-youtube"
                    >
                      Watch on YouTube
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
              Media Categories
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              {mediaCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.title} className="hover:border-primary/30 transition-all hover-elevate text-center" data-testid={`card-category-${category.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    <CardContent className="p-8">
                      <div className={`w-20 h-20 ${category.color} rounded-full flex items-center justify-center mb-4 mx-auto`}>
                        <Icon className="w-10 h-10 text-white" />
                      </div>
                      <h3 className="text-xl font-bold mb-2">{category.title}</h3>
                      <p className="text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
              Stay Connected
            </h2>
            <p className="text-muted-foreground mb-8 text-lg">
              Follow us on social media for the latest updates, videos, and opportunities
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <a
                href="https://www.linkedin.com/groups/15770115/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button size="lg" className="min-h-12 gap-2" data-testid="button-linkedin">
                  <SiLinkedin className="w-5 h-5" />
                  Join our LinkedIn Group
                </Button>
              </a>
              <a
                href="https://www.youtube.com/watch?v=Z6qLKDD3T3c"
                target="_blank"
                rel="noopener noreferrer"
              >
                <Button variant="outline" size="lg" className="min-h-12 gap-2" data-testid="button-youtube">
                  <Video className="w-5 h-5" />
                  Subscribe on YouTube
                </Button>
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
