import React from "react"

interface StatsCardProps{
    title:string;
    value:number | number;
    unit: string;
    icon:React.ReactNode;
}
export const StatsCard: React.FC<StatsCardProps> = ({title, value, unit, icon}) => {
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center justify-between">
                <h3 className="text-xl text-slate-300 font-semibold">{title}</h3>
                {icon}
            </div>
            <p className="text-2xl font-bold">{value}<span className="text-sm font-normal">{unit}</span></p>

        </div>
    )
}