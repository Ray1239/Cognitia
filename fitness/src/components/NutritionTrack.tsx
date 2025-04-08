import React, { useState, useRef } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Camera, Upload, X, AlertCircle, Info, PlusCircle, Check } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { format } from 'date-fns';
// import { useToast } from '@/components/ui/use-toast';

interface FoodAnalysis {
  food: string;
  calories: number | string;
  carbs: number | string;
  protein: number | string;
  fat: number | string;
  feedback: string;
}

interface CalorieEntry {
  date: string;
  calories: number;
}

interface FoodAnalyzerProps {
  onCalorieUpdate?: (entry: CalorieEntry) => void;
}

const FoodAnalyzerGemini: React.FC<FoodAnalyzerProps> = ({ onCalorieUpdate }) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [rawErrorResponse, setRawErrorResponse] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<FoodAnalysis | null>(null);
  const [showResults, setShowResults] = useState(false);
  const [savedToTracker, setSavedToTracker] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // const { toast } = useToast();

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    setRawErrorResponse(null);
    setAnalysis(null);
    setSavedToTracker(false);

    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp', 'image/gif'].includes(file.type)) {
      setError('Please select a valid image file (JPEG, PNG, WEBP, or GIF).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setImagePreview(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setLoading(true);
    setError(null);
    setRawErrorResponse(null);
    setSavedToTracker(false);

    try {
      // Extract the base64 data from the data URL
      const base64Data = imagePreview.split(',')[1];
      const mimeType = imagePreview.split(';')[0].split(':')[1];

      const response = await fetch('/api/nutrition', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          imageBase64: base64Data,
          mimeType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to analyze image');
      }

      // Process the calorie data to ensure it's a number
      if (data && typeof data.calories === 'string') {
        // Extract numeric value from string (e.g., "250 kcal" -> 250)
        const calorieMatch = data.calories.match(/(\d+)/);
        if (calorieMatch && calorieMatch[0]) {
          data.calories = parseInt(calorieMatch[0], 10);
        }
      }

      setAnalysis(data);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred while analyzing the image.');
      if (err.rawResponse) {
        setRawErrorResponse(err.rawResponse);
      }
    } finally {
      setLoading(false);
    }
  };

  const saveCaloriesToChart = () => {
    if (analysis && onCalorieUpdate) {
      // Extract numeric calorie value
      let calorieValue: number;
      
      if (typeof analysis.calories === 'string') {
        // Remove any non-numeric characters and parse
        const numericValue = analysis.calories.replace(/[^\d.]/g, '');
        calorieValue = parseFloat(numericValue);
      } else {
        calorieValue = analysis.calories;
      }

      // Check if we have a valid number
      if (!isNaN(calorieValue)) {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        // Create entry and pass to parent component
        const entry: CalorieEntry = {
          date: today,
          calories: calorieValue
        };
        
        onCalorieUpdate(entry);
        setSavedToTracker(true);
        
        // Show toast notification
        // toast({
        //   title: "Calories Added",
        //   description: `${calorieValue} calories added to today's total.`,
        //   duration: 3000,
        // });
        
        return true;
      }
    }
    return false;
  };

  const resetAnalyzer = () => {
    setImagePreview(null);
    setAnalysis(null);
    setError(null);
    setRawErrorResponse(null);
    setShowResults(false);
    setSavedToTracker(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleCloseResults = () => {
    setShowResults(false);
  };

  const handleSaveAndClose = () => {
    // Save calorie data
    saveCaloriesToChart();
    // Keep dialog open to show confirmation
  };

  return (
    <Card className="shadow-md h-full">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Camera className="h-5 w-5 mr-2 text-blue-600" />
          Food Nutrition Analyzer
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center">
        <input
          type="file"
          ref={fileInputRef}
          accept="image/jpeg, image/png, image/webp, image/gif"
          onChange={handleImageChange}
          disabled={loading}
          className="hidden"
        />

        {!imagePreview ? (
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-8 w-full mb-4 flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 transition-colors"
            onClick={triggerFileInput}
          >
            <Upload className="h-12 w-12 text-gray-400 mb-2" />
            <p className="text-gray-600 text-center font-medium mb-1">Click to upload a food image</p>
            <p className="text-gray-500 text-center text-sm">JPEG, PNG, WEBP or GIF</p>
          </div>
        ) : (
          <div className="relative mb-4 mt-2">
            <img
              src={imagePreview}
              alt="Food preview"
              className="max-h-48 rounded-lg object-contain"
            />
            <button
              onClick={resetAnalyzer}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
              title="Remove image"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4 w-full">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          onClick={handleAnalyze}
          disabled={!imagePreview || loading}
          className="w-full"
          variant="default"
        >
          {loading ? 'Analyzing...' : 'Analyze Food'}
        </Button>
      </CardContent>

      {/* Results Dialog */}
      <Dialog open={showResults} onOpenChange={setShowResults}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Food Analysis Results</DialogTitle>
            <DialogDescription>
              AI-powered nutritional breakdown
            </DialogDescription>
          </DialogHeader>

          {analysis && (
            <div className="space-y-4">
              {imagePreview && (
                <div className="flex justify-center">
                  <img
                    src={imagePreview}
                    alt="Analyzed food"
                    className="h-40 object-contain rounded-md"
                  />
                </div>
              )}

              <div className="bg-muted/50 p-4 rounded-md">
                <h3 className="text-lg font-semibold text-green-700 mb-3">{analysis.food}</h3>

                <div className="grid grid-cols-4 gap-2 mb-4">
                  <div className="flex flex-col items-center p-2 bg-white rounded-md shadow-sm">
                    <span className="text-lg font-bold">{analysis.calories}</span>
                    <span className="text-xs text-gray-500">Calories</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white rounded-md shadow-sm">
                    <span className="text-lg font-bold">{analysis.carbs}g</span>
                    <span className="text-xs text-gray-500">Carbs</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white rounded-md shadow-sm">
                    <span className="text-lg font-bold">{analysis.protein}g</span>
                    <span className="text-xs text-gray-500">Protein</span>
                  </div>
                  <div className="flex flex-col items-center p-2 bg-white rounded-md shadow-sm">
                    <span className="text-lg font-bold">{analysis.fat}g</span>
                    <span className="text-xs text-gray-500">Fat</span>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-medium">Feedback:</h4>
                  <p className="text-sm">{analysis.feedback}</p>
                </div>
              </div>

              <div className="flex items-start text-xs text-gray-500">
                <Info className="h-3 w-3 mr-1 mt-0.5" />
                <span>These values are AI-generated estimates and may not be completely accurate.</span>
              </div>
            </div>
          )}

          <DialogFooter className="sm:justify-between flex flex-wrap gap-2">
            <Button onClick={handleCloseResults} variant="outline">Close</Button>
            {onCalorieUpdate && !savedToTracker && (
              <Button onClick={handleSaveAndClose} className="flex items-center">
                <PlusCircle className="h-4 w-4 mr-2" />
                Add to Calorie Tracker
              </Button>
            )}
            {savedToTracker && (
              <div className="flex items-center text-green-600 text-sm">
                <Check className="h-4 w-4 mr-1" />
                Added to tracker
              </div>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default FoodAnalyzerGemini;