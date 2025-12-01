
import React from 'react';

interface IconProps {
  iconName: string;
  className?: string;
}

const Icon: React.FC<IconProps> = ({ iconName, className }) => {
  return <i className={`fas ${iconName} ${className}`}></i>;
};

export default Icon;
