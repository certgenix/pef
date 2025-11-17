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
    title: "Video Gallery",
    description: "Watch interviews, presentations, and event highlights from our professional community.",
    color: "bg-purple-500",
  },
  {
    icon: Newspaper,
    title: "Press Releases",
    description: "Official announcements and press materials from PEF and our partners.",
    color: "bg-blue-500",
  },
  {
    icon: Calendar,
    title: "Event Coverage",
    description: "Recordings and highlights from our conferences, webinars, and networking events.",
    color: "bg-orange-500",
  },
  {
    icon: Mail,
    title: "Newsletters",
    description: "Multimedia newsletters featuring opportunities and community highlights.",
    color: "bg-green-500",
  },
];

const featuredVideos = [
  {
    category: "Leadership Interview",
    title: "Building Global Networks: A Conversation with Industry Leaders",
    description: "Join us as we discuss strategies for building meaningful professional connections across borders.",
    duration: "12:45",
  },
  {
    category: "Event Highlights",
    title: "PEF Annual Summit 2025 - Key Takeaways",
    description: "Highlights from our annual summit featuring insights from business leaders and investors.",
    duration: "8:30",
  },
  {
    category: "Tutorial",
    title: "Maximizing Your PEF Membership Benefits",
    description: "Learn how to leverage the full potential of your Professional Executive Forum membership.",
    duration: "6:15",
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
              
              <a 
                href="https://www.linkedin.com/feed/update/urn:li:activity:7393430270223458304?utm_source=share&utm_medium=member_desktop&rcm=ACoAADty3ZQBkH_2WlLwlpoggXcuS2hjtRsePaM"
                target="_blank"
                rel="noopener noreferrer"
                className="block"
                data-testid="link-featured-linkedin-video"
              >
                <Card className="border-2 hover:border-primary transition-all hover-elevate cursor-pointer" data-testid="card-featured-video">
                  <CardContent className="p-0">
                    <div className="aspect-video bg-gradient-to-br from-[#0077B5] to-[#00A0DC] relative flex items-center justify-center">
                      <div className="absolute inset-0 bg-black/20"></div>
                      <div className="relative z-10 text-center text-white">
                        <div className="w-24 h-24 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 mx-auto hover:bg-white/30 transition-all">
                          <Play className="w-12 h-12 text-white ml-2" />
                        </div>
                        <div className="flex items-center justify-center gap-2 mb-2">
                          <SiLinkedin className="w-8 h-8" />
                          <span className="text-xl font-semibold">LinkedIn Video</span>
                        </div>
                        <p className="text-white/90 text-sm flex items-center justify-center gap-1">
                          Click to watch on LinkedIn
                          <ExternalLink className="w-4 h-4" />
                        </p>
                      </div>
                    </div>
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Badge variant="secondary" data-testid="badge-video-category">
                          Featured Content
                        </Badge>
                        <Badge className="bg-[#0077B5] hover:bg-[#0077B5]" data-testid="badge-linkedin">
                          <SiLinkedin className="w-3 h-3 mr-1" />
                          LinkedIn
                        </Badge>
                      </div>
                      <h3 className="text-2xl font-bold mb-2" data-testid="text-video-title">
                        Professional Executive Forum on LinkedIn
                      </h3>
                      <p className="text-muted-foreground mb-4" data-testid="text-video-description">
                        Watch our featured video post on LinkedIn. Connect with us to stay updated on the latest insights, events, and opportunities from the Professional Executive Forum community.
                      </p>
                      <div className="flex items-center gap-2 text-primary font-semibold" data-testid="text-watch-linkedin">
                        Watch on LinkedIn
                        <ExternalLink className="w-4 h-4" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </a>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {mediaCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <Card key={category.title} className="border-2 hover:border-primary/30 transition-all hover-elevate" data-testid={`card-category-${category.title.toLowerCase().replace(/\s+/g, "-")}`}>
                    <CardContent className="p-6">
                      <div className={`w-16 h-16 ${category.color} rounded-full flex items-center justify-center mb-4`}>
                        <Icon className="w-8 h-8 text-white" />
                      </div>
                      <h3 className="text-lg font-bold mb-2">{category.title}</h3>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">
              Video Gallery
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {featuredVideos.map((video, index) => (
                <Card key={index} className="border-2 hover:border-primary/30 transition-all overflow-hidden hover-elevate" data-testid={`card-video-${index}`}>
                  <div className="aspect-video bg-gradient-to-br from-primary/20 to-primary/5 relative flex items-center justify-center">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-16 h-16 rounded-full bg-primary/80 flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                        <Video className="w-8 h-8 text-white ml-1" />
                      </div>
                    </div>
                    <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.duration}
                    </div>
                  </div>
                  <CardHeader>
                    <Badge variant="secondary" className="w-fit mb-2" data-testid={`badge-category-${index}`}>
                      {video.category}
                    </Badge>
                    <CardTitle className="text-lg" data-testid={`text-video-title-${index}`}>
                      {video.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">{video.description}</p>
                    <Button variant="outline" size="sm" data-testid={`button-watch-${index}`}>
                      Watch Now
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center">
              <Button size="lg" className="min-h-12" data-testid="button-view-all-videos">
                View All Videos
              </Button>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="bg-primary/10 rounded-lg p-8">
              <Mail className="w-12 h-12 text-primary mx-auto mb-4" />
              <h2 className="text-2xl md:text-3xl font-display font-bold mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-muted-foreground mb-6">
                Receive periodic updates featuring new videos, opportunities, and community highlights
              </p>
              <Button size="lg" className="min-h-12" data-testid="button-subscribe">
                Subscribe Now
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
