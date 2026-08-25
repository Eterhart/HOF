'use client';

import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight, Calendar, MapPin, QrCode, X } from 'lucide-react';
import { STORY_PLACARDS_DATA, StoryPlacardItem } from '@/data/storyPlacardsData';
import { HologramConfirmModal } from '@/components/HologramConfirmModal';
import { TeamState } from '@/data/types';

interface StoryPlacardsViewProps {
  myTeam?: TeamState | null;
  onBuyItem?: (itemId: number) => void;
  isBuying?: boolean;
  hideOwned?: boolean;
}

export const StoryPlacardsView: React.FC<StoryPlacardsViewProps> = ({
  myTeam,
  onBuyItem,
  isBuying = false,
  hideOwned = false,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [previewPlacardIndex, setPreviewPlacardIndex] = useState<number | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<StoryPlacardItem | null>(null);

  const filteredPlacards = useMemo(() => {
    return STORY_PLACARDS_DATA.filter((item) => {
      if (hideOwned && myTeam?.storyInventory?.includes(item.id)) {
        return false;
      }
      const matchCat = selectedCategory === 'ALL' || item.categoryId === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchSearch =
        !q ||
        item.titleTh.toLowerCase().includes(q) ||
        item.titleEn.toLowerCase().includes(q) ||
        item.location.toLowerCase().includes(q) ||
        item.recordDate.toLowerCase().includes(q) ||
        item.summary.toLowerCase().includes(q);
      return matchCat && matchSearch;
    });
  }, [selectedCategory, searchQuery, hideOwned, myTeam?.storyInventory]);

  const currentPlacard = previewPlacardIndex !== null ? filteredPlacards[previewPlacardIndex] : null;
  const isCurrentOwned = Boolean(currentPlacard && myTeam?.storyInventory?.includes(currentPlacard.id));

  const handlePrev = () => {
    if (previewPlacardIndex === null) return;
    if (previewPlacardIndex > 0) {
      setPreviewPlacardIndex(previewPlacardIndex - 1);
    } else {
      setPreviewPlacardIndex(filteredPlacards.length - 1);
    }
  };

  const handleNext = () => {
    if (previewPlacardIndex === null) return;
    if (previewPlacardIndex < filteredPlacards.length - 1) {
      setPreviewPlacardIndex(previewPlacardIndex + 1);
    } else {
      setPreviewPlacardIndex(0);
    }
  };

  return (
    <div className="space-y-6 select-none animate-fadeIn">
      {/* ── 3-COLUMN PEDESTALS GRID ── */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-x-1.5 xs:gap-x-3 sm:gap-x-4 md:gap-x-6 gap-y-24 sm:gap-y-28 md:gap-y-36 justify-items-center max-w-4xl mx-auto pt-6 pb-24">
        {filteredPlacards.map((item, idx) => {
          const isOwned = Boolean(myTeam?.storyInventory?.includes(item.id));

          return (
            <div
              key={`story-pedestal-${item.id}`}
              onClick={() => setPreviewPlacardIndex(idx)}
              className="group relative isolate flex flex-col items-center w-full cursor-pointer select-none transition-all duration-300 active:scale-[0.98]"
            >
              {/* ─── Horizontal Black Banner: Sold Out ─── */}
              {isOwned && (
                <div className="absolute top-[36%] left-0 right-0 z-30 flex items-center justify-center pointer-events-none">
                  <div
                    className="w-[78%] max-w-[165px] sm:max-w-[195px] py-1.5 flex items-center justify-center shadow-lg select-none backdrop-blur-sm bg-black/35 border-y border-white/20"
                    style={{
                      maskImage: 'linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)',
                      WebkitMaskImage: 'linear-gradient(90deg, transparent 0%, black 20%, black 80%, transparent 100%)',
                    }}
                  >
                    <span className="text-white font-sans font-bold text-xs sm:text-sm tracking-[0.25em] uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                      Sold Out
                    </span>
                  </div>
                </div>
              )}

              {/* ─── 1. VOLUMETRIC SPOTLIGHT ─── */}
              <div
                className={`absolute -top-6 left-1/2 -translate-x-1/2 w-[145px] sm:w-[175px] md:w-[200px] h-[200px] sm:h-[230px] md:h-[260px] pointer-events-none flex flex-col items-center z-0 ${
                  isOwned ? 'opacity-25' : 'opacity-70'
                }`}
              >
                <div className="w-6 sm:w-8 h-1 bg-amber-100/90 rounded-full blur-[1.5px] shadow-[0_0_10px_rgba(255,230,180,0.9)] mb-0.5" />
                <div
                  className="w-full h-full opacity-60 group-hover:opacity-85 transition-opacity duration-500"
                  style={{
                    clipPath: 'polygon(38% 0%, 62% 0%, 100% 100%, 0% 100%)',
                    background:
                      'linear-gradient(180deg, rgba(255, 235, 190, 0.65) 0%, rgba(255, 220, 160, 0.25) 40%, rgba(255, 200, 140, 0.08) 75%, transparent 100%)',
                    filter: 'blur(6px)',
                  }}
                />
              </div>

              {/* ─── 2. Artifact Exhibit Image + High-Tech Mount ─── */}
              <div className="relative z-20 w-full flex flex-col items-center justify-end -mb-3 sm:-mb-4 transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
                <div className="relative w-28 h-36 xs:w-32 xs:h-40 sm:w-36 sm:h-44 md:w-40 md:h-48 flex items-end justify-center">
                  <div className="relative w-full h-full p-1 flex items-end justify-center">
                    <img
                      src={item.image}
                      alt={item.titleTh}
                      className="max-w-full max-h-full object-contain object-bottom filter transition-all duration-500 drop-shadow-[0_10px_16px_rgba(0,0,0,0.8)] group-hover:drop-shadow-[0_15px_22px_rgba(225,29,72,0.4)] rounded-[4px]"
                      loading="lazy"
                    />
                  </div>
                </div>

                <div className="flex flex-col items-center -mt-0.5 z-20">
                  <div className="w-1 h-3 sm:h-3.5 bg-gradient-to-r from-[#2a2a2e] via-[#8e8e93] to-[#1c1c1e] rounded-xs shadow-sm" />
                  <div
                    className="w-12 sm:w-14 md:w-16 h-2.5 sm:h-3 rounded-[50%] shadow-lg -mt-0.5 border-t border-rose-400/40 relative z-20"
                    style={{
                      background:
                        'radial-gradient(ellipse at 50% 30%, #3a3a40 0%, #1c1c20 60%, #0c0c0e 100%)',
                    }}
                  >
                    <div className="absolute inset-0.5 rounded-[50%] border border-rose-500/20 pointer-events-none" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-0.5 rounded-full bg-rose-500/40 blur-[1px]" />
                  </div>
                </div>
              </div>

              {/* ─── 3. DRAPED VELVET CLOTH PEDESTAL ─── */}
              <div className="relative w-full max-w-[150px] xs:max-w-[170px] sm:max-w-[200px] md:max-w-[230px] flex flex-col items-center z-10">
                <div
                  className="w-full h-6 sm:h-8 rounded-[50%] z-10 relative shadow-[inset_0_2px_4px_rgba(255,255,255,0.15),0_4px_12px_rgba(0,0,0,0.8)] border-t border-white/15"
                  style={{
                    background:
                      'radial-gradient(ellipse at 50% 35%, #4a3a3e 0%, #2e2024 45%, #180f12 85%, #0e0709 100%)',
                  }}
                >
                  <div
                    className="absolute inset-0 rounded-[50%] opacity-20 pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(45deg, rgba(255,255,255,0.08) 0px, rgba(255,255,255,0.08) 1px, transparent 1px, transparent 3px)',
                    }}
                  />

                  {/* Gold Price Badge */}
                  {!isOwned ? (
                    <div
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmTarget(item);
                      }}
                      className="absolute -top-2.5 sm:-top-3 right-1 z-30 px-1.5 sm:px-2 py-0.5 rounded-[3px] bg-[#1a120b] border border-[#d4af37] shadow-[0_2px_8px_rgba(212,175,55,0.35)] hover:shadow-[0_0_12px_rgba(245,208,97,0.7)] hover:border-[#f5d061] active:scale-95 transition-all duration-200 cursor-pointer flex items-center gap-0.5 group/price"
                      title="สั่งซื้อป้ายเรื่องราว"
                    >
                      <span className="text-[8px] sm:text-[9px] text-[#f5d061] font-mono font-medium opacity-85">฿</span>
                      <span className="text-[9.5px] sm:text-[10.5px] font-mono font-bold text-[#f5d061] tracking-wider group-hover/price:text-white transition-colors">
                        {item.price.toLocaleString()}
                      </span>
                    </div>
                  ) : null}
                </div>

                {/* Vertical Draped Cloth Body */}
                <div
                  className="w-full min-h-[115px] sm:min-h-[130px] md:min-h-[145px] -mt-3 sm:-mt-4 flex flex-col items-center justify-start pt-5 sm:pt-6 pb-4 px-2 z-0 relative overflow-hidden transition-all duration-300 shadow-[0_12px_25px_rgba(0,0,0,0.9)]"
                  style={{
                    background:
                      'linear-gradient(90deg, #0d070a 0%, #1f1418 8%, #0d070a 16%, #3a282e 26%, #180f12 36%, #4a353c 50%, #180f12 64%, #3a282e 74%, #0d070a 84%, #1f1418 92%, #0d070a 100%)',
                    maskImage:
                      'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
                    WebkitMaskImage:
                      'linear-gradient(to bottom, rgba(0,0,0,1) 0%, rgba(0,0,0,0.95) 75%, rgba(0,0,0,0.3) 92%, rgba(0,0,0,0) 100%)',
                  }}
                >
                  <div
                    className="absolute inset-0 opacity-15 pointer-events-none"
                    style={{
                      backgroundImage:
                        'repeating-linear-gradient(0deg, rgba(255,255,255,0.06) 0px, rgba(255,255,255,0.06) 1px, transparent 1px, transparent 2px)',
                    }}
                  />
                  <div className="absolute left-[44%] right-[44%] top-0 bottom-0 bg-white/10 blur-[5px] pointer-events-none" />

                  <div className="relative z-10 text-center space-y-1 w-full px-1 pt-0.5">
                    <h3 className="text-xs xs:text-sm sm:text-[15px] md:text-base font-serif font-extrabold text-white tracking-wide leading-snug group-hover:text-[#f5d061] transition-colors break-words drop-shadow-[0_2px_6px_rgba(0,0,0,0.95)] line-clamp-2">
                      {item.titleTh}
                    </h3>
                    {item.titleEn && (
                      <p className="text-[9px] sm:text-[10.5px] md:text-[11px] text-rose-300/80 font-mono uppercase tracking-wider leading-tight break-words line-clamp-1">
                        {item.titleEn}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── ARCHIVAL EVIDENCE-STYLE DETAIL MODAL (FULLSCREEN PORTAL - EXACT MATCH TO EVIDENCE DOSSIER UI) ── */}
      {currentPlacard && typeof document !== 'undefined' && createPortal(
        <div
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setPreviewPlacardIndex(null);
            }
          }}
          className="fixed inset-0 top-0 left-0 right-0 bottom-0 z-[999999] w-screen h-screen bg-[#070305] text-[#f2e6e6] flex flex-col justify-between overflow-y-auto custom-dark-scrollbar select-none animate-pureFadeIn font-sans border-0 p-0 m-0"
        >
          {/* ── Background Cyber Ambient Glow & Topographic Grid ── */}
          <div className="absolute inset-0 bg-gradient-to-b from-[#1a050b]/90 via-[#0a0204]/95 to-[#050102] pointer-events-none z-0" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-lg h-96 bg-rose-950/20 blur-3xl rounded-full pointer-events-none z-0" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-950/25 blur-3xl rounded-full pointer-events-none z-0" />

          {/* Cyber Grid Lines Texture */}
          <div
            className="absolute inset-0 opacity-[0.04] pointer-events-none z-0"
            style={{
              backgroundImage: 'radial-gradient(circle at 1px 1px, #ff3366 1px, transparent 0)',
              backgroundSize: '24px 24px',
            }}
          />

          {/* ── Top Header Navigation Bar ── */}
          <div className="relative z-20 w-full max-w-xl mx-auto px-4 sm:px-6 pt-5 sm:pt-6 flex items-center justify-between">
            <button
              onClick={() => setPreviewPlacardIndex(null)}
              className="p-1.5 text-[#a89297] hover:text-white hover:scale-110 transition active:scale-90 cursor-pointer flex items-center gap-1"
              title="ย้อนกลับ"
            >
              <ChevronLeft className="w-6 h-6 stroke-[2]" />
            </button>

            <div className="text-[10px] sm:text-xs font-mono tracking-widest text-rose-500/60 uppercase">
              STORY PLACARD ARCHIVE
            </div>
          </div>

          {/* ── Main Content Area ── */}
          <div className="relative z-10 flex-1 flex flex-col justify-between max-w-xl mx-auto w-full px-5 sm:px-8 py-4">
            
            {/* ── Section Header Title (พื้นหลังแสงสีแดงเรืองรองบางๆ เฟดออกเนียนตา ไร้ขอบตัด) ── */}
            <div className="relative pt-2 pb-1">
              {/* 1. Subtle Red Glowing Background (Feathered Radial Glow) */}
              <div
                className="absolute -inset-x-10 -inset-y-4 pointer-events-none z-0"
                style={{
                  background: 'radial-gradient(ellipse 65% 90% at 20% 50%, rgba(225, 29, 72, 0.35) 0%, rgba(159, 18, 57, 0.18) 45%, rgba(60, 10, 22, 0.04) 75%, transparent 100%)',
                  filter: 'blur(14px)',
                }}
              />

              {/* 2. Layer บนสีแดงเลือดหมูเข้มกระพริบ + โหลดกลับหลัง */}
              <div
                className="absolute -inset-x-8 -inset-y-3 pointer-events-none z-10 animate-cyberRedWipe"
                style={{
                  background: 'radial-gradient(ellipse 70% 90% at 25% 50%, #660014 0%, rgba(102, 0, 20, 0.85) 50%, rgba(70, 0, 14, 0.3) 80%, transparent 100%)',
                  filter: 'blur(8px)',
                }}
              />

              {/* 3. Text that fades in 0 -> 100 with blinking */}
              <div className="relative z-20 space-y-0.5 pl-1 animate-cyberFlickerFade">
                <h2 className="text-xl sm:text-2xl font-serif font-bold text-rose-100 tracking-wide truncate drop-shadow-[0_2px_10px_rgba(225,29,72,0.7)]">
                  {currentPlacard.titleEn || currentPlacard.titleTh}
                </h2>

                <div className="text-xs sm:text-sm text-rose-300/80 font-sans font-medium">
                  {currentPlacard.titleTh}
                </div>
              </div>

              {/* Glowing Red Underline with Cyber Notches */}
              <div className="relative w-full pt-2.5 flex items-center z-20">
                <div className="h-[1.5px] flex-1 bg-gradient-to-r from-rose-600 via-rose-500/70 to-transparent shadow-[0_0_8px_rgba(225,29,72,0.9)]" />
                <div className="flex items-center gap-0.5 pl-2 opacity-60 font-mono text-[8px] text-rose-400">
                  <span>///</span>
                  <span>STORY</span>
                </div>
              </div>
            </div>

            {/* ── Bracketed Main Reading Box with Red Corners [ ... ] ── */}
            <div className="relative my-4 flex-1 flex flex-col justify-center min-h-[320px] sm:min-h-[380px]">
              {/* Corner Brackets */}
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-rose-600/80 pointer-events-none" />
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-rose-600/80 pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-rose-600/80 pointer-events-none" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-rose-600/80 pointer-events-none" />

              {/* Inner Content Display */}
              <div className="p-5 sm:p-7 flex flex-col justify-between h-full space-y-4 animate-pureFadeIn text-left">
                {/* Story Placard Header */}
                <div className="flex items-start justify-between gap-3 border-b border-rose-900/40 pb-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-xs bg-rose-950 border border-rose-700/60 text-rose-300 font-mono text-[10px] font-bold">
                        #{currentPlacard.pageNumber}
                      </span>
                      <span className="font-mono text-[10px] text-rose-400/60">
                        {currentPlacard.categoryNameTh}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                      {currentPlacard.titleTh}
                    </h3>
                    {currentPlacard.titleEn && (
                      <p className="text-xs text-rose-300/70 font-mono font-medium truncate">
                        {currentPlacard.titleEn}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── ARTIFACT ICON / IMAGE DISPLAY (แสดงรูปภาพจาก Iconเรื่องราว แทน QR Code) ── */}
                <div className="py-2.5 flex flex-col items-center justify-center">
                  <div className="relative p-2 bg-black/40 rounded-[12px] shadow-[0_0_24px_rgba(225,29,72,0.3)] border border-rose-500/40 flex items-center justify-center overflow-hidden max-w-[280px]">
                    <img
                      src={currentPlacard.image}
                      alt={currentPlacard.titleTh}
                      className="max-h-40 sm:max-h-48 w-auto object-contain rounded-[6px] drop-shadow-[0_8px_16px_rgba(0,0,0,0.9)]"
                      loading="eager"
                    />
                  </div>
                </div>

                {/* Story Summary / Content */}
                <div className="flex-1 overflow-y-auto custom-dark-scrollbar pr-1.5 space-y-3 max-h-[160px] sm:max-h-[200px]">
                  {(currentPlacard.recordDate || currentPlacard.location) && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-0.5 pb-1">
                      {currentPlacard.recordDate && (
                        <div className="flex flex-col min-w-0 text-xs font-mono">
                          <span className="text-[10px] font-mono uppercase text-rose-400/70 tracking-wider font-semibold">
                            วันที่
                          </span>
                          <span className="text-xs sm:text-[13px] font-bold text-rose-100 break-words leading-relaxed whitespace-normal">
                            {currentPlacard.recordDate}
                          </span>
                        </div>
                      )}
                      {currentPlacard.location && (
                        <div className="flex flex-col min-w-0 text-xs font-mono">
                          <span className="text-[10px] font-mono uppercase text-rose-400/70 tracking-wider font-semibold">
                            สถานที่
                          </span>
                          <span className="text-xs sm:text-[13px] font-bold text-rose-100 break-words leading-relaxed whitespace-normal">
                            {currentPlacard.location}
                          </span>
                        </div>
                      )}
                    </div>
                  )}

                  <p className="text-xs sm:text-[13.5px] text-[#e0cdd1] leading-relaxed font-sans font-normal tracking-wide">
                    &ldquo;{currentPlacard.summary}&rdquo;
                  </p>
                </div>

                {/* Direct Action Button in Reader */}
                <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-rose-400/70 uppercase font-mono">ราคาจัดซื้อ</span>
                    <span className="font-mono font-bold text-sm sm:text-base text-rose-300">
                      ฿ {currentPlacard.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setConfirmTarget(currentPlacard)}
                      disabled={isCurrentOwned || isBuying || Boolean(myTeam && myTeam.budget < currentPlacard.price)}
                      className={`py-1.5 px-6 rounded-full text-xs font-bold font-mono tracking-wider uppercase transition active:scale-95 cursor-pointer shadow-md ${
                        isCurrentOwned
                          ? 'bg-[#1c181a] text-[#7a6f72] border border-white/10 cursor-default'
                          : 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border border-rose-400/80 shadow-[0_0_12px_rgba(225,29,72,0.4)] disabled:opacity-50 disabled:grayscale'
                      }`}
                    >
                      {isCurrentOwned ? 'Sold Out' : isBuying ? 'BUYING...' : myTeam && myTeam.budget < currentPlacard.price ? 'INSUFFICIENT' : 'BUY'}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* ── Pagination Indicator & Next Button (01/26  Next >) ── */}
            <div className="space-y-2 pt-1 pb-4">
              <div className="flex items-center justify-between text-xs font-mono text-rose-300/80 px-1">
                <div className="flex items-center gap-1.5">
                  <span className="text-white font-bold">{String((previewPlacardIndex ?? 0) + 1).padStart(2, '0')}</span>
                  <span className="text-rose-500/60">/</span>
                  <span>{String(filteredPlacards.length).padStart(2, '0')}</span>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handlePrev}
                    className="flex items-center gap-1 text-rose-200 hover:text-white hover:-translate-x-0.5 transition active:scale-95 cursor-pointer font-bold tracking-wider"
                  >
                    <ChevronLeft className="w-4 h-4 text-rose-500" />
                    <span>Prev</span>
                  </button>
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-1 text-rose-200 hover:text-white hover:translate-x-0.5 transition active:scale-95 cursor-pointer font-bold tracking-wider"
                  >
                    <span>Next</span>
                    <ChevronRight className="w-4 h-4 text-rose-500" />
                  </button>
                </div>
              </div>

              {/* Glowing Red Progress Track Line with Active Node */}
              <div className="relative w-full h-[2px] bg-rose-950/80 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300 shadow-[0_0_8px_rgba(225,29,72,0.9)]"
                  style={{
                    width: `${(((previewPlacardIndex ?? 0) + 1) / filteredPlacards.length) * 100}%`,
                  }}
                />
              </div>
            </div>

          </div>
        </div>,
        document.body
      )}

      {/* ── HOLOGRAPHIC BUY CONFIRMATION MODAL ── */}
      {confirmTarget && (
        <HologramConfirmModal
          title="Notice"
          itemName={confirmTarget.titleTh}
          itemType="story"
          currentBudget={myTeam?.budget ?? 0}
          price={confirmTarget.price}
          onCancel={() => setConfirmTarget(null)}
          onConfirm={() => {
            if (onBuyItem) onBuyItem(confirmTarget.id);
            setConfirmTarget(null);
          }}
          isLoading={isBuying}
        />
      )}
    </div>
  );
};
