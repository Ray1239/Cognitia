'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const LooseWeight = () => {
    return (
        <div className="min-h-screen">
            <div className="container mx-auto px-4 flex flex-col items-center justify-center lg:w-1/2 sm:w-4/5 w-full">
                <div className="w-full relative h-[400px] mt-4 p-2 border-2 rounded-xl">
                    <Image
                        src="/Assets/loose1.png"
                        alt="Weight Loss"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Weight Loss Diet Plan
                </h1>

                <p className="text-lg leading-relaxed tracking-wide text-black mb-8">
                    The key to successful weight loss is creating a sustainable calorie deficit. This means consuming fewer calories than your body burns daily. While it might be tempting to drastically cut calories, sustainable weight loss occurs gradually. Aim for a moderate calorie deficit of <span className="text-orange-500">500-750 calories per day</span>, which can result in a healthy weight loss of <span className="text-orange-500">1-2 pounds per week</span>. Combined with regular exercise, especially strength training to preserve muscle mass, this approach leads to long-term success. Remember, slow and steady wins the race when it comes to weight loss.
                </p>

                <div className="grid lg:grid-cols-2 gap-8 w-full mb-12 mt-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-black">
                            Essential Rules for Weight Loss
                        </h2>
                        <ul className="space-y-2 text-gray-600 list-disc pl-6">
                            <li>Maintain a calorie deficit</li>
                            <li>Eat protein with every meal</li>
                            <li>Stay hydrated (drink water before meals)</li>
                            <li>Get adequate sleep</li>
                            <li>Include regular exercise</li>
                            <li>Plan your meals ahead</li>
                        </ul>
                    </div>
                    <div className="relative h-[300px] border-2 rounded-xl">
                        <Image
                            src="/Assets/loose2.png"
                            alt="Weight Loss"
                            fill
                            className="object-cover"
                            priority
                        />
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Effective Weight Loss Strategies
                </h2>

                <div className="border rounded-2xl p-2 w-full">
                    <Accordion type="single" collapsible className="space-y-4">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Increase Protein Intake</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-gray-600 text-base">
                                    Protein is crucial for weight loss as it helps preserve muscle mass and increases satiety. Aim for <span className="text-orange-500">0.8-1.2g of protein per pound</span> of body weight. High-protein foods include:
                                    <br /><br />
                                    • Lean meats and poultry
                                    <br />
                                    • Fish and seafood
                                    <br />
                                    • Eggs
                                    <br />
                                    • Greek yogurt and cottage cheese
                                    <br />
                                    • Legumes and lentils
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                            <AccordionTrigger>Control Portion Sizes</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-gray-600">
                                    Even healthy foods can contribute to weight gain if portions are too large. Use these strategies:
                                    <br /><br />
                                    • Use smaller plates and bowls
                                    <br />
                                    • Measure portions initially to understand serving sizes
                                    <br />
                                    • Fill half your plate with vegetables
                                    <br />
                                    • Wait 20 minutes before getting seconds
                                    <br />
                                    • Practice mindful eating
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                Choose Low-Calorie, Nutrient-Dense Foods
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-gray-600">
                                    Focus on foods that provide maximum nutrition with minimal calories:
                                    <br /><br />
                                    • Leafy greens and vegetables
                                    <br />
                                    • Fruits (especially berries)
                                    <br />
                                    • Lean proteins
                                    <br />
                                    • Whole grains in moderation
                                    <br />
                                    • Low-fat dairy products
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                Implement Strategic Meal Timing
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 text-gray-600">
                                    <p>
                                        When you eat can be as important as what you eat:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Eat breakfast within an hour of waking</li>
                                        <li>Space meals 3-4 hours apart</li>
                                        <li>Avoid eating late at night</li>
                                        <li>Consider intermittent fasting after consulting a healthcare provider</li>
                                        <li>Plan healthy snacks between meals if needed</li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <Card className="mt-12 mb-12 w-full border rounded-2xl">
                    <CardContent className="p-6">
                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent text-center">
                            SUMMARY
                        </h2>
                        <ul className="space-y-4 text-gray-200 list-disc pl-6">
                            <li className="text-black">
                                Create a sustainable calorie deficit through balanced nutrition and portion control.
                            </li>
                            <li className="text-black">
                                Prioritize protein intake to preserve muscle mass and increase satiety.
                            </li>
                            <li className="text-black">
                                Choose nutrient-dense, low-calorie foods and stay hydrated.
                            </li>
                            <li className="text-black">
                                Combine diet with regular exercise, adequate sleep, and stress management.
                            </li>
                            <li className="text-black">
                                Practice mindful eating and plan meals ahead for better success.
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default LooseWeight;