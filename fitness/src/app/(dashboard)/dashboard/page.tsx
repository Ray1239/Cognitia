"use client"

import React, { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import {
  Activity,
  Clock,
  Dumbbell,
  Calendar,
  TrendingUp,
  ChevronRight,
  Award,
  BarChart4,
  Flame,
  Target,
  Droplets,
  Apple,
  Share2,
  AlertCircle,
  CheckCircle2,
  Bell,
  Settings,
  PlusCircle,
  Info,
  ChevronDown,
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { motion, AnimatePresence } from "framer-motion"
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts"
import { useSession } from "next-auth/react"
import axios from "axios"
import BMIGauge from "@/components/Bmi"
import FoodAnalyzerGemini from "@/components/NutritionTrack"
import CalorieCard, { CalorieEntry } from '@/components/CalorieCard';
import MealSuggestions from "@/components/MealSuggestions"
import WorkoutScheduler from "@/components/WorkoutScheduler"


// Types
interface Exercise {
  name: string
  sets: number
  reps: number
  rest: number
  duration?: number
  muscle?: string // Added muscle group
}

interface WorkoutPlan {
  day: string
  name: string
  exercises: Exercise[]
  quote: string
}

interface UserData {
  data: {
    user: {
      name: string
      weight: number
      height: number
      age: number
      dailyCalories: number
      fitnessGoal: string
      activityLevel: string
    }
    workoutPlan: WorkoutPlan[]
  }
  success: boolean
  message: string
}

// Mock data for visualization
const mockProgressData = [
  { date: "Week 1", weight: 75, calories: 2500, steps: 8000 },
  { date: "Week 2", weight: 74.5, calories: 2400, steps: 8500 },
  { date: "Week 3", weight: 73.8, calories: 2350, steps: 9000 },
  { date: "Week 4", weight: 73.2, calories: 2300, steps: 9500 },
  { date: "Week 5", weight: 72.8, calories: 2250, steps: 10000 },
]

const mockNutritionData = [
  { name: "Protein", value: 30 },
  { name: "Carbs", value: 45 },
  { name: "Fats", value: 25 },
]

const mockMuscleGroupData = [
  { muscle: "Chest", workouts: 8 },
  { muscle: "Back", workouts: 7 },
  { muscle: "Legs", workouts: 9 },
  { muscle: "Arms", workouts: 6 },
  { muscle: "Shoulders", workouts: 5 },
  { muscle: "Core", workouts: 10 },
]

const mockHydrationData = [
  { day: "Mon", amount: 2.1 },
  { day: "Tue", amount: 2.5 },
  { day: "Wed", amount: 1.9 },
  { day: "Thu", amount: 2.8 },
  { day: "Fri", amount: 2.3 },
  { day: "Sat", amount: 1.7 },
  { day: "Sun", amount: 2.0 },
]

const mockMilestones = [
  { id: 1, title: "Lost 5kg", completed: true, date: "2024-03-15" },
  { id: 2, title: "Completed 30 days workout streak", completed: true, date: "2024-03-30" },
  { id: 3, title: "Bench press personal record", completed: false, target: "80kg" },
  { id: 4, title: "Reduced body fat to 15%", completed: false, target: "15%" },
]

const mockUpcomingWorkouts = [
  { id: 1, title: "HIIT Session", time: "07:00 AM", duration: "45 min", type: "Cardio" },
  { id: 2, title: "Yoga", time: "06:00 PM", duration: "60 min", type: "Flexibility" },
]

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8", "#82ca9d"]

interface DashboardProps {
  activeTab?: string
}

const Dashboard = () => {
  const router = useRouter()
  const [userData, setUserData] = useState<UserData | null>(null)
  const [selectedDay, setSelectedDay] = useState<string | null>(null)
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(true)
  const [waterIntake, setWaterIntake] = useState(0)
  const [showNotification, setShowNotification] = useState(false)
  const [expandedExercise, setExpandedExercise] = useState<number | null>(null)

  // Get the active tab from URL query parameters
  const searchParams = useSearchParams()
  const activeTab = searchParams.get("tab") || "overview"

  // const handleCalorieUpdate = (entry) => {
  //   // This function is defined inside CalorieTrackingCard
  //   // We're just passing it through to FoodAnalyzerGemini
  //   calorieTrackingRef.current?.handleCalorieUpdate(entry);
  // };
  // const calorieTrackingRef = React.useRef(null);


  useEffect(() => {
    if (session?.user?.email) {
      const fetchUserData = async () => {
        setIsLoading(true)
        try {
          const response = await axios.get("api/user")
          if (response.status === 200) {
            setUserData(response.data)
            if (response.data.data.workoutPlan.length > 0) {
              setSelectedDay(response.data.data.workoutPlan[0].day)
            }
          } else {
            console.error(response.data)
          }
        } catch (error) {
          console.error("Error fetching user data:", error)
        } finally {
          setIsLoading(false)
        }
      }
      fetchUserData()
    }
  }, [session])

  useEffect(() => {
    // Show notification after component mounts
    const timer = setTimeout(() => {
      setShowNotification(true)
    }, 3000)

    return () => clearTimeout(timer)
  }, [])

  const handleCalorieUpdate = (entry: CalorieEntry) => {
    // Get existing entries from localStorage
    const storedData = localStorage.getItem('calorieEntries');
    let entries: CalorieEntry[] = storedData ? JSON.parse(storedData) : [];

    // Check if entry for this date already exists
    const existingEntryIndex = entries.findIndex(item => item.date === entry.date);

    if (existingEntryIndex >= 0) {
      // Update existing entry
      entries[existingEntryIndex].calories += entry.calories;
    } else {
      // Add new entry
      entries.push(entry);
    }

    // Sort by date
    entries.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });

    // Save to localStorage
    localStorage.setItem('calorieEntries', JSON.stringify(entries));

    // If you need to trigger a re-render or update in other components
    // You can dispatch a custom event or use context/redux
    window.dispatchEvent(new CustomEvent('calorie-data-updated'));
  };

  // Get today's workout if available
  const getTodayWorkout = () => {
    if (!userData?.data?.workoutPlan) return null
    const today = new Date().getDay()
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const todayString = days[today]
    return userData.data.workoutPlan.find((workout) => workout.day.toLowerCase() === todayString.toLowerCase())
  }

  const todaysWorkout = getTodayWorkout()

  const addWater = () => {
    setWaterIntake((prev) => Math.min(prev + 0.25, 3))
    // Show notification
    setShowNotification(true)
    setTimeout(() => setShowNotification(false), 3000)
  }

  // Card Component with animations
  const StatsCard = ({ title, value, unit, icon, description, color }: any) => (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card
        className="w-full overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-l-4"
        style={{ borderLeftColor: color }}
      >
        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-gray-600">{title}</CardTitle>
          <motion.div
            whileHover={{ scale: 1.1, rotate: 5 }}
            className={`p-2 rounded-full bg-opacity-20`}
            style={{ backgroundColor: `${color}25` }}
          >
            {React.cloneElement(icon, { style: { color: color } })}
          </motion.div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold" style={{ color: color }}>
            {value} <span className="text-lg font-normal text-gray-500">{unit}</span>
          </div>
          <p className="text-xs text-gray-500 mt-1">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  )

  // Redesigned Workout Card with Framer Motion
  const WorkoutCard = ({
    workout,
    isActive,
    onClick,
    index,
  }: { workout: WorkoutPlan; isActive: boolean; onClick: () => void; index: number }) => (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.1 }}
    >
      <motion.div
        className={`mb-3 rounded-xl overflow-hidden shadow-sm transition-all duration-300 border ${isActive ? "border-indigo-500" : "border-gray-200"
          }`}
        whileHover={{ scale: 1.02 }}
        onClick={onClick}
      >
        <div className={`h-2 ${isActive ? "bg-indigo-500" : "bg-gray-200"}`}></div>
        <div className={`p-4 ${isActive ? "bg-indigo-50" : "bg-white"} cursor-pointer`}>
          <div className="flex justify-between items-center">
            <div>
              <h3 className={`font-semibold ${isActive ? "text-indigo-700" : "text-gray-700"}`}>{workout.day}</h3>
              <div className="flex items-center mt-1">
                <Dumbbell className={`h-4 w-4 mr-1 ${isActive ? "text-indigo-500" : "text-gray-400"}`} />
                <p className={`text-sm ${isActive ? "text-indigo-600" : "text-gray-500"}`}>{workout.name}</p>
              </div>
              <div className="mt-2">
                <span
                  className={`text-xs px-2 py-1 rounded-full ${isActive ? "bg-indigo-100 text-indigo-700" : "bg-gray-100 text-gray-600"
                    }`}
                >
                  {workout.exercises.length} exercises
                </span>
              </div>
            </div>
            <motion.div
              whileHover={{ x: 3 }}
              className={`rounded-full p-1 ${isActive ? "bg-indigo-100" : "bg-gray-100"}`}
            >
              <ChevronRight className={`h-5 w-5 ${isActive ? "text-indigo-500" : "text-gray-400"}`} />
            </motion.div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )

  // Notification component
  const Notification = ({ message, type = "success" }: { message: string; type?: "success" | "info" | "warning" }) => (
    <motion.div
      initial={{ opacity: 0, y: -50 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -50 }}
      className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${type === "success"
        ? "bg-green-100 border-l-4 border-green-500"
        : type === "info"
          ? "bg-blue-100 border-l-4 border-blue-500"
          : "bg-yellow-100 border-l-4 border-yellow-500"
        }`}
    >
      <div className="flex items-center">
        {type === "success" && <CheckCircle2 className="h-5 w-5 text-green-500 mr-2" />}
        {type === "info" && <Info className="h-5 w-5 text-blue-500 mr-2" />}
        {type === "warning" && <AlertCircle className="h-5 w-5 text-yellow-500 mr-2" />}
        <p
          className={`text-sm ${type === "success" ? "text-green-700" : type === "info" ? "text-blue-700" : "text-yellow-700"
            }`}
        >
          {message}
        </p>
      </div>
    </motion.div>
  )

  // Timeline component for milestones
  const Timeline = ({ milestones }: { milestones: any[] }) => (
    <div className="relative">
      {milestones.map((milestone, index) => (
        <motion.div
          key={milestone.id}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: index * 0.2 }}
          className="mb-6 relative pl-8"
        >
          <div className="absolute left-0 top-0 h-full">
            <div className="h-full w-0.5 bg-gray-200 absolute left-3 transform -translate-x-1/2"></div>
          </div>
          <div
            className={`absolute left-3 top-0 w-6 h-6 rounded-full transform -translate-x-1/2 flex items-center justify-center ${milestone.completed ? "bg-green-500" : "bg-gray-300"
              }`}
          >
            {milestone.completed ? (
              <CheckCircle2 className="h-4 w-4 text-white" />
            ) : (
              <Clock className="h-4 w-4 text-white" />
            )}
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <h4 className="font-medium text-gray-800">{milestone.title}</h4>
            <p className="text-sm text-gray-500 mt-1">
              {milestone.completed ? `Completed on ${milestone.date}` : `Target: ${milestone.target}`}
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  )

  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-gray-50 p-4 flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <motion.div
            className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-500 rounded-full mx-auto"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
          />
          <p className="mt-4 text-gray-600">Loading your fitness dashboard...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <motion.div
      className="w-full bg-gradient-to-br from-gray-50 to-indigo-50 p-0"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* <AnimatePresence>
        {showNotification && <Notification message="Water intake updated! Keep it up!" type="success" />}
      </AnimatePresence> */}

      <div className="flex flex-col h-screen">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {/* Welcome Section with subtle gradient */}
          <motion.div
            className="mb-8 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-500 p-6 text-white shadow-lg"
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">
                  Welcome back, {session?.user?.name || userData?.data.user.name}
                </h1>
                <p className="text-indigo-100 mt-1">Let's check your fitness progress today</p>
              </div>
              <div className="hidden md:flex items-center space-x-3">
                <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all">
                  <Bell className="h-5 w-5 text-white" />
                </button>
                <button className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all">
                  <Settings className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>

            {todaysWorkout && (
              <motion.div
                className="mt-4 p-3 bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                <div className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  <p className="font-medium">
                    Today's workout: <span className="font-bold">{todaysWorkout.name}</span>
                  </p>
                </div>
                <div className="mt-2 flex space-x-2">
                  <motion.button
                    className="px-3 py-1 bg-white text-indigo-700 rounded-full text-sm font-medium hover:bg-opacity-90 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => {
                      setSelectedDay(todaysWorkout.day)
                    }}
                  >
                    View Details
                  </motion.button>
                  <motion.button
                    className="px-3 py-1 bg-transparent border border-white text-white rounded-full text-sm font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Start Workout
                  </motion.button>
                </div>
              </motion.div>
            )}
          </motion.div>

          {/* Content based on active tab */}
          <AnimatePresence mode="wait">
            {activeTab === "overview" && (
              <motion.div
                key="overview"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Stats Grid */}
                {userData?.data && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <StatsCard
                      title="Daily Calories"
                      value={userData?.data.user.dailyCalories}
                      unit="kcal"
                      icon={<Flame className="h-5 w-5" />}
                      color="#ed6c02"
                      description="Daily caloric target"
                    />
                    <StatsCard
                      title="Current Weight"
                      value={userData?.data.user.weight}
                      unit="kg"
                      icon={<BarChart4 className="h-5 w-5" />}
                      color="#2e7d32"
                      description="Last updated today"
                    />
                    <StatsCard
                      title="Activity Level"
                      value={userData?.data.user.activityLevel || "Moderate"}
                      unit=""
                      icon={<Activity className="h-5 w-5" />}
                      color="#0288d1"
                      description="Your current activity level"
                    />
                    <StatsCard
                      title="Fitness Goal"
                      value={userData?.data.user.fitnessGoal || "General Fitness"}
                      unit=""
                      icon={<Award className="h-5 w-5" />}
                      color="#7b1fa2"
                      description="Your primary focus"
                    />
                  </div>
                )}

                {/* BMI Gauge with new design */}
                <motion.div
                  className="mb-8"
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                >
                  <BMIGauge userData={userData} />
                </motion.div>

                {/* Quick Info Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                  {/* Upcoming Workouts */}
                  <WorkoutScheduler />

                  {/* Weekly Progress */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.4 }}
                  >
                    <Card className="h-full shadow-md hover:shadow-lg transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <TrendingUp className="h-5 w-5 mr-2 text-green-600" />
                          Weekly Progress
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-48">
                          <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={mockProgressData.slice(-5)}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="date" />
                              <YAxis />
                              <Tooltip />
                              <Line
                                type="monotone"
                                dataKey="weight"
                                stroke="#2e7d32"
                                strokeWidth={2}
                                dot={{ r: 4, fill: "#2e7d32" }}
                                activeDot={{ r: 6 }}
                              />
                            </LineChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                      <CardFooter className="pt-0">
                        <button className="text-sm text-green-600 hover:text-green-800 transition-colors flex items-center">
                          View detailed progress
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </CardFooter>
                    </Card>
                  </motion.div>

                  {/* Recent Achievements */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.5 }}
                  >
                    <Card className="h-full shadow-md hover:shadow-lg transition-all">
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg flex items-center">
                          <Award className="h-5 w-5 mr-2 text-amber-600" />
                          Recent Achievements
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {mockMilestones
                          .filter((m) => m.completed)
                          .slice(0, 2)
                          .map((milestone, index) => (
                            <motion.div
                              key={milestone.id}
                              initial={{ x: -20, opacity: 0 }}
                              animate={{ x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.1 + 0.3 }}
                              className="mb-3 last:mb-0 bg-amber-50 p-3 rounded-lg"
                            >
                              <div className="flex items-center">
                                <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center mr-3">
                                  <CheckCircle2 className="h-5 w-5 text-amber-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-gray-800">{milestone.title}</h4>
                                  <p className="text-xs text-gray-500 mt-1">Completed on {milestone.date}</p>
                                </div>
                              </div>
                            </motion.div>
                          ))}
                      </CardContent>
                      <CardFooter className="pt-0">
                        <button className="text-sm text-amber-600 hover:text-amber-800 transition-colors flex items-center">
                          View all achievements
                          <ChevronRight className="h-4 w-4 ml-1" />
                        </button>
                      </CardFooter>
                    </Card>
                  </motion.div>
                </div>

                {/* Nutrition Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.6 }}
                  >
                    <Card className="shadow-md hover:shadow-lg transition-all h-full">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Apple className="h-5 w-5 mr-2 text-red-600" />
                          Nutrition Distribution
                        </CardTitle>
                        <CardDescription>Macronutrient breakdown</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64 flex items-center justify-center">
                          <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                              <Pie
                                data={mockNutritionData}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                              >
                                {mockNutritionData.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip formatter={(value) => `${value}%`} />
                              <Legend />
                            </PieChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>

                  {/* Hydration Tracker */}
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.3, delay: 0.7 }}
                  >
                    <Card className="shadow-md hover:shadow-lg transition-all h-full">
                      <CardHeader>
                        <CardTitle className="text-lg flex items-center">
                          <Droplets className="h-5 w-5 mr-2 text-blue-600" />
                          Hydration Tracker
                        </CardTitle>
                        <CardDescription>Weekly water intake (liters)</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="h-64">
                          <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={mockHydrationData}>
                              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                              <XAxis dataKey="day" />
                              <YAxis />
                              <Tooltip />
                              <Area
                                type="monotone"
                                dataKey="amount"
                                stroke="#0288d1"
                                fill="#0288d1"
                                fillOpacity={0.3}
                              />
                            </AreaChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                </div>
              </motion.div>
            )}

            {activeTab === "workouts" && (
              <motion.div
                key="workouts"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Sidebar with workout days */}
                  <div className="md:col-span-1">
                    <Card className="shadow-md">
                      <CardHeader>
                        <CardTitle>Weekly Schedule</CardTitle>
                        <CardDescription>Your personalized workout plan</CardDescription>
                      </CardHeader>
                      <CardContent className="px-2">
                        {userData?.data.workoutPlan.map((workout, index) => (
                          <WorkoutCard
                            key={workout.day}
                            workout={workout}
                            isActive={selectedDay === workout.day}
                            onClick={() => setSelectedDay(workout.day)}
                            index={index}
                          />
                        ))}
                      </CardContent>
                    </Card>
                  </div>

                  {/* Workout details */}
                  <div className="md:col-span-2">
                    <Card className="shadow-md h-full">
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <div>
                            <CardTitle>
                              {selectedDay && userData?.data.workoutPlan.find((w) => w.day === selectedDay)?.name}
                            </CardTitle>
                            <CardDescription>{selectedDay && `${selectedDay}'s workout plan`}</CardDescription>
                          </div>
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                          >
                            Start Workout
                          </motion.button>
                        </div>
                      </CardHeader>
                      <CardContent>
                        {selectedDay && (
                          <>
                            <div className="bg-indigo-50 p-4 rounded-lg mb-6 italic text-gray-700">
                              "{userData?.data.workoutPlan.find((w) => w.day === selectedDay)?.quote}"
                            </div>

                            <div className="space-y-4">
                              {userData?.data.workoutPlan
                                .find((w) => w.day === selectedDay)
                                ?.exercises.map((exercise, index) => (
                                  <motion.div
                                    key={`${exercise.name}-${index}`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    className="bg-white border border-gray-100 rounded-lg shadow-sm overflow-hidden"
                                  >
                                    <div
                                      className="p-4 flex items-center justify-between cursor-pointer"
                                      onClick={() => setExpandedExercise(expandedExercise === index ? null : index)}
                                    >
                                      <div className="flex items-center">
                                        <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-3">
                                          <Dumbbell className="h-5 w-5 text-indigo-600" />
                                        </div>
                                        <div>
                                          <h3 className="font-medium text-gray-800">{exercise.name}</h3>
                                          <p className="text-sm text-gray-500">
                                            {exercise.sets} sets x {exercise.reps} reps
                                            {exercise.muscle && ` · ${exercise.muscle}`}
                                          </p>
                                        </div>
                                      </div>
                                      <ChevronDown
                                        className={`h-5 w-5 text-gray-400 transition-transform ${expandedExercise === index ? "transform rotate-180" : ""
                                          }`}
                                      />
                                    </div>

                                    {expandedExercise === index && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: "auto", opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        className="px-4 pb-4"
                                      >
                                        <div className="bg-gray-50 p-3 rounded-lg space-y-2">
                                          <div className="flex justify-between text-sm">
                                            <span className="text-gray-600">Rest between sets:</span>
                                            <span className="font-medium">{exercise.rest} seconds</span>
                                          </div>
                                          {exercise.duration && (
                                            <div className="flex justify-between text-sm">
                                              <span className="text-gray-600">Duration:</span>
                                              <span className="font-medium">{exercise.duration} minutes</span>
                                            </div>
                                          )}
                                          <div className="flex items-center space-x-2 mt-3">
                                            <button className="text-xs bg-indigo-100 text-indigo-700 px-3 py-1 rounded-full hover:bg-indigo-200 transition-colors">
                                              <Info className="h-3 w-3 inline mr-1" />
                                              View tutorial
                                            </button>
                                            <button className="text-xs bg-gray-100 text-gray-700 px-3 py-1 rounded-full hover:bg-gray-200 transition-colors">
                                              <Share2 className="h-3 w-3 inline mr-1" />
                                              Share
                                            </button>
                                          </div>
                                        </div>
                                      </motion.div>
                                    )}
                                  </motion.div>
                                ))}
                            </div>
                          </>
                        )}
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === "progress" && (
              <motion.div
                key="progress"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Weight Progress */}
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <BarChart4 className="h-5 w-5 mr-2 text-green-600" />
                        Weight Progress
                      </CardTitle>
                      <CardDescription>Weekly tracking</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={mockProgressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" />
                            <YAxis domain={["auto", "auto"]} />
                            <Tooltip />
                            <Line
                              type="monotone"
                              dataKey="weight"
                              stroke="#2e7d32"
                              strokeWidth={2}
                              dot={{ r: 4, fill: "#2e7d32" }}
                              activeDot={{ r: 6 }}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Steps Progress */}
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Activity className="h-5 w-5 mr-2 text-blue-600" />
                        Daily Steps
                      </CardTitle>
                      <CardDescription>Weekly tracking</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={mockProgressData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="date" />
                            <YAxis />
                            <Tooltip />
                            <Area type="monotone" dataKey="steps" stroke="#0288d1" fill="#0288d1" fillOpacity={0.3} />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Milestones Timeline */}
                <Card className="shadow-md mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-indigo-600" />
                      Fitness Milestones
                    </CardTitle>
                    <CardDescription>Your progress journey</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Timeline milestones={mockMilestones} />
                  </CardContent>
                </Card>

                {/* Muscle Group Focus */}
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Dumbbell className="h-5 w-5 mr-2 text-purple-600" />
                      Muscle Group Distribution
                    </CardTitle>
                    <CardDescription>Workout focus by muscle group</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart outerRadius={90} data={mockMuscleGroupData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="muscle" />
                          <PolarRadiusAxis />
                          <Radar
                            name="Workout Frequency"
                            dataKey="workouts"
                            stroke="#8884d8"
                            fill="#8884d8"
                            fillOpacity={0.6}
                          />
                          <Tooltip />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}

            {activeTab === "nutrition" && (
              <motion.div
                key="nutrition"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                  {/* Nutrient breakdown */}
                  <Card className="shadow-md">
                    <CardHeader>
                      <CardTitle className="flex items-center">
                        <Apple className="h-5 w-5 mr-2 text-red-600" />
                        Macronutrient Breakdown
                      </CardTitle>
                      <CardDescription>Daily nutrient distribution</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={mockNutritionData}
                              cx="50%"
                              cy="50%"
                              labelLine={false}
                              label={({ name, value }) => `${name}: ${value}%`}
                              outerRadius={80}
                              fill="#8884d8"
                              dataKey="value"
                            >
                              {mockNutritionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Calorie Tracking */}
                  <div>
                    <FoodAnalyzerGemini onCalorieUpdate={handleCalorieUpdate} />
                  </div>

                  {/* Calorie tracking card - add ref to access methods */}
                  <div>
                    {/* <CalorieCard ref={calorieTrackingRef} /> */}
                  </div>
                </div>

                {/* Meal Plan Recommendations */}
                <Card className="shadow-md">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Apple className="h-5 w-5 mr-2 text-green-600" />
                      Recommended Meal Plan
                    </CardTitle>
                    <CardDescription>Based on your fitness goals</CardDescription>
                  </CardHeader>
                  {/* <CardContent>
                    <p className="text-center text-gray-600 py-8">Meal plan recommendations will be available soon!</p>
                  </CardContent> */}
                  <CardFooter className="flex justify-center">
                    <MealSuggestions />
                  </CardFooter>
                </Card>
              </motion.div>
            )}

            {activeTab === "goals" && (
              <motion.div
                key="goals"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                <Card className="shadow-md mb-8">
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Target className="h-5 w-5 mr-2 text-indigo-600" />
                      Your Fitness Goals
                    </CardTitle>
                    <CardDescription>Track and manage your objectives</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Timeline milestones={mockMilestones} />
                  </CardContent>
                  <CardFooter>
                    <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center">
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Add New Goal
                    </button>
                  </CardFooter>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

export default Dashboard

