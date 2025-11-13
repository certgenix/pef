import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Newspaper, Video, Mail, Calendar } from "lucide-react";

const newsCategories = [
  {
    icon: Newspaper,
    title: "News & Updates",
    description: "Articles and announcements related to professional development, business trends, and international markets.",
    color: "bg-blue-500",
  },
  {
    icon: Video,
    title: "Video Interviews",
    description: "Conversations with business leaders, investors, and industry experts.",
    color: "bg-purple-500",
  },
  {
    icon: Mail,
    title: "Newsletters",
    description: "Periodic newsletters featuring notable opportunities and community highlights.",
    color: "bg-green-500",
  },
  {
    icon: Calendar,
    title: "Events",
    description: "Information on upcoming conferences, networking events, and professional gatherings.",
    color: "bg-orange-500",
  },
];

const sampleArticles = [
  {
    category: "Business Trends",
    title: "The Future of Professional Networks in the MENA Region",
    excerpt: "Exploring how digital platforms are transforming professional connectivity across Middle East and North Africa...",
    date: "November 10, 2025",
    readTime: "5 min read",
  },
  {
    category: "Professional Development",
    title: "Essential Skills for International Business Collaboration",
    excerpt: "Key competencies professionals need to succeed in global business partnerships and cross-border opportunities...",
    date: "November 8, 2025",
    readTime: "7 min read",
  },
  {
    category: "Investment Insights",
    title: "Emerging Sectors Attracting International Investment in Saudi Arabia",
    excerpt: "A comprehensive analysis of growth sectors and investment opportunities in the Kingdom's evolving economy...",
    date: "November 5, 2025",
    readTime: "6 min read",
  },
];

export default function News() {
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
              News & Media
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Stay informed with insights, interviews, and industry updates
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
              {newsCategories.map((category) => {
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
              Latest Articles
            </h2>

            <div className="space-y-6">
              {sampleArticles.map((article, index) => (
                <Card key={index} className="border-2 hover:border-primary/30 transition-all" data-testid={`card-article-${index}`}>
                  <CardHeader>
                    <div className="flex flex-wrap items-start justify-between gap-4 mb-2">
                      <Badge variant="secondary" data-testid={`badge-category-${index}`}>{article.category}</Badge>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span>{article.date}</span>
                        <span>{article.readTime}</span>
                      </div>
                    </div>
                    <CardTitle className="text-2xl" data-testid={`text-article-title-${index}`}>{article.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground mb-4">{article.excerpt}</p>
                    <Button variant="outline" data-testid={`button-read-more-${index}`}>Read More</Button>
                  </CardContent>
                </Card>
              ))}
            </div>

            <div className="text-center mt-12">
              <Button size="lg" className="min-h-12" data-testid="button-view-all-articles">
                View All Articles
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
                Receive periodic newsletters featuring notable opportunities and community highlights
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
