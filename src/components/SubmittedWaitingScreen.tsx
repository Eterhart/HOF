'use client';

import React from 'react';
import { GameSessionState, TeamState } from '@/data/types';

interface SubmittedWaitingScreenProps {
  session: GameSessionState;
  myTeam: TeamState;
  onViewExhibition: () => void;
}

export const SubmittedWaitingScreen: React.FC<SubmittedWaitingScreenProps> = ({
  session,
  myTeam,
  onViewExhibition,
}) => {
  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-12 max-w-lg mx-auto select-none animate-fadeIn text-[#e0f2fe] relative overflow-hidden font-sans">
      {/* ── Cyber Grid Background (ตารางฟ้าไซไฟ) ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(125,211,252,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,211,252,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_45%,transparent_20%,#030712_95%)] pointer-events-none z-0" />

      {/* ── Ambient Volumetric Spotlight Glow ── */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-950/25 blur-[120px] rounded-full pointer-events-none z-0" />

      {/* ── Centered Content ── */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center space-y-3 max-w-md w-full px-4">
        {/* Title */}
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-serif font-black text-white tracking-wide drop-shadow-[0_0_25px_rgba(125,211,252,0.5)]">
          ทีมคุณส่งนิทรรศการสำเร็จ
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-sky-300 font-sans tracking-wide drop-shadow-[0_0_12px_rgba(56,189,248,0.4)]">
          กำลังรออาจารย์สรุปผล...
        </p>

        {/* Divider Line (ขีดกั้นเรืองแสง) */}
        <div className="w-full pt-6 pb-1 flex items-center justify-center">
          <div className="w-[260px] max-w-full h-[1px] bg-gradient-to-r from-transparent via-sky-500/50 to-transparent shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
        </div>

        {/* Action Button (ดีไซน์เดียวกับปุ่ม พิพิธภัณฑ์) */}
        <button
          type="button"
          onClick={onViewExhibition}
          className="w-[260px] max-w-full mx-auto py-3.5 px-4 rounded-[4px] cyber-glass-btn text-center text-white hover:text-cyan-100 cursor-pointer block active:scale-98 transition-all"
        >
          <span className="text-sm sm:text-base font-serif font-bold tracking-wide drop-shadow-[0_1px_4px_rgba(0,0,0,0.8)]">
            ไปดูนิทรรศการของฉัน
          </span>
        </button>
      </div>
    </div>
  );
};
