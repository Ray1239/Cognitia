import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Flame, Plus, Calendar } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ReferenceLine } from 'recharts';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { format, subDays, parseISO, isValid } from 'date-fns';

interface CalorieEntry {
  date: string;
  calories: number;
}

interface FormattedCalorieData {
  date: string;
  calories: number;
}

const CalorieTrackingCard = () => {
  const [calorieData, setCalorieData] = useState<FormattedCalorieData[]>([]);
  const [isAddingEntry, setIsAddingEntry] = useState(false);
  const [newCalories, setNewCalories] = useState('');
  const [selectedDate, setSelectedDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  
  // Load data on component mount
  useEffect(() => {
    loadCalorieData();
  }, []);
  
  const loadCalorieData = () => {
    const storedData = localStorage.getItem('calorieEntries');
    let entries: CalorieEntry[] = storedData ? JSON.parse(storedData) : [];
    
    // Generate last 7 days of data
    const formattedData = getWeeklyCalorieData(entries);
    setCalorieData(formattedData);
  };
  
  const getWeeklyCalorieData = (entries: CalorieEntry[]): FormattedCalorieData[] => {
    const today = new Date();
    const result: FormattedCalorieData[] = [];
    
    // Create entries for the last 7 days
    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i);
      const dateStr = format(date, 'yyyy-MM-dd');
      const displayDate = format(date, 'MMM dd');
      
      // Find entry for this date or use 0 calories
      const entry = entries.find(e => e.date === dateStr);
      
      result.push({
        date: displayDate,
        calories: entry ? entry.calories : 0
      });
    }
    
    return result;
  };
  
  const saveCalorieEntry = (entry: CalorieEntry) => {
    // Get existing entries
    const storedData = localStorage.getItem('calorieEntries');
    let entries: CalorieEntry[] = storedData ? JSON.parse(storedData) : [];
    
    // Check if entry for this date already exists
    const existingEntryIndex = entries.findIndex(item => item.date === entry.date);
    
    if (existingEntryIndex >= 0) {
      // Update existing entry
      entries[existingEntryIndex].calories += entry.calories;
    } else {
      // Add new entry
      entries.push(entry);
    }
    
    // Sort by date
    entries.sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    
    // Save to localStorage
    localStorage.setItem('calorieEntries', JSON.stringify(entries));
    
    // Reload data
    loadCalorieData();
  };
  
  const handleSaveManualEntry = () => {
    const calorieValue = parseInt(newCalories, 10);
    
    if (!isNaN(calorieValue) && calorieValue > 0 && isValid(parseISO(selectedDate))) {
      saveCalorieEntry({
        date: selectedDate,
        calories: calorieValue
      });
      
      // Reset form
      setNewCalories('');
      setSelectedDate(format(new Date(), 'yyyy-MM-dd'));
      setIsAddingEntry(false);
    }
  };
  
  // Calculate daily average
  const calculateAverage = () => {
    const nonZeroEntries = calorieData.filter(entry => entry.calories > 0);
    if (nonZeroEntries.length === 0) return 0;
    
    const sum = nonZeroEntries.reduce((total, entry) => total + entry.calories, 0);
    return Math.round(sum / nonZeroEntries.length);
  };
  
  // Function that can be passed to FoodAnalyzerGemini
  const handleCalorieUpdate = (entry: CalorieEntry) => {
    saveCalorieEntry(entry);
  };
  
  return (
    <>
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Flame className="h-5 w-5 mr-2 text-orange-600" />
            Calorie Tracking
          </CardTitle>
          <CardDescription>Weekly calorie intake</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={calorieData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="calories"
                  stroke="#ed6c02"
                  strokeWidth={2}
                  dot={{ r: 4, fill: "#ed6c02" }}
                  activeDot={{ r: 6 }}
                />
                {calculateAverage() > 0 && (
                  <ReferenceLine 
                    y={calculateAverage()} 
                    stroke="#0088FE" 
                    strokeDasharray="3 3"
                    label={{ value: `Avg: ${calculateAverage()}`, position: 'right' }}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
        <CardFooter>
          <Button
            onClick={() => setIsAddingEntry(true)}
            variant="outline"
            className="w-full flex items-center justify-center"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Calorie Entry
          </Button>
        </CardFooter>
      </Card>
      
      {/* Dialog for adding manual entries */}
      <Dialog open={isAddingEntry} onOpenChange={setIsAddingEntry}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Calorie Entry</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="calories">Calories</Label>
              <Input 
                id="calories" 
                type="number" 
                placeholder="Enter calorie amount" 
                value={newCalories} 
                onChange={(e) => setNewCalories(e.target.value)}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date</Label>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-2 text-gray-500" />
                <Input 
                  id="date" 
                  type="date" 
                  value={selectedDate} 
                  onChange={(e) => setSelectedDate(e.target.value)}
                  max={format(new Date(), 'yyyy-MM-dd')}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddingEntry(false)}>Cancel</Button>
            <Button onClick={handleSaveManualEntry}>Save Entry</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

// Export both the card and the handleCalorieUpdate function
export { CalorieTrackingCard, type CalorieEntry };
export default CalorieTrackingCard;