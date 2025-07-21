import React, { useState } from 'react';
import { Info } from 'lucide-react';

interface TooltipProps {
  text: string;
}

const Tooltip: React.FC<TooltipProps> = ({ text }) => {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <div 
      className="relative flex items-center"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <Info className="h-4 w-4 text-gray-400 cursor-pointer" />
      {isVisible && (
        <div className="absolute bottom-full mb-2 w-80 bg-gray-800 text-white text-base rounded-md p-4 z-10 shadow-lg">
          {text}
        </div>
      )}
    </div>
  );
};

export default Tooltip;
