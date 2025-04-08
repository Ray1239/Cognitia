import React from 'react'
import { ChevronRightIcon, Activity, Moon, Dumbbell, Activity as Yoga, Droplet } from 'lucide-react';

const scheduleData = [
  { day: 'Monday', activity: 'Running', duration: '20 min', icon: Activity },
  { day: 'Tuesday', activity: 'Sleeping', duration: '7 hrs', icon: Moon },
  { day: 'Wednesday', activity: 'Weight Loss', duration: '1.5hrs', icon: Dumbbell },
  { day: 'Thursday', activity: 'Yoga', duration: '45 min', icon: Yoga },
  { day: 'Friday', activity: 'Swimming', duration: '25 min', icon: Droplet },
]

const Schedule: React.FC = () => {
  return (
    <div className="bg-white p-6 rounded-lg shadow-lg">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold text-gray-800">My Schedule</h2>
        <button className="text-blue-500 text-sm font-medium hover:text-blue-600 transition-colors">
          View All <ChevronRightIcon className="inline-block w-4 h-4 ml-1" />
        </button>
      </div>
      <div className="space-y-3">
        {scheduleData.map((item) => (
          <div key={item.day} className="flex items-center justify-between bg-gray-50 p-3 rounded-lg">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 p-2 rounded-full">
                <item.icon className="w-5 h-5 text-blue-500" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-800">{item.day}</p>
                <p className="text-xs text-gray-500">{item.activity}</p>
              </div>
            </div>
            <div className="bg-blue-500 text-white text-xs font-medium py-1 px-2 rounded-full">
              {item.duration}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Schedule