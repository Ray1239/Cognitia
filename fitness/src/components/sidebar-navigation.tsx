"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Activity, Dumbbell, BarChart4, MessageSquare, TrendingUp, Apple, Target, Calendar, Settings } from 'lucide-react';
import { motion } from "framer-motion"
import Profile from "./Profile";

// Navigation Tab Component
const NavigationTab = ({ icon, label, active, onClick }: any) => (
    <motion.div
        whileHover={{ scale: 1.05 }}
        onClick={onClick}
        className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all ${active ? "bg-gray-100" : "text-gray-600 hover:bg-gray-100"
            }`}
    >
        {React.cloneElement(icon, { className: `h-5 w-5 ${active ? "" : "text-gray-500"}` })}
        <span className={`ml-3 font-medium ${active ? "text-indigo-400" : ""}`}>{label}</span>
    </motion.div>
)

interface SidebarNavigationProps {
    activeTab: string
    setActiveTab: (tab: string) => void
    userName?: string
    fitnessGoal?: string
}

const SidebarNavigation = ({ activeTab, setActiveTab, userName, fitnessGoal }: SidebarNavigationProps) => {
    const router = useRouter()

    return (
        <motion.div
            className="md:w-64 bg-white shadow-md md:min-h-screen p-4"
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
        >
            <div className="flex items-center justify-center mb-4 pt-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{
                        opacity: 1,
                        scale: [1, 1.05, 1], // Bounce effect: scale up and back
                        y: [0, -5, 0], // Slight vertical bounce
                    }}
                    transition={{
                        duration: 0.9, // Duration of one bounce cycle
                        ease: "easeInOut", // Smooth easing
                        repeat: Number.POSITIVE_INFINITY, // Infinite loop
                        repeatType: "loop", // Ensures continuous animation
                    }}
                    whileHover={{ scale: 1.1, rotate: 5 }} // Retain hover effect
                    className="bg-gradient-to-br from-red-600 to-orange-500 text-white h-12 w-12 rounded-full flex items-center justify-center text-2xl font-extrabold shadow-lg mr-3"
                >
                    <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                        />
                    </svg>
                </motion.div>
                <div className="flex flex-col">
                    <h1 className="text-2xl font-extrabold bg-gradient-to-r from-indigo-600 to-teal-500 bg-clip-text text-transparent">
                        FitTrack
                    </h1>
                    <p className="text-xs text-gray-500 font-medium">Power Your Progress</p>
                </div>
            </div>

            <div className="mb-2">
                <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider px-3">Dashboard</p>

                <div>
                    <NavigationTab
                        icon={<Activity />}
                        label="Overview"
                        active={activeTab === "overview"}
                        onClick={() => {
                            setActiveTab("overview");
                            router.push("/dashboard?tab=overview");
                        }}
                    />
                    <NavigationTab
                        icon={<Dumbbell />}
                        label="Workouts"
                        active={activeTab === "workouts"}
                        onClick={() => {
                            setActiveTab("workouts");
                            router.push("/dashboard?tab=workouts");
                        }}
                    />
                    <NavigationTab
                        icon={<BarChart4 />}
                        label="Train"
                        active={activeTab === "Train"}
                        onClick={() => {
                            router.push("/train"); // Navigate using App Router
                        }}
                    />
                    <NavigationTab
                        icon={<MessageSquare />}
                        label="Community"
                        // active={activeTab === 'Train'} // Uncomment and adjust if needed
                        onClick={() => {
                            router.push("/chat"); // Navigate using App Router
                        }}
                    />
                    <NavigationTab
                        icon={<MessageSquare />}
                        label="live"
                        // active={activeTab === 'Train'} // Uncomment and adjust if needed
                        onClick={() => {
                            router.push("/live"); // Navigate using App Router
                        }}
                    />
                    <NavigationTab
                        icon={<TrendingUp />}
                        label="Progress"
                        active={activeTab === "progress"}
                        onClick={() => {
                            setActiveTab("progress");
                            router.push("/dashboard?tab=progress");
                        }}
                    />
                    <NavigationTab
                        icon={<Apple />}
                        label="Nutrition"
                        active={activeTab === "nutrition"}
                        onClick={() => {
                            setActiveTab("nutrition");
                            router.push("/dashboard?tab=nutrition");
                        }}
                    />
                </div>

                <div className="mb-2">
                    <p className="text-xs font-medium text-gray-400 mb-2 uppercase tracking-wider px-3">Tools</p>
                    <NavigationTab
                        icon={<Target />}
                        label="Goals"
                        active={activeTab === "goals"}
                        onClick={() => {
                            setActiveTab("goals");
                            router.push("/dashboard?tab=goals");
                        }}
                    />
                    {/* <NavigationTab
                        icon={<Calendar />}
                        label="Calendar"
                        active={activeTab === "calendar"}
                        onClick={() => {
                            setActiveTab("calendar");
                            router.push("/dashboard?tab=calendar");
                        }}
                    />
                    <NavigationTab
                        icon={<Settings />}
                        label="Settings"
                        active={activeTab === "settings"}
                        onClick={() => {
                            setActiveTab("settings");
                            router.push("/dashboard?tab=settings");
                        }}
                    /> */}
                </div>
                <div className="mt-12">
                    <Profile />
                </div>

            </div>
        </motion.div>
    )
}

export default SidebarNavigation

