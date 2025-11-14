import { useEffect, useRef, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Globe2, Users, Shield, FileText, Newspaper, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

const benefits = [
  {
    icon: Globe2,
    title: "Global Member Directory",
    description: "Browse approved members by country, industry, and role with high-quality, structured data",
    color: "from-blue-500 to-cyan-500",
    iconBg: "bg-blue-500/10",
    iconColor: "text-blue-600",
  },
  {
    icon: Users,
    title: "One Profile, Multiple Roles",
    description: "No separate accounts or duplication—choose any combination of the five roles under one profile",
    color: "from-purple-500 to-pink-500",
    iconBg: "bg-purple-500/10",
    iconColor: "text-purple-600",
  },
  {
    icon: Shield,
    title: "Strong Admin Approval",
    description: "Every member and opportunity is reviewed before going live—ensuring serious, high-quality, spam-free data",
    color: "from-green-500 to-emerald-500",
    iconBg: "bg-green-500/10",
    iconColor: "text-green-600",
  },
  {
    icon: FileText,
    title: "Post & Explore Opportunities",
    description: "Employers post jobs, investors share opportunities, business owners seek partnerships—all in one place",
    color: "from-orange-500 to-amber-500",
    iconBg: "bg-orange-500/10",
    iconColor: "text-orange-600",
  },
  {
    icon: Newspaper,
    title: "Active Community Content",
    description: "Stay engaged with news, videos, newsletters, and weekly updates while data grows",
    color: "from-indigo-500 to-blue-500",
    iconBg: "bg-indigo-500/10",
    iconColor: "text-indigo-600",
  },
];

export default function PlatformBenefitsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-gradient-to-br from-background via-secondary/5 to-accent/5 relative overflow-hidden" ref={ref}>
      <div className="absolute inset-0 opacity-5">
        <div className="absolute top-0 left-0 w-96 h-96 bg-secondary rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 rounded-full blur-3xl bg-[#f5f1eb]" />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-2 bg-primary/10 rounded-full mb-4">
            <span className="text-sm font-semibold text-primary">Platform Benefits</span>
          </div>
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-4"
            data-testid="text-benefits-title"
          >
            What PEF Does
          </h2>
          <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
            Building a high-quality global platform connecting talent, business opportunities, and investment prospects through intelligent matching and community engagement
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {benefits.map((benefit, index) => {
            const Icon = benefit.icon;
            const isHovered = hoveredIndex === index;

            return (
              <Card
                key={benefit.title}
                className={`group relative overflow-hidden border-2 transition-all duration-500 hover-elevate ${
                  isVisible
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-12"
                } ${isHovered ? "shadow-2xl border-primary/30 scale-105" : "border-transparent shadow-lg"}`}
                style={{ transitionDelay: `${index * 100}ms` }}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                data-testid={`benefit-${benefit.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${benefit.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`} />
                <CardContent className="p-8 relative">
                  <div className={`w-16 h-16 ${benefit.iconBg} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <Icon className={`w-8 h-8 ${benefit.iconColor}`} />
                  </div>
                  
                  <h3 className="text-xl font-display font-bold mb-3 group-hover:text-primary transition-colors">
                    {benefit.title}
                  </h3>
                  
                  <p className="text-muted-foreground leading-relaxed mb-4">
                    {benefit.description}
                  </p>

                  <div className={`flex items-center text-primary font-semibold text-sm transition-all duration-300 ${
                    isHovered ? "translate-x-2 opacity-100" : "opacity-0"
                  }`}>
                    Learn more
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Link href="/register">
            <Button
              size="lg"
              className="bg-primary hover:bg-primary text-primary-foreground font-semibold px-8 min-h-12 group"
              data-testid="button-get-started"
            >
              Get Started Today
              <ArrowRight className="ml-2 w-5 h-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
