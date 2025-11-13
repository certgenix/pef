import { useState, useEffect, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";

const countries = [
  { name: "Saudi Arabia", code: "SA", isPrimary: true },
  { name: "Canada", code: "CA", isPrimary: false },
  { name: "United Kingdom", code: "UK", isPrimary: false },
  { name: "Germany", code: "DE", isPrimary: false },
  { name: "Italy", code: "IT", isPrimary: false },
];


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
        <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto text-lg">
          Launching first in Saudi Arabia, open to Canada, UK, Germany, Italy, and others from day one
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          {countries.map((country) => (
            <Card
              key={country.code}
              className={`transition-all duration-300 hover-elevate cursor-pointer ${
                hoveredCountry === country.code ? "shadow-lg scale-105 border-primary" : ""
              } ${country.isPrimary ? "border-2 border-primary bg-primary/5" : ""}`}
              onMouseEnter={() => setHoveredCountry(country.code)}
              onMouseLeave={() => setHoveredCountry(null)}
              data-testid={`card-country-${country.code.toLowerCase()}`}
            >
              <CardContent className="p-6 text-center">
                <h3 className="font-semibold text-lg mb-2">{country.name}</h3>
                {country.isPrimary && (
                  <p className="text-sm text-primary font-semibold">Primary Launch Market</p>
                )}
                {!country.isPrimary && (
                  <p className="text-sm text-muted-foreground">Supported Region</p>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="relative w-full bg-muted/30 rounded-lg overflow-hidden p-12">
          <div className="text-center max-w-3xl mx-auto">
            <h3 className="text-2xl md:text-3xl font-display font-bold text-primary mb-4">
              Accepts Registrations From All Over the World
            </h3>
            <p className="text-lg text-muted-foreground">
              While launching first in Saudi Arabia, PEF welcomes professionals, employers, business owners, and investors from across the globe to join our platform and participate in building a massive database of talent and opportunities.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
