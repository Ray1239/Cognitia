// components/ServiceInfo.tsx
"use client";

import React from "react";
import Image from "next/image";
import { motion } from "framer-motion";

// Animation variants for text (unrolling from left)
const textVariants = {
  hidden: {
    opacity: 0,
    x: -80, // Further off-screen for a dramatic entrance
    skewX: 10, // Slight skew for an unrolling effect
    filter: "blur(5px)", // Blurry start for depth
  },
  visible: {
    opacity: 1,
    x: 0,
    skewX: 0,
    filter: "blur(0px)",
    transition: {
      duration: 1,
      ease: [0.6, -0.05, 0.01, 0.99], // Smooth, slightly elastic easing
    },
  },
};

// Animation variants for image (zooming in from right with bounce)
const imageVariants = {
  hidden: {
    opacity: 0,
    x: 80, // Further off-screen
    scale: 0.85, // Start smaller for a zoom effect
    filter: "blur(5px)", // Blurry start
    boxShadow: "0px 0px 0px rgba(0, 0, 0, 0)", // No shadow initially
  },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: "blur(0px)",
    boxShadow: "0px 10px 20px rgba(0, 0, 0, 0.15)", // Shadow appears for depth
    transition: {
      duration: 1.2,
      ease: [0.25, 0.1, 0.25, 1], // Bounce-like easing
      scale: { type: "spring", stiffness: 200, damping: 15 }, // Bounce for scale
    },
  },
};

export const ServiceInfo = () => {
  const contentArray = [
    {
      id: 1,
      image: "/Assets/health.png",
      text: "Progress Visualization",
      desc: "Fit 4 You tracking system is designed to empower users in their health and wellness journey. With features such as real-time activity monitoring, personalized workout plans, and dietary guidance, it provides a comprehensive approach to fitness.",
    },
    {
      id: 2,
      image: "/Assets/nutrion.png",
      text: "Nutrition Tracking",
      desc: "Our Nutrition Tracking feature is designed to help you take control of your diet and achieve your health objectives. Whether you're aiming to lose weight, gain muscle, or simply maintain a balanced diet, our intuitive tracking system makes it easy to log your daily meals and monitor your nutrient intake.",
    },
    {
      id: 3,
      image: "/Assets/health.png",
      text: "Create Your Workout Plan",
      desc: "Our workout plan feature is designed to motivate and inspire you to push your limits and achieve your fitness goals. Each week, you'll have the opportunity to participate in exciting challenges that not only enhance your physical capabilities but also foster a sense of community and friendly competition.",
    },
    {
      id: 4,
      image: "/Assets/health.png",
      text: "Health Cure",
      desc: "Our AI-Powered Health Tracking feature is designed to provide you with personalized insights and recommendations, helping you take control of your health like never before. By harnessing the power of artificial intelligence, we transform your health data into actionable strategies tailored specifically for you.",
    },
    {
      id: 5,
      image: "/Assets/health.png",
      text: "Goal Setting",
      desc: "Fit4You helps to set, track, and accomplish your goals effectively while keeping yourself motivated along the way.",
    },
    {
      id: 6,
      image: "/Assets/one.png",
      text: "One-to-One Monitoring",
      desc: "Our One-to-One Mentoring Sessions leverage WebSocket technology to provide real-time, interactive communication between mentors and mentees. Enjoy personalized guidance and instant feedback in a secure environment, ensuring a rich and engaging learning experience.",
    },
  ];

  return (
    <div className="grid gap-8 sm:gap-12 lg:gap-16">
      {contentArray.map((item, index) => (
        <motion.div
          key={item.id}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }} // Trigger when 30% is visible
          className="group relative overflow-hidden rounded-2xl bg-white/80 backdrop-blur-lg p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all duration-300 ease-in-out transform hover:-translate-y-1"
        >
          <div className="grid gap-6 sm:gap-8 md:grid-cols-2 items-center">
            {/* Text Section - Unrolling from Left */}
            <motion.div
              variants={textVariants}
              transition={{ delay: index * 0.2 }} // Increased stagger for drama
              className={`space-y-4 ${index % 2 === 0 ? "md:order-1" : "md:order-2"}`}
            >
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 text-lg sm:text-xl font-bold text-white transition-transform duration-300 group-hover:scale-110">
                  {item.id}
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-indigo-900">{item.text}</h3>
              </div>
              <p className="text-sm sm:text-base leading-relaxed text-gray-600 text-justify">{item.desc}</p>
            </motion.div>

            {/* Image Section - Zooming in from Right */}
            <motion.div
              variants={imageVariants}
              transition={{ delay: index * 0.2 + 0.15 }} // Image follows text
              className={`${index % 2 === 0 ? "md:order-2" : "md:order-1"}`}
            >
              <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-50 to-cyan-100 p-4">
                <Image
                  src={item.image}
                  alt={`${item.text} illustration`}
                  width={400}
                  height={300}
                  className="w-full h-48 sm:h-56 md:h-64 object-cover transform transition-transform duration-300 group-hover:scale-105"
                />
              </div>
            </motion.div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};