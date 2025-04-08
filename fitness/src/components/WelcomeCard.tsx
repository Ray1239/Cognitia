import React from "react"
import Image from "next/image"


interface WelcomeCardProps {
    name: string
}

export const WelcomeCard: React.FC<WelcomeCardProps> = ({name}) => {
    return (
        <div className="bg-cyan-400 text-white rounded-lg shadow-md flex items-center justify-between px-6 py-4">
            <div>
                <h2 className="text-white text-2xl font-bold font-frank mb-2">Hello, {name}</h2>
                <p className="text-white text-3xl font-extrabold font-frank mb-4">Welcome Back!</p>
                <button className="bg-white px-4 py-2 text-blue-500 rounded-md font-frank">Learn More</button>
            </div>
            <Image
              src="/Assets/Fit.png"
              alt="Fitness"
              width={100}
              height={100}
              
            />

        </div>
    )
}