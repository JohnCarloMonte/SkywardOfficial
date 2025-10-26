import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero-car-bg.jpg";

const HeroSection = () => {
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section 
      id="home"
      className="relative min-h-screen flex items-center justify-center bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroImage})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>
      
      {/* Content */}
      <div className="relative z-10 text-center text-white px-4 max-w-4xl mx-auto">
        <h1 className="text-6xl md:text-8xl font-bold mb-4 tracking-tight">
          <span className="text-brand">Tap.</span>{" "}
          <span className="text-white">Book.</span>{" "}
          <span className="text-brand">Drive.</span>
        </h1>
        <p className="text-xl md:text-2xl mb-12 opacity-90">
          It's that easy
        </p>
        <Button 
          onClick={() => scrollToSection('cars')}
          size="lg"
          className="bg-brand text-brand-foreground hover:bg-brand/90 text-lg px-8 py-3"
        >
          See Available Cars
        </Button>
      </div>
    </section>
  );
};

export default HeroSection;