'use client';

import React from 'react';
import { TeamState, GameSessionState } from '@/data/types';
import { EXHIBITION_ROOMS } from '@/data/gameData';

interface HeaderHUDProps {
  session: GameSessionState;
  myTeam?: TeamState;
  activeTab: 'market' | 'room' | 'briefing';
  setActiveTab: (tab: 'market' | 'room' | 'briefing') => void;
  timeLeft: number;
  onSetPhase?: (phase: 'LOBBY' | 'BRIEFING' | 'SHOPPING' | 'EVALUATION' | 'LEADERBOARD') => Promise<void>;
  onResetGame?: () => Promise<void>;
}

export const HeaderHUD: React.FC<HeaderHUDProps> = ({
  session, myTeam, timeLeft
}) => {
  const room = myTeam ? EXHIBITION_ROOMS.find(r => r.id === myTeam.roomId) : undefined;

  const minutes = Math.floor(Math.max(0, timeLeft) / 60);
  const seconds = Math.floor(Math.max(0, timeLeft) % 60);
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const isUrgent = timeLeft <= 60 && timeLeft > 0;

  return (
    <header className="w-full select-none">
      <div className="max-w-7xl mx-auto px-2 xs:px-3 sm:px-4 py-1.5 sm:py-2">
        {/* Top bar */}
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          {/* Left: รับผิดชอบการจัดนิทรรศการ ห้อง... */}
          {room ? (
            <div className="flex items-center min-w-0 flex-1 pr-1 sm:pr-2">
              <div className="inline-flex items-center gap-1 sm:gap-1.5 max-w-full truncate">
                <span className="text-[11px] xs:text-xs sm:text-sm md:text-base text-rose-300/80 font-serif shrink-0">
                  รับผิดชอบ
                </span>
                <span className="text-[11px] xs:text-xs sm:text-sm md:text-base text-white font-bold truncate drop-shadow-sm font-serif">
                  ห้อง{room.nameTh}
                </span>
              </div>
            </div>
          ) : (
            <div className="flex-1" />
          )}

          {/* Right Status: Timer & Budget */}
          <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 shrink-0">
            {session.phase === 'SHOPPING' && (
              <div className="flex items-center px-0.5 py-0.5 select-none shrink-0">
                <span className={`font-mono font-normal text-base xs:text-lg sm:text-xl md:text-2xl tracking-normal filter drop-shadow-[0_0_8px_rgba(225,29,72,0.4)] ${
                  session.durationSeconds === 0
                    ? 'text-sky-300'
                    : isUrgent
                    ? 'text-rose-400 font-bold animate-pulse drop-shadow-[0_0_12px_rgba(244,63,94,0.7)]'
                    : 'text-rose-300'
                }`}>
                  {session.durationSeconds === 0 ? 'ไม่จับเวลา' : formattedTime}
                </span>
              </div>
            )}

            {myTeam && (
              <div className="flex items-center gap-1 sm:gap-2 px-0.5 py-0.5 select-none shrink-0">
                {/* Custom Currency Coin Icon (Cyan & Thin) */}
                <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-cyan-400 filter drop-shadow-[0_0_8px_rgba(6,182,212,0.6)]" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="9" className="fill-cyan-950/30 stroke-cyan-400" strokeWidth="1.5" />
                  <path d="M10 7h3.5a2 2 0 0 1 0 4H10m0 0h4a2 2 0 0 1 0 4H10m0-8v10m2-12v2m0 10v2" className="stroke-cyan-400" strokeWidth="1.5" />
                </svg>
                <span className="text-cyan-300 font-mono font-normal text-base xs:text-lg sm:text-xl md:text-2xl tracking-normal filter drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  {myTeam.budget.toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
