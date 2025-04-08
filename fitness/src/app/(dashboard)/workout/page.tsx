"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectTrigger, SelectItem, SelectValue, SelectContent } from "@/components/ui/select";
import WorkoutCards from "@/components/WorkoutCard";
import axios from "axios";
import { BookMarked, Flame } from "lucide-react";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { MdHealthAndSafety } from "react-icons/md";
import { Bookmark, BookmarkPlus } from "lucide-react"; // Import Lucide Icons


interface WorkoutCardsProps {
    id: number
    title: string;
    description: string;
    duration: string; // Changed to string for flexibility
    difficulty: string;
    goals: string;
    body: string;
}

export default function () {
    const [workoutData, setWorkoutData] = useState<WorkoutCardsProps[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [bookmarkedWorkouts, setBookmarkedWorkouts] = useState<Record<number, boolean>>({});

    const handleOpenModal = () => {
        setIsModalOpen(true);
    }
    const handleCloseModal = () => {
        setIsModalOpen(false);
    }

    const handleBookMark = async (e: React.FormEvent, workoutId: number) => {
        e.preventDefault();
        try {
            const userId = 1;
            setBookmarkedWorkouts((prevState) => ({
                ...prevState,
                [workoutId]: !prevState[workoutId],
            }));
    

            const response = await axios.post("api/bookmark", {
                userId,
                workoutId,
            });
            if (response.status == 201) {
                toast.success("Bookmarked successfully");
            }else if (response.status === 200) {
                // If unbookmarked, show a success message
                toast.success("Unbookmarked successfully");
            }else{
                toast.error("Something went wrong");

            }
            console.log(response.data);
        } catch (error) {
            console.error("Error while bookmarking workout:", error);
            toast.error("An error occurred while bookmarking the workout");
        }
    }


    useEffect(() => {
        const fetchWorkoutData = async () => {
            setLoading(true);
            setError(null);

            try {
                const response = await axios.get("api/workout",);
                console.log(response.data);
                if (response.data && Array.isArray(response.data.data)) {
                    setWorkoutData(response.data.data); // Assuming data is inside 'data' field
                } else {
                    setError("Received data is not in the expected format");
                }
            } catch (error: any) {
                setError(error.message)
                console.log("Error while updating workout details");
                setLoading(false);
            }

        }
        fetchWorkoutData();
    }, [])

    return (
        <div className="p-8">
            <div className="mb-6 flex justify-between items-center">
                <h1 className="text-2xl font-semibold">My workouts</h1>
                <div className="flex items-center gap-6">
                    <div className="text-lg font-medium bg-white text-black border border-black rounded-lg mt-6">
                        <Select
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue placeholder="Filter workouts" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="+91">+91</SelectItem>
                                <SelectItem value="+91">+91</SelectItem>
                                <SelectItem value="+91">+91</SelectItem>
                                <SelectItem value="+91">+91</SelectItem>
                                <SelectItem value="+91">+91</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div>
                        <Button
                            onClick={handleOpenModal}
                            className="text-lg font-medium bg-white text-black border border-black rounded-lg px-4 py-2 flex items-center gap-2 hover:bg-black hover:text-white hover:border-transparent transition-all duration-300 mt-6"
                        >
                            <MdHealthAndSafety className="w-6 h-6" />
                            <span className="text-base">Create Your's</span>
                        </Button>
                    </div>

                    <div>
                        <Label>Search</Label>
                        <Input
                            id="search"
                            type="text"
                            className="w-[200px] bg-white text-black border border-black"
                            placeholder="Search your workout plan"
                        />
                    </div>
                </div>
            </div>
            <div className="bg-white rounded-lg shadow-sm">
                <div className="p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-3 md:grid-cols-2 gap-4">
                        {workoutData.map((workout, index) => (
                            <div key={workout.id} className="p-6">
                                <Card className="w-full max-w-sm border-2 border-black/20 rounded-lg transition-all duration-300 hover:border-primary hover:shadow-lg hover:scale-105">
                                    <CardHeader>
                                        <div className="flex items-center justify-between gap-2">
                                            <div>
                                                <CardTitle className="text-base">{workout.title}</CardTitle>
                                                <span className="text-gray-800">{workout.body}</span>
                                            </div>
                                            <Flame className="text-orange-500 ml-auto" />
                                        </div>
                                    </CardHeader>
                                    <CardContent>
                                        <p>
                                            <strong>Duration:</strong> {workout.duration}
                                        </p>
                                        <p>
                                            <strong>Difficulty:</strong> {workout.difficulty}
                                        </p>
                                        <p>
                                            <strong>Goals:</strong> {workout.goals}
                                        </p>
                                        <p className="mt-2">{workout.description}</p>
                                    </CardContent>
                                    <div>
                                        <button
                                            onClick={(e) => {
                                                handleBookMark(e, workout.id);
                                            }}
                                            className="p-2"
                                        >
                                            {bookmarkedWorkouts[workout.id] ? (
                                                <Bookmark className="text-orange-500" />
                                            ) : (
                                                <BookmarkPlus className="text-gray-500" />
                                            )}
                                        </button>
                                    </div>
                                </Card>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            <WorkoutCards
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                name="Create workout"
                className=""
            />

        </div>
    )
}