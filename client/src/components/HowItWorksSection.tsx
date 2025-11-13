import { useEffect, useRef, useState } from "react";
import { UserPlus, FileEdit, CheckCircle, Briefcase, Bell } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  {
    icon: UserPlus,
    title: "Register Online",
    description: "Sign up and select your roles — Professional, Job Seeker, Employer, Business Owner, Investor — or any combination.",
  },
  {
    icon: FileEdit,
    title: "Complete Your Profile",
    description: "Provide essential information about your skills, experience, business, or investment interests.",
    note: "We focus on clarity, accuracy, and data quality.",
  },
  {
    icon: CheckCircle,
    title: "Profile Review & Approval",
    description: "Our team reviews all submissions to ensure a credible, professional community.",
    note: "Approved members receive an email confirmation and access to member features.",
  },
  {
    icon: Briefcase,
    title: "Access Opportunities",
    description: "Members can:",
    bullets: [
      "Post or explore job opportunities",
      "Share investment or partnership proposals",
      "Connect with professionals and organizations",
      "Showcase their business or areas of expertise",
    ],
  },
  {
    icon: Bell,
    title: "Stay Informed",
    description: "Receive newsletters, watch interviews, read articles, and stay updated on key developments.",
  },
];

export default function HowItWorksSection() {
  const [visibleSteps, setVisibleSteps] = useState<number[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          steps.forEach((_, index) => {
            setTimeout(() => {
              setVisibleSteps((prev) => [...prev, index]);
            }, index * 200);
          });
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
    <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/10 to-primary/5 overflow-hidden" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center mb-4"
          data-testid="text-how-it-works-title"
        >
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto text-lg">
          Join our global community in five simple steps
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 max-w-7xl mx-auto mb-8">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isVisible = visibleSteps.includes(index);

            return (
              <Card
                key={step.title}
                className={`relative transition-all duration-500 ${
                  isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                }`}
                data-testid={`step-${index + 1}`}
              >
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg mb-3">
                      <Icon className="w-8 h-8 text-primary-foreground" />
                    </div>
                    <div className="text-center">
                      <span className="text-sm font-bold text-primary">Step {index + 1}</span>
                    </div>
                  </div>
                  <h3 className="text-lg font-display font-semibold mb-3 text-center">{step.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-center mb-2">
                    {step.description}
                  </p>
                  {step.bullets && (
                    <ul className="space-y-1 mt-3">
                      {step.bullets.map((bullet, i) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="text-primary mt-0.5 flex-shrink-0">•</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {step.note && (
                    <p className="text-xs text-muted-foreground/80 italic mt-2 text-center">
                      {step.note}
                    </p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
