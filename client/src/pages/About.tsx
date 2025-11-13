import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Database, Users, TrendingUp, Shield, Globe2, Zap } from "lucide-react";

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
              A global digital platform collecting structured information to power intelligent opportunity matching
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
              Our Mission
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-lg leading-relaxed mb-6">
                Professional Executive Forum (PEF) is a global digital platform that collects structured information from professionals at all levels—including job seekers, employers, business owners, and investors—and uses that data to power intelligent opportunity matching.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                This creates a massive, high-quality global database of talent, business opportunities, and investment prospects.
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
              How the Multi-Role System Works
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto text-lg">
              When registering, any person can select one or more of the five available roles
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">1. Register</h3>
                  <p className="text-muted-foreground">
                    Enter basic information: name, country, email
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">2. Select Roles</h3>
                  <p className="text-muted-foreground">
                    Choose any combination of the five roles
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <h3 className="text-xl font-bold mb-3">3. Provide Information</h3>
                  <p className="text-muted-foreground">
                    Answer a few short, relevant questions for each role
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="bg-primary/5 border border-primary/20 rounded-lg p-6 max-w-3xl mx-auto">
              <p className="text-center text-muted-foreground">
                The platform stores all role data under one single profile. <strong>No separate accounts. No duplication. No confusion.</strong>
              </p>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
              What the Platform Does
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center mb-4">
                    <Database className="w-7 h-7 text-primary" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Phase 1: Data Collection</h3>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Accepts registrations from all over the world</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Stores structured, high-quality information</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Shows public Member Directory (approved members only)</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Allows employers to post jobs</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Allows investors and business owners to post opportunities</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Strong admin approval ensures quality</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">✓</span>
                      <span>Publishes content: news, videos, newsletters</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="border-2 hover:border-primary/30 transition-colors">
                <CardContent className="p-8">
                  <div className="w-14 h-14 bg-amber-500/10 rounded-xl flex items-center justify-center mb-4">
                    <Zap className="w-7 h-7 text-amber-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-3">Phase 2: AI Matching (Future)</h3>
                  <p className="text-muted-foreground mb-4">
                    Once enough data is collected, PEF will be able to:
                  </p>
                  <ul className="space-y-2 text-muted-foreground">
                    <li className="flex items-start">
                      <span className="mr-2">→</span>
                      <span>Match investors with businesses</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">→</span>
                      <span>Match job seekers with employers</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">→</span>
                      <span>Match professionals with partnerships</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">→</span>
                      <span>Provide analytics on industry trends</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">→</span>
                      <span>Identify skill gaps and investment patterns</span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2">→</span>
                      <span>Offer insights to chambers and government</span>
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/10 to-primary/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-12 text-center">
              Our Core Values
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Quality First</h3>
                <p className="text-muted-foreground">
                  Every member and opportunity is reviewed and approved to ensure a credible, professional, spam-free community
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Globe2 className="w-8 h-8 text-green-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Global Reach</h3>
                <p className="text-muted-foreground">
                  Launching first in Saudi Arabia, but open to professionals, employers, business owners, and investors worldwide
                </p>
              </div>

              <div className="text-center">
                <div className="w-16 h-16 bg-purple-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-purple-600" />
                </div>
                <h3 className="text-xl font-bold mb-3">Flexibility</h3>
                <p className="text-muted-foreground">
                  One profile, multiple roles—choose any combination that fits your needs and participate in multiple capacities
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
              The Power of Structured Data
            </h2>
            <div className="prose prose-lg max-w-none text-muted-foreground">
              <p className="text-lg leading-relaxed mb-6">
                Unlike traditional platforms, PEF focuses on collecting <strong>structured information</strong>—high-quality, consistent data that can be used later for intelligent matching.
              </p>
              <p className="text-lg leading-relaxed mb-6">
                This means every piece of information is organized, verified, and ready to power future AI-driven connections between:
              </p>
              <ul className="space-y-2 mb-6">
                <li>Investors seeking the right business opportunities</li>
                <li>Employers looking for qualified talent</li>
                <li>Job seekers finding their ideal positions</li>
                <li>Business owners exploring partnerships and growth</li>
                <li>Professionals expanding their network globally</li>
              </ul>
              <p className="text-lg leading-relaxed">
                By building this database now, we're creating the foundation for tomorrow's intelligent opportunity ecosystem.
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
