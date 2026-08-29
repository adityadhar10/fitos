import { useState, useEffect, useRef } from "react";
import { indianFoods } from "../data/indianFoods";

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
  onEstimateWithAI?: (query: string) => void;
}

export default function FoodSearch({ onSelect, onEstimateWithAI }: FoodSearchProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<FoodResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [searchedApi, setSearchedApi] = useState(false);
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

  // Debounced search: local Indian foods first, then Open Food Facts
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setOpen(false);
      setSearchedApi(false);
      return;
    }

    // 1. Check local Indian foods list first (instant, no network call)
    const q = query.trim().toLowerCase();
    const localMatches = indianFoods
      .filter((f) => f.name.toLowerCase().includes(q))
      .map((f) => ({
        name: `${f.name} (${f.serving})`,
        brand: "Indian food (local)",
        calories: f.calories,
        protein: f.protein,
        carbs: f.carbs,
        fats: f.fats,
      }));

    if (localMatches.length > 0) {
      setResults(localMatches);
      setOpen(true);
      setSearchedApi(false);
      return;
    }

    // 2. No local match — fall back to Open Food Facts (debounced)
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/off-api/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=8&fields=product_name,brands,nutriments`
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
        setSearchedApi(true);
      }
    }, 450);
  }, [query]);

  const handleSelect = (food: FoodResult) => {
    onSelect(food);
    setQuery(food.name);
    setOpen(false);
  };

  const handleEstimateWithAI = () => {
    onEstimateWithAI?.(query);
    setOpen(false);
  };

  return (
    <div className="food-search-wrapper" ref={wrapperRef}>
      <div className="food-search-input-row">
        <span className="food-search-icon"></span>
        <input
          className="food-search-input"
          type="text"
          placeholder="Search food database... (e.g. chicken breast, oats, roti)"
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
            per serving/100g · local + Open Food Facts
          </li>
        </ul>
      )}

      {open && !loading && searchedApi && results.length === 0 && query.trim() && (
        <div className="food-search-empty" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <span>No results found in database.</span>
          {onEstimateWithAI && (
            <button
              type="button"
              onMouseDown={handleEstimateWithAI}
              style={{
                background: "#163a24",
                border: "1px solid #2d4535",
                color: "#4ade80",
                padding: "8px 12px",
                borderRadius: 8,
                cursor: "pointer",
                fontWeight: 600,
                fontSize: 13,
              }}
            >
              ✨ Estimate "{query}" with AI
            </button>
          )}
        </div>
      )}
    </div>
  );
}