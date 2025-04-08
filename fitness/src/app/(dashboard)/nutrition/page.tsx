'use client';

import MealSuggestions from "@/components/MealSuggestions";
import { motion } from "framer-motion";

export default function Dashboard() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 p-6 md:p-10">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-10"
            >
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                    <span role="img" aria-label="meal">🍽️</span> Your Nutrition Dashboard
                </h1>
                <p className="text-gray-600 mt-2 text-lg">
                    Personalized meal suggestions to match your health goals.
                </p>
            </motion.div>

            {/* Meal Suggestions Section */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="bg-white shadow-xl rounded-3xl p-6 md:p-8"
            >
                <h2 className="text-2xl font-semibold text-gray-800 mb-4">🥗 AI Meal Suggestions</h2>
                <MealSuggestions />
            </motion.div>
        </div>
    );
}
