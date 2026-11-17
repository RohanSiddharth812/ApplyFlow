import React from 'react';

interface CircularProgressProps {
  score: number;
  maxScore?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  subtext?: string;
  color?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  score,
  maxScore = 100,
  size = 140,
  strokeWidth = 10,
  label = "Overall Score",
  subtext,
  color = "#08979D"
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = Math.min(maxScore, Math.max(0, score));
  const strokeDashoffset = circumference - (normalizedScore / maxScore) * circumference;

  return (
    <div className="flex flex-col items-center justify-center">
      <div className="relative" style={{ width: size, height: size }}>
        <svg className="w-full h-full transform -rotate-90" viewBox={`0 0 ${size} ${size}`}>
          {/* Background circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#E2E8F0"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            fill="transparent"
            className="transition-all duration-1000 ease-out"
          />
        </svg>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-bold text-slate-800 tracking-tight">
            {score}{maxScore === 100 ? '%' : `/${maxScore}`}
          </span>
          {label && (
            <span className="text-xs font-medium text-slate-500 mt-0.5">
              {label}
            </span>
          )}
        </div>
      </div>
      {subtext && (
        <p className="text-xs text-slate-500 mt-3 text-center max-w-[200px] leading-relaxed">
          {subtext}
        </p>
      )}
    </div>
  );
};
