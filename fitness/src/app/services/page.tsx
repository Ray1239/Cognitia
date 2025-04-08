// import React from 'react';
// import Image from 'next/image';
// import { ServiceInfo } from '@/components/ServiceInfo';
// import { Footer } from '@/components/Landing/Footer';
// import { motion } from "framer-motion";
// import { fadeInUp } from '@/utils/motion';

// export default function ServicesPage() {
//   const fadeInUp = {
//     hidden: { opacity: 0, y: 20 },
//     visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
//   };
  
//   const decorationVariants = {
//     hidden: { opacity: 0, scale: 0 },
//     visible: {
//       opacity: 0.2,
//       scale: 1,
//       transition: { delay: 0.3, duration: 0.8, ease: "easeOut" },
//     },
//   };
  
//   const floatingAnimation = {
//     animate: {
//       y: [0, -10, 0],
//       transition: { duration: 6, repeat: Infinity, repeatType: "reverse" },
//     },
//   };

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
//       {/* Background Decorations (matched with SignUp/Login) */}
//       <motion.div
//         className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 blur-3xl"
//         initial="hidden"
//         animate={["visible", "animate"]}
//         variants={{ ...decorationVariants, ...floatingAnimation }}
//       />
//       <motion.div
//         className="absolute bottom-0 left-0 w-36 sm:w-56 md:w-72 h-36 sm:h-56 md:h-72 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 blur-3xl"
//         initial="hidden"
//         animate={["visible", "animate"]}
//         variants={{
//           ...decorationVariants,
//           visible: { ...decorationVariants.visible, transition: { delay: 0.5, duration: 0.8, ease: "easeOut" } },
//           ...floatingAnimation,
//           animate: { ...floatingAnimation.animate, transition: { ...floatingAnimation.animate.transition, delay: 1 } },
//         }}
//       />
//       {/* Hero Section */}
//       {/* <section className="relative overflow-hidden px-4 py-16 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-7xl">
//           <div className="relative rounded-2xl overflow-hidden shadow-2xl">
//             <Image
//               src="/Assets/banner1.jpg"
//               alt="Fitness"
//               width={1200}
//               height={400}
//               className="w-full object-cover"
//             />
//           </div>
//         </div>
//       </section> */}

//       <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
//         <div className="mx-auto max-w-7xl">
//           <motion.div
//             className="relative rounded-2xl overflow-hidden shadow-2xl"
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={fadeInUp}
//           >
//             <Image
//               src="/Assets/banner1.jpg"
//               alt="Fitness"
//               width={1200}
//               height={400}
//               className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
//             />
//           </motion.div>
//         </div>
//       </section>

//       {/* Section Header */}
//       {/* <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
//         <div className="mx-auto max-w-3xl text-center">
//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={fadeInUp}
//           >
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Why Choose Us?</h2>
//             <p className="mt-2 sm:mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
//               Comprehensive <span className="text-cyan-400">Services</span>
//             </p>
//             <div className="mt-3 sm:mt-4 h-1 w-16 sm:w-20 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full" />
//           </motion.div>
//         </div>
//       </section> */}
// {/* Section Header */}
//       <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
//         <div className="mx-auto max-w-3xl text-center">
//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={fadeInUp}
//           >
//             <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Why Choose Us?</h2>
//             <p className="mt-2 sm:mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
//               Comprehensive <span className="text-cyan-400">Services</span>
//             </p>
//             <div className="mt-3 sm:mt-4 h-1 w-16 sm:w-20 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full" />
//           </motion.div>
//         </div>
//       </section>



//       {/* Services Content */}
//       <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
//         <div className="mx-auto max-w-7xl">
//           <motion.div
//             initial="hidden"
//             whileInView="visible"
//             viewport={{ once: true }}
//             variants={fadeInUp}
//           >
//             <ServiceInfo />
//           </motion.div>
//         </div>
//       </section>




//       {/* Section Header */}
//       {/* <section className="px-4 py-16 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-3xl text-center">
//           <h2 className="text-2xl font-bold text-gray-900">
//             Why Choose Us?
//           </h2>
//           <p className="mt-4 text-4xl font-bold tracking-tight text-gray-900">
//             Comprehensive <span className="text-blue-600">Services</span>
//           </p>
//           <div className="mt-4 h-1 w-20 bg-blue-600 mx-auto rounded-full" />
//         </div>
//       </section> */}

//       {/* Services Content */}
//       {/* <section className="px-4 py-16 sm:px-6 lg:px-8">
//         <div className="mx-auto max-w-7xl">
//           <ServiceInfo />
//         </div>
//       </section> */}

//       <Footer />
//     </div>
//   );
// }



"use client";

import React from "react";
import Image from "next/image";
import { ServiceInfo } from "@/components/ServiceInfo";
import { Footer } from "@/components/Landing/Footer";
import { motion } from "framer-motion";

// Animation variants (consistent with previous components)
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } },
};

const decorationVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 0.2,
    scale: 1,
    transition: { delay: 0.3, duration: 0.8, ease: "easeOut" },
  },
};

const floatingAnimation = {
  animate: {
    y: [0, -10, 0],
    transition: { duration: 6, repeat: Infinity, repeatType: "reverse" },
  },
};

export default function ServicesPage() {
  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-gray-50 to-white relative overflow-hidden">
      {/* Background Decorations (matched with SignUp/Login) */}
      <motion.div
        className="absolute top-0 right-0 w-32 sm:w-48 md:w-64 h-32 sm:h-48 md:h-64 rounded-full bg-gradient-to-r from-blue-300 to-indigo-300 blur-3xl"
        initial="hidden"
        animate={["visible", "animate"]}
        variants={{ ...decorationVariants, ...floatingAnimation }}
      />
      <motion.div
        className="absolute bottom-0 left-0 w-36 sm:w-56 md:w-72 h-36 sm:h-56 md:h-72 rounded-full bg-gradient-to-r from-cyan-300 to-blue-300 blur-3xl"
        initial="hidden"
        animate={["visible", "animate"]}
        variants={{
          ...decorationVariants,
          visible: { ...decorationVariants.visible, transition: { delay: 0.5, duration: 0.8, ease: "easeOut" } },
          ...floatingAnimation,
          animate: { ...floatingAnimation.animate, transition: { ...floatingAnimation.animate.transition, delay: 1 } },
        }}
      />

      {/* Hero Section */}
      <section className="relative overflow-hidden px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            className="relative rounded-2xl overflow-hidden shadow-2xl"
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <Image
              src="/Assets/3d-cartoon-fitness-man.jpg"
              alt="Fitness"
              width={1200}
              height={400}
              className="w-full h-48 sm:h-64 md:h-80 lg:h-96 object-cover"
            />
          </motion.div>
        </div>
      </section>

      {/* Section Header */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <h2 className="text-xl sm:text-2xl font-bold text-gray-900">Why Choose Us?</h2>
            <p className="mt-2 sm:mt-4 text-3xl sm:text-4xl font-bold tracking-tight text-gray-900">
              Comprehensive <span className="text-cyan-400">Services</span>
            </p>
            <div className="mt-3 sm:mt-4 h-1 w-16 sm:w-20 bg-gradient-to-r from-blue-500 to-indigo-600 mx-auto rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Services Content */}
      <section className="px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
          >
            <ServiceInfo />
          </motion.div>
        </div>
      </section>

      <Footer />

      {/* Global Styles for Responsiveness */}
      <style jsx global>{`
        @media (max-width: 640px) {
          .min-h-screen {
            padding-top: 1rem;
            padding-bottom: 1rem;
          }
          .text-4xl {
            font-size: 2rem;
            line-height: 2.5rem;
          }
          .text-2xl {
            font-size: 1.5rem;
          }
        }
      `}</style>
    </div>
  );
}