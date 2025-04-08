
import React from 'react';
import HeroSection from '../../public/Assets/HeroSection';
import FeaturesSection from '../../public/Assets/FeaturesSection';
import HowItWorksSection from '../../public/Assets/nd';
import TestimonialsSection from '@/components/fitness/TestimonialsSection';
import FaqSection from '../../public/Assets/FaqSection';
import FooterSection from '../../public/Assets/FooterSection';
import AnimatedBackground from '../../public/Assets/AnimatedBackground';

const FitnessLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-blue-50 dark:from-background dark:to-background relative overflow-hidden">
      {/* Animated Background */}
      <AnimatedBackground />
      
      {/* Main Content */}
      <div className="relative z-10">
        <HeroSection />
        <FeaturesSection />
        <HowItWorksSection />
        <TestimonialsSection />
        <FaqSection />
        <FooterSection />
      </div>
    </div>
  );
};

export default FitnessLanding;
