import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { authOptions } from "@/app/lib/auth";
import { GoogleGenAI } from "@google/genai";
import { getServerSession } from "next-auth";

const prisma = new PrismaClient();

//Gemini ai
const API_KEY = process.env.GOOGLE_API_KEY;
const genAI = new GoogleGenAI({ apiKey: API_KEY as string });

export async function POST(req: NextRequest) {
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.email) {
        return NextResponse.json(
            { message: 'Unauthorized' },
            { status: 401 }
        );
    }

    try {
        const {
            weight, gender, height, age, fitnessGoal, activityLevel,
            dailyCalories, dietaryPreferences, allergies, weightGoal,
            numberOfMeals, preferredWorkoutTime, workoutDaysPerWeek,
            workoutDuration, workoutLocation, availableEquipment
        } = await req.json();

        const user = await prisma.user.findUnique({
            where: {
                email: session.user.email
            }
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                weight: parseFloat(weight),
                height: parseFloat(height),
                age: parseInt(age),
                gender,
                fitnessGoal,
                activityLevel,
                dailyCalories: parseInt(dailyCalories),
                dietaryPreferences, // Expecting an array
                allergies, // Expecting an array
                weightGoal,
                numberOfMeals: numberOfMeals ? parseInt(numberOfMeals) : null,
                preferredWorkoutTime,
                workoutDaysPerWeek: workoutDaysPerWeek ? parseInt(workoutDaysPerWeek) : null,
                workoutDuration: workoutDuration ? parseInt(workoutDuration) : null,
                workoutLocation,
                availableEquipment
            },
        });

        // Enhanced prompt with video tutorial details
        const prompt = `
        Create an exciting, motivating, and personalized *7-day workout plan with tutorial video links* for a ${age}-year-old ${gender} who:
        - *Weight:* ${weight} lbs
        - *Height:* ${height} inches
        - *Fitness Goal:* ${fitnessGoal}
        - *Activity Level:* ${activityLevel}
        - *Workout Frequency:* ${workoutDaysPerWeek} days per week
        - *Workout Duration:* ${workoutDuration} minutes per session
        - *Workout Location:* ${workoutLocation}
        - *Available Equipment:* ${availableEquipment}
        - *Preferred Workout Time:* ${preferredWorkoutTime || 'any time'}
        
        ### *Important Guidelines for Exercise Selection*
        1. *If the workout location is home, only suggest **bodyweight exercises* or *exercises using the available equipment* (e.g., resistance bands, dumbbells, yoga mats). Do *not* include exercises that require gym machines or barbells unless they are listed as available.
        2. *If the workout location is a gym, include a **mix of machine-based, free weight, and bodyweight exercises*.
        3. *Always ensure the workout plan aligns with the user's fitness goal* (e.g., strength, weight loss, muscle building, endurance).
        4. *Each workout should be fun and motivating* to keep the user engaged.
        5. *Consider the user's fitness level based on their data* when selecting exercises:
           - For beginners (low activity level): Include more foundational exercises with proper form guidance.
           - For intermediate/advanced (moderate to high activity level): Include more complex movements appropriate to their level.
        
        ### *Tutorial Video Links and Suggestions*
        For each exercise, provide:
        1. *3 tutorial focus areas* that are most important for this specific user based on their profile:
           - For example, a beginner with weight loss goals might need "Proper Form", "Modifications for Beginners", and "Breathing Technique".
           - For an intermediate/advanced user with muscle gain goals, they might need "Advanced Variations", "Mind-Muscle Connection", and "Progressive Overload Tips".
        2.  *A high-quality, real, specific YouTube video link*:
            - *Critically, this MUST be a valid and working YouTube URL for a video directly demonstrating the exact exercise.*
            - *The video *must match the exercise name precisely.**
            - *The video quality MUST be high (good audio, clear visuals).*
            - *The video source MUST be from a reputable fitness channel known for accurate instruction* (e.g., Fitness Blender, Athlean-X, HASfit, Bowflex, ScottHermanFitness, PictureFit, or similar well-known channels focused on instruction rather than just workout montages).
            - *The video choice MUST be appropriate for the user's data:*
                - If the user is a beginner, the video should explain basic form well and suggest modifications.
                - If the user is intermediate/advanced, it should offer more challenging variations and techniques.
                - If the workout location is 'home' and the user only has resistance bands, the video MUST demonstrate using resistance bands for that exercise.
                - The video content MUST align with the user's fitness goal (e.g., weight loss = cardio/high-rep, muscle gain = strength/hypertrophy).
                - Consider the user's age and gender (if this strongly affects exercise selection or explanation).
            - Return the full, valid YouTube URL (e.g., "https://www.youtube.com/watch?v=xyz1234567"). Do not return placeholder URLs or search queries.
        3. *Key form tips* specific to the exercise that address:
           - Common mistakes to avoid.
           - Proper body positioning.
           - How to maximize effectiveness for their specific fitness goals.
        
        ### *Workout Plan Structure*
        - *Each day's workout should have a creative and exciting title* (e.g., "Upper Body Power Surge" instead of "Upper Body Day").
        - *Include 3-5 exercises per day*, specifying:
          - Exercise name
          - Sets and reps (use exact numbers, not ranges)
          - Rest time (numeric, e.g., 60 seconds)
          - Tutorial focus areas (3 per exercise)
          - Tutorial video link (real YouTube URL)
          - Form tips (3 key points per exercise)
        - *For rest days (Saturday and Sunday)*:
          - Suggest *light activities* like stretching, yoga, or walking for *30 minutes*.
          - Choose activities based on their gender and fitness goal (e.g., yoga for flexibility if aiming to gain muscle, walking for endurance).
          - *Use duration (minutes) instead of sets and reps*.
          - Include tutorial focus areas and a real YouTube video link for these activities too.
        - *Each day should include a motivational quote*.
        
        ### *Return Format*
        Return the response as *pure JSON* without any markdown, code blocks, or extra text. Follow this structure:
        {
            "workoutPlan": [
                {
                    "day": "Day 1",
                    "name": "Workout Name",
                    "exercises": [
                        {
                            "name": "Exercise Name (e.g., Barbell Squat)",
                            "sets": 3,
                            "reps": 12,
                            "rest": 60,
                            "tutorialFocus": ["Proper back arch", "Knee tracking over toes", "Breathing technique"],
                            "tutorialLink": "youtubelink add here",
                            "formTips": ["Engage core", "Drive through heels", "Maintain neutral spine"]
                        }
                    ],
                    "quote": "Motivational quote for the day"
                },
                {
                    "day": "Saturday",
                    "name": "Active Recovery",
                    "exercises": [
                        {
                            "name": "Yoga (Light Flow)",
                            "duration": 30,
                            "tutorialFocus": ["Proper Alignment", "Diaphragmatic Breathing", "Modifications"],
                            "tutorialLink": "youtube link add here",
                            "formTips": ["Focus on controlled movements", "Breathe deeply", "Listen to your body's limits"]
                        }
                    ],
                    "quote": "Recovery is part of progress!"
                }
            ]
        }
        `;

        let workoutPlan;
        try {
            const result = await genAI.models.generateContent({
                model: 'gemini-2.0-flash',
                contents: [
                    prompt
                ],
                config: {
                    tools: [{ googleSearch: {} }],
                }
            });
            const workoutPlanText = await result.text;
            console.log(workoutPlanText);

            // Clean the response
            const extractJSON = (text: string) => {
                const jsonMatch = text.match(/\{[\s\S]*\}/); // Find JSON block
                return jsonMatch ? jsonMatch[0] : null;
            };

            if (!workoutPlanText) {
                throw new Error('Error')
            }

            let cleanedText = extractJSON(workoutPlanText);

            if (!cleanedText) {
                throw new Error('No valid JSON found in response');
            }

            try {
                workoutPlan = JSON.parse(cleanedText);
            } catch (parseError: any) {
                console.error('Error parsing cleaned Gemini response:', parseError);
                console.error('Cleaned response:', cleanedText);
                return NextResponse.json(
                    {
                        message: "Error parsing workout plan response",
                        error: parseError.message,
                        rawResponse: workoutPlanText,
                        cleanedResponse: cleanedText
                    },
                    { status: 500 }
                );
            }
        } catch (error: any) {
            console.error('Gemini API Error:', error);
            return NextResponse.json(
                {
                    message: "Error generating workout plan",
                    error: error.message
                },
                { status: 500 }
            );
        }

        const workoutPlanRecord = await prisma.workoutPlan.create({
            data: {
                userId: user.id,
                plan: workoutPlan,
                createdAt: new Date()
            }
        });

        return NextResponse.json(
            {
                success: true,
                message: 'User updated and workout plan generated successfully',
                data: {
                    user: updatedUser,
                    workoutPlan: workoutPlan.workoutPlan
                }
            },
            { status: 201 }
        );
    } catch (error: any) {
        console.error('Error processing request:', error);
        return NextResponse.json(
            { message: "Internal server error", error: error.message },
            { status: 500 }
        );
    }
}

// Define the enhanced structure stored in the 'plan' Json field
interface WorkoutPlanData {
    workoutPlan: {
        day: string;
        name: string;
        exercises: {
            name: string;
            sets?: number;
            reps?: number;
            rest?: number;
            duration?: number;
            tutorialFocus: string[];
            formTips: string[];
        }[];
        quote: string;
    }[];
}

// Type for the WorkoutPlan model
interface WorkoutPlanRecord {
    id: number;
    userId: number;
    plan: WorkoutPlanData;
    createdAt: Date;
}

export async function GET(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session || !session.user?.email) {
            return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (!user) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const workoutPlanRecord = await prisma.workoutPlan.findFirst({
            where: { userId: user.id },
            orderBy: { createdAt: "desc" }, // Get the most recent plan
        }) as WorkoutPlanRecord | null;

        return NextResponse.json({
            success: true,
            message: "Content fetched successfully",
            data: {
                user: user,
                workoutPlan: workoutPlanRecord?.plan.workoutPlan || [], // Access plan.workoutPlan safely
            },
        }, { status: 200 });
    } catch (error) {
        console.error("Error while fetching user details:", error);
        return NextResponse.json(
            { success: false, error: "Internal server error" },
            { status: 500 }
        );
    }
}