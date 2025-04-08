import { NextRequest, NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { PrismaClient } from "@prisma/client";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/lib/auth";

const prisma = new PrismaClient();
const API_KEY = process.env.GOOGLE_API_KEY!;

// Assuming generateMealSuggestionsWithGemini is defined elsewhere with logging
async function generateMealSuggestionsWithGemini(userProfile: {
    numberOfMeals: number;
    dietaryPreferences: string[];
    allergies: string[];
    weightGoal: string;
    activityLevel: string;
    gender: string;
    dailyCalories?: number;
}) {
    console.log("🔍 Input to generateMealSuggestionsWithGemini:", JSON.stringify(userProfile, null, 2));

    const genAI = new GoogleGenAI({ apiKey: API_KEY as string });

    const dietaryPreferences = userProfile.dietaryPreferences?.length
        ? userProfile.dietaryPreferences.join(", ")
        : "None";
    const allergies = userProfile.allergies?.length ? userProfile.allergies.join(", ") : "None";
    const dailyCalories = userProfile.dailyCalories || 2000;

    const prompt = `Generate ${userProfile.numberOfMeals} healthy meal suggestions with the following requirements:
    - Total daily calories: ${dailyCalories}
    - Dietary preferences: ${dietaryPreferences}
    - Allergies to avoid: ${allergies}
    - Weight goal: ${userProfile.weightGoal}
    - Activity level: ${userProfile.activityLevel}
    - Gender: ${userProfile.gender}

    Each meal should include:
    1. Name
    2. Brief description
    3. Calories (number, no null values)
    4. Macronutrients (protein, carbs, fat in grams, no null values)
    5. List of ingredients
    6. Step-by-step cooking instructions

    **Return only valid JSON**, no explanations or markdown.  
    Use this format:
    [
        {
        "name": "Meal Name",
        "description": "Brief description",
        "calories": 450,
        "protein": 30,
        "carbs": 50,
        "fat": 10,
        "ingredients": ["ingredient1", "ingredient2"],
        "instructions": ["step1", "step2"]
        }
    ]`;

    try {
        console.log("📝 Generated Prompt:", prompt);
        const result = await genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [prompt],
            config: { tools: [{ googleSearch: {} }] },
        });
        const text = result.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!text) throw new Error("No response text from Gemini");

        console.log("🔹 Raw Response from Gemini:", text);

        const jsonMatch = text.match(/\[[\s\S]*\]/);
        if (!jsonMatch) throw new Error("Invalid JSON response from Gemini");

        let cleanedText = jsonMatch[0]
            .replace(/"protein": (\d+)g/g, '"protein": $1')
            .replace(/"carbs": (\d+)g/g, '"carbs": $1')
            .replace(/"fat": (\d+)g/g, '"fat": $1')
            .trim();

        console.log("🔹 Cleaned JSON Response:", cleanedText);

        let meals;
        try {
            meals = JSON.parse(cleanedText);
            if (!Array.isArray(meals)) throw new Error("Response is not an array");
        } catch (error) {
            console.error("❌ JSON Parsing Error:", error);
            throw new Error("Failed to parse Gemini response");
        }

        const formattedMeals = meals.map((meal: any) => ({
            name: meal.name || "Unknown Meal",
            description: meal.description || "No description available",
            calories: typeof meal.calories === "number" ? Math.round(meal.calories) : 0,
            protein: typeof meal.protein === "number" ? Math.round(meal.protein) : 0,
            carbs: typeof meal.carbs === "number" ? Math.round(meal.carbs) : 0,
            fat: typeof meal.fat === "number" ? Math.round(meal.fat) : 0,
            ingredients: Array.isArray(meal.ingredients) ? meal.ingredients : [],
            instructions: Array.isArray(meal.instructions) ? meal.instructions : [],
        }));

        console.log("✅ Generated Meals:", JSON.stringify(formattedMeals, null, 2));
        return formattedMeals;
    } catch (error) {
        console.error("❌ Error in generateMealSuggestionsWithGemini:", error);
        throw error;
    }
}

export async function GET(req: NextRequest) {
    try {
        console.log("🚀 Starting GET request for meal suggestions");

        const session = await getServerSession(authOptions);
        console.log("🔐 Session Data:", session);

        if (!session?.user?.email) {
            console.log("⚠️ No user email found in session");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        console.log("🔍 Fetching user with email:", session.user.email);
        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            console.log("⚠️ User not found for email:", session.user.email);
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        console.log("👤 User Data Fetched:", JSON.stringify(user, null, 2));

        // Prepare user profile for meal generation
        const userProfile = {
            dailyCalories: user.dailyCalories || 2000,
            numberOfMeals: user.numberOfMeals || 3,
            dietaryPreferences: user.dietaryPreferences || [],
            allergies: user.allergies || [],
            weightGoal: user.weightGoal || "maintain",
            activityLevel: user.activityLevel || "moderate",
            gender: user.gender || "MALE",
        };

        console.log("🍽️ User Profile for Meal Generation:", JSON.stringify(userProfile, null, 2));

        // Generate meals
        const meals = await generateMealSuggestionsWithGemini(userProfile);

        // Add unique IDs to meals
        const mealsWithIds = meals.map((meal, index) => ({
            id: `meal-${index + 1}`,
            ...meal,
        }));

        console.log("📤 Final Response Meals:", JSON.stringify(mealsWithIds, null, 2));

        return NextResponse.json(
            {
                success: true,
                meals: mealsWithIds,
            },
            { status: 200 }
        );
    } catch (error) {
        console.error("❌ Error fetching meals:", error);
        return NextResponse.json({ message: "Internal server error" }, { status: 500 });
    }
}

export async function POST(req: NextRequest) {
    try {
        console.log("🚀 Starting POST request for meal suggestions");

        const session = await getServerSession(authOptions);
        console.log("🔐 Session Data:", session);

        if (!session?.user?.email) {
            console.log("⚠️ No user email found in session");
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const userData = await req.json();
        console.log("📥 Received User Data from POST:", JSON.stringify(userData, null, 2));

        // Generate meals using provided data
        const meals = await generateMealSuggestionsWithGemini({
            dailyCalories: userData.dailyCalories,
            numberOfMeals: userData.numberOfMeals,
            dietaryPreferences: userData.dietaryPreferences,
            allergies: userData.allergies,
            weightGoal: userData.weightGoal,
            activityLevel: userData.activityLevel,
            gender: userData.gender,
        });

        // Add unique IDs to meals
        const mealsWithIds = meals.map((meal, index) => ({
            id: `meal-${Date.now()}-${index}`,
            ...meal,
        }));

        console.log("📤 Final Response Meals:", JSON.stringify(mealsWithIds, null, 2));

        return NextResponse.json(
            {
                success: true,
                meals: mealsWithIds,
            },
            { status: 201 }
        );
    } catch (error) {
        console.error("❌ Error generating meals:", error);
        return NextResponse.json({ message: "Failed to generate meal suggestions" }, { status: 500 });
    }
}