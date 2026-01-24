import React from 'react';

const ShinyText = ({ text, disabled = false, speed = 3, className = '' }) => {
  const animationDuration = `${speed}s`;

  return (
    <div
      className={`text-black bg-clip-text inline-block ${disabled ? '' : 'animate-shine'} ${className}`}
      style={{
        backgroundImage: 'linear-gradient(120deg, rgba(0, 0, 0, 1) 40%, rgba(100, 100, 100, 1) 50%, rgba(0, 0, 0, 1) 60%)',
        backgroundSize: '200% 100%',
        WebkitBackgroundClip: 'text',
        animationDuration: animationDuration,
      }}
    >
      {text}
    </div>
  );
};

export default ShinyText;
