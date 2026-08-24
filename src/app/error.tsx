'use client';

import React, { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#030712] text-white flex flex-col items-center justify-center p-4 text-center select-none font-sans">
      <div className="max-w-md w-full p-6 rounded-2xl bg-[#081220] border border-rose-500/40 shadow-xl space-y-4">
        <h2 className="text-xl font-bold text-rose-300 font-serif">เกิดข้อผิดพลาดในการโหลดหน้าเว็บ</h2>
        <p className="text-xs text-slate-400 leading-relaxed font-mono">
          {error.message || 'โปรดลองรีเฟรชหน้าเว็บอีกครั้ง'}
        </p>
        <button
          onClick={() => reset()}
          className="px-6 py-2.5 rounded-full bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold transition active:scale-95 cursor-pointer shadow-md"
        >
          โหลดหน้าเว็บใหม่
        </button>
      </div>
    </div>
  );
}
