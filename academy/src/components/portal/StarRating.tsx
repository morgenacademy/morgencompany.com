import { Star } from "lucide-react";
import { useState } from "react";

interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
}

const labels: Record<number, string> = {
  1: "Matig",
  2: "Voldoende",
  3: "Goed",
  4: "Heel goed",
  5: "Uitstekend",
};

const StarRating = ({ value, onChange, max = 5 }: StarRatingProps) => {
  const [hovered, setHovered] = useState(0);

  const active = hovered || value;

  return (
    <div className="flex items-center gap-1.5">
      {Array.from({ length: max }, (_, i) => i + 1).map((star) => (
        <button
          key={star}
          type="button"
          onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          className="focus:outline-none"
          aria-label={`${star} van ${max} sterren`}
        >
          <Star
            className={`h-7 w-7 transition-colors ${
              star <= active
                ? "fill-amber-400 text-amber-400"
                : "fill-transparent text-muted-foreground/40"
            }`}
          />
        </button>
      ))}
      {active > 0 && (
        <span className="ml-1 text-xs text-muted-foreground">{labels[active]}</span>
      )}
    </div>
  );
};

export default StarRating;
