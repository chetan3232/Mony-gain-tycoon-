
import React from 'react';

interface ProgressBarProps {
  current: number;
  max: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ current, max }) => {
  const percentage = max > 0 ? (current / max) * 100 : 0;

  return (
    <div className="w-full bg-gray-700 rounded-full h-2.5">
      <div
        className="bg-blue-brand h-2.5 rounded-full transition-all duration-300"
        style={{ width: `${percentage}%` }}
      ></div>
    </div>
  );
};

export default ProgressBar;
