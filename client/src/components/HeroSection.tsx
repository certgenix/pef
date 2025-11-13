import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import heroImage from "@assets/generated_images/Professional_business_handshake_hero_9421906c.png";

interface StatProps {
  end: number;
  label: string;
  suffix?: string;
}

function AnimatedStat({ end, label, suffix = "" }: StatProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 2000;
          const steps = 60;
          const increment = end / steps;
          let current = 0;

          const timer = setInterval(() => {
            current += increment;
            if (current >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(current));
            }
          }, duration / steps);

          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, [end, hasAnimated]);

  return (
    <div ref={ref} className="text-center" data-testid={`stat-${label.toLowerCase().replace(/\s+/g, "-")}`}>
      <div className="text-3xl md:text-4xl font-bold text-white mb-1">
        {count.toLocaleString()}
        {suffix}
      </div>
      <div className="text-sm md:text-base text-white/80">{label}</div>
    </div>
  );
}

export default function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroImage})`,
          backgroundAttachment: "fixed",
        }}
      />
      <div className="absolute inset-0 bg-primary/75" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-32 text-center">
        <h1
          className="text-4xl md:text-6xl lg:text-7xl font-display font-bold text-white mb-6 animate-in fade-in slide-in-from-bottom-4 duration-700"
          data-testid="text-hero-title"
        >
          Professional Executive Forum
        </h1>

        <p
          className="text-lg md:text-xl lg:text-2xl text-white/90 max-w-4xl mx-auto mb-10 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150"
          data-testid="text-hero-subtitle"
        >
          A global digital platform collecting structured information from professionals, job seekers, employers, business owners, and investors to power intelligent opportunity matching
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          <Button
            size="lg"
            className="bg-accent hover:bg-accent text-accent-foreground font-semibold text-lg px-8 py-6 min-h-14"
            data-testid="button-join-forum"
          >
            Join the Forum
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-2 border-white text-white hover:bg-white/10 backdrop-blur-sm font-semibold text-lg px-8 py-6 min-h-14"
            data-testid="button-explore"
          >
            Explore Opportunities
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500">
          <AnimatedStat end={15000} label="Active Members" suffix="+" />
          <AnimatedStat end={2500} label="Opportunities Posted" suffix="+" />
          <AnimatedStat end={25} label="Countries Served" suffix="+" />
        </div>
      </div>
    </section>
  );
}
