"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Calendar, Clock, ChevronRight, CheckCircle, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

// Define interfaces for type safety
interface Workout {
    id: number;
    title: string;
    description: string;
    duration: string;
    difficulty: string;
    goals: string;
    body: string;
    userId: number;
    date: string;
    startTimeStamp: string;
    endTimeStamp: string;
    timeSpent: number;
    reps: number;
}

interface NewWorkout {
    title: string;
    description: string;
    duration: string;
    difficulty: string;
    goals: string;
    body: string;
    date: string;
}

interface ApiResponse<T> {
    success: boolean;
    message?: string;
    data?: T;
    error?: string;
}

const WorkoutScheduler: React.FC = () => {
    const { data: session } = useSession();
    const router = useRouter();
    const [workouts, setWorkouts] = useState<Workout[]>([]);
    const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);
    const [isTraining, setIsTraining] = useState<boolean>(false);
    const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);
    const [newWorkout, setNewWorkout] = useState<NewWorkout>({
        title: "",
        description: "",
        duration: "",
        difficulty: "",
        goals: "",
        body: "",
        date: "",
    });
    const [error, setError] = useState<string | null>(null);

    const fetchWorkouts = async () => {
        if (!session?.user?.id) return;
        try {
            const response = await fetch("/api/workout", {
                headers: { "user-id": session.user.id },
            });
            if (!response.ok) {
                const text = await response.text(); // Log raw response for debugging
                console.error("Response text:", text);
                throw new Error("Network response was not ok");
            }
            const result: ApiResponse<Workout[]> = await response.json();
            if (result.success) {
                setWorkouts(result.data || []);
            } else {
                throw new Error(result.error || "Failed to fetch workouts");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    useEffect(() => {
        fetchWorkouts();
    }, [session?.user?.id]);

    const handleScheduleWorkout = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!session?.user?.id) return;
        try {
            const response = await fetch("/api/workout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": session.user.id,
                },
                body: JSON.stringify({
                    ...newWorkout,
                    startTimeStamp: newWorkout.date || new Date().toISOString(),
                    endTimeStamp: newWorkout.date || new Date().toISOString(),
                }),
            });
            if (!response.ok) throw new Error("Failed to schedule workout");
            const result: ApiResponse<Workout> = await response.json();
            if (result.success) {
                setWorkouts([...workouts, result.data!]);
                setNewWorkout({
                    title: "",
                    description: "",
                    duration: "",
                    difficulty: "",
                    goals: "",
                    body: "",
                    date: "",
                });
                setIsDialogOpen(false);
            } else {
                throw new Error(result.error || "Failed to schedule workout");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const startWorkout = (workout: Workout) => {
        setCurrentWorkout(workout);
        setIsTraining(true);
    };

    const completeWorkout = async () => {
        if (!currentWorkout || !session?.user?.id) return;
        try {
            const response = await fetch(`/api/workout/${currentWorkout.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    "user-id": session.user.id,
                },
                body: JSON.stringify({
                    timeSpent: currentWorkout.timeSpent + (parseInt(currentWorkout.duration) || 1),
                    reps: currentWorkout.reps + 1,
                    endTimeStamp: new Date().toISOString(),
                }),
            });
            const result: ApiResponse<Workout> = await response.json();
            if (result.success) {
                setWorkouts(workouts.map((w) => (w.id === currentWorkout.id ? result.data! : w)));
                setIsTraining(false);
                setCurrentWorkout(null);
            } else {
                throw new Error(result.error || "Failed to complete workout");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    const deleteWorkout = async (id: number) => {
        if (!session?.user?.id) return;
        try {
            const response = await fetch(`/api/workout/${id}`, {
                method: "DELETE",
                headers: { "user-id": session.user.id },
            });
            const result: ApiResponse<void> = await response.json();
            if (result.success) {
                setWorkouts(workouts.filter((w) => w.id !== id));
            } else {
                throw new Error(result.error || "Failed to delete workout");
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred");
        }
    };

    if (!session) return <p>Please sign in to view your workouts.</p>;

    if (isTraining && currentWorkout) {
        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="p-6"
            >
                <Card>
                    <CardHeader>
                        <CardTitle>{currentWorkout.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p>{currentWorkout.description}</p>
                        <p>Duration: {currentWorkout.duration} mins</p>
                        <p>Difficulty: {currentWorkout.difficulty}</p>
                        <p>Goals: {currentWorkout.goals}</p>
                        <p>Body: {currentWorkout.body}</p>
                        <p>Time Spent: {currentWorkout.timeSpent} mins</p>
                        <p>Reps: {currentWorkout.reps}</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Complete Workout
                        </Button>
                    </CardFooter>
                </Card>
            </motion.div>
        );
    }

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.3 }}
        >
            <Card className="h-full shadow-md hover:shadow-lg transition-all">
                <CardHeader className="pb-2">
                    <CardTitle className="text-lg flex items-center justify-between">
                        <div className="flex items-center">
                            <Calendar className="h-5 w-5 mr-2 text-indigo-600" />
                            Upcoming Workouts
                        </div>
                        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                            <DialogTrigger asChild>
                                <Button variant="outline" size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Schedule
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[425px]">
                                <motion.div
                                    initial={{ scale: 0.95, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <DialogHeader>
                                        <DialogTitle>Schedule a Workout</DialogTitle>
                                    </DialogHeader>
                                    <form onSubmit={handleScheduleWorkout} className="space-y-4 mt-4">
                                        <Input
                                            placeholder="Title"
                                            value={newWorkout.title}
                                            onChange={(e) => setNewWorkout({ ...newWorkout, title: e.target.value })}
                                            required
                                        />
                                        <Input
                                            placeholder="Description"
                                            value={newWorkout.description}
                                            onChange={(e) => setNewWorkout({ ...newWorkout, description: e.target.value })}
                                            required
                                        />
                                        <Input
                                            placeholder="Duration (minutes)"
                                            type="number"
                                            value={newWorkout.duration}
                                            onChange={(e) => setNewWorkout({ ...newWorkout, duration: e.target.value })}
                                            required
                                        />
                                        <Input
                                            placeholder="Difficulty"
                                            value={newWorkout.difficulty}
                                            onChange={(e) => setNewWorkout({ ...newWorkout, difficulty: e.target.value })}
                                            required
                                        />
                                        <Input
                                            placeholder="Goals"
                                            value={newWorkout.goals}
                                            onChange={(e) => setNewWorkout({ ...newWorkout, goals: e.target.value })}
                                            required
                                        />
                                        <Input
                                            placeholder="Body Part"
                                            value={newWorkout.body}
                                            onChange={(e) => setNewWorkout({ ...newWorkout, body: e.target.value })}
                                            required
                                        />
                                        <Input
                                            type="datetime-local"
                                            value={newWorkout.date}
                                            onChange={(e) => setNewWorkout({ ...newWorkout, date: e.target.value })}
                                        />
                                        <Button type="submit" className="w-full">
                                            Schedule
                                        </Button>
                                    </form>
                                </motion.div>
                            </DialogContent>
                        </Dialog>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    {error && <p className="text-red-500 text-center">{error}</p>}
                    {workouts.length === 0 ? (
                        <p className="text-gray-500 text-center">No workouts scheduled</p>
                    ) : (
                        workouts.map((workout, index) => (
                            <motion.div
                                key={workout.id}
                                initial={{ x: -20, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                transition={{ delay: index * 0.1 + 0.3 }}
                                className="mb-3 last:mb-0 bg-gray-50 p-3 rounded-lg"
                            >
                                <div className="flex justify-between items-center">
                                    <div>
                                        <h4 className="font-medium text-gray-800">{workout.title}</h4>
                                        <div className="flex items-center text-sm text-gray-600 mt-1">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {new Date(workout.startTimeStamp).toLocaleTimeString()} • {workout.duration} mins
                                        </div>
                                    </div>
                                    <div className="flex space-x-2">
                                        <Button size="sm" onClick={() => {
                                            router.push("/train") // Navigate using App Router
                                        }}>
                                            Start
                                        </Button>
                                        <Button size="sm" variant="destructive" onClick={() => deleteWorkout(workout.id)}>
                                            Delete
                                        </Button>
                                    </div>
                                </div>
                            </motion.div>
                        ))
                    )}
                </CardContent>
                <CardFooter className="pt-0">
                    <button className="text-sm text-indigo-600 hover:text-indigo-800 transition-colors flex items-center">
                        View all scheduled workouts
                        <ChevronRight className="h-4 w-4 ml-1" />
                    </button>
                </CardFooter>
            </Card>
        </motion.div>
    );
};

export default WorkoutScheduler;