import React from 'react';

type BrandMarkProps = {
  size?: 'sm' | 'md' | 'lg';
  muted?: boolean;
};

const sizeClasses = {
  sm: 'w-8 h-8 rounded-xl text-sm',
  md: 'w-9 h-9 rounded-xl text-sm',
  lg: 'w-10 h-10 rounded-2xl text-sm',
};

export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'sm', muted = false }) => (
  <div
    className={`${sizeClasses[size]} ${
      muted ? 'bg-sky-50 text-sky-500' : 'bg-sky-500 text-white'
    } flex items-center justify-center font-bold`}
    aria-label="BioLink"
  >
    B*
  </div>
);
