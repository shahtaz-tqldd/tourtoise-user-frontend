import React from "react";

export const SingleItemSelectGroup = ({
  title,
  options,
  value,
  onValueChange,
}) => {
  return (
    <fieldset>
      <legend className="text-sm font-medium text-slate-800">{title}</legend>

      <div className="mt-4 flex flex-wrap gap-2.5">
        {options.map((option) => {
          const isSelected = value === option.value;
          const Icon = option.icon;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onValueChange(option.value)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                isSelected
                  ? "bg-primary text-white"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
              }`}
            >
              {Icon ? <Icon aria-hidden="true" className="size-4" /> : null}
              <span>{option.label}</span>
            </button>
          );
        })}
      </div>
    </fieldset>
  );
};
