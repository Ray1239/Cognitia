'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';

const trainData = [
  {
    id: 'pushup',
    title: 'Push Up',
    image: '/Assets/pushpng.png',
    description:
      'A push-up is a bodyweight exercise primarily targeting the chest, shoulders, and triceps, while also engaging the core and lower body for stability.',
  },
  {
    id: 'squats',
    title: 'Squats',
    image: '/Assets/squat.png',
    description:
      'A squat is a fundamental lower-body exercise that targets the quadriceps, hamstrings, glutes, and core. It also helps improve balance, flexibility, and strength.',
  },
  {
    id: 'crunches',
    title: 'Crunches',
    image: '/Assets/crunches1.png',
    description:
      'Crunches are a classic abdominal exercise that primarily targets the rectus abdominis and helps build core strength.',
  },
  {
    id: 'bicep',
    title: 'Bicep Curl',
    image: '/Assets/curl.png',
    description:
      'A bicep curl is a popular exercise that targets the biceps brachii (the muscles at the front of the upper arm) to build strength and muscle mass.',
  },
];

const Page = () => {
  return (
    <div className="px-6 py-10 space-y-10 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center"
      >
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900">
          Train Accurately with Smart Tracking
        </h1>
        <p className="mt-2 text-gray-600 text-base md:text-lg">
          Choose your target and train with guided form and performance data
        </p>
      </motion.div>

      {/* Card Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {trainData.map((item, index) => (
          <Link key={item.id} href={`/train/${item.id}`}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.98 }}
              className="group"
            >
              <Card className="w-full rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-shadow duration-300">
                {/* Image */}
                <div className="relative w-full h-48 rounded-t-2xl overflow-hidden">
                  <Image
                    src={item.image}
                    alt={item.title}
                    layout="fill"
                    objectFit="cover"
                    className="transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-all" />
                </div>

                {/* Content */}
                <CardHeader className="text-center px-4 pt-4">
                  <CardTitle className="text-lg font-semibold text-indigo-700">
                    {item.title}
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-4 pb-4">
                  <CardDescription className="text-sm text-gray-600 line-clamp-3">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            </motion.div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Page;
