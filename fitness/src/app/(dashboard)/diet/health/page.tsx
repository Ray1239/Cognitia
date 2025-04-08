'use client';

import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const HealthyDiet = () => {
    return (
        <div className="min-h-screen bg-white">
            <div className="container mx-auto px-4 flex flex-col items-center justify-center lg:w-1/2 sm:w-4/5 w-full">
                <div className="w-full relative h-[400px] mt-4 border-2 rounded-xl">
                    <Image
                        src="/Assets/heath1.png"
                        alt="Healthy Food"
                        fill
                        className="object-cover"
                        priority
                    />
                </div>
            </div>

            <div className="container mx-auto px-4 mt-8 flex flex-col items-center">
                <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Balanced Healthy Diet Plan
                </h1>

                <p className="text-lg leading-relaxed tracking-wide text-black mb-8">
                    A healthy diet is about more than just managing weight—it's about nourishing your body with the right balance of nutrients. The key is to eat a variety of foods from all food groups while maintaining proper portions. A balanced diet supports your immune system, provides energy, improves mental clarity, and promotes overall wellness. Focus on whole, minimally processed foods and maintain a <span className="text-orange-500">colorful plate</span> with plenty of fruits and vegetables. Remember, healthy eating is a lifestyle, not a temporary fix.
                </p>

                <div className="grid lg:grid-cols-2 gap-8 w-full mb-12  mt-8">
                    <div>
                        <h2 className="text-2xl font-semibold mb-4 text-black">
                            Principles of Healthy Eating
                        </h2>
                        <ul className="space-y-2 text-gray-600 list-disc pl-6">
                            <li>Eat a rainbow of fruits and vegetables</li>
                            <li>Choose whole grains over refined grains</li>
                            <li>Include lean proteins and plant-based options</li>
                            <li>Incorporate healthy fats</li>
                            <li>Stay hydrated with water</li>
                            <li>Practice mindful eating</li>
                        </ul>
                    </div>
                    <div className="relative h-[300px] border-2 rounded-xl">
                        <Image
                            src="/Assets/health2.png"
                            alt="Colorful Healthy Food"
                            fill
                            className="object-cover rounded-lg"
                        />
                    </div>
                </div>

                <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                    Essential Components of a Healthy Diet
                </h2>

                <div className="border rounded-2xl p-2 w-full">

                    <Accordion type="single" collapsible className="w-full space-y-4">
                        <AccordionItem value="item-1">
                            <AccordionTrigger>Fruits and Vegetables</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-gray-600">
                                    Aim for <span className="text-orange-500">5-9 servings</span> of fruits and vegetables daily:
                                    <br /><br />
                                    • Dark leafy greens (spinach, kale, swiss chard)
                                    <br />
                                    • Colorful vegetables (bell peppers, carrots, tomatoes)
                                    <br />
                                    • Berries (strawberries, blueberries, raspberries)
                                    <br />
                                    • Citrus fruits (oranges, lemons, grapefruits)
                                    <br />
                                    • Cruciferous vegetables (broccoli, cauliflower, brussels sprouts)
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-2">
                            <AccordionTrigger>Whole Grains and Fiber</AccordionTrigger>
                            <AccordionContent>
                                <p className="text-gray-600">
                                    Choose whole grains for sustained energy and fiber:
                                    <br /><br />
                                    • Quinoa and brown rice
                                    <br />
                                    • Oats and barley
                                    <br />
                                    • Whole wheat bread and pasta
                                    <br />
                                    • Ancient grains (farro, amaranth, millet)
                                    <br />
                                    Aim for <span className="text-orange-500">25-35 grams</span> of fiber daily
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-3">
                            <AccordionTrigger>
                                Healthy Proteins and Fats
                            </AccordionTrigger>
                            <AccordionContent>
                                <p className="text-gray-600">
                                    Include a mix of protein sources:
                                    <br /><br />
                                    • Fish (especially fatty fish rich in omega-3s)
                                    <br />
                                    • Lean meats and poultry
                                    <br />
                                    • Legumes and beans
                                    <br />
                                    • Nuts and seeds
                                    <br />
                                    • Plant-based proteins (tofu, tempeh)
                                    <br /><br />
                                    Healthy fats from:
                                    <br />
                                    • Avocados
                                    <br />
                                    • Olive oil
                                    <br />
                                    • Nuts and seeds
                                </p>
                            </AccordionContent>
                        </AccordionItem>

                        <AccordionItem value="item-4">
                            <AccordionTrigger>
                                Smart Snacking and Portion Control
                            </AccordionTrigger>
                            <AccordionContent>
                                <div className="space-y-4 text-gray-600">
                                    <p>
                                        Healthy snack options:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Fresh fruit with nuts</li>
                                        <li>Greek yogurt with berries</li>
                                        <li>Hummus with vegetable sticks</li>
                                        <li>Hard-boiled eggs</li>
                                        <li>Smoothies with leafy greens</li>
                                    </ul>
                                    <p>
                                        Portion control tips:
                                    </p>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li>Use smaller plates</li>
                                        <li>Fill half plate with vegetables</li>
                                        <li>Practice mindful eating</li>
                                        <li>Listen to hunger cues</li>
                                    </ul>
                                </div>
                            </AccordionContent>
                        </AccordionItem>
                    </Accordion>
                </div>

                <Card className="mt-12 mb-12 w-full">
                    <CardContent className="p-6">
                        <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent text-center">
                            SUMMARY
                        </h2>
                        <ul className="space-y-4 text-gray-600 list-disc pl-6">
                            <li>
                                Eat a variety of colorful fruits and vegetables daily for essential vitamins and minerals.
                            </li>
                            <li>
                                Choose whole grains and high-fiber foods for sustained energy and digestive health.
                            </li>
                            <li>
                                Include a mix of lean proteins and healthy fats from both animal and plant sources.
                            </li>
                            <li>
                                Stay hydrated and practice mindful eating habits.
                            </li>
                            <li>
                                Plan balanced meals and healthy snacks throughout the day.
                            </li>
                        </ul>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default HealthyDiet;