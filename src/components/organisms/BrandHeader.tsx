import React from 'react';
import { BrandMark } from '../atoms/BrandMark';

type BrandHeaderProps = {
  suffix?: React.ReactNode;
  accountUsername?: string;
};

export const BrandHeader: React.FC<BrandHeaderProps> = ({ suffix, accountUsername }) => (
  <header className="max-w-6xl w-full mx-auto flex items-center justify-between">
    <div className="flex items-center gap-2.5">
      <BrandMark />
      <span className="font-bold text-lg tracking-tight text-slate-900">BioLink</span>
      {accountUsername && (
        <span className="text-xs font-medium text-slate-500 bg-slate-100 border border-slate-200 px-2.5 py-0.5 rounded-full">
          @{accountUsername}
        </span>
      )}
    </div>
    {suffix}
  </header>
);