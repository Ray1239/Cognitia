"use client";
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import axios from "axios";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, ArrowLeft, PlusCircle } from "lucide-react";

type FitnessGoal = "LOSE" | "GAIN" | "MAINTAIN";
type ActivityLevel = "SEDENTARY" | "LIGHT" | "MODERATE" | "ACTIVE";

interface Details {
    weight: string;
    height: string;
    age: string;
    gender: string,
    fitnessGoal: FitnessGoal;
    activityLevel: ActivityLevel;
    dailyCalories: number;
    dietaryPreferences: string[],
    allergies: string[]
    weightGoal: string
    numberOfMeals: number | null;
    workoutDaysPerWeek: number,
    workoutDuration: number,
    workoutLocation: WorkoutLocation;
    availableEquipment: string[];
}

type WorkoutLocation = 'GYM' | 'HOME' | 'OUTDOOR';


const UserDetailsForm = () => {
    const router = useRouter();

    const [formData, setFormData] = useState<Details>({
        weight: "",
        height: "",
        age: "",
        gender: "",
        workoutDaysPerWeek: 4,
        workoutDuration: 30,
        workoutLocation: "HOME",
        availableEquipment: [] as string[],
        fitnessGoal: "MAINTAIN",
        activityLevel: "MODERATE",
        dailyCalories: 2000,
        dietaryPreferences: [] as string[],
        allergies: [] as string[],
        weightGoal: "",
        numberOfMeals: null as number | null
    });

    const [availableEquipmentInput, setAvailableEquipmentInput] = useState("");
    const [allergiesInput, setAllergiesInput] = useState("");
    const [dietaryInput, setDietaryInput] = useState("");
    const [step, setStep] = useState(1);
    const totalSteps = 3;
    const progress = (step / totalSteps) * 100;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const handleSelectChange = (name: "fitnessGoal" | "activityLevel" | "gender" | "workoutLocation", value: string) => {
        setFormData({
            ...formData,
            [name]: value,
        });
    };

    const validateCurrentStep = () => {
        switch (step) {
            case 1:
                return formData.weight && formData.height && formData.gender && formData.age;
            case 2:
                return formData.fitnessGoal && formData.activityLevel && formData.numberOfMeals !== null && formData.dietaryPreferences;
            case 3:
                return formData.dailyCalories > 0 && formData.workoutDuration >= 0 && formData.workoutLocation && formData.availableEquipment;
            default:
                return false;
        }
    };

    // const handleNext = async () => {
    //     if (validateCurrentStep()) {
    //         if (step === totalSteps) {
    //             try {
    //                 const response = await axios.post("/api/user", {
    //                     ...formData,
    //                 });
    //                 console.log(response.data);
    //                 if (response.status === 201) {
    //                     setFormData({
    //                         weight: "",
    //                         height: "",
    //                         age: "",
    //                         gender: "",
    //                         workoutDaysPerWeek: 4,
    //                         workoutDuration: 30,
    //                         workoutLocation: "",
    //                         availableEquipment: [],
    //                         fitnessGoal: "MAINTAIN",
    //                         activityLevel: "MODERATE",
    //                         dailyCalories: 2000,
    //                         dietaryPreferences: [],
    //                         allergies: [],
    //                         weightGoal: "",
    //                         numberOfMeals: null
    //                     });
    //                     toast.success("User details updated successfully!");
    //                     router.push("/dashboard");
    //                 }
    //             } catch (error) {
    //                 console.error("Error submitting form", error);
    //                 toast.error("An error occurred while submitting the form. Please try again.");
    //             }
    //         } else {
    //             setStep(step + 1);
    //         }
    //     } else {
    //         toast.error("Please fill in all required fields");
    //     }
    // };


    const handleNext = async () => {
        if (validateCurrentStep()) {
            // ✅ Custom validation for Step 1
            if (step === 1) {
                const age = Number(formData.age);
                const weight = Number(formData.weight);

                if (!age || age < 10 || age > 100) {
                    toast.error("Please enter a valid age between 10 and 100.");
                    return;
                }

                if (!weight || weight < 30 || weight > 200) {
                    toast.error("Please enter a valid weight between 30 and 200 kg.");
                    return;
                }

                if (!formData.gender) {
                    toast.error("Please select your gender.");
                    return;
                }
            }

            // ✅ Submit on last step
            if (step === totalSteps) {
                try {
                    const response = await axios.post("/api/user", {
                        ...formData,
                    });
                    console.log(response.data);

                    if (response.status === 201) {
                        setFormData({
                            weight: "",
                            height: "",
                            age: "",
                            gender: "",
                            workoutDaysPerWeek: 4,
                            workoutDuration: 30,
                            workoutLocation: "HOME",
                            availableEquipment: [],
                            fitnessGoal: "MAINTAIN",
                            activityLevel: "MODERATE",
                            dailyCalories: 2000,
                            dietaryPreferences: [],
                            allergies: [],
                            weightGoal: "",
                            numberOfMeals: null,
                        });

                        toast.success("User details updated successfully!");
                        router.push("/dashboard");
                    }
                } catch (error) {
                    console.error("Error submitting form", error);
                    toast.error("An error occurred while submitting the form. Please try again.");
                }
            } else {
                setStep(step + 1); // ✅ Go to next step
            }
        } else {
            toast.error("Please fill in all required fields");
        }
    };




    const handlePrevious = () => setStep(step - 1);

    // Animation variants
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                duration: 0.5,
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        },
        exit: {
            opacity: 0,
            transition: { duration: 0.3 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
    };

    const tagVariants = {
        initial: { scale: 0 },
        animate: { scale: 1, transition: { type: "spring", stiffness: 500 } },
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95 }
    };

    // Step titles and descriptions
    const stepInfo = [
        {
            title: "Your Basic Information",
            description: "Let's start with some basic details to personalize your fitness journey"
        },
        {
            title: "Your Fitness Profile",
            description: "Help us understand your fitness goals and dietary preferences"
        },
        {
            title: "Daily Goals & Equipment",
            description: "Let's set up your daily targets and available equipment"
        }
    ];

    const [errors, setErrors] = useState({
        age: "",
        weight: "",
    });

    const onInputChange = (e: any) => {
        const { name, value } = e.target;

        let newErrors = { ...errors };

        if (name === "age") {
            newErrors.age = Number(value) <= 13 ? "You are under 13." : "";
        }

        if (name === "weight") {
            newErrors.weight = Number(value) <= 30 ? "Your weight is too low." : "";
        }

        setErrors(newErrors);

        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        const newErrors = {
            age: "",
            weight: "",
        };

        if (formData.age !== "" && Number(formData.age) <= 13) {
            newErrors.age = "You are under 13.";
        }

        if (formData.weight !== "" && Number(formData.weight) <= 30) {
            newErrors.weight = "Your weight is too low.";
        }

        setErrors(newErrors);

        if (newErrors.age || newErrors.weight) {
            return;
        }

        console.log("Form submitted!", formData);
    };

    const equipmentSuggestions: Record<'GYM' | 'HOME' | 'OUTDOOR', string[]> = {
        GYM: ["Dumbbells", "Yoga Mat", "Resistance Bands", "Treadmill", "Kettlebell", "Skipping Rope"],
        HOME: ["Yoga Mat", "Resistance Bands", "Foam Roller", "Chair", "Bodyweight Bar"],
        OUTDOOR: ["Resistance Bands", "Skipping Rope", "Pull-up Bar", "Mat", "Portable Weights"],
    };





    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 w-full flex flex-col lg:flex-row mx-auto max-w-screen-2xl">
            <div className="flex items-center justify-center w-full lg:w-1/2 p-4 sm:p-6 lg:p-12 min-h-screen">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                    className="w-full max-w-[600px]"
                >
                    <Card className="w-full overflow-hidden shadow-lg border-0 bg-white/90 backdrop-blur-sm">
                        <CardHeader className="bg-gradient-to-r from-amber-500 to-orange-500 text-white">
                            <div className="flex justify-between items-center">
                                <CardTitle className="text-2xl font-bold">
                                    {stepInfo[step - 1].title}
                                </CardTitle>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                                >
                                    <Sparkles className="h-6 w-6 text-yellow-100" />
                                </motion.div>
                            </div>
                            <p className="text-amber-100 mt-1">{stepInfo[step - 1].description}</p>
                            <div className="mt-4">
                                <div className="text-xs text-white/80 mb-1 flex justify-between">
                                    <span>Getting Started</span>
                                    <span>Step {step} of {totalSteps}</span>
                                </div>
                                <Progress value={progress} className="w-full h-2 bg-white/30" />
                            </div>
                        </CardHeader>
                        <CardContent className="p-6">
                            {step === 1 && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="weight" className="text-sm font-medium flex items-center">
                                                Weight (kg) <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="weight"
                                                name="weight"
                                                type="number"
                                                placeholder="Enter your weight"
                                                className="h-11 focus:ring-2 focus:ring-amber-500 transition-all"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                required
                                            />
                                            {errors.weight && (
                                                <p className="text-sm text-red-500">{errors.weight}</p>
                                            )}
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="height" className="text-sm font-medium flex items-center">
                                                Height (cm) <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="height"
                                                name="height"
                                                type="number"
                                                placeholder="Enter your height"
                                                className="h-11 focus:ring-2 focus:ring-amber-500 transition-all"
                                                value={formData.height}
                                                onChange={onInputChange}
                                                required
                                            />
                                        </div>
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="age" className="text-sm font-medium flex items-center">
                                            Age <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="age"
                                            name="age"
                                            type="number"
                                            placeholder="Enter your age"
                                            className="h-11 focus:ring-2 focus:ring-amber-500 transition-all"
                                            value={formData.age}
                                            onChange={handleChange}
                                            required
                                        />
                                        {errors.age && (
                                            <p className="text-sm text-red-500">{errors.age}</p>
                                        )}
                                    </motion.div>

                                    {/* <motion.div variants={itemVariants} className="grid gap-6 md:grid-cols-2">
                                        <div className="space-y-2">
                                            <Label htmlFor="weight" className="text-sm font-medium flex items-center">
                                                Weight (kg) <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="weight"
                                                name="weight"
                                                type="number"
                                                placeholder="Enter your weight"
                                                className="h-11 focus:ring-2 focus:ring-amber-500 transition-all"
                                                value={formData.weight}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <Label htmlFor="height" className="text-sm font-medium flex items-center">
                                                Height (cm) <span className="text-red-500 ml-1">*</span>
                                            </Label>
                                            <Input
                                                id="height"
                                                name="height"
                                                type="number"
                                                placeholder="Enter your height"
                                                className="h-11 focus:ring-2 focus:ring-amber-500 transition-all"
                                                value={formData.height}
                                                onChange={handleChange}
                                                required
                                            />
                                        </div>
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="age" className="text-sm font-medium flex items-center">
                                            Age <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="age"
                                            name="age"
                                            type="number"
                                            placeholder="Enter your age"
                                            className="h-11 focus:ring-2 focus:ring-amber-500 transition-all"
                                            value={formData.age}
                                            onChange={handleChange}
                                            required
                                        />
                                    </motion.div> */}
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="gender" className="text-sm font-medium flex items-center">
                                            Gender <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Select
                                            value={formData.gender}
                                            onValueChange={(value) => handleSelectChange("gender", value)}
                                        >
                                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-amber-500 transition-all">
                                                <SelectValue placeholder="Select your Gender" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="MALE">Male</SelectItem>
                                                <SelectItem value="FEMALE">Female</SelectItem>
                                                <SelectItem value="OTHER">OTHER</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                </motion.div>
                            )}

                            {step === 2 && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="fitnessGoal" className="text-sm font-medium flex items-center">
                                            Fitness Goal <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Select
                                            value={formData.fitnessGoal}
                                            onValueChange={(value) => handleSelectChange("fitnessGoal", value)}
                                        >
                                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-amber-500 transition-all">
                                                <SelectValue placeholder="Select your fitness goal" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="LOSE">Lose Weight</SelectItem>
                                                <SelectItem value="GAIN">Gain Weight</SelectItem>
                                                <SelectItem value="MAINTAIN">Maintain Weight</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="activityLevel" className="text-sm font-medium flex items-center">
                                            Activity Level <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Select
                                            value={formData.activityLevel}
                                            onValueChange={(value) => handleSelectChange("activityLevel", value)}
                                        >
                                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-amber-500 transition-all">
                                                <SelectValue placeholder="Select your activity level" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="SEDENTARY">Sedentary</SelectItem>
                                                <SelectItem value="LIGHT">Lightly Active</SelectItem>
                                                <SelectItem value="MODERATE">Moderately Active</SelectItem>
                                                <SelectItem value="ACTIVE">Very Active</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="numberOfMeals" className="text-sm font-medium flex items-center">
                                            Preferred Number of Meals per Day <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="numberOfMeals"
                                            name="numberOfMeals"
                                            type="number"
                                            placeholder="Enter number of meals"
                                            className="h-11 focus:ring-2 focus:ring-amber-500 transition-all"
                                            value={formData.numberOfMeals || ''}
                                            onChange={handleChange}
                                        />
                                    </motion.div>

                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="dietaryPreferences" className="text-sm font-medium flex items-center">
                                            Dietary Preferences <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="dietaryPreferences"
                                                name="dietaryPreferences"
                                                placeholder="Type a preference and press Enter"
                                                className="h-11 focus:ring-2 focus:ring-amber-500 transition-all pr-10"
                                                value={dietaryInput}
                                                onChange={(e) => setDietaryInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if ((e.key === "Enter" || e.key === ",") && dietaryInput.trim()) {
                                                        e.preventDefault();
                                                        const newPref = dietaryInput.trim();
                                                        if (!formData.dietaryPreferences.includes(newPref)) {
                                                            setFormData({
                                                                ...formData,
                                                                dietaryPreferences: [...formData.dietaryPreferences, newPref],
                                                            });
                                                        }
                                                        setDietaryInput("");
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-3 text-amber-500 hover:text-amber-700 transition-colors"
                                                onClick={() => {
                                                    if (dietaryInput.trim()) {
                                                        const newPref = dietaryInput.trim();
                                                        if (!formData.dietaryPreferences.includes(newPref)) {
                                                            setFormData({
                                                                ...formData,
                                                                dietaryPreferences: [...formData.dietaryPreferences, newPref],
                                                            });
                                                        }
                                                        setDietaryInput("");
                                                    }
                                                }}
                                            >
                                                <PlusCircle size={18} />
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {formData.dietaryPreferences.map((pref, index) => (
                                                <motion.span
                                                    key={index}
                                                    variants={tagVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    className="bg-green-100 text-green-700 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                                                >
                                                    {pref}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData({
                                                                ...formData,
                                                                dietaryPreferences: formData.dietaryPreferences.filter(
                                                                    (p) => p !== pref
                                                                ),
                                                            })
                                                        }
                                                        className="ml-1 text-green-500 hover:text-green-700 rounded-full w-4 h-4 flex items-center justify-center bg-green-200 hover:bg-green-300 transition-colors"
                                                    >
                                                        &times;
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}

                            {step === 3 && (
                                <motion.div
                                    variants={containerVariants}
                                    initial="hidden"
                                    animate="visible"
                                    exit="exit"
                                    className="space-y-6"
                                >
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="dailyCalories" className="text-sm font-medium flex items-center">
                                            Daily Calorie Target <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="dailyCalories"
                                            name="dailyCalories"
                                            type="number"
                                            placeholder="Enter your daily calorie target"
                                            className="h-11 focus:ring-2 focus:ring-amber-500 transition-all"
                                            value={formData.dailyCalories}
                                            onChange={handleChange}
                                            required
                                        />
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="workoutDuration" className="text-sm font-medium flex items-center">
                                            Workout Duration (minutes) <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Input
                                            id="workoutDuration"
                                            name="workoutDuration"
                                            type="number"
                                            placeholder="Enter your daily workout duration"
                                            className="h-11 focus:ring-2 focus:ring-amber-500 transition-all"
                                            value={formData.workoutDuration}
                                            onChange={handleChange}
                                            required
                                        />
                                    </motion.div>
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="workoutLocation" className="text-sm font-medium flex items-center">
                                            Workout Location <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <Select
                                            value={formData.workoutLocation}
                                            onValueChange={(value) => handleSelectChange("workoutLocation", value)}
                                        >
                                            <SelectTrigger className="h-11 focus:ring-2 focus:ring-amber-500 transition-all">
                                                <SelectValue placeholder="Select your location" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="HOME">Home</SelectItem>
                                                <SelectItem value="GYM">Gym</SelectItem>
                                                <SelectItem value="OUTDOOR">Outdoor</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </motion.div>

                                    {/* <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="availableEquipment" className="text-sm font-medium flex items-center">
                                            Available Equipment <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="availableEquipment"
                                                name="availableEquipment"
                                                placeholder="Type equipment and press Enter"
                                                className="h-11 focus:ring-2 focus:ring-amber-500 transition-all pr-10"
                                                value={availableEquipmentInput}
                                                onChange={(e) => setAvailableEquipmentInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if ((e.key === "Enter" || e.key === ",") && availableEquipmentInput.trim()) {
                                                        e.preventDefault();
                                                        const newItem = availableEquipmentInput.trim();
                                                        if (!formData.availableEquipment.includes(newItem)) {
                                                            setFormData({
                                                                ...formData,
                                                                availableEquipment: [...formData.availableEquipment, newItem],
                                                            });
                                                        }
                                                        setAvailableEquipmentInput("");
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-3 text-amber-500 hover:text-amber-700 transition-colors"
                                                onClick={() => {
                                                    if (availableEquipmentInput.trim()) {
                                                        const newItem = availableEquipmentInput.trim();
                                                        if (!formData.availableEquipment.includes(newItem)) {
                                                            setFormData({
                                                                ...formData,
                                                                availableEquipment: [...formData.availableEquipment, newItem],
                                                            });
                                                        }
                                                        setAvailableEquipmentInput("");
                                                    }
                                                }}
                                            >
                                                <PlusCircle size={18} />
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {formData.availableEquipment.map((item, index) => (
                                                <motion.span
                                                    key={index}
                                                    variants={tagVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                                                >
                                                    {item}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData({
                                                                ...formData,
                                                                availableEquipment: formData.availableEquipment.filter((e) => e !== item),
                                                            })
                                                        }
                                                        className="ml-1 text-indigo-500 hover:text-indigo-700 rounded-full w-4 h-4 flex items-center justify-center bg-indigo-200 hover:bg-indigo-300 transition-colors"
                                                    >
                                                        &times;
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </div>
                                    </motion.div> */}
                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="availableEquipment" className="text-sm font-medium flex items-center">
                                            Available Equipment <span className="text-red-500 ml-1">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="availableEquipment"
                                                name="availableEquipment"
                                                placeholder="Type equipment and press Enter"
                                                className="h-11 focus:ring-2 focus:ring-amber-500 transition-all pr-10"
                                                value={availableEquipmentInput}
                                                onChange={(e) => setAvailableEquipmentInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if ((e.key === "Enter" || e.key === ",") && availableEquipmentInput.trim()) {
                                                        e.preventDefault();
                                                        const newItem = availableEquipmentInput.trim();
                                                        if (!formData.availableEquipment.includes(newItem)) {
                                                            setFormData({
                                                                ...formData,
                                                                availableEquipment: [...formData.availableEquipment, newItem],
                                                            });
                                                        }
                                                        setAvailableEquipmentInput("");
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-3 text-amber-500 hover:text-amber-700 transition-colors"
                                                onClick={() => {
                                                    if (availableEquipmentInput.trim()) {
                                                        const newItem = availableEquipmentInput.trim();
                                                        if (!formData.availableEquipment.includes(newItem)) {
                                                            setFormData({
                                                                ...formData,
                                                                availableEquipment: [...formData.availableEquipment, newItem],
                                                            });
                                                        }
                                                        setAvailableEquipmentInput("");
                                                    }
                                                }}
                                            >
                                                <PlusCircle size={18} />
                                            </button>
                                        </div>

                                        {/* Dynamic Suggested Equipment based on Workout Location */}
                                        {formData.workoutLocation && equipmentSuggestions[formData.workoutLocation]?.length > 0 && (
                                            <>
                                                <p className="text-sm text-gray-500 pt-2">Suggested for {formData.workoutLocation}:</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {equipmentSuggestions[formData.workoutLocation].map((equipment: string, index: number) => (
                                                        <button
                                                            key={index}
                                                            type="button"
                                                            onClick={() => {
                                                                if (!formData.availableEquipment.includes(equipment)) {
                                                                    setFormData({
                                                                        ...formData,
                                                                        availableEquipment: [...formData.availableEquipment, equipment],
                                                                    });
                                                                }
                                                            }}
                                                            className="text-xs px-3 py-1 rounded-full border border-indigo-300 hover:bg-indigo-100 transition-all"
                                                        >
                                                            {equipment}
                                                        </button>
                                                    ))}

                                                </div>
                                            </>
                                        )}

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {formData.availableEquipment.map((item, index) => (
                                                <motion.span
                                                    key={index}
                                                    variants={tagVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    className="bg-indigo-100 text-indigo-700 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                                                >
                                                    {item}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData({
                                                                ...formData,
                                                                availableEquipment: formData.availableEquipment.filter((e) => e !== item),
                                                            })
                                                        }
                                                        className="ml-1 text-indigo-500 hover:text-indigo-700 rounded-full w-4 h-4 flex items-center justify-center bg-indigo-200 hover:bg-indigo-300 transition-colors"
                                                    >
                                                        &times;
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </div>
                                    </motion.div>




                                    <motion.div variants={itemVariants} className="space-y-2">
                                        <Label htmlFor="allergies" className="text-sm font-medium">
                                            Food Allergies <span className="text-gray-400 text-xs ml-1">(Optional)</span>
                                        </Label>
                                        <div className="relative">
                                            <Input
                                                id="allergies"
                                                name="allergies"
                                                placeholder="Type an allergy and press Enter"
                                                className="h-11 focus:ring-2 focus:ring-amber-500 transition-all pr-10"
                                                value={allergiesInput}
                                                onChange={(e) => setAllergiesInput(e.target.value)}
                                                onKeyDown={(e) => {
                                                    if ((e.key === "Enter" || e.key === ",") && allergiesInput.trim()) {
                                                        e.preventDefault();
                                                        const newAllergy = allergiesInput.trim();
                                                        if (!formData.allergies.includes(newAllergy)) {
                                                            setFormData({
                                                                ...formData,
                                                                allergies: [...formData.allergies, newAllergy],
                                                            });
                                                        }
                                                        setAllergiesInput("");
                                                    }
                                                }}
                                            />
                                            <button
                                                type="button"
                                                className="absolute right-3 top-3 text-amber-500 hover:text-amber-700 transition-colors"
                                                onClick={() => {
                                                    if (allergiesInput.trim()) {
                                                        const newAllergy = allergiesInput.trim();
                                                        if (!formData.allergies.includes(newAllergy)) {
                                                            setFormData({
                                                                ...formData,
                                                                allergies: [...formData.allergies, newAllergy],
                                                            });
                                                        }
                                                        setAllergiesInput("");
                                                    }
                                                }}
                                            >
                                                <PlusCircle size={18} />
                                            </button>
                                        </div>

                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {formData.allergies.map((allergy, index) => (
                                                <motion.span
                                                    key={index}
                                                    variants={tagVariants}
                                                    initial="initial"
                                                    animate="animate"
                                                    whileHover="hover"
                                                    whileTap="tap"
                                                    className="bg-red-100 text-red-700 text-xs px-3 py-1 rounded-full flex items-center gap-1"
                                                >
                                                    {allergy}
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            setFormData({
                                                                ...formData,
                                                                allergies: formData.allergies.filter((a) => a !== allergy),
                                                            })
                                                        }
                                                        className="ml-1 text-red-500 hover:text-red-700 rounded-full w-4 h-4 flex items-center justify-center bg-red-200 hover:bg-red-300 transition-colors"
                                                    >
                                                        &times;
                                                    </button>
                                                </motion.span>
                                            ))}
                                        </div>
                                    </motion.div>

                                </motion.div>
                            )}

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="flex justify-between pt-6"
                            >
                                {step > 1 ? (
                                    <Button
                                        type="button"
                                        onClick={handlePrevious}
                                        variant="outline"
                                        className="w-32 group hover:bg-amber-50 transition-all"
                                    >
                                        <ArrowLeft className="mr-2 h-4 w-4 group-hover:-translate-x-1 transition-transform" />
                                        Previous
                                    </Button>
                                ) : (
                                    <div className="w-32" />
                                )}
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="w-32 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all group"
                                >
                                    {step === totalSteps ? "Submit" : "Next"}
                                    {step !== totalSteps && (
                                        <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                                    )}
                                </Button>
                            </motion.div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="relative hidden lg:block w-full lg:w-1/2 ">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1 }}
                    className="h-full"
                >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/30 to-transparent z-10" />
                    <img
                        src="Assets/healthImage.png"
                        alt="Fitness journey"
                        className="h-screen w-full object-cover"
                    />
                </motion.div>
            </div>
        </div>
    );
};

export default UserDetailsForm;