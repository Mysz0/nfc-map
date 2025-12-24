import React from 'react';

export default function StatCard({ mainVal, subVal, colors }) {
  return (
    <div className={`${colors.card} backdrop-blur-2xl rounded-[3rem] p-10 border flex justify-between items-center`}>
      <div>
        <p className="text-6xl font-bold tracking-tighter leading-none">{mainVal}</p>
        <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-[0.2em] mt-4">Experience</p>
      </div>
      <div className="h-12 w-px bg-emerald-500/10" />
      <div className="text-right">
        <p className="text-3xl font-bold leading-none">{subVal}</p>
        <p className="text-zinc-500 text-[10px] font-bold uppercase mt-1">Found</p>
      </div>
    </div>
  );
}
