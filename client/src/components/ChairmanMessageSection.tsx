import { Quote } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import chairmanImage from "@assets/image_1763374941295.png";

export default function ChairmanMessageSection() {
  return (
    <section className="relative py-16 md:py-24 bg-background overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Image Side */}
          <div className="relative order-2 lg:order-1" data-testid="section-chairman">
            <div className="relative rounded-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/20 to-primary/20"></div>
              <img 
                src={chairmanImage} 
                alt="Chairman & Founder PEF" 
                className="w-full h-auto relative z-10"
                data-testid="img-chairman"
              />
            </div>
            <div className="mt-6 text-center lg:text-left">
              <h3 className="text-xl font-display font-bold mb-1">Chairman & Founder</h3>
              <p className="text-muted-foreground">Professional Executive Forum</p>
            </div>
          </div>

          {/* Vision Quote Side */}
          <div className="order-1 lg:order-2">
            <div className="mb-6">
              <Quote className="w-12 h-12 text-secondary/30 mb-4" />
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
                Our Vision
              </h2>
            </div>
            
            <blockquote className="text-xl md:text-2xl leading-relaxed text-foreground/90 mb-8 italic">
              "To build a trusted and intelligent network where business owners, directors, and professionals connect through meaningful collaboration, creating a smart bridge between opportunities and talent."
            </blockquote>

            <p className="text-lg leading-relaxed text-muted-foreground mb-8">
              Our goal is not only to empower job seekers with access to the right people and projects, but also to help discover new business collaborations, unlock investment opportunities, and drive collective growth and integrated success for all.
            </p>

            <div className="flex flex-wrap gap-4">
              <Button size="lg" asChild>
                <Link href="/membership" data-testid="button-join-vision">
                  Join Our Vision
                </Link>
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="/contact" data-testid="button-contact">
                  Get in Touch
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
