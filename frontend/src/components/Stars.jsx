import { Star } from "lucide-react";

export default function Stars({ value = 0, count, size = 16, interactive = false, onChange }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div className="flex items-center gap-0.5">
      {stars.map((s) => {
        const filled = s <= Math.round(value);
        return (
          <button
            key={s}
            type="button"
            disabled={!interactive}
            onClick={() => interactive && onChange?.(s)}
            className={interactive ? "cursor-pointer hover:scale-110 transition" : "cursor-default"}
          >
            <Star
              size={size}
              className={filled ? "fill-yellow-400 text-yellow-400" : "text-stone-300"}
            />
          </button>
        );
      })}
      {count !== undefined && (
        <span className="ml-1 text-xs text-stone-500">
          {value ? value.toFixed(1) : "—"}
          {count > 0 && ` (${count})`}
        </span>
      )}
    </div>
  );
}
