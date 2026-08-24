'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import { EXHIBITION_ROOMS } from '@/data/gameData';
import { TeamState } from '@/data/types';
import { Sparkles, Loader2 } from 'lucide-react';

interface SlotReelRevealProps {
  myTeam: TeamState;
  onComplete: () => void;
}

export const SlotReelReveal: React.FC<SlotReelRevealProps> = ({ myTeam, onComplete }) => {
  const [hasStarted, setHasStarted] = useState(false);
  const [isSettled, setIsSettled] = useState(false);
  const [isFadingOut, setIsFadingOut] = useState(false);
  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const ITEM_HEIGHT = 80; // Height of each text row
  const VIEWPORT_HEIGHT = 280; // Height of visible reel window
  const CYCLES = 6; // Repeat cycles

  // Flattened list of 8 exhibition rooms repeated
  const strip = useMemo(() => {
    const list = [];
    for (let c = 0; c < CYCLES; c++) {
      for (let i = 0; i < EXHIBITION_ROOMS.length; i++) {
        list.push({
          room: EXHIBITION_ROOMS[i],
          key: `${c}-${EXHIBITION_ROOMS[i].id}`,
          roomIndex: i,
        });
      }
    }
    return list;
  }, []);

  // Safe room index of the assigned team
  const targetRoomIndex = useMemo(() => {
    const idx = EXHIBITION_ROOMS.findIndex(r => r.id === (myTeam.roomId || 'CAT-1'));
    return idx >= 0 ? idx : 0;
  }, [myTeam.roomId]);

  // Target item index in the strip (cycle 4)
  const targetIndex = useMemo(() => {
    return 4 * EXHIBITION_ROOMS.length + targetRoomIndex;
  }, [targetRoomIndex]);

  // Exact formula to position the target item in the center:
  const centerOffset = (VIEWPORT_HEIGHT - ITEM_HEIGHT) / 2;
  const initialTranslateY = centerOffset;
  const finalTranslateY = centerOffset - targetIndex * ITEM_HEIGHT;

  useEffect(() => {
    // 1. Trigger smooth spin shortly after mount
    const startTimer = setTimeout(() => {
      setHasStarted(true);
    }, 100);

    // 2. Mark settled after 3.2s transition
    const settleTimer = setTimeout(() => {
      setIsSettled(true);
    }, 3300);

    // 3. Fade out after pausing for 1.5s
    const fadeTimer = setTimeout(() => {
      setIsFadingOut(true);
    }, 4800);

    // 4. Complete & unmount into game board
    const completeTimer = setTimeout(() => {
      onCompleteRef.current();
    }, 5200);

    return () => {
      clearTimeout(startTimer);
      clearTimeout(settleTimer);
      clearTimeout(fadeTimer);
      clearTimeout(completeTimer);
    };
  }, []); // Run only once on mount

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#030712] px-4 select-none font-sans text-white transition-opacity duration-500 overflow-hidden ${
        isFadingOut ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* ── Soft Comfortable Cyber Grid Background ── */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(125,211,252,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(125,211,252,0.06)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none z-0" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_85%_85%_at_50%_45%,transparent_20%,#030712_95%)] pointer-events-none z-0" />

      {/* ── Ambient Volumetric Spotlight Glow ── */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-sky-950/25 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* ── Top Header Title ── */}
      <div className="relative z-10 text-center space-y-1 mb-8 max-w-md mx-auto">
        <p className="text-xs font-mono text-[#f5c768] tracking-widest uppercase font-bold drop-shadow-[0_0_8px_rgba(245,199,104,0.4)]">
          {myTeam.name}
        </p>

        <h2 className="text-2xl sm:text-3xl font-serif font-black text-white tracking-tight drop-shadow-[0_0_20px_rgba(125,211,252,0.3)]">
          หัวข้อห้องนิทรรศการของกลุ่ม
        </h2>
      </div>

      {/* ── Reel Window (Cyber Dark Theme) ── */}
      <div
        className="relative z-10 w-full max-w-lg overflow-hidden select-none"
        style={{ height: `${VIEWPORT_HEIGHT}px` }}
      >
        {/* Top & Bottom Gradient Masks blending directly with #030712 */}
        <div className="absolute top-0 left-0 right-0 h-28 bg-gradient-to-b from-[#030712] via-[#030712]/80 to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-[#030712] via-[#030712]/80 to-transparent z-20 pointer-events-none" />

        {/* Target Frame Glow Indicator when Settled */}
        {isSettled && (
          <div className="absolute inset-x-4 sm:inset-x-8 top-1/2 -translate-y-1/2 h-[72px] rounded-[4px] border border-sky-400/50 shadow-[0_0_25px_rgba(125,211,252,0.3),inset_0_0_15px_rgba(125,211,252,0.15)] bg-sky-950/20 z-10 pointer-events-none animate-fadeIn" />
        )}

        {/* Scrolling text strip */}
        <div
          className="w-full text-center relative z-10"
          style={{
            transform: `translateY(${hasStarted ? finalTranslateY : initialTranslateY}px)`,
            transition: hasStarted
              ? 'transform 3.2s cubic-bezier(0.12, 0.82, 0.2, 1)'
              : 'none',
          }}
        >
          {strip.map((item, index) => {
            const isTarget = index === targetIndex;
            return (
              <div
                key={item.key}
                className={`flex flex-col items-center justify-center px-4 transition-all duration-300 ${
                  isTarget && isSettled
                    ? 'opacity-100 scale-110 font-serif font-bold text-white drop-shadow-[0_0_15px_rgba(125,211,252,0.5)]'
                    : isTarget
                    ? 'opacity-80 scale-105 text-sky-100 font-serif'
                    : 'opacity-25 scale-90 text-sky-300/40 font-sans'
                }`}
                style={{
                  height: `${ITEM_HEIGHT}px`,
                }}
              >
                <span className="text-base sm:text-xl leading-snug tracking-tight text-center max-w-md">
                  {item.room.nameTh}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Bottom Status indicator / Skip ── */}
      <div className="relative z-10 mt-8 text-center">
        {isSettled ? (
          <button
            onClick={() => onCompleteRef.current()}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-[4px] cyber-glass-btn text-xs font-mono text-sky-300 hover:text-white cursor-pointer transition active:scale-95 shadow-[0_0_12px_rgba(125,211,252,0.2)]"
          >
            <span>กำลังเข้าสู่หน้านิทรรศการ (แตะเพื่อข้าม &gt;)</span>
          </button>
        ) : (
          <div className="inline-flex items-center gap-2 text-xs font-mono text-sky-300/70 tracking-wider">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-sky-300" />
            <span>กำลังสุ่มหัวข้อห้องนิทรรศการ...</span>
          </div>
        )}
      </div>
    </div>
  );
};
