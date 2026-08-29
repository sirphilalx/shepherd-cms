import { ChevronDown } from "lucide-react";

/**
 * Native <select> styled as the bordered pill from the mockups. Used by the
 * sermon and library filter toolbars. Native control = most thumb-friendly
 * filter on mobile.
 */
export function PillSelect({
  label,
  placeholder,
  value,
  options,
  onChange,
}: {
  label: string;
  placeholder: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <div className="relative inline-flex">
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full appearance-none rounded-full border border-border-strong bg-surface py-[7px] pl-[14px] pr-9 text-[12.5px] font-semibold text-ink transition-colors hover:bg-bg focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
      >
        <option value="">{placeholder}</option>
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
      <ChevronDown
        size={14}
        strokeWidth={1.9}
        aria-hidden
        className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted"
      />
    </div>
  );
}
