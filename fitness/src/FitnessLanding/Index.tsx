import React, { useEffect } from 'react';
import { 
  Sparkles, 
  PaintBucket, 
  MousePointer, 
  Layers, 
  Palette,
  Zap
} from 'lucide-react';
import { Link } from 'react-router-dom';
import Hero from '@/components/Hero';
import ParticleBackground from '@/components/ParticleBackground';
import FeatureCard from '@/components/FeatureCard';
import CallToAction from '@/components/CallToAction';

const Index = () => {
  // Intersection Observer for animations on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.1 }
    );

    document.querySelectorAll('.animate-on-scroll').forEach((el) => {
      observer.observe(el);
    });

    return () => {
      document.querySelectorAll('.animate-on-scroll').forEach((el) => {
        observer.unobserve(el);
      });
    };
  }, []);

  return (
    <div className="min-h-screen bg-background relative">
      {/* Interactive particle background */}
      <ParticleBackground />
      
      {/* Hero section with animated gradient background */}
      <Hero />
      
      {/* Features section */}
      <section id="features" className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 animate-on-scroll">
              Beautiful <span className="gradient-text">Animated Backgrounds</span>
            </h2>
            <p className="text-lg text-foreground/70 max-w-2xl mx-auto animate-on-scroll">
              Add life to your website with these stunning animation techniques
            </p>
            
            {/* Link to Fitness Landing Page */}
            <div className="mt-8 animate-on-scroll">
              <Link to="/fitness" className="inline-block px-6 py-3 bg-primary text-white rounded-full hover:bg-primary/90 transition-colors">
                Check out our Fitness Landing Page
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              title="Particle Effects" 
              description="Interactive particle systems that respond to user movement and create a dynamic atmosphere."
              icon={<Sparkles className="w-6 h-6 text-white" />}
              gradient="from-theme-purple to-theme-blue"
            />
            
            <FeatureCard 
              title="Gradient Animations" 
              description="Smooth, shifting color gradients that add depth and visual interest to your backgrounds."
              icon={<PaintBucket className="w-6 h-6 text-white" />}
              gradient="from-theme-pink to-theme-purple"
            />
            
            <FeatureCard 
              title="Interactive Elements" 
              description="Elements that respond to mouse movements, creating an engaging and playful user experience."
              icon={<MousePointer className="w-6 h-6 text-white" />}
              gradient="from-theme-blue to-theme-teal"
            />
            
            <FeatureCard 
              title="Layered Animations" 
              description="Multiple layers of animations that work together to create rich, complex visual effects."
              icon={<Layers className="w-6 h-6 text-white" />}
              gradient="from-theme-violet to-theme-blue"
            />
            
            <FeatureCard 
              title="Custom Color Schemes" 
              description="Personalized color palettes that match your brand identity and create a cohesive look."
              icon={<Palette className="w-6 h-6 text-white" />}
              gradient="from-theme-teal to-theme-blue"
            />
            
            <FeatureCard 
              title="Performance Optimized" 
              description="Lightweight animations that look great without slowing down your website or draining battery life."
              icon={<Zap className="w-6 h-6 text-white" />}
              gradient="from-theme-purple to-theme-pink"
            />
          </div>
        </div>
      </section>
      
      {/* Call to action section */}
      <CallToAction />
      
      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4">
          <div className="text-center text-foreground/60 text-sm">
            <p>© {new Date().getFullYear()} Animated Background Delights. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
