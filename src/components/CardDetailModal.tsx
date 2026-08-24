'use client';

import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronLeft } from 'lucide-react';
import { StatueItem, EvidenceItem, TeamState } from '@/data/types';
import { HologramConfirmModal } from '@/components/HologramConfirmModal';

interface CardDetailModalProps {
  item: (StatueItem & { itemType: 'statue' }) | (EvidenceItem & { itemType: 'evidence' }) | any;
  onClose: () => void;
  onBuy?: (itemType: 'statue' | 'evidence' | 'story', itemId: number) => void;
  myTeam?: TeamState | null;
  isBuying?: boolean;
  theme?: 'cyan' | 'rose';
}

export const CardDetailModal: React.FC<CardDetailModalProps> = ({
  item, onClose, onBuy, myTeam, isBuying = false, theme = 'rose'
}) => {
  const [showConfirmBuy, setShowConfirmBuy] = useState(false);

  if (!item) return null;

  const isStory = item.itemType === 'story' || 'pageNumber' in item;
  const isStatue = !isStory && (item.itemType === 'statue' || 'nameTh' in item || 'sculptureImage' in item);
  const statue = isStatue ? (item as unknown as StatueItem) : null;
  const isOwned = myTeam
    ? isStatue
      ? myTeam.statueInventory.includes(item.id)
      : isStory
      ? Boolean(myTeam.storyInventory?.includes(item.id))
      : myTeam.evidenceInventory.includes(item.id)
    : false;
  const canAfford = myTeam ? myTeam.budget >= item.price : false;
  const itemName = isStatue ? (statue?.nameTh || (item as any).nameTh || '') : ((item as any).titleTh || '');
  const itemSubtitle = isStatue ? (statue?.nameEn || (item as any).nameEn || '') : isStory ? ((item as any).recordDate || '') : ((item as any).titleEn || '');
  const itemImage = isStatue
    ? (statue?.sculptureImage || statue?.frontImage || (item as any).frontImage || `/sculptures/${item.id}.webp`)
    : ((item as any).frontImage || (item as any).image || `/stories/story_${item.id}.webp`);

  const isCyan = theme === 'cyan';

  if (typeof document === 'undefined') return null;

  return createPortal(
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
      className={`fixed inset-0 top-0 left-0 right-0 bottom-0 z-[9999999] w-screen h-screen flex flex-col justify-between overflow-y-auto select-none animate-fadeIn p-0 m-0 border-0 ${
        isCyan
          ? 'bg-gradient-to-b from-[#040c17] via-[#02070f] to-[#081524] text-[#e0f2fe]'
          : 'bg-gradient-to-b from-[#11050a] via-[#080205] to-[#16060e] text-[#fce7f3]'
      }`}
    >
      {/* ── Background Ambient Silk & Glow Lighting ── */}
      <div className={`absolute top-0 right-0 w-96 h-96 blur-3xl rounded-full pointer-events-none ${
        isCyan ? 'bg-cyan-950/40' : 'bg-rose-950/40'
      }`} />
      <div className={`absolute bottom-1/4 left-0 w-80 h-80 blur-3xl rounded-full pointer-events-none ${
        isCyan ? 'bg-sky-950/30' : 'bg-red-950/25'
      }`} />
      
      {/* ── Top Navigation Bar (Back Chevron & Close) ── */}
      <div className="relative z-20 w-full max-w-2xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex items-center justify-between">
        {/* Back Button */}
        <button
          onClick={onClose}
          className={`p-1.5 hover:text-white hover:scale-110 transition active:scale-90 cursor-pointer ${
            isCyan ? 'text-cyan-200/80' : 'text-rose-200/80'
          }`}
          title="ย้อนกลับ"
        >
          <ChevronLeft className="w-7 h-7 stroke-[1.75]" />
        </button>

        {/* Close Button */}
        <button
          onClick={onClose}
          className={`p-1.5 hover:text-white hover:scale-110 transition active:scale-90 cursor-pointer ${
            isCyan ? 'text-cyan-200/60' : 'text-rose-200/60'
          }`}
          title="ปิด"
        >
          <X className="w-6 h-6 stroke-[1.75]" />
        </button>
      </div>

      {/* ── Main Container (Centered content with proper margins) ── */}
      <div className="relative z-10 w-full max-w-lg mx-auto px-4 sm:px-6 flex-1 flex flex-col justify-between py-2 sm:py-4">
        
        {/* ── 1. Top Header: Circular Stamp & Caption ── */}
        <div className="flex items-center gap-3.5 pt-2 sm:pt-4">
          {/* Circular Seal Badge */}
          <div className={`w-12 h-12 rounded-full border flex flex-col items-center justify-center text-[#f5c768] flex-shrink-0 select-none ${
            isCyan
              ? 'border-cyan-400/60 bg-gradient-to-b from-[#0a233f] via-[#06162a] to-[#040e1c] shadow-[0_0_15px_rgba(6,182,212,0.35)]'
              : 'border-rose-500/60 bg-gradient-to-b from-[#2a0e17] via-[#1a080f] to-[#100308] shadow-[0_0_15px_rgba(225,29,72,0.35)]'
          }`}>
            <span className="text-xs font-bold leading-none">{String(item.id).padStart(2, '0')}</span>
            <div className={`w-5 h-[1px] my-0.5 ${isCyan ? 'bg-cyan-400/50' : 'bg-rose-500/50'}`} />
            <span className="text-[9px] leading-none opacity-80 font-mono">SECTOR</span>
          </div>

          {/* Caption */}
          <div className="flex-1 min-w-0">
            <p className="font-bold text-xs sm:text-sm text-white leading-snug">
              {isStatue ? `Acquired ${itemName} for the Historical Exhibition.` : `Discovered archival evidence: ${itemName}`}
            </p>
          </div>
        </div>

        {/* ── 2. Centerpiece: High-res 3D Statue or Evidence Item (ขยายใหญ่เต็มตา) ── */}
        <div className="relative my-auto py-2 sm:py-4 flex-1 flex flex-col items-center justify-center min-h-[320px] xs:min-h-[380px] sm:min-h-[440px]">
          {/* Overhead Spotlight Light Beam */}
          <div
            className="absolute -top-16 w-80 sm:w-96 h-96 pointer-events-none opacity-40"
            style={{
              background: isCyan
                ? 'radial-gradient(ellipse at 50% 10%, rgba(125,211,252,0.85) 0%, rgba(6,182,212,0.25) 45%, transparent 75%)'
                : 'radial-gradient(ellipse at 50% 10%, rgba(255,230,180,0.85) 0%, rgba(225,29,72,0.3) 45%, transparent 75%)',
              filter: 'blur(16px)',
            }}
          />

          <div className="relative w-full max-w-[320px] xs:max-w-[380px] sm:max-w-[440px] md:max-w-[500px] h-[320px] xs:h-[380px] sm:h-[440px] md:h-[480px] flex items-center justify-center transition-transform duration-500 hover:scale-105">
            <img
              src={itemImage}
              alt={itemName}
              className="w-full h-full object-contain filter drop-shadow-[0_25px_45px_rgba(0,0,0,0.8)]"
            />
          </div>
        </div>

        {/* ── 3. Bottom Floating Glass Card (Item Information Vitrine) ── */}
        <div className={`relative w-full backdrop-blur-xl rounded-[20px] p-5 shadow-[0_15px_40px_rgba(0,0,0,0.8)] space-y-2 mb-4 border ${
          isCyan
            ? 'bg-[#061426]/90 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.2)]'
            : 'bg-[#13050c]/90 border-rose-500/50 shadow-[0_0_30px_rgba(225,29,72,0.25)]'
        }`}>
          {/* Ring Bullet + Thai Title (แสดงชื่อครบถ้วน ไม่ตัด ...) */}
          <div className="flex items-start gap-2.5">
            <div className={`w-2.5 h-2.5 rounded-full border-2 flex-shrink-0 mt-1.5 ${
              isCyan ? 'border-cyan-300 bg-cyan-400/30' : 'border-rose-400 bg-rose-500/30'
            }`} />
            <h3 className="font-serif font-bold text-base sm:text-lg md:text-xl text-white tracking-tight leading-snug break-words">
              {itemName}
            </h3>
          </div>

          {/* English Subtitle below */}
          {itemSubtitle && itemSubtitle !== itemName && (
            <p className={`text-xs uppercase tracking-wider pl-5 -mt-0.5 font-mono leading-normal break-words ${
              isCyan ? 'text-cyan-300/80' : 'text-rose-300/80'
            }`}>
              {itemSubtitle}
            </p>
          )}

          {/* Delicate Hairline Divider */}
          <div className={`w-full border-t my-1.5 ${isCyan ? 'border-cyan-900/80' : 'border-rose-950/90'}`} />

          {/* Description */}
          <p className={`text-xs sm:text-[13px] leading-relaxed font-sans ${
            isCyan ? 'text-cyan-100/85' : 'text-rose-100/90'
          }`}>
            {isStatue ? (item as StatueItem).role : (item as any).summary || (item as any).role || ''}
          </p>

          {/* Vitrine Footer Marks */}
          <div className={`pt-2 flex items-center justify-between text-[9px] uppercase tracking-widest select-none font-mono ${
            isCyan ? 'text-cyan-400/70' : 'text-rose-400/70'
          }`}>
            <div className="flex items-center gap-1.5 opacity-80">
              <span>✦</span>
              <span>HISTORICAL EXHIBITION</span>
              <span>✦</span>
            </div>
            <span>CURATOR FILE // 0{item.id}</span>
          </div>
        </div>
      </div>

      {/* ── Bottom Fixed Action Bar: Price & Buy / Sold Out ── */}
      {onBuy && item.price !== undefined ? (
        <div className={`relative z-20 w-full backdrop-blur-2xl border-t shadow-[0_-4px_24px_rgba(0,0,0,0.7)] ${
          isCyan ? 'bg-[#040c17]/90 border-cyan-900/80' : 'bg-[#0b0307]/95 border-rose-950/90'
        }`}>
          <div className="max-w-2xl mx-auto px-4 sm:px-6 py-3.5 sm:py-4 flex items-center justify-between">
            <div className="flex flex-col">
              <div className={`flex items-baseline gap-1.5 text-xs font-mono ${
                isCyan ? 'text-cyan-200/70' : 'text-rose-200/70'
              }`}>
                <span>Price:</span>
                <span className="font-bold text-[#f5c768] text-base">฿ {item.price.toLocaleString()}</span>
              </div>
              <span className={`text-[10px] sm:text-[11px] font-mono ${
                isCyan ? 'text-cyan-400/60' : 'text-rose-400/60'
              }`}>
                ({isOwned ? 'Owned: 1' : 'Unowned'})
              </span>
            </div>

            <div className="flex items-center gap-3">
              {/* BUY / SOLD OUT BUTTON */}
              <button
                onClick={() => {
                  if (!isOwned && canAfford && !isBuying) {
                    setShowConfirmBuy(true);
                  }
                }}
                disabled={isOwned || isBuying || !canAfford}
                className={`relative overflow-hidden py-2 px-7 sm:px-9 rounded-full font-serif font-bold text-xs sm:text-[13px] tracking-[0.14em] uppercase active:scale-95 transition flex items-center justify-center cursor-pointer border ${
                  isOwned
                    ? (isCyan ? 'bg-[#0a1628] text-white/50 border-white/20' : 'bg-[#1f0a13] text-white/50 border-rose-900/40') + ' cursor-default shadow-none font-medium tracking-[0.18em]'
                    : 'text-[#443011] border-[#f5d061] hover:brightness-105 disabled:opacity-40 disabled:grayscale shadow-[0_0_15px_rgba(245,199,104,0.4)]'
                }`}
                style={!isOwned ? {
                  background: 'linear-gradient(135deg, #fff7d6 0%, #f7d67b 50%, #e6b743 100%)',
                } : undefined}
              >
                <span className="relative z-10">{isOwned ? 'Sold Out' : isBuying ? 'BUYING...' : !canAfford ? 'INSUFFICIENT' : 'BUY'}</span>
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className={`relative z-20 w-full backdrop-blur-2xl border-t py-3 text-center text-[11px] font-mono tracking-widest uppercase ${
          isCyan ? 'bg-[#040c17]/90 border-cyan-900/80 text-cyan-300/80' : 'bg-[#0b0307]/95 border-rose-950/90 text-rose-300/80'
        }`}>
          ✦ HISTORICAL EXHIBITION ARCHIVE DOSSIER ✦
        </div>
      )}

      {/* ─── HOLOGRAPHIC TERMINAL BUY CONFIRMATION MODAL ─── */}
      {showConfirmBuy && (
        <HologramConfirmModal
          title={isStatue ? 'Notice' : 'Notice'}
          itemName={itemName}
          itemType={isStory ? ('story' as any) : isStatue ? 'statue' : 'evidence'}
          currentBudget={myTeam?.budget ?? 0}
          price={item.price}
          warningNote={
            !isStatue && !isStory
              ? 'หากซื้อหลักฐานเท็จ คุณจะถูกหักคะแนน'
              : undefined
          }
          onCancel={() => setShowConfirmBuy(false)}
          onConfirm={() => {
            if (onBuy) onBuy(item.itemType, item.id);
            setShowConfirmBuy(false);
          }}
          isLoading={isBuying}
        />
      )}
    </div>,
    document.body
  );
};
