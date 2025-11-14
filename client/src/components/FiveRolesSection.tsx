import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Briefcase, Search, Building2, Handshake, TrendingUp } from "lucide-react";

const roles = [
  {
    icon: Briefcase,
    title: "Professionals",
    color: "bg-blue-500",
    borderColor: "border-blue-500",
    description: "Individuals looking to enhance their visibility, expand their network, and access new opportunities.",
  },
  {
    icon: Search,
    title: "Job Seekers",
    color: "bg-green-500",
    borderColor: "border-green-500",
    description: "Professionals actively exploring new employment opportunities locally or internationally.",
  },
  {
    icon: Building2,
    title: "Employers",
    color: "bg-purple-500",
    borderColor: "border-purple-500",
    description: "Organizations or individuals offering job openings and seeking qualified candidates.",
  },
  {
    icon: Handshake,
    title: "Business Owners",
    color: "bg-orange-500",
    borderColor: "border-orange-500",
    description: "Entrepreneurs and company leaders seeking investors, collaborators, or growth opportunities.",
  },
  {
    icon: TrendingUp,
    title: "Investors",
    color: "bg-amber-500",
    borderColor: "border-amber-500",
    description: "Individuals or firms seeking investment-ready companies or projects.",
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
          Member Roles
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-3xl mx-auto text-lg">
          Choose any combination of roles that fits your needs. One profile, multiple roles—no separate accounts, no duplication.
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
                <CardContent className="p-6">
                  <div className={`w-16 h-16 ${role.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-display font-semibold mb-3 text-center">{role.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed text-center">
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
