import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import emailjs from "@emailjs/browser";

const ContactSection = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await emailjs.send(
        "service_wrfhmuq",     // ✅ your EmailJS service ID
        "template_les9pvp",    // ✅ your EmailJS template ID
        formData,
        "e6MVv-IemUO6OfdUQ"    // ✅ your public key
      );

      toast({
        title: "Message Sent!",
        description: "Thank you for contacting us. We'll get back to you soon.",
      });

      setFormData({ name: "", email: "", message: "" });
    } catch (error) {
      console.error("Error sending email:", error);
      toast({
        title: "Error",
        description: "Failed to send message. Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20 bg-background">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-brand mb-4">
            Contact Us
          </h2>
          <p className="text-lg text-muted-foreground">
            If you have any concerns or questions, feel free to message us.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <Label htmlFor="name" className="text-foreground">Name</Label>
            <Input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              required
              className="mt-2"
              placeholder="Your full name"
            />
          </div>

          <div>
            <Label htmlFor="email" className="text-foreground">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="mt-2"
              placeholder="your.email@example.com"
            />
          </div>

          <div>
            <Label htmlFor="message" className="text-foreground">Message</Label>
            <Textarea
              id="message"
              name="message"
              value={formData.message}
              onChange={handleChange}
              required
              className="mt-2 min-h-[120px]"
              placeholder="Tell us how we can help you..."
            />
          </div>

          <div className="text-center">
            <Button 
              type="submit" 
              size="lg"
              disabled={isSubmitting}
              className="bg-brand text-brand-foreground hover:bg-brand/90 px-8 py-3"
            >
              {isSubmitting ? "Sending..." : "Send"}
            </Button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default ContactSection;

