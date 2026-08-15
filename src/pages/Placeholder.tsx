import React from 'react';
import { Construction } from 'lucide-react';

export default function Placeholder({ title }: { title: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <div className="w-24 h-24 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-6 shadow-sm">
        <Construction className="w-12 h-12" />
      </div>
      <h1 className="text-3xl font-bold text-slate-800 mb-2">{title}</h1>
      <p className="text-slate-500 text-center max-w-md">
        This module is currently under development. Please check back later.
      </p>
    </div>
  );
}
