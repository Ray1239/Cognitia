// src/app/api/nutrition/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

interface FoodAnalysis {
    food: string;
    calories: number | string;
    carbs: number | string;
    protein: number | string;
    fat: number | string;
    feedback: string;
}

interface ApiRequestBody {
    imageBase64: string;
    mimeType: string;
}

const MODEL_NAME = "gemini-2.0-flash"; // Adjust to the correct vision-capable model

export async function POST(request: NextRequest) {
    const apiKey = process.env.GOOGLE_API_KEY;
    if (!apiKey) {
        return NextResponse.json({ error: 'API key configuration error.' }, { status: 500 });
    }

    try {
        const body: ApiRequestBody = await request.json();
        const { imageBase64, mimeType } = body;
        
        if (!imageBase64 || !mimeType) {
            return NextResponse.json({ error: 'Missing imageBase64 or mimeType in request body.' }, { status: 400 });
        }

        const genAI = new GoogleGenerativeAI(apiKey);
        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const generationConfig = {
            temperature: 0.4,
            topK: 32,
            topP: 1,
            maxOutputTokens: 4096,
        };

        const safetySettings = [
            { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
            { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE },
        ];

        const prompt = `
          You are a helpful nutritionist AI assistant. Analyze the food item in the provided image.
          Your tasks are:
          1. Identify the main food items in the image (e.g., "Grilled Chicken Salad", "Spaghetti Bolognese").
          2. Estimate the nutritional breakdown for a typical serving size shown in the image:
             - Calories (kcal)
             - Carbohydrates (g)
             - Protein (g)
             - Fat (g)
          3. Provide a short health/fitness recommendation based on the analysis. Consider its suitability for:
             - Weight loss
             - Muscle gain
             - Keto/low-carb diets
             - A balanced healthy diet
          4. Mention if it's notably high or low in any specific macronutrient.
          5. IMPORTANT: Return your answer ONLY as a valid JSON object strictly following this format, with estimated numerical values where possible:
          \`\`\`json
          {
            "food": "...",
            "calories": "...",
            "carbs": "...",
            "protein": "...",
            "fat": "...",
            "feedback": "..."
          }
          \`\`\`
          Do not include any text before or after the JSON object. Provide estimations, acknowledging they are approximate. Use numbers for nutritional values if possible, otherwise use descriptive terms like "moderate".
        `;

        const parts = [
            { text: prompt },
            { inlineData: { mimeType, data: imageBase64 } },
        ];

        const result = await model.generateContent({
            contents: [{ role: "user", parts }],
            generationConfig,
            safetySettings,
        });

        const responseText = result.response.text();
        const cleanedJsonString = responseText
            .replace(/^```json\s*/, '')
            .replace(/```\s*$/, '')
            .trim();

        console.log("Cleaned Gemini Response:", cleanedJsonString);

        if (!cleanedJsonString.startsWith('{') || !cleanedJsonString.endsWith('}')) {
            throw new Error("Response is not a valid JSON object.");
        }

        const analysisResult: FoodAnalysis = JSON.parse(cleanedJsonString);
        if (!analysisResult.food || analysisResult.calories === undefined || analysisResult.feedback === undefined) {
            throw new Error("Parsed JSON is missing required fields.");
        }

        return NextResponse.json(analysisResult);
    } catch (error: any) {
        console.error("Error calling Gemini API:", error);
        const errorMessage = error.message || 'An unknown error occurred.';
        return NextResponse.json({
            error: `Failed to analyze image: ${errorMessage}`,
            rawResponse: error.response?.text?.() || error.message,
        }, { status: 500 });
    }
}