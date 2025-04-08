"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCcw } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { motion } from "framer-motion";

interface Meal {
    id: string;
    name: string;
    description: string;
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
    ingredients: string[];
    instructions: string[];
}

interface User {
    user: {
        name: string;
        age: number;
        height: number;
        weight: number;
        activityLevel: string;
        dietaryPreferences: string[];
        allergies: string[];
        weightGoal: string;
        numberOfMeals: number;
        dailyCalories: number;
    }
}

export default function MealSuggestions() {
    const [meals, setMeals] = useState<Meal[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [user, setUser] = useState<User | null>(null);
    const { data: session, status } = useSession();

    const fetchUser = async () => {
        try {
            console.log("🚀 Starting fetchUser function");

            // Check if session and email exist
            if (!session?.user?.email) {
                console.log("⚠️ No session or user email found, aborting fetch");
                return;
            }
            console.log("🔐 Session email:", session.user.email);

            // Fetch user data from the API
            console.log("📡 Sending fetch request to /api/user");
            const response = await fetch('/api/user');
            console.log("📥 Fetch response status:", response.status, response.statusText);
            console.log("📥 Fetch response headers:", Object.fromEntries(response.headers.entries()));

            // Check if response is OK
            if (!response.ok) {
                console.log("❌ Response not OK:", response.status, response.statusText);
                throw new Error('Failed to fetch user data');
            }

            // Parse and log the response data
            const userData = await response.json();
            console.log("✅ Parsed user data:", JSON.stringify(userData, null, 2));

            // Set the user state with the fetched data
            setUser(userData.data);
            console.log("👤 User state updated with:", JSON.stringify(userData.data, null, 2));

        } catch (err: any) {
            console.error("❌ Error in fetchUser:", err.message);
            setError('Failed to load user data. Please try again later.');
        }
    };

    const requestNewMeal = async () => {
        try {
            console.log("🚀 Starting requestNewMeal function");

            // Check if user and session email exist
            if (!user || !session?.user?.email) {
                console.log("⚠️ No user or session email found, aborting request");
                return;
            }
            console.log("🔐 Session email:", session.user.email);
            console.log("👤 Current user state:", JSON.stringify(user, null, 2));

            setLoading(true);
            setError(null);
            console.log("🔄 Set loading to true, error to null");

            // Prepare the request payload
            const payload = {
                userId: session.user.email,
                age: user.user.age,
                height: user.user.height,
                weight: user.user.weight,
                activityLevel: user.user.activityLevel,
                dietaryPreferences: user.user.dietaryPreferences,
                allergies: user.user.allergies,
                weightGoal: user.user.weightGoal,
                numberOfMeals: user.user.numberOfMeals,
                dailyCalories: user.user.dailyCalories,
            };
            console.log("📤 Request payload to /api/meals:", JSON.stringify(payload, null, 2));

            // Send the POST request
            console.log("📡 Sending POST request to /api/meals");
            const response = await fetch("/api/meals", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload),
            });
            console.log("📥 Response status:", response.status, response.statusText);

            // Check if response is OK
            if (!response.ok) {
                console.log("❌ Response not OK:", response.status, response.statusText);
                throw new Error("Failed to generate new meals");
            }

            // Parse and log the response data
            const data = await response.json();
            console.log("✅ Parsed response data:", JSON.stringify(data, null, 2));

            // Update state with meals
            setMeals(data.meals);
            console.log("🍽️ Meals state updated with:", JSON.stringify(data.meals, null, 2));

        } catch (err: any) {
            console.error("❌ Error in requestNewMeal:", err.message);
            setError("Failed to generate new meal suggestions. Please try again.");
        } finally {
            setLoading(false);
            console.log("🔄 Set loading to false");
        }
    };

    useEffect(() => {
        if (session?.user?.email) {
            fetchUser();
        }
    }, [session]);

    if (status === "loading") {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin" />
            </div>
        );
    }

    if (status === "unauthenticated") {
        return (
            <Alert variant="destructive">
                <AlertDescription>
                    Please sign in to view meal suggestions.
                </AlertDescription>
            </Alert>
        );
    }

    return (
        <motion.div
            className="container mx-auto px-4 py-8"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
        >
            <div className="flex justify-between items-center">
                {/* <motion.h2
                    className="text-3xl font-bold"
                    initial={{ x: -10, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                >
                    AI-Generated Meal Plan
                </motion.h2> */}
                <Button
                    onClick={requestNewMeal}
                    disabled={loading || !user}
                    className="flex items-center gap-2 mb-4"
                >
                    {loading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                        <RefreshCcw className="w-4 h-4" />
                    )}
                    {loading ? "Generating..." : "Generate New Plan"}
                </Button>
            </div>

            {error && (
                <Alert variant="destructive" className="mb-6">
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {meals.map((meal, index) => (
                    <motion.div
                        key={meal.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="h-full"
                    >
                        <Card className="h-full flex flex-col justify-between hover:shadow-lg hover:scale-[1.02] transition-all duration-300 border border-gray-100 rounded-2xl bg-white">
                            <CardHeader className="pb-0">
                                <CardTitle className="text-xl font-semibold text-indigo-700">{meal.name}</CardTitle>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between">
                                <p className="text-gray-600 mb-4 italic">{meal.description}</p>

                                <div className="grid grid-cols-2 gap-4 text-center text-sm text-gray-600 mb-4">
                                    <div>
                                        <span className="block text-gray-500">🔥 Calories</span>
                                        <span className="font-semibold text-lg">{meal.calories}</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500">💪 Protein</span>
                                        <span className="font-semibold text-lg">{meal.protein}g</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500">🥖 Carbs</span>
                                        <span className="font-semibold text-lg">{meal.carbs}g</span>
                                    </div>
                                    <div>
                                        <span className="block text-gray-500">🧈 Fat</span>
                                        <span className="font-semibold text-lg">{meal.fat}g</span>
                                    </div>
                                </div>

                                <div className="space-y-4 mt-auto">
                                    <div>
                                        <h4 className="font-semibold mb-2 text-indigo-600">🥗 Ingredients</h4>
                                        <ul className="list-disc list-inside text-sm text-gray-700 space-y-1">
                                            {meal.ingredients.map((ingredient, i) => (
                                                <li key={i}>{ingredient}</li>
                                            ))}
                                        </ul>
                                    </div>

                                    <div>
                                        <h4 className="font-semibold mb-2 text-indigo-600">👨‍🍳 Instructions</h4>
                                        <ol className="list-decimal list-inside text-sm text-gray-700 space-y-1">
                                            {meal.instructions.map((instruction, i) => (
                                                <li key={i}>{instruction}</li>
                                            ))}
                                        </ol>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

        </motion.div>
    );
}
