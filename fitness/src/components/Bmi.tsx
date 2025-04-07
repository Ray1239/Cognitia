import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, Info } from 'lucide-react';

interface BMIGaugeProps {
  userData: {
    data: {
      user: {
        weight: number;
        height: number;
      }
    }
  } | null;
}

const BMIGauge: React.FC<BMIGaugeProps> = ({ userData }) => {
  const [showInfo, setShowInfo] = React.useState(false);

  // Calculate BMI
  const calculateBMI = (weight: number, height: number) => {
    // Convert height from cm to meters
    const heightInMeters = height / 100;
    return Number((weight / (heightInMeters * heightInMeters)).toFixed(1));
  };

  // Determine BMI Category
  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5) return { 
      category: 'Underweight', 
      color: 'text-blue-600',
      bgColor: 'bg-blue-500',
      advice: "Consider consulting a nutritionist to develop a healthy weight gain plan."
    };
    if (bmi < 25) return { 
      category: 'Normal weight', 
      color: 'text-green-600',
      bgColor: 'bg-green-500',
      advice: "Great job maintaining a healthy weight! Continue balanced diet and exercise."
    };
    if (bmi < 30) return { 
      category: 'Overweight', 
      color: 'text-orange-600',
      bgColor: 'bg-orange-500',
      advice: "Focus on balanced nutrition and increased physical activity."
    };
    return { 
      category: 'Obese', 
      color: 'text-red-600',
      bgColor: 'bg-red-500',
      advice: "Consult healthcare professionals for a comprehensive health and weight management strategy."
    };
  };

  // If no user data, return null
  if (!userData) return null;
    
  const bmi = calculateBMI(userData.data.user.weight, userData.data.user.height);
  const { category, color, bgColor, advice } = getBMICategory(bmi);

  // Calculate rotation angle for the needle (180 degrees represents the full gauge)
  const calculateNeedleRotation = () => {
    // Map BMI to a rotation between 0 and 180 degrees
    // Assume BMI range from 10 to 40
    const minBMI = 10;
    const maxBMI = 40;
    const normalizedBMI = Math.min(Math.max(bmi, minBMI), maxBMI);
    const rotationPercentage = (normalizedBMI - minBMI) / (maxBMI - minBMI);
    return rotationPercentage * 180;
  };

  const needleRotation = calculateNeedleRotation();

  return (
    <Card className="w-full lg:max-w-full shadow-lg transition-all duration-300 hover:shadow-xl border-t-4" style={{ borderTopColor: bgColor.replace('bg-', '#').replace('-500', '') }}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold">BMI Analysis</CardTitle>
        <button 
          onClick={() => setShowInfo(!showInfo)}
          className="p-1 rounded-full hover:bg-gray-200 transition-colors"
        >
          <Info className="h-5 w-5 text-gray-500" />
        </button>
      </CardHeader>
      <CardContent className="flex flex-col md:flex-row items-center justify-between">
        <div className="w-full md:w-1/2 flex flex-col items-center mb-4 md:mb-0">
          <div className="relative w-48 h-28">
            {/* Gauge Background */}
            <div className="absolute inset-0 bg-gray-200 rounded-t-none rounded-b-full overflow-hidden">
              {/* Color Zones */}
              <div className="absolute bottom-0 left-0 w-1/4 h-full bg-blue-400 opacity-70"></div>
              <div className="absolute bottom-0 left-1/4 w-1/4 h-full bg-green-400 opacity-70"></div>
              <div className="absolute bottom-0 right-1/4 w-1/4 h-full bg-orange-400 opacity-70"></div>
              <div className="absolute bottom-0 right-0 w-1/4 h-full bg-red-400 opacity-70"></div>
              
              {/* Zone Labels */}
              <div className="absolute bottom-1 left-[12%] text-xs font-bold text-blue-800">18.5</div>
              <div className="absolute bottom-1 left-[37%] text-xs font-bold text-green-800">25</div>
              <div className="absolute bottom-1 right-[37%] text-xs font-bold text-orange-800">30</div>
              <div className="absolute bottom-1 right-[12%] text-xs font-bold text-red-800">40</div>
            </div>
            
            {/* Needle */}
            <div
              className="absolute bottom-0 left-1/2 w-1 h-28 bg-gray-800 origin-bottom transform transition-all duration-500 ease-in-out"
              style={{
                transform: `translateX(-50%) rotate(${needleRotation - 90}deg)`
              }}
            >
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-gray-800"></div>
            </div>
          </div>
          
          {/* BMI Value */}
          <div className="mt-6 text-center">
            <p className="text-3xl font-bold">
              <span className={color}>{bmi}</span>
            </p>
            <p className={`text-lg font-medium ${color}`}>
              {category}
            </p>
          </div>
        </div>
        
        {/* Health Advice Section */}
        <div className={`w-full md:w-1/2 p-4 rounded-lg transition-all duration-300 ${showInfo ? 'bg-gray-100' : ''}`}>
          {showInfo ? (
            <div className="text-sm space-y-2">
              <p className="font-bold text-gray-700">Understanding BMI:</p>
              <ul className="list-disc pl-5 text-gray-600">
                <li>Underweight: BMI less than 18.5</li>
                <li>Normal weight: BMI between 18.5 and 24.9</li>
                <li>Overweight: BMI between 25 and 29.9</li>
                <li>Obesity: BMI of 30 or greater</li>
              </ul>
              <p className="text-xs text-gray-500 mt-2">BMI is a screening tool but doesn't diagnose body fatness or health.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center md:items-start">
              <div className={`p-2 mb-2 rounded-lg ${bgColor.replace('500', '100')} ${color}`}>
                <p className="font-semibold">Recommendations</p>
              </div>
              <p className="text-gray-700">{advice}</p>
              <button 
                className={`mt-3 flex items-center text-sm ${color} hover:underline`}
                onClick={() => setShowInfo(true)}
              >
                Learn more about BMI <ArrowUp className="h-3 w-3 ml-1 transform rotate-45" />
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default BMIGauge;