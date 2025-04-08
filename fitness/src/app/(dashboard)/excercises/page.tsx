// "use client";

// import HorzinatalScrollbar from '@/components/HorzinatalScrollbar';
// import { SearchExcercises } from '@/components/Search'
// import React, { useState } from 'react'

// interface Exercise {
//     name: string;
//     target: string;
//     equipment: string;
//     bodyPart: string;
// }
// const ExercisePage = () => {
//     const [exercises, setExercises] = useState<Exercise[]>([]);

//     return (
//         <div className="p-8">
//             <div className="mb-6 flex justify-between items-center">
//                 <h1 className="text-2xl font-semibold">My Excercises</h1>
//                 <SearchExcercises setExercises={setExercises} />
//             </div>

//             <div className="bg-white rounded-lg shadow-sm">
//                 <div className="p-6">
//                     <HorzinatalScrollbar  />
//                 </div>
//             </div>

//         </div>
//     )
// }

// export default ExercisePage