import React from 'react';

interface ProgressBarProps {
  label: string;
  value: number;
  maxValue?: number;
  color?: string;
  showValue?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  value,
  maxValue = 100,
  color = "bg-niagara",
  showValue = true
}) => {
  const percentage = Math.min(100, Math.max(0, (value / maxValue) * 100));

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-1.5 text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        {showValue && (
          <span className="font-semibold text-slate-800 text-xs">
            {value}
          </span>
        )}
      </div>
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
};
