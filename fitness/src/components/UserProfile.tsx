import React from "react"

interface User {
  name: string;
  height: number;
  age: number;
  weight: number;
  image: string;
  location: string; 
}

interface UserProfileProps {
  userInfo: User;
}

export const UserProfile: React.FC<UserProfileProps> = ({ userInfo }) => {
  return (
    <div className="bg-gray p-4 rounded-lg shadow-md">
      <div className="flex items-center mb-4">
      <img 
        src={userInfo.image} 
        alt={`${userInfo.name}'s Profile`} 
        className="h-12 w-12 rounded-full mr-4" />
      
      <div>
        {/* User Name and Location */}
        <h1 className="text-lg text-gray-400 font-frank">{userInfo.name}</h1>
        <p className="text-md text-gray-200 font-frank">{userInfo.location}</p>
      </div>
      </div>
      {/* User Stats */}
      <div className="mt-4 flex justify-between items-center text-center">
        <div>
          <h3 className="text-xl font-bold">{userInfo.weight} kg</h3>
          <p className="text-sm text-gray-500">Weight</p>
        </div>
        <div>
          <h3 className="text-xl font-bold">{userInfo.height} m</h3>
          <p className="text-sm text-gray-500">Height</p>
        </div>
        <div>
          <h3 className="text-xl font-bold">{userInfo.age} yrs</h3>
          <p className="text-sm text-gray-500">Age</p>
        </div>
      </div>
    </div>
  );
}
