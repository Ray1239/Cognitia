import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "./Modal";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import axios from "axios";
import { title } from "process";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";




interface WorkoutCardsProps {
  title: string;
  description: string;
  duration: string; // Changed to string for flexibility
  difficulty: string;
  goals: string;
  body: string;
}

interface ModalProps {
  id?: string | null;
  isOpen: boolean;
  onClose: () => void;
  name: string;
  width?: string;
  height?: string
  className?: string

}

export default function WorkoutCards({
  isOpen, onClose, name, className
}: ModalProps) {
  const { data: session, status } = useSession();
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [isBookMarked, setIsBookMarked] = useState(false);
  const [formData, setFormData] = useState<WorkoutCardsProps>({
    title: "",
    description: "",
    duration: "",
    difficulty: "",
    goals: "",
    body: "",

  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev => ({ ...prev, [name]: value })))

  }


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const userId = session?.user.id;
      const response = await axios.post("api/workout", {
        ...formData, userId,
      })
      console.log(response.data);
      if (response.status == 201) {
        setFormData({
          title: "",
          description: "",
          duration: "",
          difficulty: "",
          goals: "",
          body: "",
        });
      }
      toast.success("Successfully created workout plan");
    } catch (error) {
      toast.error("Error while creating workout plan");
      console.log("Error while creatting workouts");

    }
  }
  return (
    <Modal isOpen={isOpen} onClose={onClose} name={name}>
      <form className="space-y-6 p-6">
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700" htmlFor="workout">Workout Title</Label>
          <Input
            id="title"
            name="title"
            placeholder='Enter a workout name'
            value={formData.title}
            onChange={handleInputChange}
            className='w-[400px] h-[50px] text-black'
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700" htmlFor="projectDescription">Description</Label>
          <Textarea
            id="description"
            name="description"
            placeholder='Enter a workout description'
            value={formData.description}
            onChange={handleInputChange}
            className='w-[500px] h-[50px] text-black'
            rows={4}
          />
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700" htmlFor="duration">Duration</Label>
          <Input
            id="duration"
            name="duration"
            placeholder='Enter a duration'
            value={formData.duration}
            onChange={handleInputChange}
            className='w-[400px] h-[50px] text-black'
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 sm:gap-2">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700" htmlFor="techStack">Workout Difficulty</Label>
            <Input
              id="difficulty"
              name="difficulty"
              placeholder='Difficulty'
              value={formData.difficulty}
              onChange={handleInputChange}
              className='w-full h-[50px] text-black'
            />
          </div>
          <div className="space-y-2">
            <Label className="text-sm font-medium text-gray-700" htmlFor="livedemo">Set Goals</Label>
            <Input
              id="goals"
              name="goals"
              placeholder='Goals'
              value={formData.goals}
              onChange={handleInputChange}
              className='w-full h-[50px] text-black'
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label className="text-sm font-medium text-gray-700" htmlFor="sourcecode">Body Part</Label>
          <Input
            id="body"
            name="body"
            placeholder='Body Part'
            value={formData.body}
            onChange={handleInputChange}
            className="w-[400px] h-[50px] text-black"
          />
        </div>
        <div className='flex flex-row-reverse'>
          <Button onClick={handleSubmit} type="submit" className="w-full h-[50px]" disabled={loading}>
            Create Workout Plan
          </Button>
        </div>
      </form>
    </Modal>
  );
}
