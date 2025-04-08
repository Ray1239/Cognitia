// import { NextRequest, NextResponse } from "next/server";
// import { PrismaClient } from "@prisma/client";
// import { authOptions } from "@/app/lib/auth";
// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { getServerSession } from "next-auth";

// const prisma = new PrismaClient();

// const API_KEY = process.env.GOOGLE_API_KEY;
// if (!API_KEY) throw new Error("GOOGLE_API_KEY is not defined in environment variables");
// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

// export async function POST(req: NextRequest) {
//   const session = await getServerSession(authOptions);
//   if (!session || !session.user?.email) {
//     return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
//   }

//   try {
//     const {
//       weight,
//       gender,
//       height,
//       age,
//       fitnessGoal,
//       activityLevel,
//       dailyCalories,
//       dietaryPreferences,
//       allergies,
//       weightGoal,
//       numberOfMeals,
//       preferredWorkoutTime,
//       workoutDaysPerWeek,
//       workoutDuration,
//       workoutLocation,
//       availableEquipment,
//     } = await req.json();

//     const user = await prisma.user.findUnique({
//       where: { email: session.user.email },
//     });

//     if (!user) {
//       return NextResponse.json({ message: "User not found" }, { status: 404 });
//     }

//     const bmr =
//       gender === "male"
//         ? 10 * weight + 6.25 * height - 5 * age + 5
//         : 10 * weight + 6.25 * height - 5 * age - 161;

//     const activityFactors = {
//       sedentary: 1.2,
//       light: 1.375,
//       moderate: 1.55,
//       active: 1.725,
//       "very active": 1.9,
//     };
//     const maintenanceCalories = dailyCalories || bmr * (activityFactors[activityLevel] || 1.2);

//     let targetCalories;
//     if (fitnessGoal === "maintain weight") {
//       targetCalories = maintenanceCalories;
//     } else if (fitnessGoal === "gain weight") {
//       targetCalories = maintenanceCalories + 500;
//     } else if (fitnessGoal === "lose weight") {
//       targetCalories = maintenanceCalories - 500;
//     } else {
//       throw new Error("Invalid fitness goal");
//     }

//     const carbsCalories = targetCalories * 0.4;
//     const proteinCalories = targetCalories * 0.3;
//     const fatCalories = targetCalories * 0.3;
//     const carbsGrams = carbsCalories / 4;
//     const proteinGrams = proteinCalories / 4;
//     const fatGrams = fatCalories / 9;

//     const prompt = `
//       Generate a detailed, healthy daily diet plan in JSON format for a ${age}-year-old ${gender} weighing ${weight} kg, 
//       ${height} cm tall, with a fitness goal of "${fitnessGoal}". Their activity level is "${activityLevel}", 
//       and they want ${numberOfMeals} meals per day. Target daily calories: ${targetCalories}. 
//       Dietary preferences: ${dietaryPreferences || "none"}. Allergies: ${allergies || "none"}. 
//       Weight goal: ${weightGoal || "not specified"} kg. Include a workout suggestion for 
//       ${workoutDaysPerWeek} days/week, ${workoutDuration} minutes, at ${workoutLocation} with 
//       ${availableEquipment || "no equipment"}. Provide ${numberOfMeals} meals with:
//       - "name": meal name (e.g., "Breakfast"),
//       - "time": suggested time (e.g., "8:00 AM"),
//       - "description": brief description of the meal,
//       - "imageUrl": a generic image URL (e.g., from Unsplash or similar),
//       - "foods": array of { "name": string, "portion": string, "calories": number, "carbs": number, "protein": number, "fat": number },
//       - "totalCalories": total calories for the meal.
//       Ensure total daily macros match approximately carbs: ${carbsGrams}g, protein: ${proteinGrams}g, fat: ${fatGrams}g.
//       Return the response in JSON format with "meals" and "workout" keys.
//     `;

//     const result = await model.generateContent(prompt);
//     const dietPlanText = result.response.text();

//     let dietPlan;
//     try {
//       dietPlan = JSON.parse(dietPlanText);
//     } catch (e) {
//       dietPlan = generateFallbackDietPlan(
//         fitnessGoal,
//         targetCalories,
//         numberOfMeals,
//         dietaryPreferences,
//         allergies,
//         workoutDaysPerWeek,
//         workoutDuration,
//         workoutLocation,
//         availableEquipment
//       );
//     }

//     await prisma.dietPlan.create({
//       data: {
//         userId: user.id,
//         fitnessGoal,
//         dietDetails: JSON.stringify(dietPlan),
//         createdAt: new Date(),
//       },
//     });

//     return NextResponse.json({
//       success: true,
//       message: "Diet plan generated successfully",
//       data: {
//         fitnessGoal,
//         calories: targetCalories,
//         macros: {
//           carbs: Math.round(carbsGrams),
//           protein: Math.round(proteinGrams),
//           fat: Math.round(fatGrams),
//         },
//         dietPlan: dietPlan.meals,
//         workout: dietPlan.workout,
//       },
//     });
//   } catch (error) {
//     console.error("Error generating diet plan:", error);
//     return NextResponse.json({ success: false, message: "Internal server error" }, { status: 500 });
//   } finally {
//     await prisma.$disconnect();
//   }
// }

// function generateFallbackDietPlan(
//   fitnessGoal: string,
//   targetCalories: number,
//   numberOfMeals: number,
//   dietaryPreferences: string,
//   allergies: string,
//   workoutDaysPerWeek: number,
//   workoutDuration: number,
//   workoutLocation: string,
//   availableEquipment: string
// ) {
//   const mealTimes = ["8:00 AM", "12:00 PM", "6:00 PM"].slice(0, numberOfMeals);
//   const caloriesPerMeal = targetCalories / numberOfMeals;
//   const meals = mealTimes.map((time, index) => {
//     const mealNumber = index + 1;
//     return {
//       name: `Meal ${mealNumber}`,
//       time,
//       description: `A balanced meal for ${fitnessGoal}`,
//       imageUrl: "https://source.unsplash.com/300x200/?food,healthy",
//       foods: [
//         {
//           name: "Grilled Chicken",
//           portion: "150g",
//           calories: 240,
//           carbs: 0,
//           protein: 45,
//           fat: 6,
//         },
//         {
//           name: "Brown Rice",
//           portion: "100g",
//           calories: 120,
//           carbs: 25,
//           protein: 3,
//           fat: 1,
//         },
//         {
//           name: "Steamed Broccoli",
//           portion: "100g",
//           calories: 35,
//           carbs: 7,
//           protein: 3,
//           fat: 0,
//         },
//       ],
//       totalCalories: Math.round(caloriesPerMeal),
//     };
//   });

//   return {
//     meals,
//     workout: {
//       daysPerWeek: workoutDaysPerWeek,
//       duration: workoutDuration,
//       location: workoutLocation,
//       equipment: availableEquipment,
//       description: `Workout plan for ${fitnessGoal}: Strength training with ${availableEquipment || "bodyweight"} exercises.`,
//     },
//   };
// }