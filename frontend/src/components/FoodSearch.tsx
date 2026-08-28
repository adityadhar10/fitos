import { useState, useEffect, useRef } from "react";

interface FoodResult {
  name: string;
  brand: string;
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
}

interface FoodSearchProps {
  onSelect: (food: FoodResult) => void;
}

export default function FoodSearch({ onSelect }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      return;
    }

    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments`
        );
        const data = await res.json();

        const mapped: FoodResult[] = (data.products || [])
          .filter((p: any) => p.product_name && p.nutriments?.["energy-kcal_100g"])
          .map((p: any) => ({
            name: p.product_name,
            brand: p.brands || "",
            calories: Math.round(p.nutriments["energy-kcal_100g"] || 0),
            protein: Math.round(p.nutriments["proteins_100g"] || 0),
            carbs: Math.round(p.nutriments["carbohydrates_100g"] || 0),
            fats: Math.round(p.nutriments["fat_100g"] || 0),
          }));

        setResults(mapped);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 450);
  }, [query]);

  const handleSelect = (food: FoodResult) => {
    onSelect(food);
    setQuery(food.name);
    setOpen(false);
  };

  return (
    <div className="food-search-wrapper" ref={wrapperRef}>
      <div className="food-search-input-row">
        <span className="food-search-icon"></span>
        <input
          className="food-search-input"
          type="text"
          placeholder="Search food database... (e.g. chicken breast, oats)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        {loading && <span className="food-search-spinner" />}
      </div>

      {open && results.length > 0 && (
        <ul className="food-search-dropdown">
          {results.map((food, i) => (
            <li
              key={i}
              className="food-search-item"
              onMouseDown={() => handleSelect(food)}
            >
              <div className="food-search-item-left">
                <span className="food-search-name">{food.name}</span>
                {food.brand && (
                  <span className="food-search-brand">{food.brand}</span>
                )}
              </div>
              <div className="food-search-item-right">
                <span className="food-search-cal">{food.calories} kcal</span>
                <span className="food-search-macros">
                  P: {food.protein}g · C: {food.carbs}g · F: {food.fats}g
                </span>
              </div>
            </li>
          ))}
          <li className="food-search-footer">
            per 100g · powered by Open Food Facts
          </li>
        </ul>
      )}

      {open && !loading && results.length === 0 && query.trim() && (
        <div className="food-search-empty">
          No results found. Enter details manually below.
        </div>
      )}
    </div>
  );
}
