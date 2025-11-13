import { useEffect, useRef, useState } from "react";
import { UserPlus, FileEdit, CheckCircle, Briefcase, Bell } from "lucide-react";

const steps = [
  {
    icon: UserPlus,
    title: "Register Online",
    description: "Sign up and select your roles — any combination of the five available roles",
  },
  {
    icon: FileEdit,
    title: "Complete Profile",
    description: "Provide essential information about your skills, experience, or investment interests",
  },
  {
    icon: CheckCircle,
    title: "Review & Approval",
    description: "Our team reviews all submissions to ensure a credible, professional community",
  },
  {
    icon: Briefcase,
    title: "Access Opportunities",
    description: "Post or explore jobs, investments, and business partnership opportunities",
  },
  {
    icon: Bell,
    title: "Stay Informed",
    description: "Receive newsletters, watch interviews, and stay updated on key developments",
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
    <section className="py-16 md:py-24 bg-gradient-to-br from-secondary/10 to-primary/5" ref={ref}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center mb-4"
          data-testid="text-how-it-works-title"
        >
          How It Works
        </h2>
        <p className="text-center text-muted-foreground mb-16 max-w-2xl mx-auto">
          Join our global community in five simple steps
        </p>

        <div className="relative px-8">
          <div className="hidden md:block absolute top-[40px] left-[10%] right-[10%] h-1 bg-primary/20" />
          <div
            className="hidden md:block absolute top-[40px] left-[10%] h-1 bg-primary transition-all duration-1000"
            style={{ width: `${((visibleSteps.length / steps.length) * 80)}%` }}
          />

          <div className="grid grid-cols-1 md:grid-cols-5 gap-6 relative">
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isVisible = visibleSteps.includes(index);

              return (
                <div
                  key={step.title}
                  className={`text-center transition-all duration-500 ${
                    isVisible ? "opacity-100 scale-100" : "opacity-0 scale-90"
                  }`}
                  data-testid={`step-${index + 1}`}
                >
                  <div className="relative mb-6">
                    <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg relative z-10">
                      <Icon className="w-10 h-10 text-primary-foreground" />
                    </div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-24 h-24 bg-primary/20 rounded-full blur-sm" />
                  </div>
                  <h3 className="text-base md:text-lg font-display font-semibold mb-2">{step.title}</h3>
                  <p className="text-xs md:text-sm text-muted-foreground leading-relaxed">{step.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
