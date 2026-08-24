'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface HologramConfirmModalProps {
  title?: string;
  itemName: string;
  itemType?: 'statue' | 'evidence' | 'story';
  currentBudget: number;
  price: number;
  warningNote?: string;
  onCancel: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
}

export const HologramConfirmModal: React.FC<HologramConfirmModalProps> = ({
  title = 'Notice',
  itemName,
  itemType = 'statue',
  currentBudget,
  price,
  warningNote,
  onCancel,
  onConfirm,
  isLoading = false,
}) => {
  const remainingBudget = currentBudget - price;
  const cannotAfford = remainingBudget < 0;

  return (
    <div
      onClick={onCancel}
      className="fixed inset-0 z-[99999999] flex items-center justify-center p-4 sm:p-6 bg-black/85 backdrop-blur-md animate-pureFadeIn select-none cursor-pointer"
    >
      {/* ── MODAL CONTAINER (ANONYMOUS PLATFORM / LOVE & DEEPSPACE TERMINAL) ── */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-lg bg-[#071322]/95 rounded-[12px] border border-cyan-500/40 shadow-[0_0_50px_rgba(6,182,212,0.25)] overflow-hidden cursor-default animate-scaleUp text-white"
        style={{
          background:
            'radial-gradient(ellipse 90% 70% at 50% 30%, rgba(10, 32, 58, 0.95) 0%, rgba(5, 16, 30, 0.98) 100%)',
        }}
      >
        {/* ── 4 CORNER TECH CROSSHAIRS / TICK MARKS ── */}
        <div className="absolute top-1.5 left-1.5 w-3 h-3 border-t-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
        <div className="absolute top-1.5 right-1.5 w-3 h-3 border-t-2 border-r-2 border-cyan-400 pointer-events-none z-20" />
        <div className="absolute bottom-1.5 left-1.5 w-3 h-3 border-b-2 border-l-2 border-cyan-400 pointer-events-none z-20" />
        <div className="absolute bottom-1.5 right-1.5 w-3 h-3 border-b-2 border-r-2 border-cyan-400 pointer-events-none z-20" />

        {/* ── CRT SCANLINES & FAINT TERMINAL CODE WATERMARK ── */}
        <div
          className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
          style={{
            backgroundImage:
              'linear-gradient(to right, #00f0ff 1px, transparent 1px), linear-gradient(to bottom, #00f0ff 1px, transparent 1px)',
            backgroundSize: '20px 20px',
          }}
        />
        <div className="absolute top-8 right-6 font-mono text-[7.5px] text-cyan-400/20 tracking-wider pointer-events-none text-right space-y-0.5 select-none hidden sm:block">
          <div>SYS.VER // v4.41/S</div>
          <div>MEM.ALLOC // 0x7FFF</div>
          <div>PROTOCOL: CLASSIFIED</div>
        </div>

        {/* ── TOP HEADER BAR: ONLY NOTICE RIBBON ── */}
        <div className="relative z-10 px-5 pt-5 pb-3 flex items-center justify-center border-b border-cyan-900/30">
          {/* Centered Notice Ribbon Badge */}
          <div className="px-6 py-1.5 rounded-[4px] bg-[#0c243c]/80 border border-cyan-400/60 shadow-[0_0_15px_rgba(6,182,212,0.35)] flex items-center gap-2.5">
            <AlertTriangle className="w-4 h-4 text-cyan-300 stroke-[2.25]" />
            <span className="font-serif tracking-[0.3em] text-xs sm:text-sm font-extrabold text-cyan-100 uppercase">
              {title}
            </span>
          </div>
        </div>

        {/* ── MODAL BODY ── */}
        <div className="relative z-10 p-5 sm:p-6 space-y-4 text-center">
          {/* Main Question */}
          <div className="space-y-1">
            <p className="text-base sm:text-lg font-serif font-bold text-white tracking-wide">
              {itemType === 'statue' ? 'ต้องการซื้อรูปปั้น' : 'ต้องการซื้อหลักฐาน'} &ldquo;<span className="text-cyan-300">{itemName}</span>&rdquo; ใช่หรือไม่?
            </p>
            {warningNote && (
              <p className="text-xs text-rose-300/90 font-sans font-medium">
                {warningNote}
              </p>
            )}
          </div>

          {/* Horizontal Budget Comparison Strip */}
          <div className="py-3 px-4 rounded-[8px] bg-[#040c17]/80 border border-cyan-900/60 flex items-center justify-around">
            <div className="flex flex-col items-center">
              <span className="text-[10.5px] font-mono text-cyan-400/70 mb-0.5">ยอดเงินที่มีตอนนี้</span>
              <span className="font-mono font-bold text-base sm:text-lg text-white">
                ฿ {currentBudget.toLocaleString()}
              </span>
            </div>

            <div className="text-cyan-400 font-bold text-lg select-none px-2">&gt;</div>

            <div className="flex flex-col items-center">
              <span className="text-[10.5px] font-mono text-cyan-400/70 mb-0.5">คงเหลือหลังซื้อ</span>
              <span
                className={`font-mono font-bold text-base sm:text-lg ${
                  cannotAfford ? 'text-rose-500' : 'text-cyan-200'
                }`}
              >
                ฿ {remainingBudget.toLocaleString()}
              </span>
            </div>
          </div>

          <p className="text-[11px] font-mono text-cyan-400/50">
            (เมื่อสั่งซื้อแล้วจะไม่สามารถขอคืนเงินได้)
          </p>
        </div>

        {/* ── BOTTOM ACTION BUTTONS (SWAPPED: CANCEL RED GLOW | CONFIRM CYAN GLASS) ── */}
        <div className="relative z-10 p-4 sm:p-5 pt-0 flex items-center justify-center gap-4 sm:gap-6">
          {/* CANCEL BUTTON */}
          <button
            onClick={onCancel}
            className="w-32 sm:w-36 py-2 px-3 bg-gradient-to-r from-red-950/70 via-red-900/85 to-red-950/70 hover:from-red-900/90 hover:via-red-800 hover:to-red-900/90 text-red-50 hover:text-white border border-red-500/30 hover:border-red-400/50 rounded-[4px] font-serif font-bold text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_0_20px_rgba(239,68,68,0.5),inset_0_0_12px_rgba(239,68,68,0.25)] hover:shadow-[0_0_30px_rgba(239,68,68,0.8),inset_0_0_16px_rgba(239,68,68,0.4)] active:scale-95 transition-all duration-300 cursor-pointer text-center"
          >
            CANCEL
          </button>

          {/* CONFIRM BUTTON */}
          <button
            onClick={onConfirm}
            disabled={isLoading || cannotAfford}
            className="w-32 sm:w-36 py-2 px-3 bg-gradient-to-b from-[#0e2744]/70 to-[#07172b]/85 hover:from-[#13375e] hover:to-[#0a233f] text-cyan-100/90 hover:text-white disabled:opacity-40 disabled:grayscale border border-cyan-400/25 hover:border-cyan-400/45 rounded-[4px] font-serif font-bold text-xs sm:text-sm tracking-[0.2em] uppercase shadow-[0_0_16px_rgba(6,182,212,0.22),inset_0_0_10px_rgba(6,182,212,0.12)] hover:shadow-[0_0_24px_rgba(6,182,212,0.45),inset_0_0_14px_rgba(6,182,212,0.2)] active:scale-95 transition-all duration-300 cursor-pointer text-center"
          >
            CONFIRM
          </button>
        </div>
      </div>
    </div>
  );
};
