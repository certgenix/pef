import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Search, Building2, Handshake, TrendingUp } from "lucide-react";

const roles = [
  {
    icon: Briefcase,
    title: "Professional",
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    description: "Enhance your visibility, expand your network, and access new opportunities globally",
  },
  {
    icon: Search,
    title: "Job Seeker",
    color: "bg-green-500",
    borderColor: "border-green-500",
    description: "Explore employment opportunities locally and internationally with verified employers",
  },
  {
    icon: Building2,
    title: "Employer",
    color: "bg-purple-500",
    borderColor: "border-purple-500",
    description: "Find qualified candidates and build your team with trusted professional profiles",
  },
  {
    icon: Handshake,
    title: "Business Owner",
    color: "bg-orange-500",
    borderColor: "border-orange-500",
    description: "Seek investors, partners, and growth opportunities for your business ventures",
  },
  {
    icon: TrendingUp,
    title: "Investor",
    color: "bg-amber-500",
    borderColor: "border-amber-500",
    description: "Discover investment-ready companies and projects across multiple sectors and regions",
  },
];

export default function FiveRolesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  return (
    <section className="py-16 md:py-24 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2
          className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-center mb-4"
          data-testid="text-section-title"
        >
          Who We Serve
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          One platform, multiple roles. Join as a professional, job seeker, employer, business owner, or investor.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          {roles.map((role, index) => {
            const Icon = role.icon;
            const isHovered = hoveredIndex === index;

            return (
              <Card
                key={role.title}
                className={`relative overflow-hidden transition-all duration-300 hover-elevate border-2 ${
                  isHovered ? `${role.borderColor} shadow-lg -translate-y-2` : "border-transparent"
                }`}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                data-testid={`card-role-${role.title.toLowerCase().replace(/\s+/g, "-")}`}
              >
                <CardContent className="p-6 text-center">
                  <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3">{role.title}</h3>
                  <p
                    className={`text-sm text-muted-foreground transition-all duration-300 ${
                      isHovered ? "opacity-100 max-h-32" : "opacity-60 max-h-0 md:max-h-32 md:opacity-100"
                    }`}
                  >
                    {role.description}
                  </p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
