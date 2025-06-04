import React from "react";

interface PickerProps<T extends string | number> {
  label?: string;
  options: T[];
  value: T | "";
  onChange: (value: T | "") => void;
  allLabel?: string;
  className?: string;
}

function Picker<T extends string | number>({
  label,
  options,
  value,
  onChange,
  allLabel = "All",
  className = "",
}: PickerProps<T>) {
  return (
    <label style={{ display: "block" }}>
      {label && <span style={{ marginRight: 8 }}>{label}</span>}
      <select
        value={value}
        onChange={e => onChange(e.target.value === "" ? "" : (e.target.value as T))}
        className={className}
      >
        <option value="">{allLabel}</option>
        {options.map(opt => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </label>
  );
}

export default Picker;
