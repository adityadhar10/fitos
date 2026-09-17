import { useState, useEffect, useRef } from "react";
import { EXERCISES, type Exercise } from "../data/exercises";

interface ExercisePickerProps {
  value: string;
  selectedCategory?: string;
  onSelect: (exercise: Exercise) => void;
}

/**
 * ExercisePicker component
 * Provides an intelligent, searchable autocomplete input filtered by body part / muscle category.
 */
export default function ExercisePicker({
  value,
  selectedCategory,
  onSelect,
}: ExercisePickerProps) {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Sync internal search query when external value prop changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  // Dismiss autocomplete dropdown when clicking outside component
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Handle typing inside the search input
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setQuery(text);
    setIsOpen(true);
    const matched = EXERCISES.find(
      (ex) => ex.name.toLowerCase() === text.trim().toLowerCase()
    );
    if (matched) {
      onSelect(matched);
    } else {
      onSelect({
        name: text,
        category: (selectedCategory as any) || "Full Body",
        muscle: "Custom",
      });
    }
  };

  // Handle picking an exercise from dropdown list
  const handleSelect = (exercise: Exercise) => {
    setQuery(exercise.name);
    setIsOpen(false);
    onSelect(exercise);
  };

  // Apply muscle category filter
  const cleanCat =
    selectedCategory && selectedCategory.trim() !== "" && selectedCategory !== "Auto-detect / Optional"
      ? selectedCategory.trim().toLowerCase()
      : "";

  const categoryFiltered = cleanCat
    ? EXERCISES.filter((ex) => {
        const exCat = ex.category.toLowerCase();
        if (cleanCat === "abs / core") {
          return exCat === "abs / core" || exCat.includes("abs") || exCat.includes("core");
        }
        return exCat === cleanCat;
      })
    : EXERCISES;

  // Apply search keyword filter across name, primary muscle & category with word-start ranking
  const searchKey = query.trim().toLowerCase();
  const searchFiltered = searchKey
    ? [...categoryFiltered]
        .filter(
          (ex) =>
            ex.name.toLowerCase().includes(searchKey) ||
            ex.muscle.toLowerCase().includes(searchKey) ||
            ex.category.toLowerCase().includes(searchKey)
        )
        .sort((a, b) => {
          const aName = a.name.toLowerCase();
          const bName = b.name.toLowerCase();
          const aWordStarts = aName.split(" ").some((w) => w.startsWith(searchKey));
          const bWordStarts = bName.split(" ").some((w) => w.startsWith(searchKey));
          if (aWordStarts && !bWordStarts) return -1;
          if (!aWordStarts && bWordStarts) return 1;
          return 0;
        })
    : categoryFiltered;

  // Limit display list to first 20 matching items
  const displayList = searchFiltered.slice(0, 20);

  return (
    <div className="exercise-picker-wrapper" ref={wrapperRef}>
      <input
        type="text"
        placeholder={
          cleanCat
            ? `Search ${selectedCategory} exercises (e.g. ${categoryFiltered[0]?.name || "exercise"})...`
            : "Search for an exercise (e.g. Bench Press, Squat, Row, Curl)..."
        }
        value={query}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        className="exercise-picker-input"
        required
      />

      {isOpen && (
        <div className="exercise-picker-dropdown">
          {displayList.length > 0 ? (
            displayList.map((exercise) => (
              <button
                key={`${exercise.category}-${exercise.name}`}
                type="button"
                className="exercise-picker-item"
                onClick={() => handleSelect(exercise)}
              >
                <div className="exercise-picker-info">
                  <span className="exercise-picker-name">{exercise.name}</span>
                  <span className="exercise-picker-sub">{exercise.muscle}</span>
                </div>
                <span className="exercise-picker-tag">{exercise.category}</span>
              </button>
            ))
          ) : (
            <div className="exercise-picker-empty">
              No exercises found matching &quot;{query}&quot; {cleanCat ? `in ${selectedCategory}` : ""}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
