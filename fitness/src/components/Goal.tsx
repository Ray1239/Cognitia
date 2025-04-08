'use client';

import { useState, useEffect } from 'react';
import { Target, PlusCircle, X, Trash2, CheckCircle } from 'lucide-react';

type Goal = {
  id: number;
  title: string;
  date: string;
  createdAt: string;
  completed: boolean;
};

const FitnessGoalsCard = () => {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newGoal, setNewGoal] = useState({ title: '', date: '' });
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [triggerActive, setTriggerActive] = useState(true); 

  useEffect(() => {
    const fetchGoals = async () => {
      try {
        console.log('Fetching goals from /api/goal');
        const response = await fetch('/api/goal');
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch goals: ${errorText}`);
        }
        const data = await response.json();
        console.log('Goals fetched:', data);
        setGoals(data);
        if (data.some((goal: Goal) => goal.completed)) {
          setTriggerActive(false);
        }
      } catch (err) {
        setError('Error fetching goals');
        console.error(err);
      }
    };
    fetchGoals();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setNewGoal(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted with:', newGoal);
    if (!newGoal.title || !newGoal.date) {
      setError('Please fill in both fields');
      console.log('Validation failed: Missing title or date');
      return;
    }

    try {
      console.log('Sending POST request to /api/goal with:', newGoal);
      const response = await fetch('/api/goal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newGoal),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to add goal');
      }

      const addedGoal = await response.json();
      console.log('Goal added successfully:', addedGoal);
      setGoals([addedGoal, ...goals]);
      setNewGoal({ title: '', date: '' });
      setIsDialogOpen(false);
      setError(null);
      setToast(`Added: ${addedGoal.title}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setError('Error adding goal');
      console.error('POST request failed:', err);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      console.log('Sending DELETE request to /api/goal for ID:', id);
      const response = await fetch('/api/goal', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to delete goal');
      }

      console.log('Goal deleted successfully:', id);
      setGoals(goals.filter(goal => goal.id !== id));
    } catch (err) {
      setError('Error deleting goal');
      console.error('DELETE request failed:', err);
    }
  };

  const handleToggleComplete = async (id: number, currentCompleted: boolean) => {
    try {
      console.log('Sending PATCH request to /api/goal for ID:', id);
      const response = await fetch('/api/goal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, completed: !currentCompleted }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to update goal');
      }

      const updatedGoal = await response.json();
      console.log('Goal updated successfully:', updatedGoal);
      setGoals(goals.map(goal => (goal.id === id ? updatedGoal : goal)));
      if (!currentCompleted) {
        setToast(`Completed: ${updatedGoal.title}`);
        setTimeout(() => setToast(null), 3000);
      }
    } catch (err) {
      setError('Error updating goal');
      console.error('PATCH request failed:', err);
    }
  };

  const handleTriggerComplete = async () => {
    if (goals.length === 0) {
      setToast('No goals to complete');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    const latestGoal = goals[0]; 
    if (latestGoal.completed) {
      setToast('Latest goal already completed');
      setTimeout(() => setToast(null), 3000);
      return;
    }

    try {
      console.log('Sending PATCH request to /api/goal for latest goal ID:', latestGoal.id);
      const response = await fetch('/api/goal', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: latestGoal.id, completed: true }),
      });

      if (!response.ok) {
        const { error } = await response.json();
        throw new Error(error || 'Failed to complete goal');
      }

      const updatedGoal = await response.json();
      console.log('Latest goal completed successfully:', updatedGoal);
      setGoals(goals.map(goal => (goal.id === latestGoal.id ? updatedGoal : goal)));
      setTriggerActive(false); 
      setToast(`Completed: ${updatedGoal.title}`);
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      setError('Error completing goal');
      console.error('PATCH request failed:', err);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={handleTriggerComplete}
        className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-4 py-2 bg-green-500 text-white rounded-lg flex items-center z-50 transition-all ${
          triggerActive && goals.length > 0 && !goals[0].completed ? 'animate-pulse' : 'hover:bg-green-700'
        }`}
      >
        <CheckCircle className="h-4 w-4 mr-2" />
        Complete Latest Goal
      </button>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-16 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg z-50 animate-bounce">
          {toast}
        </div>
      )}

      {/* Card */}
      <div className="shadow-md mb-8 mt-20 bg-white rounded-lg relative">
        {/* Card Header */}
        <div className="p-6 border-b">
          <h2 className="flex items-center text-xl font-bold">
            <Target className="h-5 w-5 mr-2 text-indigo-600" />
            Your Fitness Goals
          </h2>
          <p className="text-gray-600">Track your objectives</p>
        </div>

        <div className="p-6">
          {goals.length === 0 ? (
            <p className="text-gray-500">No goals set yet. Add one to get started!</p>
          ) : (
            <div className="relative">
              <div className="absolute h-full w-1 bg-indigo-200 left-4 top-0"></div>
              {goals.map((goal, index) => (
                <div key={goal.id} className="mb-6 flex items-center">
                  <div className="w-8 h-8 flex-shrink-0 flex items-center justify-center bg-indigo-600 rounded-full text-white z-10">
                    {index + 1}
                  </div>
                  <div className="ml-4 flex-1 flex items-center justify-between">
                    <div>
                      <h3 className={`font-semibold ${goal.completed ? 'line-through text-gray-500' : ''}`}>
                        {goal.title}
                      </h3>
                      <p className="text-sm text-gray-600">{goal.date}</p>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleToggleComplete(goal.id, goal.completed)}
                        className={`${goal.completed ? 'text-green-500 hover:text-green-700' : 'text-gray-500 hover:text-gray-700'}`}
                      >
                        <CheckCircle className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="p-6 border-t">
          <button
            onClick={() => setIsDialogOpen(true)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Goal
          </button>
        </div>

        {/* Dialog for Adding New Goal */}
        {isDialogOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md relative">
              <button
                onClick={() => setIsDialogOpen(false)}
                className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
              <h3 className="text-lg font-semibold mb-4">Add a New Fitness Goal</h3>
              {error && <p className="text-red-500 mb-4">{error}</p>}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Goal Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={newGoal.title}
                    onChange={handleInputChange}
                    placeholder="Enter your goal"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Target Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={newGoal.date}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <button
                    type="button"
                    onClick={() => setIsDialogOpen(false)}
                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    Save Goal
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FitnessGoalsCard;