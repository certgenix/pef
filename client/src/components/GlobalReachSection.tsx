import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import SA from 'country-flag-icons/react/3x2/SA';
import US from 'country-flag-icons/react/3x2/US';
import CA from 'country-flag-icons/react/3x2/CA';
import GB from 'country-flag-icons/react/3x2/GB';
import AE from 'country-flag-icons/react/3x2/AE';
import PK from 'country-flag-icons/react/3x2/PK';
import NG from 'country-flag-icons/react/3x2/NG';
import DE from 'country-flag-icons/react/3x2/DE';
import IT from 'country-flag-icons/react/3x2/IT';
import FR from 'country-flag-icons/react/3x2/FR';

const countries = [
  { name: "Saudi Arabia", code: "SA", isPrimary: true, comingSoon: false, Flag: SA },
  { name: "United States", code: "US", isPrimary: false, comingSoon: false, Flag: US },
  { name: "Canada", code: "CA", isPrimary: false, comingSoon: false, Flag: CA },
  { name: "United Kingdom", code: "UK", isPrimary: false, comingSoon: false, Flag: GB },
  { name: "Dubai (UAE)", code: "AE", isPrimary: false, comingSoon: false, Flag: AE },
  { name: "Pakistan", code: "PK", isPrimary: false, comingSoon: false, Flag: PK },
  { name: "Nigeria", code: "NG", isPrimary: false, comingSoon: false, Flag: NG },
  { name: "Germany", code: "DE", isPrimary: false, comingSoon: true, Flag: DE },
  { name: "Italy", code: "IT", isPrimary: false, comingSoon: true, Flag: IT },
  { name: "France", code: "FR", isPrimary: false, comingSoon: true, Flag: FR },
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
          Launching first in Saudi Arabia, now open to USA, Canada, UK, Dubai, Pakistan, Nigeria, and more coming soon
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {countries.map((country) => (
            <Card
              key={country.code}
              className={`transition-all duration-300 hover-elevate cursor-pointer overflow-hidden ${
                hoveredCountry === country.code ? "shadow-lg scale-105 border-primary" : ""
              } ${country.isPrimary ? "border-2 border-primary bg-primary/5" : ""}`}
              onMouseEnter={() => setHoveredCountry(country.code)}
              onMouseLeave={() => setHoveredCountry(null)}
              data-testid={`card-country-${country.code.toLowerCase()}`}
            >
              <CardContent className="p-6 text-center relative overflow-visible">
                <div 
                  className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[120px] opacity-[0.15] pointer-events-none select-none ${
                    hoveredCountry === country.code ? "wave-flag-hover" : "wave-flag"
                  }`}
                  style={{ zIndex: 0 }}
                  aria-hidden="true"
                >
                  <country.Flag className="w-full h-auto" />
                </div>
                <h3 className="font-semibold text-lg mb-2 relative z-10">{country.name}</h3>
                {country.isPrimary && (
                  <p className="text-sm text-primary font-semibold relative z-10">Primary Launch Market</p>
                )}
                {!country.isPrimary && !country.comingSoon && (
                  <p className="text-sm text-muted-foreground relative z-10">Supported Region</p>
                )}
                {country.comingSoon && (
                  <p className="text-sm text-muted-foreground relative z-10">Coming Soon</p>
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
