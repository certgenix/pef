import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Eye, Target, Globe2 } from "lucide-react";
import chairmanImage from "@assets/image_1763374410897.png";

export default function About() {
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
              About Professional Executive Forum
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Connecting professionals, job seekers, employers, business owners, and investors worldwide
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
              Who We Are
            </h2>
            <div className="prose prose-lg max-w-none">
              <p className="text-lg leading-relaxed text-muted-foreground">
                Professional Executive Forum (PEF) is an international platform committed to supporting economic collaboration by connecting key stakeholders across industries and countries. We bring together professionals, entrepreneurs, employers, and investors to help them access opportunities and build meaningful partnerships.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-br from-[hsl(191,100%,60%)] to-[hsl(191,90%,45%)] relative overflow-hidden">
          <div className="absolute top-0 right-0 w-1/3 h-full opacity-20">
            <svg className="w-full h-full" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">
              <path fill="white" d="M45.5,-67.3C57.4,-58.5,64.3,-43.3,69.8,-27.5C75.3,-11.7,79.4,4.7,76.8,20.1C74.2,35.5,64.9,49.9,52.7,60.1C40.5,70.3,25.4,76.3,9.5,79.8C-6.4,83.3,-23.1,84.3,-37.8,78.1C-52.5,71.9,-65.2,58.5,-72.4,42.8C-79.6,27.1,-81.3,9.1,-78.7,-7.9C-76.1,-24.9,-69.2,-41,-58.4,-52.8C-47.6,-64.6,-33,-72.1,-17.8,-73.6C-2.6,-75.1,13.2,-70.6,27.4,-63.8C41.6,-57,54.2,-47.9,45.5,-67.3Z" transform="translate(100 100)" />
            </svg>
          </div>
          
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-12 text-center text-white">
              PEF Vision
            </h2>
            
            <div className="grid md:grid-cols-[300px,1fr] gap-8 md:gap-12 items-center">
              <div className="flex flex-col items-center md:items-start" data-testid="chairman-profile">
                <div className="mb-4 rounded-md overflow-hidden shadow-xl">
                  <img 
                    src={chairmanImage} 
                    alt="Chairman & Founder PEF" 
                    className="w-64 h-auto object-cover"
                    data-testid="img-chairman"
                  />
                </div>
                <p className="text-white font-semibold text-lg text-center md:text-left" data-testid="text-chairman-title">
                  Chairman & Founder PEF
                </p>
              </div>
              
              <div className="text-white" data-testid="vision-statement">
                <p className="text-lg md:text-xl lg:text-2xl leading-relaxed">
                  To build a trusted and intelligent network where business owners, directors, and professionals connect through meaningful collaboration, creating a smart bridge between opportunities and talent. Our goal is not only to empower job seekers with access to the right people and projects, but also to help discover new business collaborations, unlock investment opportunities, and drive collective growth and integrated success for all.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <div className="w-16 h-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="w-8 h-8 text-secondary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-8">
                Our Mission
              </h2>
            </div>
            <Card>
              <CardContent className="p-8">
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                    <span className="text-lg text-muted-foreground">Build a verified global directory of professionals and organizations.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                    <span className="text-lg text-muted-foreground">Collect structured data to drive intelligent opportunity matching.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                    <span className="text-lg text-muted-foreground">Facilitate business collaborations, investments, and talent exchange.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                    <span className="text-lg text-muted-foreground">Provide reliable content and insights that support career and business growth.</span>
                  </li>
                  <li className="flex items-start gap-3">
                    <span className="text-primary font-bold text-xl flex-shrink-0">✓</span>
                    <span className="text-lg text-muted-foreground">Act as a trusted platform for cross-border professional engagement.</span>
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
              Our Values
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Integrity</h3>
                  <p className="text-muted-foreground">
                    We uphold the highest standards of honesty and ethical conduct in all our interactions.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Professionalism</h3>
                  <p className="text-muted-foreground">
                    We maintain excellence and quality in every aspect of our platform and service.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Eye className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Transparency</h3>
                  <p className="text-muted-foreground">
                    We operate with openness and clarity, building trust through honest communication.
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Collaboration</h3>
                  <p className="text-muted-foreground">
                    We foster partnerships and connections that create mutual value for all stakeholders.
                  </p>
                </CardContent>
              </Card>

              <Card className="md:col-span-2 lg:col-span-1">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Globe2 className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Global Impact</h3>
                  <p className="text-muted-foreground">
                    We strive to create meaningful change across borders and industries worldwide.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
