import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, ArrowRight, Users, Shield, Globe2, Briefcase, Search, Building2, Handshake, TrendingUp } from "lucide-react";

const roles = [
  {
    icon: Briefcase,
    title: "Professional",
    description: "Network, showcase your skills, and gain career visibility on the global stage",
    dataCollected: [
      "Years of experience",
      "Industry/sector",
      "Top 5-10 skills",
      "Certifications (optional)",
      "Current job title",
      "Current employer (if applicable)"
    ]
  },
  {
    icon: Search,
    title: "Job Seeker",
    description: "Actively looking for jobs locally or internationally with access to verified employers",
    dataCollected: [
      "Target job titles",
      "Preferred industries",
      "Employment type (full-time/part-time/remote)",
      "Salary expectation range",
      "Availability timeline",
      "Willingness to relocate",
      "Countries you want to work in"
    ]
  },
  {
    icon: Building2,
    title: "Employer",
    description: "Post job openings, hire talent, and find qualified candidates for your organization",
    dataCollected: [
      "Company name",
      "Industry/sector",
      "Open job positions",
      "Job descriptions",
      "Required skills",
      "Job location (local/remote)",
      "Salary range (optional)",
      "Hiring urgency"
    ]
  },
  {
    icon: Handshake,
    title: "Business Owner",
    description: "Seek partnerships, expansion support, investors, and talent for your company",
    dataCollected: [
      "Business/Company name",
      "Industry/sector",
      "Company size",
      "Years in operation",
      "What you're looking for (investors, partners, distributors)",
      "Revenue range (optional)",
      "Capital required (if seeking investment)",
      "Export/expansion countries"
    ]
  },
  {
    icon: TrendingUp,
    title: "Investor",
    description: "Invest in startups, SMEs, new projects, and market opportunities worldwide",
    dataCollected: [
      "Investment amount range",
      "Preferred sectors/industries",
      "Preferred countries to invest in",
      "Investment stage (idea, startup, growth, mature)",
      "Investment type (equity, partnership, joint venture)",
      "Investment thesis",
      "Contact preferences"
    ]
  }
];

const benefits = [
  {
    icon: Users,
    title: "One Profile, Multiple Roles",
    description: "No separate accounts or duplication—choose any combination of the five roles under one profile"
  },
  {
    icon: Shield,
    title: "Verified Membership",
    description: "Every member and opportunity is reviewed before going live—ensuring serious, high-quality, spam-free data"
  },
  {
    icon: Globe2,
    title: "Global Network",
    description: "Connect with professionals, employers, business owners, and investors from around the world"
  }
];

export default function Membership() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary to-[hsl(213,58%,35%)] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="dots" x="0" y="0" width="50" height="50" patternUnits="userSpaceOnUse">
                  <circle cx="25" cy="25" r="2" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#dots)" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Join Professional Executive Forum
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto mb-8">
              Register today and become part of the global database that will power intelligent opportunity matching tomorrow
            </p>
            <Button
              size="lg"
              className="bg-accent hover:bg-accent text-accent-foreground font-semibold text-lg px-10 py-7 min-h-14"
            >
              Register Now
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
              Membership Benefits
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto text-lg">
              Experience a trusted, professional environment designed for global business collaboration and career advancement
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
              {benefits.map((benefit) => {
                const Icon = benefit.icon;
                return (
                  <Card key={benefit.title} className="border-2 hover:border-primary/30 transition-all">
                    <CardContent className="p-8 text-center">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Icon className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="text-xl font-bold mb-3">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="bg-primary/5 border-2 border-primary/20 rounded-lg p-8 max-w-4xl mx-auto">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">Free</div>
                  <div className="text-sm text-muted-foreground">Membership</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">Verified</div>
                  <div className="text-sm text-muted-foreground">Profiles Only</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-primary mb-2">Global</div>
                  <div className="text-sm text-muted-foreground">Database</div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4 text-center">
              Choose Your Roles
            </h2>
            <p className="text-center text-muted-foreground mb-6 max-w-3xl mx-auto text-lg">
              Select any combination of the five roles. For each role you choose, we'll ask a few short, relevant questions to build your structured profile.
            </p>
            <div className="text-center mb-12 max-w-2xl mx-auto">
              <p className="text-sm text-primary font-semibold">
                A single person can be all five at the same time—the system adapts to whatever roles you choose
              </p>
            </div>

            <div className="space-y-6">
              {roles.map((role) => {
                const Icon = role.icon;
                return (
                  <Card key={role.title} className="border-2 hover:border-primary/30 transition-all">
                    <CardContent className="p-8">
                      <div className="flex flex-col md:flex-row gap-6">
                        <div className="flex-shrink-0">
                          <div className="w-16 h-16 bg-primary/10 rounded-xl flex items-center justify-center">
                            <Icon className="w-8 h-8 text-primary" />
                          </div>
                        </div>
                        <div className="flex-grow">
                          <h3 className="text-2xl font-bold mb-2">{role.title}</h3>
                          <p className="text-muted-foreground mb-4">{role.description}</p>
                          <div>
                            <h4 className="font-semibold mb-3 text-sm uppercase tracking-wide text-muted-foreground">
                              Information We Collect:
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {role.dataCollected.map((item, index) => (
                                <div key={index} className="flex items-start gap-2">
                                  <Check className="w-4 h-4 text-primary mt-1 flex-shrink-0" />
                                  <span className="text-sm text-muted-foreground">{item}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-8 text-center">
              How Registration Works
            </h2>

            <div className="space-y-6">
              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      1
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Enter Basic Information</h3>
                      <p className="text-muted-foreground">
                        Provide your name, country, email, phone (optional), city, languages spoken, and a short professional headline and bio.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      2
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Select Your Roles</h3>
                      <p className="text-muted-foreground">
                        Choose any combination of the five roles: Professional, Job Seeker, Employer, Business Owner, or Investor.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      3
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Answer Role-Specific Questions</h3>
                      <p className="text-muted-foreground">
                        For each role you selected, provide structured information through a few short, relevant questions. This data is stored under your single profile.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      4
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Admin Review & Approval</h3>
                      <p className="text-muted-foreground">
                        Our team reviews all submissions to ensure a credible, professional community. Only approved members appear in the public directory.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-2">
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                      5
                    </div>
                    <div>
                      <h3 className="text-xl font-bold mb-2">Start Participating</h3>
                      <p className="text-muted-foreground">
                        Once approved, post or explore jobs, investments, and business partnerships. Stay engaged with newsletters, videos, and community updates.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/10 to-primary/5">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 text-center">
              <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                Ready to Join?
              </h2>
              <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
                Provide your structured information today and join the global database that will power intelligent opportunity matching tomorrow. Every registration helps build the foundation for Phase 2.
              </p>
              <Button
                size="lg"
                className="bg-primary hover:bg-primary text-primary-foreground font-semibold text-lg px-10 py-7 min-h-14"
              >
                Create Your Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
              <p className="text-sm text-muted-foreground mt-6">
                Free membership • Verified profiles only • Global network
              </p>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
