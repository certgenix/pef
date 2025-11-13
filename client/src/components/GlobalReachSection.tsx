import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

const countries = [
  { name: "Saudi Arabia", flag: "🇸🇦", members: 5200, code: "SA" },
  { name: "Canada", flag: "🇨🇦", members: 3100, code: "CA" },
  { name: "United Kingdom", flag: "🇬🇧", members: 2800, code: "UK" },
  { name: "Germany", flag: "🇩🇪", members: 1900, code: "DE" },
  { name: "Italy", flag: "🇮🇹", members: 1500, code: "IT" },
];

interface CounterProps {
  end: number;
  suffix?: string;
}

function AnimatedCounter({ end, suffix = "" }: CounterProps) {
  const [count, setCount] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const duration = 1500;
          const steps = 50;
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
    <span ref={ref}>
      {count.toLocaleString()}
      {suffix}
    </span>
  );
}

export default function GlobalReachSection() {
  const [hoveredCountry, setHoveredCountry] = useState<string | null>(null);

  return (
    <section className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center mb-4"
          data-testid="text-global-reach-title"
        >
          Global Reach
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto text-lg">
          Launching first in Saudi Arabia, open to Canada, UK, Germany, Italy, and others from day one
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {countries.map((country) => (
            <Card
              key={country.code}
              className={`transition-all duration-300 hover-elevate cursor-pointer ${
                hoveredCountry === country.code ? "shadow-lg scale-105 border-primary" : ""
              }`}
              onMouseEnter={() => setHoveredCountry(country.code)}
              onMouseLeave={() => setHoveredCountry(null)}
              data-testid={`card-country-${country.code.toLowerCase()}`}
            >
              <CardContent className="p-6 text-center">
                <div className="text-5xl mb-3">{country.flag}</div>
                <h3 className="font-semibold mb-2">{country.name}</h3>
                <p className="text-2xl font-bold text-primary">
                  <AnimatedCounter end={country.members} suffix="+" />
                </p>
                <p className="text-sm text-muted-foreground">Members</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative w-full h-64 bg-muted/30 rounded-lg overflow-hidden">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="text-6xl font-display font-bold text-primary mb-2">
                <AnimatedCounter end={25} suffix="+" />
              </div>
              <p className="text-xl text-muted-foreground">Countries Worldwide</p>
            </div>
          </div>
          <div className="absolute inset-0 opacity-10">
            <svg viewBox="0 0 800 400" className="w-full h-full">
              <circle cx="150" cy="100" r="3" fill="currentColor" className="text-primary" />
              <circle cx="250" cy="150" r="3" fill="currentColor" className="text-primary" />
              <circle cx="400" cy="120" r="3" fill="currentColor" className="text-primary" />
              <circle cx="550" cy="180" r="3" fill="currentColor" className="text-primary" />
              <circle cx="650" cy="140" r="3" fill="currentColor" className="text-primary" />
              <path
                d="M 150 100 Q 200 125 250 150"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-primary"
              />
              <path
                d="M 250 150 Q 325 135 400 120"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-primary"
              />
              <path
                d="M 400 120 Q 475 150 550 180"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-primary"
              />
              <path
                d="M 550 180 Q 600 160 650 140"
                stroke="currentColor"
                strokeWidth="1"
                fill="none"
                className="text-primary"
              />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
