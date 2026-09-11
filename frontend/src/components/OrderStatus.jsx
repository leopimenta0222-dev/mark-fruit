import { Check } from "lucide-react";
import { ORDER_STATUS } from "../utils/format.js";

const STEPS = ["RECEIVED", "PREPARING", "READY_OR_SHIPPED", "COMPLETED"];

export default function OrderStatus({ status, compact = false }) {
  const currentIndex = Math.max(0, STEPS.indexOf(status));

  return (
    <div aria-label={`Status: ${ORDER_STATUS[status]?.label || status}`}>
      <div className="flex items-center justify-between gap-3">
        <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-xs font-extrabold text-brand-800 dark:bg-brand-950 dark:text-brand-200">
          {ORDER_STATUS[status]?.label || status}
        </span>
        {!compact && <span className="text-xs text-stone-500">Etapa {currentIndex + 1} de {STEPS.length}</span>}
      </div>
      {!compact && (
        <div className="mt-3 flex" aria-hidden="true">
          {STEPS.map((step, index) => (
            <div key={step} className="flex flex-1 items-center last:flex-none">
              <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full border-2 ${index <= currentIndex ? "border-brand-600 bg-brand-600 text-white" : "border-stone-300 bg-white text-transparent"}`}>
                <Check size={13} strokeWidth={3} />
              </span>
              {index < STEPS.length - 1 && <span className={`h-0.5 w-full ${index < currentIndex ? "bg-brand-600" : "bg-stone-200 dark:bg-stone-700"}`} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
