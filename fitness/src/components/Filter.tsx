"use client";

import { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";

const FilterDropdown = () => {
  const [filters, setFilters] = useState({
    goal: "",
    duration: "",
    difficulty: "",
  });

  const resetFilters = () => {
    setFilters({
      goal: "",
      duration: "",
      difficulty: "",
    });
  };

  return (
    <div className="flex flex-col gap-4 p-4">
      {/* Goal Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {filters.goal || "Select Goal"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {["Weight Loss", "Strength Training", "Yoga"].map((goal) => (
            <DropdownMenuItem
              key={goal}
              onClick={() => setFilters({ ...filters, goal })}
            >
              {goal}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Duration Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {filters.duration || "Select Duration"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {["Short", "Medium", "Long"].map((duration) => (
            <DropdownMenuItem
              key={duration}
              onClick={() => setFilters({ ...filters, duration })}
            >
              {duration}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Difficulty Dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline">
            {filters.difficulty || "Select Difficulty"}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          {["Beginner", "Intermediate", "Advanced"].map((difficulty) => (
            <DropdownMenuItem
              key={difficulty}
              onClick={() => setFilters({ ...filters, difficulty })}
            >
              {difficulty}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Reset Filters */}
      <Button variant="secondary" onClick={resetFilters}>
        Reset Filters
      </Button>
    </div>
  );
};

export default FilterDropdown;
