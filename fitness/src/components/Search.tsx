// "use client"

// import { exerciseOptions } from "@/app/api/exercise/route";
// import axios from "axios";
// import React, { useEffect, useState } from "react";
// import { Label } from "./ui/label";
// import { Input } from "./ui/input";
// import { Button } from "./ui/button";

// interface Exercise {
//     name: string;
//     target: string;
//     equipment: string;
//     bodyPart: string;
// }

// interface SearchExercisesProps {
//     setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
// }

// export const SearchExcercises = ({setExercises}:any) => {
//     const [search, setSearch] = useState("");
//     // const [exercises, setExercises] = useState<Exercise[]>([]);
//     const [bodyPart, setBodyParts] = useState<string[]>([]);


//     useEffect(() => {
//         const fetchExerciseData = async () => {
//             const response = await axios.get("https://exercisedb.p.rapidapi.com/exercises/bodyPartList",
//                 exerciseOptions
//             );
//             setBodyParts(['all', ...response.data]);
//         }
//         fetchExerciseData();
//     }, [])


//     const handleSearch = async (e: React.FormEvent) => {
//         e.preventDefault();
//         if (search) {
//             try {
//                 const response = await axios.get("https://exercisedb.p.rapidapi.com/exercises", exerciseOptions);

//                 // Get the exercises data from the response
//                 const excerciseData: Exercise[] = response.data;

//                 // Filter the exercises based on the search input
//                 const searchedExcercises = excerciseData.filter((excercise) =>
//                     excercise.name.toLowerCase().includes(search.toLowerCase()) ||
//                     excercise.target.toLowerCase().includes(search.toLowerCase()) ||
//                     excercise.equipment.toLowerCase().includes(search.toLowerCase()) ||
//                     excercise.bodyPart.toLowerCase().includes(search.toLowerCase())
//                 );
//                 setExercises(searchedExcercises);
//                 setSearch("");

//                 console.log(searchedExcercises); // Display the filtered exercises

//             } catch (error) {
//                 console.error("Error fetching exercises", error);

//             }
//         }
//     }

//     return (
//         <div>
//             <div>
//                 <Label>Search</Label>
//                 <Input
//                     id="search"
//                     type="text"
//                     value={search}
//                     onChange={(e) => setSearch(e.target.value)}
//                     className="w-[200px] bg-white text-black border border-black"
//                     placeholder="Search your workout plan"
//                 />
//             </div>
//             <Button onClick={handleSearch} type="submit" className="mt-2">Search</Button>


//         </div>
//     )
// }