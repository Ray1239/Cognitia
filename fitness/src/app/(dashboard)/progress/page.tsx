"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import axios from 'axios';
import React, { useState, useEffect } from 'react'
import toast from 'react-hot-toast';
import { useSession } from "next-auth/react";


interface Exercise {
  id?: number; // Optional for new records (auto-generated by Prisma)
  name: string;
  sets: number;
  reps: number;
  weight: number;
  calories: number;
  duration: string;
}
const Progress = () => {
  const { data: session, status } = useSession();
  const [exercise, setExercise] = useState<Exercise[]>([]);

  const [formData, setFormData] = useState<Exercise>({
    name: "",
    sets: 0,
    reps: 0,
    weight: 0,
    calories: 0,
    duration: ""
  })


  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: name === "name" || name === "duration" ? value : value === "" ? 0 : Number(value), // If empty, set to 0, otherwise convert to number
    });
  };



  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const userId = session?.user.id;
      const formDataWithDurationAsString = {
        ...formData,
        duration: formData.duration.toString(), // Ensure duration is a string
        userId,
      };
      const response = await axios.post("api/exercise", formDataWithDurationAsString);    
      console.log(response.data);
      if (response.status == 201) {
        setFormData({
          name: "",
          sets: 0,
          reps: 0,
          weight: 0,
          calories: 0,
          duration: ""
        });
      }
      toast.success("Successfully created exercise plan");
    } catch (error) {
      toast.error("Error while creating exercise plan");
      console.log("Error while creating exercise");

    }
  }
  const fetchExercise = async () => {
    // Fetch workout data from API
    try {
      const response = await axios.get('/api/exercise');
      if (response.status == 200) {
        setExercise(response.data);
        toast.success("Exercise displayed successfully");
      } else {
        console.error('Failed to fetch workouts');
        toast.error("Error while fetching Exercise");

      }
    } catch (error) {
      console.error('Error fetching workouts:', error);
    }
  };

  useEffect(() => {
    fetchExercise();
  }, []);


  return (
    <div className="p-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-2xl font-semibold">My Progress</h1>
      </div>
      <div className="bg-white rounded-lg shadow-sm">
        <div className="p-6">
          <form onSubmit={handleSubmit} className='space-y-6'>
              <div>
                <Label className="block text-sm font-medium text-gray-700">Exercise</Label>
                <Input
                  type="text"
                  name="name"
                  placeholder="Exercise name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="mt-1 p-3 w-full border rounded-md"
                  required
                />
              </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700">Sets</Label>
                <Input
                  type="number"
                  name="sets"
                  placeholder="Sets"
                  value={formData.sets}
                  onChange={handleInputChange}
                  className="mt-1 p-3 w-full border rounded-md"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">Reps</Label>
                <Input
                  type="number"
                  name="reps"
                  placeholder="Reps"
                  value={formData.reps}
                  onChange={handleInputChange}
                  className="mt-1 p-3 w-full border rounded-md"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label className="block text-sm font-medium text-gray-700">Weight (kg)</Label>
                <Input
                  type="number"
                  name="weight"
                  placeholder="Weight"
                  value={formData.weight}
                  onChange={handleInputChange}
                  className="mt-1 p-3 w-full border rounded-md"
                />
              </div>
              <div>
                <Label className="block text-sm font-medium text-gray-700">Duration (minutes)</Label>
                <Input
                  type="number"
                  name="duration"
                  placeholder="Duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  className="mt-1 p-3 w-full border rounded-md"
                  required
                />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700">Calories Burned</Label>
              <Input
                type="number"
                name="calories"
                placeholder="Calories"
                value={formData.calories}
                onChange={handleInputChange}
                className="mt-1 p-3 w-full border rounded-md"
              />
            </div>
            <button
              type="submit"
              className="w-full p-3 mt-4 bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Log Workout
            </button>
          </form>
        </div>
      </div>

      {/* Table to display workout data */}
      <div className="mt-8 overflow-x-auto">
        <table className="min-w-full table-auto bg-white border rounded-md shadow-md">
          <thead className="bg-gray-100 text-sm text-gray-700">
            <tr>
              <th className="p-3 text-left">Exercise Name</th>
              <th className="p-3 text-left">Sets</th>
              <th className="p-3 text-left">Reps</th>
              <th className="p-3 text-left">Weight (kg)</th>
              <th className="p-3 text-left">Duration (min)</th>
              <th className="p-3 text-left">Calories Burned</th>
            </tr>
          </thead>
          <tbody>
            {exercise.map((workout) => (
              <tr key={workout.id} className="border-t text-sm text-gray-700">
                <td className="p-3">{workout.name}</td>
                <td className="p-3">{workout.sets}</td>
                <td className="p-3">{workout.reps}</td>
                <td className="p-3">{workout.weight}</td>
                <td className="p-3">{workout.duration}</td>
                <td className="p-3">{workout.calories}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}


export default Progress