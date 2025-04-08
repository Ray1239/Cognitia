'use client';

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";

const WeightGain = () => {
  return (
    <div className="min-h-screen">
      {/* Header component would go here */}
      
      <div className="container mx-auto px-4 flex flex-col items-center justify-center lg:w-1/2 sm:w-4/5 w-full">
        <div className="w-full relative h-[400px] mt-4 border-2 rounded-xl">
          <Image
            src="/Assets/gain1.png"
            alt="Diet"
            fill
            className="object-cover"
            priority
          />
        </div>
      </div>

      <div className="container mx-auto px-4 mt-8 flex flex-col items-center">
        <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Weight Gain Diet Plan
        </h1>
        
        <p className="text-lg leading-relaxed tracking-wide text-black mb-8">
          If you're looking to gain weight, it's very important to do it right.
          Consuming soda, donuts, and other junk foods may help you gain weight
          initially, but it can increase your risk of heart disease, diabetes,
          and cancer. A healthy approach to gaining weight involves gaining a
          balanced amount of muscle mass and subcutaneous fat rather than a lot
          of unhealthy belly fat.
        </p>

        <div className="grid lg:grid-cols-2 gap-8 w-full mb-12 mt-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">
              Basic Rules to Gain Weight
            </h2>
            <ul className="space-y-2 text-gray-600 list-disc pl-6">
              <li>Avoid drinking water before meals</li>
              <li>Try weight gainer shakes</li>
              <li>Eat your protein and fat source first</li>
              <li>Get quality sleep</li>
            </ul>
          </div>
          <div className="relative h-[300px] border-2 rounded-xl">
            <Image
              src="/Assets/gain2.png"
              alt="Avoid Junk"
              fill
              className="object-cover rounded-lg"
            />
          </div>
        </div>

        <h2 className="text-3xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
          Different Strategies for Gaining Weight!
        </h2>


        <div className="border rounded-2xl p-2 w-full">
        <Accordion type="single" collapsible className="w-full space-y-4">
          <AccordionItem value="item-1">
            <AccordionTrigger>Increase your caloric intake</AccordionTrigger>
            <AccordionContent>
              <p className="text-gray-600">
                If you want to gain weight slowly and steadily, aim for{" "}
                <span className="text-orange-500">300–500 calories</span> more
                than you burn each day according to the calculator. If you want
                to gain weight fast, aim for around{" "}
                <span className="text-orange-500">700–1,000 calories</span> above
                your maintenance level.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-2">
            <AccordionTrigger>Increase your protein intake</AccordionTrigger>
            <AccordionContent>
              <p className="text-gray-600">
                To promote skeletal and muscle growth and physical strength in
                healthy adults with minimal to intense physical activity, the
                Recommended Dietary Allowance of protein is between 1 to 1.6
                grams of protein per kilogram of body weight per day.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-3">
            <AccordionTrigger>
              Increase your intake of carbs and fat
            </AccordionTrigger>
            <AccordionContent>
              <p className="text-gray-600">
                Many people try restricting either carbs or fat when trying to
                lose weight. This may make it hard to gain weight, as it will
                make it harder to get in enough calories.
              </p>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="item-4">
            <AccordionTrigger>
              Increase your intake of energy-dense foods
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 text-gray-600">
                <p>
                  It's very important to eat mostly whole foods, like fruits,
                  vegetables, whole grains, and legumes.
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Nuts: almonds, walnuts, macadamia nuts, and peanuts</li>
                  <li>Dried fruit: raisins, dates, prunes, and others</li>
                  <li>High fat dairy: whole milk, full-fat yogurt, cheese, and cream</li>
                  <li>Fats and oils: extra virgin olive oil, avocado oil</li>
                  <li>Grains: oats, brown rice</li>
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
                Eat plenty of high protein foods, such as meat, fish, eggs,
                dairy, legumes, and nuts.
              </li>
              <li>
                Eat plenty of high carb and high fat foods, such as potatoes,
                sweet potatoes, rice, pasta, oats, whole grain bread, fruits.
              </li>
              <li>
                Eat plenty of energy-dense foods, such as nuts, seeds,
                avocados, dried fruit, and whole grains.
              </li>
              <li>
                Eat plenty of whole foods, such as fruits, vegetables, whole
                grains, and legumes.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default WeightGain;