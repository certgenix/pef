import Header from "../Header";

export default function HeaderExample() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="h-screen pt-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h2 className="text-2xl font-bold mb-4">Scroll to see header effect</h2>
          <p className="text-muted-foreground">The header becomes slightly transparent when you scroll down.</p>
          <div className="h-[200vh]" />
        </div>
      </div>
    </div>
  );
}
