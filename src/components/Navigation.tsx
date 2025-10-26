import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";

const Navigation = () => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-black/20 backdrop-blur-md z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link to="/">
              <img
                src="/logobluebig.png"
                alt="DriveCarmarines Logo"
                className="h-10 w-auto object-contain"
                style={{ maxHeight: '2.5rem' }}
              />
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:block">
            <div className="ml-10 flex items-baseline space-x-8">
              <button 
                onClick={() => scrollToSection('home')} 
                className="text-white hover:text-brand transition-colors duration-200 px-3 py-2 text-sm font-medium"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-white hover:text-brand transition-colors duration-200 px-3 py-2 text-sm font-medium"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('cars')} 
                className="text-white hover:text-brand transition-colors duration-200 px-3 py-2 text-sm font-medium"
              >
                Book
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-white hover:text-brand transition-colors duration-200 px-3 py-2 text-sm font-medium"
              >
                Contact
              </button>
              <Button 
                onClick={() => navigate('/auth')} 
                className="bg-brand text-brand-foreground hover:bg-brand/90"
              >
                Login
              </Button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-white hover:text-brand p-2"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 bg-black/40 backdrop-blur-md rounded-lg mt-2">
              <button 
                onClick={() => scrollToSection('home')} 
                className="text-white hover:text-brand block px-3 py-2 text-base font-medium w-full text-left"
              >
                Home
              </button>
              <button 
                onClick={() => scrollToSection('about')} 
                className="text-white hover:text-brand block px-3 py-2 text-base font-medium w-full text-left"
              >
                About
              </button>
              <button 
                onClick={() => scrollToSection('cars')} 
                className="text-white hover:text-brand block px-3 py-2 text-base font-medium w-full text-left"
              >
                Book
              </button>
              <button 
                onClick={() => scrollToSection('contact')} 
                className="text-white hover:text-brand block px-3 py-2 text-base font-medium w-full text-left"
              >
                Contact
              </button>
              <div className="px-3 py-2">
                <Button 
                  onClick={() => navigate('/auth')} 
                  className="bg-brand text-brand-foreground hover:bg-brand/90 w-full"
                >
                  Login
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;