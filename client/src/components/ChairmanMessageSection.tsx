import { Quote } from "lucide-react";

export default function ChairmanMessageSection() {
  return (
    <section className="relative py-16 md:py-24 bg-muted/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="mb-8">
            <Quote className="w-12 h-12 text-secondary/30 mb-4 mx-auto" />
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold mb-6">
              Chairman's Message
            </h2>
          </div>
          
          <blockquote className="text-xl md:text-2xl leading-relaxed text-foreground/90 mb-8 italic">
            "To build a trusted and intelligent network where business owners, directors, and professionals connect through meaningful collaboration, creating a smart bridge between opportunities and talent."
          </blockquote>

          <p className="text-lg leading-relaxed text-muted-foreground">
            Our goal is not only to empower job seekers with access to the right people and projects, but also to help discover new business collaborations, unlock investment opportunities, and drive collective growth and integrated success for all.
          </p>
        </div>
      </div>
    </section>
  );
}
