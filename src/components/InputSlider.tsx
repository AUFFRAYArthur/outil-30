import React from 'react';
import Tooltip from './Tooltip'; // Ensure Tooltip is imported

interface InputSliderProps {
  label: string;
  value: number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  min: number;
  max: number;
  step: number;
  unit: string;
  name?: string; // Make name optional
  tooltip?: string; // Add tooltip prop
}

const InputSlider: React.FC<InputSliderProps> = ({ label, value, onChange, min, max, step, unit, name, tooltip }) => {
  return (
    <div className="space-y-2">
      <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
        <span>{label}</span>
        {tooltip && <Tooltip text={tooltip} />}
      </label>
      <div className="flex items-center space-x-4">
        <input
          type="range"
          name={name}
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={onChange}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
        <span className="text-lg font-semibold text-blue-600 w-20 text-right">{Math.round(value)}{unit}</span>
      </div>
    </div>
  );
};

export default InputSlider;
