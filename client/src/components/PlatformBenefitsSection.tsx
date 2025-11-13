import { useEffect, useRef, useState } from "react";
import { Check, Globe2, Users, Shield, FileText, Newspaper } from "lucide-react";

const benefits = [
  {
    icon: Globe2,
    title: "Global Reach",
    description: "Connect with members from multiple countries and industries worldwide",
  },
  {
    icon: Users,
    title: "One Profile, Multiple Roles",
    description: "A single person can participate in multiple capacities on one platform",
  },
  {
    icon: Shield,
    title: "Verified Membership",
    description: "Each profile is reviewed and approved to ensure accuracy and quality",
  },
  {
    icon: FileText,
    title: "Structured Opportunities",
    description: "Access curated listings for jobs, investments, and business partnerships",
  },
  {
    icon: Newspaper,
    title: "Engaging Content",
    description: "Stay informed through newsletters, insights, and video interviews",
  },
];

export default function PlatformBenefitsSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.2 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section className="py-16 md:py-24 bg-background" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2
              className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6"
              data-testid="text-benefits-title"
            >
              Why Join PEF?
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              Professional Executive Forum provides a trusted environment for global business collaboration and
              professional growth.
            </p>

            <div className="space-y-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className={`flex gap-4 transition-all duration-500 ${
                      isVisible
                        ? "opacity-100 translate-x-0"
                        : "opacity-0 -translate-x-8"
                    }`}
                    style={{ transitionDelay: `${index * 100}ms` }}
                    data-testid={`benefit-${benefit.title.toLowerCase().replace(/\s+/g, "-")}`}
                  >
                    <div className="flex-shrink-0 w-12 h-12 bg-primary/10 rounded-md flex items-center justify-center">
                      <Check className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-2">{benefit.title}</h3>
                      <p className="text-muted-foreground">{benefit.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="relative">
            <div className="grid grid-cols-2 gap-6">
              {benefits.map((benefit, index) => {
                const Icon = benefit.icon;
                return (
                  <div
                    key={benefit.title}
                    className={`p-6 bg-card border border-card-border rounded-md hover-elevate transition-all duration-500 ${
                      isVisible
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-8"
                    }`}
                    style={{ transitionDelay: `${index * 150}ms` }}
                  >
                    <Icon className="w-10 h-10 text-primary mb-3" />
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
