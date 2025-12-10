import React from 'react';

interface MaterialSymbolProps {
  name: string;
  filled?: boolean;
  size?: number;
  className?: string;
}

export const MaterialSymbol = ({ name, filled = false, size, className = '' }: MaterialSymbolProps) => {
  const style: React.CSSProperties = {};
  if (filled) {
    style.fontVariationSettings = "'FILL' 1";
  }
  if (size) {
    style.fontSize = `${size}px`;
  }

  return (
    <span
      className={`material-symbols-outlined ${filled ? 'filled' : ''} ${className}`}
      style={style}
    >
      {name}
    </span>
  );
};


