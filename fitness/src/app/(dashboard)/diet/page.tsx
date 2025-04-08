"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React from "react";



const dietData = [
    {
        id: 1,
        title: "Diet Meal Plan to Lose Weight",
        route: "/diet/loose",
        description:
            "This easy 1,500-calorie weight-loss meal plan is specially tailored to help you feel energized .",
        image: "/Assets/looseweight.png"
    },
    {
        id: 2,
        title: "Diet Meal Plan to Gain Weight",
        route: "/diet/gain",
        description:
            "Gain weight the healthy way with this nutrient-packed meal plan.",
        image: "/Assets/weight.png"
    },
    {
        id: 3,
        title: "Healthy Eating Plate",
        route: "/diet/health",
        description:
            "Use the Healthy Eating Plate as a guide for creating healthy, balanced meals—whether served at the table or packed in a lunch box.",
        image: "/Assets/plate.png"
    },
];



export default function DietPage() {
    const router =  useRouter();

    const handleClick = (route:string) => {
        router.push(route);
    }
    return (
        <div className="p-8 space-y-8">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-gray-800">Diet Suggestion</h1>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-1 gap-4">
                {dietData.map((item) => (
                    <Card key={item.id} className="w-96 rounded-xl p-4 shadow-lg overflow-hidden border border-gray-200" onClick={() => handleClick(item.route)}>
                        <Image
                            src={item.image}
                            alt={item.title}
                            width={1000}
                            height={600}
                            className="w-full object-cover"
                        />
                        <CardHeader>
                            <CardTitle className="text-2xl text-center font-semibold">{item.title}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-base text-center text-gray-600 font-semibold">{item.description}</p>
                            {/* <Link to={item.route}>
                                <Button className="mt-4 w-full"></Button>
                            </Link> */}
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    )
}