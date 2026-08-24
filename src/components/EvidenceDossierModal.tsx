'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ExhibitionRoom, EvidenceItem, TeamState } from '@/data/types';
import { EVIDENCE_ITEMS } from '@/data/gameData';

interface EvidenceDossierModalProps {
  room: ExhibitionRoom | null;
  onClose: () => void;
  myTeam: TeamState;
  onBuyItem: (itemType: 'statue' | 'evidence', itemId: number) => void;
  isBuying?: boolean;
  initialEvidenceId?: number;
}

export const EvidenceDossierModal: React.FC<EvidenceDossierModalProps> = ({
  room,
  onClose,
  myTeam,
  onBuyItem,
  isBuying = false,
  initialEvidenceId,
}) => {
  const [mounted, setMounted] = useState(false);

  // Find all 5 evidence items belonging to this room (targetEvidenceIds + trapEvidenceId)
  const roomEvidenceIds = room ? [...room.targetEvidenceIds, room.trapEvidenceId] : [];
  const roomEvidences: EvidenceItem[] = roomEvidenceIds
    .map((id) => EVIDENCE_ITEMS.find((e) => e.id === id))
    .filter((e): e is EvidenceItem => Boolean(e));

  // selectedIndex: null = Initial view ("โปรดกดดูรายละเอียดหลักฐาน 1-5 ด้านล่าง"), 0..4 = Evidence 1..5
  const [selectedIndex, setSelectedIndex] = useState<number | null>(() => {
    if (initialEvidenceId) {
      const idx = roomEvidences.findIndex((e) => e.id === initialEvidenceId);
      return idx >= 0 ? idx : 0;
    }
    return null;
  });

  // Lock background body scroll to prevent header/background leak
  useEffect(() => {
    setMounted(true);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, []);

  if (!mounted || !room || typeof document === 'undefined') return null;

  // Clean room titles (no years, no extra parentheses)
  const cleanNameTh = room.nameTh.replace(/\s*\([^)]*\)/g, '').trim();
  const cleanNameEn = room.nameEn.replace(/\s*\([^)]*\)/g, '').trim();

  const currentEvidence = selectedIndex !== null ? roomEvidences[selectedIndex] : null;
  const isOwned = currentEvidence ? myTeam.evidenceInventory.includes(currentEvidence.id) : false;
  const canAfford = currentEvidence ? myTeam.budget >= currentEvidence.price : false;

  const handleNext = () => {
    if (selectedIndex === null) {
      setSelectedIndex(0);
    } else if (selectedIndex < roomEvidences.length - 1) {
      setSelectedIndex(selectedIndex + 1);
    } else {
      setSelectedIndex(0); // loop back
    }
  };

  const roomNumFormatted = String(room.roomNumber).padStart(2, '0');
  const pageNumFormatted = selectedIndex !== null ? String(selectedIndex + 1).padStart(2, '0') : '01';

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
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
          onClick={onClose}
          className="p-1.5 text-[#a89297] hover:text-white hover:scale-110 transition active:scale-90 cursor-pointer flex items-center gap-1"
          title="ย้อนกลับ"
        >
          <ChevronLeft className="w-6 h-6 stroke-[2]" />
        </button>

        <div className="text-[10px] sm:text-xs font-mono tracking-widest text-rose-500/60 uppercase">
          EVIDENCE ARCHIVE
        </div>
      </div>

      {/* ── Main Content Area ── */}
      <div className="relative z-10 flex-1 flex flex-col justify-between max-w-xl mx-auto w-full px-5 sm:px-8 py-4">
        
        {/* ── Section Header Title (พื้นหลังแสงสีแดงเรืองรองบางๆ เฟดออกเนียนตา ไร้ขอบตัด) ── */}
        <div className="relative pt-2 pb-1">
          {/* 1. Subtle Red Glowing Background (Feathered Radial Glow เฟดเนียนตาถึง 0) */}
          <div
            className="absolute -inset-x-10 -inset-y-4 pointer-events-none z-0"
            style={{
              background: 'radial-gradient(ellipse 65% 90% at 20% 50%, rgba(225, 29, 72, 0.35) 0%, rgba(159, 18, 57, 0.18) 45%, rgba(60, 10, 22, 0.04) 75%, transparent 100%)',
              filter: 'blur(14px)',
            }}
          />

          {/* 2. Layer บนสีแดงเลือดหมูเข้มกระพริบ + โหลดกลับหลัง (ขอบเฟดนุ่มนวล ไร้เส้นตัดขอบกล่อง) */}
          <div
            className="absolute -inset-x-8 -inset-y-3 pointer-events-none z-10 animate-cyberRedWipe"
            style={{
              background: 'radial-gradient(ellipse 70% 90% at 25% 50%, #660014 0%, rgba(102, 0, 20, 0.85) 50%, rgba(70, 0, 14, 0.3) 80%, transparent 100%)',
              filter: 'blur(8px)',
            }}
          />

          {/* 3. Text that fades in 0 -> 100 with blinking (ไม่มีทิศทาง) */}
          <div className="relative z-20 space-y-0.5 pl-1 animate-cyberFlickerFade">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-rose-100 tracking-wide truncate drop-shadow-[0_2px_10px_rgba(225,29,72,0.7)]">
              {cleanNameEn || cleanNameTh}
            </h2>

            <div className="text-xs sm:text-sm text-rose-300/80 font-sans font-medium">
              {cleanNameTh}
            </div>
          </div>

          {/* Glowing Red Underline with Cyber Notches */}
          <div className="relative w-full pt-2.5 flex items-center z-20">
            <div className="h-[1.5px] flex-1 bg-gradient-to-r from-rose-600 via-rose-500/70 to-transparent shadow-[0_0_8px_rgba(225,29,72,0.9)]" />
            <div className="flex items-center gap-0.5 pl-2 opacity-60 font-mono text-[8px] text-rose-400">
              <span>///</span>
              <span>DATA</span>
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
          <div className="p-5 sm:p-7 flex flex-col justify-center items-center h-full text-center">
            {selectedIndex === null ? (
              /* ── Initial State Prompt (ไร้ขอบตัด / Soft Ambient Glow แท้จริง) ── */
              <div className="relative space-y-3 py-10 px-6 max-w-sm flex flex-col items-center justify-center">
                {/* 1. Subtle Red Glowing Background (Feathered Radial Glow) */}
                <div
                  className="absolute -inset-10 pointer-events-none z-0"
                  style={{
                    background: 'radial-gradient(ellipse 60% 70% at 50% 50%, rgba(225, 29, 72, 0.35) 0%, rgba(159, 18, 57, 0.18) 45%, rgba(60, 10, 22, 0.04) 75%, transparent 100%)',
                    filter: 'blur(16px)',
                  }}
                />

                {/* 2. Layer บนสีแดงเลือดหมูเข้มกระพริบ + โหลดกลับหลัง (ขอบเฟดนุ่มนวล ไร้เส้นตัดขอบกล่อง) */}
                <div
                  className="absolute -inset-8 pointer-events-none z-10 animate-cyberRedWipe"
                  style={{
                    background: 'radial-gradient(ellipse 65% 75% at 50% 50%, #660014 0%, rgba(102, 0, 20, 0.85) 45%, rgba(70, 0, 14, 0.3) 75%, transparent 100%)',
                    filter: 'blur(8px)',
                  }}
                />

                {/* 3. Text that fades in 0 -> 100 with blinking (ไม่มีทิศทาง) */}
                <div className="relative z-20 space-y-2 text-center animate-cyberFlickerFade">
                  <h3 className="text-base sm:text-lg font-bold text-rose-100 leading-relaxed font-serif drop-shadow-[0_2px_12px_rgba(225,29,72,0.8)]">
                    โปรดกดดูรายละเอียดหลักฐาน 1-5
                  </h3>
                  <p className="text-xs sm:text-sm text-rose-300/80 font-medium tracking-wide">
                    ด้านล่าง
                  </p>
                </div>
              </div>
            ) : currentEvidence ? (
              /* ── Evidence Detail Reading State (Fade In แค่ Opacity 0 > 100 ไม่มีทิศทาง) ── */
              <div
                key={`evidence-detail-${currentEvidence.id}`}
                className="w-full flex flex-col justify-between h-full space-y-4 animate-pureFadeIn text-left"
              >
                {/* Evidence Header */}
                <div className="flex items-start justify-between gap-3 border-b border-rose-900/40 pb-3">
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-xs bg-rose-950 border border-rose-700/60 text-rose-300 font-mono text-[10px] font-bold">
                        หลักฐาน #{selectedIndex + 1}
                      </span>
                      <span className="font-mono text-[10px] text-rose-400/60">
                        {currentEvidence.barcodeSerial}
                      </span>
                    </div>

                    <h3 className="text-base sm:text-lg font-bold text-white tracking-tight leading-snug">
                      {currentEvidence.titleTh}
                    </h3>
                    {currentEvidence.titleEn && (
                      <p className="text-xs text-rose-300/70 font-mono font-medium truncate">
                        {currentEvidence.titleEn}
                      </p>
                    )}
                  </div>
                </div>

                {/* ── QR CODE SECTION (ตรงกลางระหว่างหัวข้อและเนื้อหา) ── */}
                {currentEvidence.qrUrl && (
                  <div className="py-2 flex flex-col items-center justify-center">
                    <div className="p-2 bg-white rounded-[8px] shadow-[0_0_20px_rgba(225,29,72,0.3)] border border-rose-500/60 relative transition-transform hover:scale-105">
                      <a
                        href={currentEvidence.qrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block cursor-pointer"
                        title="คลิกหรือสแกนเพื่อเปิดลิงก์หลักฐาน"
                      >
                        <img
                          src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(
                            currentEvidence.qrUrl
                          )}`}
                          alt={`QR Code for ${currentEvidence.titleTh}`}
                          className="w-24 h-24 sm:w-28 sm:h-28 object-contain"
                          loading="eager"
                        />
                      </a>
                    </div>
                    <div className="text-[11px] font-mono text-rose-300/85 pt-2 flex flex-wrap items-center justify-center gap-1 text-center select-none">
                      <span>✦</span>
                      <span>สแกน QR CODE หรือ</span>
                      <a
                        href={currentEvidence.qrUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-white hover:text-rose-200 underline decoration-rose-400/80 font-bold transition-colors cursor-pointer"
                      >
                        คลิกที่นี่
                      </a>
                      <span>เพื่อเข้าสู่เว็บไซต์</span>
                      <span>✦</span>
                    </div>
                  </div>
                )}

                {/* Evidence Summary / Body Story */}
                <div className="flex-1 overflow-y-auto custom-dark-scrollbar pr-1.5 space-y-3 max-h-[160px] sm:max-h-[200px]">
                  <p className="text-xs sm:text-[13.5px] text-[#e0cdd1] leading-relaxed font-sans font-normal tracking-wide">
                    &ldquo;{currentEvidence.summary}&rdquo;
                  </p>

                  {currentEvidence.archiveSource && (
                    <div className="pt-2 text-[11px] text-[#8e767c] font-mono flex items-center gap-1.5">
                      <span>แหล่งที่มา:</span>
                      <span className="text-rose-300/80 underline decoration-rose-500/40">
                        {currentEvidence.archiveSource}
                      </span>
                    </div>
                  )}
                </div>

                {/* Direct Action Button in Reader */}
                <div className="pt-2 border-t border-rose-900/40 flex items-center justify-between gap-3">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-rose-400/70 uppercase font-mono">ราคาจัดซื้อ</span>
                    <span className="font-mono font-bold text-sm sm:text-base text-rose-300">
                      ฿ {currentEvidence.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onBuyItem('evidence', currentEvidence.id)}
                      disabled={isOwned || isBuying || !canAfford}
                      className={`py-1.5 px-6 rounded-full text-xs font-bold font-mono tracking-wider uppercase transition active:scale-95 cursor-pointer shadow-md ${
                        isOwned
                          ? 'bg-[#1c181a] text-[#7a6f72] border border-white/10 cursor-default'
                          : 'bg-gradient-to-r from-rose-600 via-rose-500 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white border border-rose-400/80 shadow-[0_0_12px_rgba(225,29,72,0.4)] disabled:opacity-50 disabled:grayscale'
                      }`}
                    >
                      {isOwned ? 'Sold Out' : isBuying ? 'BUYING...' : !canAfford ? 'INSUFFICIENT' : 'BUY'}
                    </button>
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {/* ── Pagination Indicator & Next Button (01/05  Next >) ── */}
        <div className="space-y-2 pt-1 pb-4">
          <div className="flex items-center justify-between text-xs font-mono text-rose-300/80 px-1">
            <div className="flex items-center gap-1.5">
              <span className="text-white font-bold">{pageNumFormatted}</span>
              <span className="text-rose-500/60">/</span>
              <span>05</span>
            </div>

            <button
              onClick={handleNext}
              className="flex items-center gap-1 text-rose-200 hover:text-white hover:translate-x-0.5 transition active:scale-95 cursor-pointer font-bold tracking-wider"
            >
              <span>Next</span>
              <ChevronRight className="w-4 h-4 text-rose-500" />
            </button>
          </div>

          {/* Glowing Red Progress Track Line with Active Node */}
          <div className="relative w-full h-[2px] bg-rose-950/80 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-rose-600 to-rose-400 transition-all duration-300 shadow-[0_0_8px_rgba(225,29,72,0.9)]"
              style={{
                width: selectedIndex !== null ? `${((selectedIndex + 1) / 5) * 100}%` : '20%',
              }}
            />
          </div>
        </div>

        {/* ── Bottom 1-5 Tabs Selector Timeline ── */}
        <div className="relative w-full pt-3 pb-6 flex items-center justify-center gap-3 sm:gap-4">
          {/* Subtle Horizontal Timeline Track Line */}
          <div className="absolute top-1/2 left-4 right-4 h-[1px] bg-rose-900/30 -translate-y-1/2 pointer-events-none z-0" />

          {roomEvidences.map((evidence, idx) => {
            const isActive = selectedIndex === idx;
            const itemOwned = myTeam.evidenceInventory.includes(evidence.id);

            return (
              <div key={`dossier-tab-${evidence.id}`} className="relative z-10 flex flex-col items-center">
                <button
                  onClick={() => setSelectedIndex(idx)}
                  className={`w-9 h-7 sm:w-11 sm:h-8 rounded-[2px] sm:rounded-[3px] flex items-center justify-center transition-all duration-200 active:scale-95 cursor-pointer relative ${
                    isActive
                      ? 'bg-rose-950/40 border border-rose-500/70 shadow-[0_0_15px_rgba(225,29,72,0.35)]'
                      : 'bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/35'
                  }`}
                >
                  <span
                    className={`font-serif text-xs sm:text-sm font-bold transition-colors duration-200 ${
                      isActive
                        ? 'text-rose-400 drop-shadow-[0_0_8px_rgba(225,29,72,0.9)]'
                        : 'text-[#e5e5ea]'
                    }`}
                  >
                    {idx + 1}
                  </span>

                  {/* Cyber notch brackets on left and right */}
                  <span className="absolute left-0.5 top-1 bottom-1 w-[1px] bg-white/20" />
                  <span className="absolute right-0.5 top-1 bottom-1 w-[1px] bg-white/20" />

                  {/* Owned indicator dot on top corner (สีแดงสด) */}
                  {itemOwned && (
                    <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.95)] border border-black" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

      </div>
    </div>,
    document.body
  );
};
