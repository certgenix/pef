import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Shield, Users, Eye, Target, Globe2 } from "lucide-react";
import chairmanImage from "@assets/image_1763374941295.png";

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

        <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-2">
                PEF Vision
              </h2>
            </div>
            
            <Card className="overflow-hidden">
              <CardContent className="p-0">
                <div className="grid md:grid-cols-2 gap-8 md:gap-0">
                  <div className="p-8 md:p-12 flex items-center justify-center bg-gradient-to-br from-secondary/20 to-primary/10">
                    <div className="max-w-sm">
                      <img 
                        src={chairmanImage} 
                        alt="Chairman & Founder PEF" 
                        className="w-full h-auto rounded-md"
                        data-testid="img-chairman"
                      />
                      <p className="text-center mt-4 text-sm font-medium text-muted-foreground">
                        Chairman & Founder PEF
                      </p>
                    </div>
                  </div>
                  
                  <div className="p-8 md:p-12 flex items-center">
                    <div>
                      <p className="text-lg leading-relaxed text-muted-foreground">
                        To build a trusted and intelligent network where business owners, directors, and professionals connect through meaningful collaboration, creating a smart bridge between opportunities and talent. Our goal is not only to empower job seekers with access to the right people and projects, but also to help discover new business collaborations, unlock investment opportunities, and drive collective growth and integrated success for all.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
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

        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Eye className="w-8 h-8 text-primary" />
              </div>
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-6">
                Our Vision
              </h2>
              <p className="text-lg leading-relaxed text-muted-foreground">
                To become a global leader in professional and business connectivity, enabling individuals and organizations to find the opportunities they need to grow and succeed.
              </p>
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
